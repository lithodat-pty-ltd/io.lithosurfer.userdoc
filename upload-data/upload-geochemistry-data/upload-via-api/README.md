# Upload geochemistry data via the batch API

This page is for contributors who will load geochemistry through LithoSurfer’s **batch REST API**. Read the [geologist preparation guide](../README.md) first — the API does not remove the need for digestion, quantitation, and source-method metadata.

The batch path is typically **50–100× faster** than creating records one-by-one and is the recommended route above a few hundred samples.

---

## Prerequisites

- LithoSurfer account in an **institution**, with **write** access to a **data package**
- Numeric **data package ID**
- Ability to call HTTPS APIs (script, notebook, or tool) with a bearer token
- Data prepared as described in [../README.md](../README.md)

Auth and package setup are institution-specific; ask Lithodat if you do not yet have a token or package.

---

## Pipeline (order matters)

```
1. POST /api/core/sample-with-locations/batch     → name → sampleId
2. POST /api/geochem/GCDataPoint/batch            → name → gcDataPointId
3. POST /api/geochem/ElementalConcentration/batch and/or
   POST /api/geochem/OxideConcentration/batch
```

Optional: `POST /api/core/SampleProperty/batch` for extra key/value metadata on samples.

Each step must finish before the next: concentrations need GC data point IDs; GC data points need sample IDs.

---

## Batch rules

| Rule | Detail |
|---|---|
| Max size | **10,000** items per request (prefer 2,000–5,000) |
| Transaction | Whole batch succeeds or fails together |
| New rows only | Every DTO must have `id` null / omitted |
| Names | Sample and data-point names must contain `\\` — see [Naming](#naming) |
| One package | All GC data points in one batch must share the same `dataPackageId` |

---

## Resolve lookup lists to IDs

Your spreadsheet has names (`Zr`, `Aqua Regia`, `Near-total`). The API wants numeric IDs. Fetch lists **once** per run and build maps.

| Concept | Example endpoint | Use on |
|---|---|---|
| Elements | `GET /api/geochem/LElement?size=500` | Elemental concentrations (`lElementId`) |
| Oxides | `GET /api/geochem/LOxide?size=200` | Oxide concentrations (`lOxideId`) |
| Digestion category | `GET /api/geochem/LDigestionCategory` | `digestionCategoryId` |
| Digestion method | `GET /api/geochem/LDigestionMethod` | `digestionMethodId` |
| Quantitation level | `GET /api/geochem/LQuantitationLevel` | `quantitationLevelId` |
| Analytical technique | geochem analytical type list (Swagger) | technique / type fields |
| Relative operator (`<`, `>`) | relative-operator list (Swagger) | `relativeOperatorId` |
| Sample kind / method / origin | core list endpoints | sample fields |
| Origin | resolve by **path** (e.g. `/Depositional/Glacial`), kind `ORIGIN` | `originId` |

Swagger: append the API docs path for your host (ask Lithodat for the current URL).

---

## Step 1 — Samples

**Endpoint:** `POST /api/core/sample-with-locations/batch`

Minimum shape:

```json
[
  {
    "sampleDTO": {
      "name": "SITE-001\\20260731-import",
      "dataPackageId": 12345
    },
    "locationDTO": {
      "lat": -25.3,
      "lon": 131.0,
      "name": "LOC-SITE-001\\20260731-import"
    }
  }
]
```

**Response:** map of sample name → sample id. Keep it for step 2.

Notes:

- Lat/lon may be omitted for non-spatial materials.
- Optional sample fields (kind, method, origin, …) use `*Id` after lookup.
- Origin import should use the vocabulary **path**, not only the leaf name.

---

## Step 2 — GC data points (analyses)

**Endpoint:** `POST /api/geochem/GCDataPoint/batch`

Each item is one analytical session on one sample. Include digestion / quantitation / source fields whenever you have them.

```json
[
  {
    "gcDataPointDTO": {
      "sampleId": 67890,
      "geochem_analytical_type": "TRACE_ELEMENT",
      "digestionCategoryId": 111,
      "digestionMethodId": 222,
      "quantitationLevelId": 333,
      "sourceMethodCode": "ME-ICP61",
      "sourceMethodDesc": "Four acid digest, ICP-MS finish",
      "laboratoryCode": "ALS",
      "sourceUnit": "ppm",
      "sampleWeightGm": null,
      "analysisDate": "2019-03",
      "sourceAnalysisId": "lab-run-99881",
      "digestionNotes": null
    },
    "dataPointDTO": {
      "name": "DP-SITE-001-ME-ICP61\\20260731-import",
      "dataPackageId": 12345
    }
  }
]
```

**Response:** map of data-point name → **gc data point id**. Keep it for step 3.

`geochem_analytical_type` values include `MAJOR_ELEMENT`, `TRACE_ELEMENT`, `ISOTOPE`, `OTHER` (confirm against Swagger for your server version).

---

## Step 3 — Concentrations

| Kind | Endpoint |
|---|---|
| Elemental | `POST /api/geochem/ElementalConcentration/batch` |
| Oxide | `POST /api/geochem/OxideConcentration/batch` |

Example elemental rows:

```json
[
  {
    "gCDataPointId": 99001,
    "lElementId": 212,
    "concentration": 120.0,
    "detectionLimit": 0.5,
    "relativeOperatorId": null
  },
  {
    "gCDataPointId": 99001,
    "lElementId": 5,
    "concentration": 0.5,
    "detectionLimit": 0.5,
    "relativeOperatorId": 12
  }
]
```

Notes:

- Field name is **`concentration`** (not `value`).
- `relativeOperatorId` marks `<` / `>` when the lab flagged the result; pair with `detectionLimit` when published.
- Do not put the detection limit into `concentration` and drop the operator — keep both roles clear.
- Response is empty `{}` (concentrations have no public name map).
- Elemental and oxide loads are **separate** batch calls.

---

## Naming

Every sample and data-point name must look like:

```text
<label>\\<session-id>
```

Examples: `SITE-001\\20260731-import`, `DP-SITE-001\\20260731-import`

| Rule | Why |
|---|---|
| Labels unique **within** a batch | Otherwise the returned name→id map overwrites silently |
| Full names unique **globally** (including soft-deleted) | Re-imports need a new session-id |
| Same session-id for one run | Keeps the batch identifiable |
| New session-id on re-run | Avoids collisions |

---

## Large datasets

Split into sequential chunks under 10,000. Log each chunk’s name→id map before continuing. A failed chunk rolls back only that chunk.

---

## Common errors

| Message | Fix |
|---|---|
| `Batch size N exceeds the maximum of 10000` | Split the batch |
| `Batch create does not allow an existing id` | Omit `id` on create |
| `Every DataPointDTO name must already contain the uniquifier separator '\\'` | Add `\\session-id` |
| `Unknown gCDataPointId(s): […]` | Use ids from step 2 for the same package |
| `All DTOs in a batch must belong to the same data package` | Split by package |
| Package write / bouncer errors | Get write access to the package |

---

## After the load

1. Confirm HTTP **200** on each batch (batch create uses 200, not 201).
2. Check that name→id map size matches the number of samples / data points sent.
3. Spot-check a few samples in the UI: digestion category, method code, a concentration, and any `<DL` case.
4. Record package id, source file, date, and counts in a short import log.

---

## See also

- [Preparing geochemistry data](../README.md) — geological meaning of the fields
- LithoSurfer Swagger — exact DTO shapes for your deployed version
