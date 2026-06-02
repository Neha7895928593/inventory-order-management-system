function MetricCard({ label, value, helper, tone = 'default', loading = false }) {
  return (
    <article className={`metric-card ${tone}`}>
      <span>{label}</span>
      {loading ? <div className="skeleton-line skeleton-value" /> : <strong>{String(value)}</strong>}
      {helper ? (
        loading ? <div className="skeleton-line skeleton-helper" /> : <p>{helper}</p>
      ) : null}
    </article>
  )
}

export default MetricCard
