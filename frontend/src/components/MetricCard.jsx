function MetricCard({ label, value, helper, tone = 'default' }) {
  return (
    <article className={`metric-card ${tone}`}>
      <span>{label}</span>
      <strong>{String(value)}</strong>
      {helper ? <p>{helper}</p> : null}
    </article>
  )
}

export default MetricCard
