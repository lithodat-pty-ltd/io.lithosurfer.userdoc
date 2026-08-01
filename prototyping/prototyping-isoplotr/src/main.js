import './styles.css'
import { clearSession, getAccount, getToken, login } from './auth.js'
import { downloadSessionJson, openIsoplotR } from './openIsoplotR.js'
import { getMethod, methods } from './methods/registry.js'

/** @type {{ methodId: string, parentIds: number[], children: any[], options: any }} */
let state = {
  methodId: 'upb',
  parentIds: [],
  children: [],
  options: { ratioSource: 'auto', format: undefined, plotdevice: undefined },
}

const $ = (sel) => document.querySelector(sel)

function show(el, on) {
  el.classList.toggle('hidden', !on)
}

function setError(msg) {
  const el = $('#error')
  el.textContent = msg || ''
  show(el, Boolean(msg))
}

function setStatus(msg) {
  const el = $('#status')
  el.textContent = msg || ''
  show(el, Boolean(msg))
}

function renderUserbar() {
  const account = getAccount()
  const loggedIn = Boolean(getToken())
  show($('#view-login'), !loggedIn)
  show($('#view-app'), loggedIn)
  if (loggedIn && account) {
    $('#user-label').textContent = account.login || account.email || 'signed in'
  }
}

function fillMethodSelect() {
  const sel = $('#method')
  sel.innerHTML = ''
  for (const m of Object.values(methods)) {
    const opt = document.createElement('option')
    opt.value = m.id
    opt.textContent = m.label
    opt.disabled = Boolean(m.stub)
    sel.appendChild(opt)
  }
  sel.value = 'upb'
}

function onMethodChange() {
  state.methodId = $('#method').value
  const m = getMethod(state.methodId)
  $('#ids').placeholder = m.parentHint || 'ids'
  $('#ids-hint').textContent = m.parentHint || ''
}

async function onLogin(e) {
  e.preventDefault()
  setError('')
  const btn = $('#login-btn')
  btn.disabled = true
  try {
    await login($('#username').value.trim(), $('#password').value)
    renderUserbar()
    setStatus('Logged in. Enter datapoint ids or names to load.')
  } catch (err) {
    setError(err.message || String(err))
  } finally {
    btn.disabled = false
  }
}

function onLogout() {
  clearSession()
  state = {
    methodId: 'upb',
    parentIds: [],
    children: [],
    options: { ratioSource: 'auto', format: undefined, plotdevice: undefined },
  }
  show($('#view-options'), false)
  setError('')
  setStatus('')
  renderUserbar()
}

async function onLoad() {
  setError('')
  setStatus('')
  const method = getMethod(state.methodId)
  if (method.stub) {
    setError(`${method.label} is a stub — implement it under src/methods/.`)
    return
  }
  const raw = $('#ids').value
  if (!String(raw || '').trim()) {
    setError('Enter at least one datapoint id or name.')
    return
  }

  const btn = $('#load-btn')
  btn.disabled = true
  try {
    const { children, summary, parentIds } = await method.load(raw)
    state.parentIds = parentIds || []
    state.children = children
    state.options = method.defaultOptions(children)
    setStatus(summary)
    renderOptions()
    show($('#view-options'), true)
  } catch (err) {
    show($('#view-options'), false)
    setError(err.message || String(err))
  } finally {
    btn.disabled = false
  }
}

function renderOptions() {
  const method = getMethod(state.methodId)
  const ratioSel = $('#ratio-source')
  ratioSel.value = state.options.ratioSource || 'auto'

  const formats = method.listFormats(state.children, state.options.ratioSource)
  const list = $('#format-list')
  list.innerHTML = ''

  if (formats.length === 0) {
    list.innerHTML = '<p class="error" style="padding:0.75rem;margin:0">No formats for this ratio source.</p>'
    state.options.format = undefined
    return
  }

  if (!formats.some((f) => f.format === state.options.format)) {
    state.options.format = formats[0].format
  }

  for (const f of formats) {
    const label = document.createElement('label')
    label.className = 'format-item'
    label.innerHTML = `
      <input type="radio" name="format" value="${f.format}" ${f.format === state.options.format ? 'checked' : ''} />
      <span>
        <strong>${f.shortLabel}</strong>
        <small>format ${f.format} · ${f.plotdevice} · ${f.usableSpots}/${state.children.length} spots</small>
      </span>
    `
    label.querySelector('input').addEventListener('change', () => {
      state.options.format = f.format
    })
    list.appendChild(label)
  }
}

function onRatioChange() {
  state.options.ratioSource = $('#ratio-source').value
  state.options.format = undefined
  renderOptions()
}

function buildCurrentSession() {
  const method = getMethod(state.methodId)
  return method.buildSession(state.children, state.options)
}

function onOpen() {
  setError('')
  try {
    const session = buildCurrentSession()
    openIsoplotR(session)
    setStatus('Opened IsoplotR in a new tab.')
  } catch (err) {
    setError(err.message || String(err))
  }
}

function onDownload() {
  setError('')
  try {
    const session = buildCurrentSession()
    downloadSessionJson(session, `isoplotr-${state.methodId}-${Date.now()}.json`)
  } catch (err) {
    setError(err.message || String(err))
  }
}

function onPreview() {
  setError('')
  try {
    const session = buildCurrentSession()
    const pre = $('#preview')
    pre.textContent = JSON.stringify(
      {
        geochronometer: session.settings?.geochronometer,
        plotdevice: session.settings?.plotdevice,
        format: session.settings?.['U-Pb']?.format,
        data4server: {
          nr: session.data4server?.nr,
          nc: session.data4server?.nc,
          firstRows: (session.data4server?.data || []).slice(0, 3),
        },
      },
      null,
      2,
    )
    show(pre, true)
  } catch (err) {
    setError(err.message || String(err))
  }
}

function boot() {
  fillMethodSelect()
  onMethodChange()
  renderUserbar()

  $('#login-form').addEventListener('submit', onLogin)
  $('#logout-btn').addEventListener('click', onLogout)
  $('#method').addEventListener('change', onMethodChange)
  $('#load-btn').addEventListener('click', onLoad)
  $('#ratio-source').addEventListener('change', onRatioChange)
  $('#open-btn').addEventListener('click', onOpen)
  $('#download-btn').addEventListener('click', onDownload)
  $('#preview-btn').addEventListener('click', onPreview)
}

boot()
