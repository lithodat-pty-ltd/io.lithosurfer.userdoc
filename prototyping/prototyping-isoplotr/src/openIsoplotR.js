import { ISOPLOTR_INIT_URL } from './config.js'

/**
 * Hand off a session blob to hosted IsoplotRgui.
 * Must be a navigational form POST (field name `data`) — not fetch.
 * @param {Record<string, unknown>} session
 */
export function openIsoplotR(session) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = ISOPLOTR_INIT_URL
  form.target = '_blank'
  form.style.display = 'none'

  const input = document.createElement('input')
  input.type = 'hidden'
  input.name = 'data'
  input.value = JSON.stringify(session)
  form.appendChild(input)

  document.body.appendChild(form)
  form.submit()
  form.remove()
}

/** Download session JSON for debugging / sharing with engineering. */
export function downloadSessionJson(session, filename = 'isoplotr-session.json') {
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
