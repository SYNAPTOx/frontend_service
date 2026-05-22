const BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:4000'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

function resolveUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${BASE_URL}${path}`
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const data = await res.json()
      message = data.message ?? data.error ?? message
    } catch {}
    throw new Error(message)
  }
  const text = await res.text()
  if (!text) return {} as T
  const json = JSON.parse(text)
  // Backend services wrap responses in { success, data }. Unwrap automatically
  // but pass through responses that don't follow this pattern (e.g. auth).
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T
  }
  return json as T
}

export const http = {
  get<T>(path: string): Promise<T> {
    return fetch(resolveUrl(path), {
      headers: authHeaders(),
    }).then(r => handleResponse<T>(r))
  },

  post<T>(path: string, body: unknown): Promise<T> {
    return fetch(resolveUrl(path), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(r => handleResponse<T>(r))
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return fetch(resolveUrl(path), {
      method: 'PUT',
      headers: authHeaders(),
      body: body != null ? JSON.stringify(body) : undefined,
    }).then(r => handleResponse<T>(r))
  },

  delete<T>(path: string): Promise<T> {
    return fetch(resolveUrl(path), {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(r => handleResponse<T>(r))
  },

  /** For SSE streaming (AI chat) — returns raw Response */
  stream(path: string, body: unknown): Promise<Response> {
    return fetch(resolveUrl(path), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    })
  },

  postForm<T>(path: string, formData: FormData): Promise<T> {
    const token = getToken()
    return fetch(resolveUrl(path), {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(r => handleResponse<T>(r))
  },
}
