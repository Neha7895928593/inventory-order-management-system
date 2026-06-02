from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0)
    quantity_in_stock: int = Field(..., ge=0)

    @field_validator("name", "sku")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class ProductRead(ProductBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone_number: str = Field(..., min_length=1, max_length=50)

    @field_validator("full_name", "phone_number")
    @classmethod
    def strip_customer_text(cls, value: str) -> str:
        return value.strip()


class CustomerCreate(CustomerBase):
    pass


class CustomerRead(CustomerBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_id: int = Field(..., gt=0)
    items: list[OrderItemCreate] = Field(..., min_length=1)


class OrderItemRead(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    line_total: float


class OrderRead(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    total_amount: float
    created_at: datetime
    items: list[OrderItemRead]


class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: list[ProductRead]


class ApiError(BaseModel):
    detail: str
