import { useEffect, useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import PageHeader from './components/PageHeader'
import FlashBanner from './components/FlashBanner'
import OverviewTab from './components/OverviewTab'
import ProductsTab from './components/ProductsTab'
import CustomersTab from './components/CustomersTab'
import OrdersTab from './components/OrdersTab'
import Drawer from './components/Drawer'
import { apiRequest } from './lib/api'

const emptyProductForm = {
  name: '',
  sku: '',
  price: '',
  quantity_in_stock: '',
}

const emptyCustomerForm = {
  full_name: '',
  email: '',
  phone_number: '',
}

const emptyOrderForm = {
  customer_id: '',
  items: [{ product_id: '', quantity: '' }],
}

const viewMeta = {
  overview: {
    title: 'Overview',
    subtitle: '',
  },
  products: {
    title: 'Products',
    subtitle: '',
  },
  customers: {
    title: 'Customers',
    subtitle: '',
  },
  orders: {
    title: 'Orders',
    subtitle: '',
  },
}

function App() {
  const [activeView, setActiveView] = useState('overview')
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [summary, setSummary] = useState({
    total_products: 0,
    total_customers: 0,
    total_orders: 0,
    low_stock_products: [],
  })
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm)
  const [orderForm, setOrderForm] = useState(emptyOrderForm)
  const [editingProductId, setEditingProductId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [flash, setFlash] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(true)
  const [drawer, setDrawer] = useState(null)

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  async function fetchDashboardData() {
    return Promise.all([
      apiRequest('/products'),
      apiRequest('/customers'),
      apiRequest('/orders'),
      apiRequest('/dashboard/summary'),
    ])
  }

  async function loadData() {
    setLoading(true)

    try {
      let result
      let lastError

      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          result = await fetchDashboardData()
          break
        } catch (error) {
          lastError = error
          if (attempt < 2) {
            await sleep(700 * (attempt + 1))
          }
        }
      }

      if (!result) {
        throw lastError
      }

      const [productsData, customersData, ordersData, summaryData] = result

      setProducts(productsData)
      setCustomers(customersData)
      setOrders(ordersData)
      setSummary(summaryData)
      setFlash((current) => (current.type === 'error' ? { type: '', message: '' } : current))
      setSelectedOrder((current) => {
        if (!current) {
          return ordersData[0] || null
        }

        return ordersData.find((order) => order.id === current.id) || ordersData[0] || null
      })
    } catch (error) {
      setFlash({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const bootstrap = async () => {
      await loadData()
    }

    void bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (flash.type !== 'error' || loading) {
      return undefined
    }

    const retryTimer = setTimeout(() => {
      void loadData()
    }, 3000)

    return () => {
      clearTimeout(retryTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flash.type, loading])

  useEffect(() => {
    if (flash.type !== 'success') {
      return undefined
    }

    const dismissTimer = setTimeout(() => {
      setFlash({ type: '', message: '' })
    }, 3200)

    return () => {
      clearTimeout(dismissTimer)
    }
  }, [flash])

  function showSuccess(message) {
    setFlash({ type: 'success', message })
  }

  function showError(error) {
    setFlash({ type: 'error', message: error.message || 'Something went wrong.' })
  }

  function closeDrawer() {
    setDrawer(null)
  }

  function openProductDrawer(product = null) {
    if (product) {
      setEditingProductId(product.id)
      setProductForm({
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity_in_stock: product.quantity_in_stock,
      })
    } else {
      setEditingProductId(null)
      setProductForm(emptyProductForm)
    }
    setDrawer('product')
  }

  function openCustomerDrawer() {
    setCustomerForm(emptyCustomerForm)
    setDrawer('customer')
  }

  function openOrderDrawer() {
    setOrderForm(emptyOrderForm)
    setDrawer('order')
  }

  function updateProductForm(field, value) {
    setProductForm((current) => ({ ...current, [field]: value }))
  }

  function updateCustomerForm(field, value) {
    setCustomerForm((current) => ({ ...current, [field]: value }))
  }

  function updateOrderForm(field, value) {
    setOrderForm((current) => ({ ...current, [field]: value }))
  }

  async function handleProductSubmit(event) {
    event.preventDefault()

    const payload = {
      ...productForm,
      price: Number(productForm.price),
      quantity_in_stock: Number(productForm.quantity_in_stock),
    }

    try {
      if (editingProductId) {
        await apiRequest(`/products/${editingProductId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        showSuccess('Product updated.')
      } else {
        await apiRequest('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        showSuccess('Product created.')
      }

      closeDrawer()
      setEditingProductId(null)
      setProductForm(emptyProductForm)
      await loadData()
    } catch (error) {
      showError(error)
    }
  }

  async function handleCustomerSubmit(event) {
    event.preventDefault()

    try {
      await apiRequest('/customers', {
        method: 'POST',
        body: JSON.stringify(customerForm),
      })
      showSuccess('Customer created.')
      closeDrawer()
      setCustomerForm(emptyCustomerForm)
      await loadData()
    } catch (error) {
      showError(error)
    }
  }

  async function handleOrderSubmit(event) {
    event.preventDefault()

    for (const item of orderForm.items) {
      const productId = Number(item.product_id)
      const requestedQuantity = Number(item.quantity)
      const product = products.find((entry) => entry.id === productId)

      if (!product) {
        showError(new Error('Select a valid product for each line item.'))
        return
      }

      if (requestedQuantity > product.quantity_in_stock) {
        showError(
          new Error(
            `Only ${product.quantity_in_stock} units available for ${product.name}. Reduce the quantity before placing the order.`,
          ),
        )
        return
      }
    }

    const payload = {
      customer_id: Number(orderForm.customer_id),
      items: orderForm.items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      })),
    }

    try {
      const order = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      showSuccess('Order created.')
      closeDrawer()
      setOrderForm(emptyOrderForm)
      setSelectedOrder(order)
      await loadData()
    } catch (error) {
      showError(error)
    }
  }

  async function handleDelete(path, label) {
    try {
      await apiRequest(path, { method: 'DELETE' })
      showSuccess(`${label} deleted.`)
      await loadData()
    } catch (error) {
      showError(error)
    }
  }

  function updateOrderItem(index, field, value) {
    setOrderForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }))
  }

  function addOrderItemRow() {
    setOrderForm((current) => ({
      ...current,
      items: [...current.items, { product_id: '', quantity: '' }],
    }))
  }

  function removeOrderItemRow(index) {
    setOrderForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  function renderViewAction() {
    if (activeView === 'products') {
      return <button onClick={() => openProductDrawer()}>Add Product</button>
    }
    if (activeView === 'customers') {
      return <button onClick={openCustomerDrawer}>Add Customer</button>
    }
    if (activeView === 'orders') {
      return <button onClick={openOrderDrawer}>Create Order</button>
    }
    return null
  }

  function renderView() {
    if (activeView === 'products') {
      return (
        <ProductsTab
          products={products}
          loading={loading}
          onEdit={(product) => openProductDrawer(product)}
          onDelete={(id) => handleDelete(`/products/${id}`, 'Product')}
        />
      )
    }

    if (activeView === 'customers') {
      return (
        <CustomersTab
          customers={customers}
          loading={loading}
          onDelete={(id) => handleDelete(`/customers/${id}`, 'Customer')}
        />
      )
    }

    if (activeView === 'orders') {
      return (
        <OrdersTab
          orders={orders}
          loading={loading}
          selectedOrder={selectedOrder}
          onSelectOrder={setSelectedOrder}
          onDeleteOrder={(id) => handleDelete(`/orders/${id}`, 'Order')}
        />
      )
    }

    return (
      <OverviewTab
        summary={summary}
        products={products}
        orders={orders}
        loading={loading}
        onOpenProducts={() => setActiveView('products')}
        onOpenOrders={() => setActiveView('orders')}
      />
    )
  }

  return (
    <div className="dashboard-shell">
      <Sidebar activeView={activeView} onChangeView={setActiveView} />

      <main className="dashboard-main">
        <PageHeader
          badge={loading ? 'Syncing' : 'Live'}
          title={viewMeta[activeView].title}
          subtitle={viewMeta[activeView].subtitle}
          action={renderViewAction()}
        />

        <FlashBanner
          flash={flash}
          onRetry={() => loadData()}
          onClose={() => setFlash({ type: '', message: '' })}
        />
        {loading ? (
          <div className="loading-note">
            <strong>Loading data...</strong>
            <span>Free-hosted backend services can take a few seconds to wake up.</span>
          </div>
        ) : null}
        {renderView()}
      </main>

      <Drawer
        open={drawer === 'product'}
        title={editingProductId ? 'Edit Product' : 'Create Product'}
        subtitle=""
        onClose={closeDrawer}
      >
        <form className="form-grid" onSubmit={handleProductSubmit}>
          <label>
            <span>Product name</span>
            <input
              value={productForm.name}
              onChange={(event) => updateProductForm('name', event.target.value)}
              placeholder="Wireless Keyboard"
              required
            />
          </label>
          <label>
            <span>SKU / code</span>
            <input
              value={productForm.sku}
              onChange={(event) => updateProductForm('sku', event.target.value)}
              placeholder="KB-001"
              required
            />
          </label>
          <label>
            <span>Unit price</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={productForm.price}
              onChange={(event) => updateProductForm('price', event.target.value)}
              required
            />
          </label>
          <label>
            <span>Quantity in stock</span>
            <input
              type="number"
              min="0"
              step="1"
              value={productForm.quantity_in_stock}
              onChange={(event) => updateProductForm('quantity_in_stock', event.target.value)}
              required
            />
          </label>
          <div className="button-row">
            <button type="submit">{editingProductId ? 'Save Changes' : 'Create Product'}</button>
            <button type="button" className="button-secondary" onClick={closeDrawer}>
              Cancel
            </button>
          </div>
        </form>
      </Drawer>

      <Drawer
        open={drawer === 'customer'}
        title="Create Customer"
        subtitle=""
        onClose={closeDrawer}
      >
        <form className="form-grid" onSubmit={handleCustomerSubmit}>
          <label>
            <span>Full name</span>
            <input
              value={customerForm.full_name}
              onChange={(event) => updateCustomerForm('full_name', event.target.value)}
              placeholder="Neha Sharma"
              required
            />
          </label>
          <label>
            <span>Email address</span>
            <input
              type="email"
              value={customerForm.email}
              onChange={(event) => updateCustomerForm('email', event.target.value)}
              placeholder="neha@company.com"
              required
            />
          </label>
          <label>
            <span>Phone number</span>
            <input
              value={customerForm.phone_number}
              onChange={(event) => updateCustomerForm('phone_number', event.target.value)}
              placeholder="+91 99999 99999"
              required
            />
          </label>
          <div className="button-row">
            <button type="submit">Create Customer</button>
            <button type="button" className="button-secondary" onClick={closeDrawer}>
              Cancel
            </button>
          </div>
        </form>
      </Drawer>

      <Drawer
        open={drawer === 'order'}
        title="Create Order"
        subtitle=""
        onClose={closeDrawer}
      >
        <form className="form-grid" onSubmit={handleOrderSubmit}>
          <label>
            <span>Customer</span>
            <select
              value={orderForm.customer_id}
              onChange={(event) => updateOrderForm('customer_id', event.target.value)}
              required
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name} ({customer.email})
                </option>
              ))}
            </select>
          </label>

          <div className="order-items-stack">
            {orderForm.items.map((item, index) => (
              <div className="drawer-item-card" key={`${index}-${item.product_id}`}>
                <label>
                  <span>Product</span>
                  <select
                    value={item.product_id}
                    onChange={(event) => updateOrderItem(index, 'product_id', event.target.value)}
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku}) • {product.quantity_in_stock} in stock
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Quantity</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    max={
                      item.product_id
                        ? products.find((product) => product.id === Number(item.product_id))
                            ?.quantity_in_stock || undefined
                        : undefined
                    }
                    value={item.quantity}
                    onChange={(event) => updateOrderItem(index, 'quantity', event.target.value)}
                    required
                  />
                </label>
                {item.product_id ? (
                  <p className="field-helper">
                    Available stock:{' '}
                    {products.find((product) => product.id === Number(item.product_id))
                      ?.quantity_in_stock ?? 0}
                  </p>
                ) : null}
                {orderForm.items.length > 1 ? (
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => removeOrderItemRow(index)}
                  >
                    Remove Line
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          <div className="button-row">
            <button type="button" className="button-secondary" onClick={addOrderItemRow}>
              Add Line Item
            </button>
            <button type="submit">Create Order</button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}

export default App
