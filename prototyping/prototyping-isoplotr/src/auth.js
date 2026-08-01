import { API_BASE } from './config.js'

const TOKEN_KEY = 'isoplotr_proto_jwt'
const ACCOUNT_KEY = 'isoplotr_proto_account'

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function getAccount() {
  try {
    return JSON.parse(sessionStorage.getItem(ACCOUNT_KEY) || 'null')
  } catch {
    return null
  }
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(ACCOUNT_KEY)
}

/**
 * Authenticate against LithoSurfer PROD (via Vite proxy).
 * @returns {Promise<{ id_token: string, account: object }>}
 */
export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, rememberMe: false }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Login failed (${res.status}). ${text.slice(0, 200)}`)
  }
  const body = await res.json()
  const token = body.id_token
  if (!token) throw new Error('Login response missing id_token.')

  sessionStorage.setItem(TOKEN_KEY, token)

  const accountRes = await fetch(`${API_BASE}/api/account`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const account = accountRes.ok ? await accountRes.json() : { login: username }
  sessionStorage.setItem(ACCOUNT_KEY, JSON.stringify(account))
  return { id_token: token, account }
}

export function authHeaders() {
  const token = getToken()
  if (!token) throw new Error('Not logged in.')
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  }
}
