import { API_BASE, MAX_CHILD_ROWS, MAX_PARENT_IDS } from './config.js'
import { authHeaders } from './auth.js'

/** Split paste box into tokens (ids or names). Comma / semicolon / newline. */
export function parseTokens(raw) {
  return String(raw || '')
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** @deprecated use parseTokens + resolveUPbDataPointRefs */
export function parseIds(raw) {
  return parseTokens(raw)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n > 0)
}

/**
 * Paginated GET with JHipster `field.in=` filter.
 * @template T
 * @param {string} path e.g. `/api/upb/UPbSpotData`
 * @param {string} parentFilterKey e.g. `uPbDataPointId`
 * @param {number[]} parentIds
 * @returns {Promise<T[]>}
 */
export async function fetchAllPages(path, parentFilterKey, parentIds) {
  if (parentIds.length === 0) return []
  if (parentIds.length > MAX_PARENT_IDS) {
    throw new Error(`At most ${MAX_PARENT_IDS} parent IDs (got ${parentIds.length}).`)
  }

  const pageSize = 200
  let page = 0
  /** @type {T[]} */
  const all = []

  for (;;) {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('size', String(pageSize))
    params.set(`${parentFilterKey}.in`, parentIds.join(','))

    const res = await fetch(`${API_BASE}${path}?${params}`, {
      headers: authHeaders(),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`GET ${path} failed (${res.status}). ${text.slice(0, 240)}`)
    }
    const batch = await res.json()
    if (!Array.isArray(batch)) throw new Error(`Unexpected response from ${path}`)
    all.push(...batch)

    if (all.length > MAX_CHILD_ROWS) {
      throw new Error(`More than ${MAX_CHILD_ROWS} child rows. Narrow the selection.`)
    }

    const total = Number(res.headers.get('X-Total-Count') || '0')
    if (batch.length < pageSize || (total > 0 && all.length >= total)) break
    page += 1
    if (page > 50) break
  }

  return all
}

export async function fetchUPbSpots(parentIds) {
  return fetchAllPages('/api/upb/UPbSpotData', 'uPbDataPointId', parentIds)
}

/**
 * @param {Record<string, unknown>} criteria
 * @param {number} [size]
 */
async function postUPbDataPoints(criteria, size = 20) {
  const params = new URLSearchParams()
  params.set('page', '0')
  params.set('size', String(size))
  const res = await fetch(`${API_BASE}/api/upb/UPbDataPoint/post?${params}`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(criteria ?? {}),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`UPbDataPoint lookup failed (${res.status}). ${text.slice(0, 240)}`)
  }
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

function rowLabel(row) {
  const name = row?.dataPointDTO?.name
  return name ? `${name} (id ${row.id})` : `id ${row.id}`
}

/**
 * Resolve pasted tokens (numeric UPbDataPoint ids and/or datapoint names) to ids.
 * @param {string[]} tokens
 * @returns {Promise<{ ids: number[], notes: string[] }>}
 */
export async function resolveUPbDataPointRefs(tokens) {
  if (tokens.length === 0) {
    throw new Error('Enter at least one datapoint id or name.')
  }
  if (tokens.length > MAX_PARENT_IDS) {
    throw new Error(`At most ${MAX_PARENT_IDS} datapoints (got ${tokens.length}).`)
  }

  /** @type {number[]} */
  const ids = []
  /** @type {string[]} */
  const notes = []

  for (const token of tokens) {
    if (/^\d+$/.test(token)) {
      const id = Number(token)
      ids.push(id)
      notes.push(`${token} → id ${id}`)
      continue
    }

    // Name filters: `equals` and `contains` work; `equalsIgnoreCase` is ignored by the API.
    let matches = await postUPbDataPoints({
      dataPointLithoCriteria: { name: { equals: token } },
    })

    if (matches.length === 0) {
      const loose = await postUPbDataPoints(
        { dataPointLithoCriteria: { name: { contains: token } } },
        10,
      )
      if (loose.length === 1) {
        matches = loose
      } else if (loose.length > 1) {
        const preview = loose
          .slice(0, 5)
          .map(rowLabel)
          .join('; ')
        throw new Error(
          `Ambiguous name "${token}" (${loose.length} matches). Be more specific or use an id. Matches: ${preview}`,
        )
      }
    }

    if (matches.length === 0) {
      throw new Error(`No U-Pb datapoint found for "${token}".`)
    }
    if (matches.length > 1) {
      throw new Error(
        `Multiple datapoints named "${token}". Use the numeric id. Matches: ${matches
          .slice(0, 5)
          .map(rowLabel)
          .join('; ')}`,
      )
    }

    const row = matches[0]
    if (row?.id == null) throw new Error(`Lookup for "${token}" returned no id.`)
    ids.push(row.id)
    notes.push(`"${token}" → ${rowLabel(row)}`)
  }

  return { ids: Array.from(new Set(ids)), notes }
}
