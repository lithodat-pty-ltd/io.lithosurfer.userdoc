# Upload geochemistry data via the batch API

Load geochemistry through LithoSurfer’s **batch REST API**. Read the [geologist preparation guide](../README.md) first — the API does not remove the need for digestion, quantitation, and source-method metadata.

| General topic | Doc |
|---|---|
| Hierarchy, packages, Swagger, reference IDs | [`01_using-the-api/`](../../../01_using-the-api/) |
| Writable packages | [Packages and access](../../../01_using-the-api/packages-and-access.md) |
| Batch size, naming, name→id | [Batch upload via API](../../batch-upload-via-api/) |
| Resolving `Zr` / list names to ids | [Reference lists](../../../01_using-the-api/reference-lists.md) |

The batch path is typically **50–100× faster** than creating records one-by-one and is recommended above a few hundred samples.

---

## Prerequisites

- Account in an **institution**, with **write** access to a **data package** ([packages and access](../../../01_using-the-api/packages-and-access.md))
- Numeric **data package ID**
- Ability to call HTTPS APIs with a bearer token
- Data prepared as in [../README.md](../README.md)

Auth and package setup are institution-specific; ask Lithodat if you do not yet have a token or package.

---

## Geochem pipeline (order matters)

Parents before children — see [data hierarchy](../../../01_using-the-api/data-hierarchy.md).

```
1. POST /api/core/sample-with-locations/batch     → name → sampleId
2. POST /api/geochem/GCDataPoint/batch            → name → gcDataPointId
3. POST /api/geochem/ElementalConcentration/batch and/or
   POST /api/geochem/OxideConcentration/batch
```

Optional: `POST /api/core/SampleProperty/batch` for key/value metadata on samples.

Apply the general [batch upload](../../batch-upload-via-api/) rules (size ≤ 10 000, `id` null, `label\\session-id` names, writable package). All GC data points in one batch must share the same `dataPackageId`.

---

## Lookups for this pipeline

Build id maps once per run ([reference lists](../../../01_using-the-api/reference-lists.md)). Geochem-relevant lists include:

| Concept | Example endpoint | Use on |
|---|---|---|
| Elements | `GET /api/geochem/LElement?size=500` | `lElementId` |
| Oxides | `GET /api/geochem/LOxide?size=200` | `lOxideId` |
| Digestion category | `GET /api/geochem/LDigestionCategory` | `digestionCategoryId` |
| Digestion method | `GET /api/geochem/LDigestionMethod` | `digestionMethodId` |
| Quantitation level | `GET /api/geochem/LQuantitationLevel` | `quantitationLevelId` |
| Relative operator (`<`, `>`) | Swagger relative-operator list | `relativeOperatorId` |
| Origin | resolve by **path** (e.g. `/Depositional/Glacial`), kind `ORIGIN` | `originId` |

Confirm paths in Swagger ([endpoints](../../../01_using-the-api/endpoints-and-swagger.md)).

---

## Step 1 — Samples

**Endpoint:** `POST /api/core/sample-with-locations/batch`

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

**Response:** sample name → sample id (keep for step 2).

- Lat/lon may be omitted for non-spatial materials.
- Optional sample fields use `*Id` after lookup.
- Origin should use the vocabulary **path**, not only the leaf name.

---

## Step 2 — GC data points

**Endpoint:** `POST /api/geochem/GCDataPoint/batch`

Include digestion / quantitation / source fields whenever you have them ([prep guide](../README.md)).

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

**Response:** data-point name → **gc data point id** (keep for step 3).

`geochem_analytical_type` values include `MAJOR_ELEMENT`, `TRACE_ELEMENT`, `ISOTOPE`, `OTHER` (confirm in Swagger).

---

## Step 3 — Concentrations

| Kind | Endpoint |
|---|---|
| Elemental | `POST /api/geochem/ElementalConcentration/batch` |
| Oxide | `POST /api/geochem/OxideConcentration/batch` |

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

- Field name is **`concentration`** (not `value`).
- Pair `relativeOperatorId` (`<` / `>`) with `detectionLimit` when the lab published both.
- Response is empty `{}`. Elemental and oxide loads are **separate** calls.

---

## After the load

1. Confirm HTTP **200** on each batch (batch create uses 200, not 201).
2. Name→id map size should match samples / data points sent.
3. Spot-check digestion category, method code, a concentration, and any `<DL` case in the UI.
4. Record package id, source file, date, and counts in a short import log.

Errors such as batch size, missing `\\`, or package write failures are covered in [batch upload via API](../../batch-upload-via-api/) and [packages and access](../../../01_using-the-api/packages-and-access.md).

---

## See also

- [Preparing geochemistry data](../README.md)
- [Batch upload via API](../../batch-upload-via-api/)
- [Using the API](../../../01_using-the-api/)
- Swagger — exact DTO shapes for your deployed version
