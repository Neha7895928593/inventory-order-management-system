import PanelCard from './PanelCard'
import StatusBadge from './StatusBadge'
import { formatCurrency } from '../lib/format'

function getStockTone(quantity) {
  if (quantity === 0) {
    return 'critical'
  }
  if (quantity <= 5) {
    return 'warning'
  }
  return 'success'
}

function getStockLabel(quantity) {
  if (quantity === 0) {
    return 'Out of stock'
  }
  if (quantity <= 5) {
    return 'Low stock'
  }
  return 'Healthy'
}

function ProductsTab({ products, onEdit, onDelete }) {
  const inventoryUnits = products.reduce((total, product) => total + product.quantity_in_stock, 0)
  const inventoryValue = products.reduce(
    (total, product) => total + product.price * product.quantity_in_stock,
    0,
  )

  return (
    <div className="view-grid">
      <div className="workspace-summary-grid">
        <PanelCard title="Catalog" subtitle="">
          <div className="mini-stats">
            <div>
              <strong>{products.length}</strong>
              <span>Total products</span>
            </div>
            <div>
              <strong>{inventoryUnits}</strong>
              <span>Units in stock</span>
            </div>
            <div>
              <strong>{formatCurrency(inventoryValue)}</strong>
              <span>Inventory value</span>
            </div>
          </div>
        </PanelCard>

        <PanelCard title="Stock Health" subtitle="">
          <div className="mini-stats">
            <div>
              <strong>{products.filter((product) => product.quantity_in_stock > 5).length}</strong>
              <span>Healthy</span>
            </div>
            <div>
              <strong>{products.filter((product) => product.quantity_in_stock > 0 && product.quantity_in_stock <= 5).length}</strong>
              <span>Low stock</span>
            </div>
            <div>
              <strong>{products.filter((product) => product.quantity_in_stock === 0).length}</strong>
              <span>Out of stock</span>
            </div>
          </div>
        </PanelCard>
      </div>

      <PanelCard title="Product Table" subtitle="">
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.quantity_in_stock}</td>
                  <td>
                    <StatusBadge tone={getStockTone(product.quantity_in_stock)}>
                      {getStockLabel(product.quantity_in_stock)}
                    </StatusBadge>
                  </td>
                  <td className="table-button-cell">
                    <button type="button" className="button-secondary" onClick={() => onEdit(product)}>
                      Edit
                    </button>
                    <button type="button" className="button-danger" onClick={() => onDelete(product.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!products.length ? <p className="empty-state">No products created yet.</p> : null}
        </div>
      </PanelCard>
    </div>
  )
}

export default ProductsTab
