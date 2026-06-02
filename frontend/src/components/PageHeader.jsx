function PageHeader({ title, subtitle, badge, action }) {
  return (
    <header className="page-header">
      <div className="page-header-copy">
        {badge ? <p className="page-badge">{badge}</p> : null}
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action ? <div className="page-header-action">{action}</div> : null}
    </header>
  )
}

export default PageHeader
