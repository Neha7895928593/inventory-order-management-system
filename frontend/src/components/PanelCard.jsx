function PanelCard({ title, subtitle, actions, children, className = '' }) {
  return (
    <section className={`panel-card ${className}`.trim()}>
      <div className="panel-card-header">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="panel-card-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

export default PanelCard
