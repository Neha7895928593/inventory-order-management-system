from collections import Counter

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.db import Base, engine, get_db
from app.models import Customer, Order, OrderItem, Product
from app.schemas import (
    ApiError,
    CustomerCreate,
    CustomerRead,
    DashboardSummary,
    OrderCreate,
    OrderItemRead,
    OrderRead,
    ProductCreate,
    ProductRead,
    ProductUpdate,
)


app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://frontend:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "message": "Ethara Inventory API is running.",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/products", response_model=ProductRead, status_code=status.HTTP_201_CREATED, responses={400: {"model": ApiError}})
def create_product(payload: ProductCreate, db: Session = Depends(get_db)) -> Product:
    product = Product(**payload.model_dump())
    db.add(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Product SKU/code must be unique.")
    db.refresh(product)
    return product


@app.get("/products", response_model=list[ProductRead])
def list_products(db: Session = Depends(get_db)) -> list[Product]:
    return db.scalars(select(Product).order_by(Product.created_at.desc())).all()


@app.get("/products/{product_id}", response_model=ProductRead, responses={404: {"model": ApiError}})
def get_product(product_id: int, db: Session = Depends(get_db)) -> Product:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    return product


@app.put("/products/{product_id}", response_model=ProductRead, responses={400: {"model": ApiError}, 404: {"model": ApiError}})
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)) -> Product:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    for field, value in payload.model_dump().items():
        setattr(product, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Product SKU/code must be unique.")
    db.refresh(product)
    return product


@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT, responses={404: {"model": ApiError}})
def delete_product(product_id: int, db: Session = Depends(get_db)) -> Response:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    existing_order_item = db.scalar(select(OrderItem.id).where(OrderItem.product_id == product_id).limit(1))
    if existing_order_item:
        raise HTTPException(
            status_code=400,
            detail="Product cannot be deleted because it is referenced by existing orders.",
        )

    db.delete(product)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.post("/customers", response_model=CustomerRead, status_code=status.HTTP_201_CREATED, responses={400: {"model": ApiError}})
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)) -> Customer:
    customer = Customer(**payload.model_dump())
    db.add(customer)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Customer email must be unique.")
    db.refresh(customer)
    return customer


@app.get("/customers", response_model=list[CustomerRead])
def list_customers(db: Session = Depends(get_db)) -> list[Customer]:
    return db.scalars(select(Customer).order_by(Customer.created_at.desc())).all()


@app.get("/customers/{customer_id}", response_model=CustomerRead, responses={404: {"model": ApiError}})
def get_customer(customer_id: int, db: Session = Depends(get_db)) -> Customer:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")
    return customer


@app.delete("/customers/{customer_id}", status_code=status.HTTP_204_NO_CONTENT, responses={404: {"model": ApiError}})
def delete_customer(customer_id: int, db: Session = Depends(get_db)) -> Response:
    customer = db.scalar(
        select(Customer)
        .options(joinedload(Customer.orders).joinedload(Order.items))
        .where(Customer.id == customer_id)
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    for order in customer.orders:
        for item in order.items:
            product = db.get(Product, item.product_id)
            if product:
                product.quantity_in_stock += item.quantity

    db.delete(customer)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def serialize_order(order: Order) -> OrderRead:
    return OrderRead(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name,
        total_amount=order.total_amount,
        created_at=order.created_at,
        items=[
            OrderItemRead(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                line_total=item.line_total,
            )
            for item in order.items
        ],
    )


@app.post("/orders", response_model=OrderRead, status_code=status.HTTP_201_CREATED, responses={400: {"model": ApiError}, 404: {"model": ApiError}})
def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> OrderRead:
    customer = db.get(Customer, payload.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    product_counts = Counter(item.product_id for item in payload.items)
    if any(count > 1 for count in product_counts.values()):
        raise HTTPException(status_code=400, detail="Each product can appear only once per order.")

    product_ids = [item.product_id for item in payload.items]
    products = db.scalars(select(Product).where(Product.id.in_(product_ids))).all()
    product_map = {product.id: product for product in products}

    missing_ids = [product_id for product_id in product_ids if product_id not in product_map]
    if missing_ids:
        raise HTTPException(status_code=404, detail=f"Product not found: {missing_ids[0]}")

    total_amount = 0.0
    order = Order(customer_id=payload.customer_id, total_amount=0.0)
    db.add(order)
    db.flush()

    for item in payload.items:
        product = product_map[item.product_id]
        if product.quantity_in_stock < item.quantity:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient inventory for product '{product.name}'.",
            )

        product.quantity_in_stock -= item.quantity
        line_total = round(product.price * item.quantity, 2)
        total_amount += line_total
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.price,
                line_total=line_total,
            )
        )

    order.total_amount = round(total_amount, 2)
    db.commit()

    saved_order = db.scalar(
        select(Order)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
        .where(Order.id == order.id)
    )
    return serialize_order(saved_order)


@app.get("/orders", response_model=list[OrderRead])
def list_orders(db: Session = Depends(get_db)) -> list[OrderRead]:
    orders = db.scalars(
        select(Order)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
        .order_by(Order.created_at.desc())
    ).unique().all()
    return [serialize_order(order) for order in orders]


@app.get("/orders/{order_id}", response_model=OrderRead, responses={404: {"model": ApiError}})
def get_order(order_id: int, db: Session = Depends(get_db)) -> OrderRead:
    order = db.scalar(
        select(Order)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
        .where(Order.id == order_id)
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    return serialize_order(order)


@app.delete("/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT, responses={404: {"model": ApiError}})
def delete_order(order_id: int, db: Session = Depends(get_db)) -> Response:
    order = db.scalar(select(Order).options(joinedload(Order.items)).where(Order.id == order_id))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    for item in order.items:
        product = db.get(Product, item.product_id)
        if product:
            product.quantity_in_stock += item.quantity

    db.delete(order)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/dashboard/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)) -> DashboardSummary:
    low_stock_products = db.scalars(
        select(Product)
        .where(Product.quantity_in_stock <= settings.low_stock_threshold)
        .order_by(Product.quantity_in_stock.asc(), Product.name.asc())
    ).all()

    return DashboardSummary(
        total_products=db.scalar(select(func.count(Product.id))) or 0,
        total_customers=db.scalar(select(func.count(Customer.id))) or 0,
        total_orders=db.scalar(select(func.count(Order.id))) or 0,
        low_stock_products=low_stock_products,
    )
