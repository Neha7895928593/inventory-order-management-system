import PanelCard from './PanelCard'
import { formatCurrency, formatDate } from '../lib/format'

function OrdersTab({ orders, selectedOrder, onSelectOrder, onDeleteOrder }) {
  return (
    <div className="view-grid">
      <div className="orders-layout">
        <PanelCard title="Orders" subtitle="">
          <div className="order-list">
            {orders.map((order) => (
              <article
                key={order.id}
                className={`order-list-item ${selectedOrder?.id === order.id ? 'active' : ''}`}
                onClick={() => onSelectOrder(order)}
              >
                <div>
                  <strong>Order #{order.id}</strong>
                  <p>{order.customer_name}</p>
                  <p>{formatDate(order.created_at)}</p>
                </div>
                <div className="order-list-item-right">
                  <strong>{formatCurrency(order.total_amount)}</strong>
                  <button
                    type="button"
                    className="button-danger"
                    onClick={(event) => {
                      event.stopPropagation()
                      onDeleteOrder(order.id)
                    }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {!orders.length ? <p className="empty-state">No orders created yet.</p> : null}
          </div>
        </PanelCard>

        <PanelCard
          title="Order Detail"
          subtitle=""
        >
          {selectedOrder ? (
            <div className="order-detail">
              <div className="detail-summary">
                <div>
                  <strong>Order #{selectedOrder.id}</strong>
                  <p>{selectedOrder.customer_name}</p>
                </div>
                <div className="detail-summary-right">
                  <strong>{formatCurrency(selectedOrder.total_amount)}</strong>
                  <p>{formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>
              <div className="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.product_name}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.unit_price)}</td>
                        <td>{formatCurrency(item.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="empty-state">Select an order to view its details.</p>
          )}
        </PanelCard>
      </div>
    </div>
  )
}

export default OrdersTab
