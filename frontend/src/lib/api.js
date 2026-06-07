const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export async function apiRequest(path, options = {}) {
  const hasBody =
    options.body !== undefined &&
    options.body !== null &&
    options.method !== 'GET' &&
    options.method !== 'HEAD'

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  if (response.status === 204) {
    return null
  }

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.detail || 'Request failed.')
  }

  return data
}
