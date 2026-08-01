# Agent brief: IsoplotR prototyping kit

**You are extending an existing working base**, not scaffolding from zero.

Location: this kit folder (`prototyping-isoplotr/`).

```bash
npm install
npm run dev
```

Open the URL Vite prints (often `http://localhost:5173`). Vite proxies `/api` → `https://app.ausgeochem.org` (no CORS pain).

**API reference for agents:** bundled copy at `skills/lithosurfer-api/` (read `SKILL.md` + `reference.md` when you need endpoints, auth details, or Swagger helpers).

---

## What already works

| Piece | Where |
|-------|--------|
| Login (JWT in `sessionStorage`) | `src/auth.js` |
| Paginated PROD GET + caps | `src/api.js` |
| Form POST to IsoplotR | `src/openIsoplotR.js` → `https://isoplotr.lithodat.com/init` field `data` |
| Full session skeleton | `fixtures/sessionTemplate.json` |
| U-Pb mapper (formats + ratio sources) | `src/lib/mapUPbSpots.ts` (from client100) |
| UI: login → IDs → options → open/download | `index.html` + `src/main.js` |
| Method plugin registry | `src/methods/registry.js` |

**U-Pb path is production-grade.** Prefer reusing / tweaking it over rewriting.

---

## Hard rules

1. **PROD read-only** — only `POST /api/authenticate` and `GET`s. No writes.
2. **Never `fetch` IsoplotR** — always `openIsoplotR(session)` form POST.
3. **Clone `sessionTemplate.json`** then overwrite the active geochronometer + `data4server` (see mapper).
4. **Credentials** — ask the geologist for a **dedicated AI user** (`ROLE_USER` + package read access). Warn if they use a personal account. Never commit secrets.
5. Caps: 20 parent ids, 500 child rows (`src/config.js`).

---

## How to add a new method (the usual ask)

1. Create `src/methods/mapXxx.js` (or `.ts`) that builds a session from child rows.
2. Register it in `src/methods/registry.js` with:
   - `load(parentIds)` — fetch children via `fetchAllPages` in `api.js`
   - `defaultOptions` / `listFormats` (or simplify UI)
   - `buildSession(children, options)`
3. Wire any extra option controls in `main.js` / `index.html` if needed.
4. Keep a golden fixture under `fixtures/` for offline open tests.
5. Smoke-test: login → load ids → open IsoplotR → confirm plot.

### Endpoint cheatsheet

| Method | Parent IDs | Children |
|--------|------------|----------|
| U-Pb | `UPbDataPoint` id **or** `dataPointDTO.name` | Resolve names via `POST /api/upb/UPbDataPoint/post` (`dataPointLithoCriteria.name`); spots via `GET /api/upb/UPbSpotData?uPbDataPointId.in=` |
| Ar-Ar | `ArArDataPoint` | `GET /api/arar/ArArMeasurement?arArDataPointId.in=` (uncertainties are **percent**) |
| FT | `FTDataPoint` | `ft-count-data` + `FTSingleGrain`, join `grainName`; ICP abs format 3; omit incomplete with `(omit): "x"` |

FT science notes (hannelore):  
`com.lithodat.ai.hannelore/project/lithosurfer/development/isoplotR integration/malcolm-decisions-2026-07.md`

---

## Agent workflow with a geologist

1. Confirm dedicated AI user + 1–3 example parent IDs.
2. `npm install && npm run dev` — verify U-Pb still opens IsoplotR.
3. Implement only what they asked (usually one new method or mapping tweak).
4. Update `README.md` if run instructions change.
5. Do **not** PR into client100 unless they explicitly want productionisation.

---

## Acceptance (keep green)

- [ ] Login against PROD via proxy
- [ ] U-Pb load + format picker + Open IsoplotR
- [ ] Download session JSON works
- [ ] No secrets in git; no PROD writes
- [ ] New methods go through `src/methods/registry.js`
