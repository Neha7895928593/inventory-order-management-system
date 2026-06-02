function normalizeApiDate(value) {
  if (!value) {
    return new Date()
  }

  if (typeof value === 'string' && !/[zZ]|[+-]\d{2}:\d{2}$/.test(value)) {
    return new Date(`${value}Z`)
  }

  return new Date(value)
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value || 0)
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(normalizeApiDate(value))
}
