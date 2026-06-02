import MetricCard from './MetricCard'
import PanelCard from './PanelCard'
import StatusBadge from './StatusBadge'
import { formatCurrency, formatDate } from '../lib/format'

function OverviewTab({ summary, products, orders, onOpenProducts, onOpenOrders }) {
  const inventoryValue = products.reduce(
    (total, product) => total + product.price * product.quantity_in_stock,
    0,
  )
  const recentOrders = orders.slice(0, 6)

  return (
    <div className="view-grid">
      <div className="metrics-grid">
        <MetricCard label="Products" value={summary.total_products} helper="Catalog" />
        <MetricCard label="Customers" value={summary.total_customers} helper="Directory" />
        <MetricCard label="Orders" value={summary.total_orders} helper="Processed" />
        <MetricCard
          label="Low Stock"
          value={summary.low_stock_products.length}
          helper="Attention"
          tone={summary.low_stock_products.length ? 'warning' : 'success'}
        />
        <MetricCard label="Inventory Value" value={formatCurrency(inventoryValue)} helper="Current stock" />
      </div>

      <div className="overview-grid">
        <PanelCard
          title="Low Stock Products"
          subtitle=""
          actions={
            <button type="button" className="button-secondary" onClick={onOpenProducts}>
              Products
            </button>
          }
        >
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.low_stock_products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.quantity_in_stock}</td>
                    <td>
                      <StatusBadge tone={product.quantity_in_stock === 0 ? 'critical' : 'warning'}>
                        {product.quantity_in_stock === 0 ? 'Out of stock' : 'Low stock'}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!summary.low_stock_products.length ? (
              <p className="empty-state">No low-stock items at the moment.</p>
            ) : null}
          </div>
        </PanelCard>

        <PanelCard
          title="Recent Orders"
          subtitle=""
          actions={
            <button type="button" className="button-secondary" onClick={onOpenOrders}>
              Orders
            </button>
          }
        >
          <div className="activity-list">
            {recentOrders.map((order) => (
              <article className="activity-row" key={order.id}>
                <div>
                  <strong>Order #{order.id}</strong>
                  <p>{order.customer_name}</p>
                </div>
                <div className="activity-row-right">
                  <strong>{formatCurrency(order.total_amount)}</strong>
                  <p>{formatDate(order.created_at)}</p>
                </div>
              </article>
            ))}
            {!recentOrders.length ? <p className="empty-state">No recent orders yet.</p> : null}
          </div>
        </PanelCard>
      </div>
    </div>
  )
}

export default OverviewTab
