function Drawer({ open, title, subtitle, onClose, children }) {
  if (!open) {
    return null
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h3>{title}</h3>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  )
}

export default Drawer
