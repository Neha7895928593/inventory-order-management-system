const navItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'products', label: 'Products' },
  { id: 'customers', label: 'Customers' },
  { id: 'orders', label: 'Orders' },
]

function Sidebar({ activeView, onChangeView }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">EA</div>
        <div>
          <h1>Inventory OS</h1>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onChangeView(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
