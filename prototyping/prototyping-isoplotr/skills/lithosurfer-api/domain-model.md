# Domain model (API view)

How LithoSurfer data is structured when working through the REST API. For the matching DB tables, see the `lithosurfer-datapoint-schema` skill.

## Hierarchy

```
DataPackage                          ← ACL / ownership boundary
  └── Sample (+ Location)            ← physical specimen + lat/lon
        └── DataPoint                ← one analytical session / measurement event
              └── Method specialization (GCDataPoint, FTDataPoint, UPbDataPoint, …)
                    └── Child measurements (concentrations, spots, lengths, …)
```

Rules of thumb:

1. **Everything lives in a data package.** Samples and data points both carry `dataPackageId`. Always scope writes/reads with `allowedAccess` (see `SKILL.md`).
2. **Sample is the geographic anchor.** Lat/lon come from the sample's `Location` (or mirrored coords on data points for map queries).
3. **One DataPoint = one method specialization.** A sample can have many data points across methods; each data point row points to exactly one method table.
4. **Measurements hang under the specialization**, not under the sample directly.

## Entity → API path map

| Level | Entity (API) | Typical path | Swagger group |
|---|---|---|---|
| Package | `data-packages` | `/api/management/data-packages` | 02 Management |
| Sample + location | `sample-with-locations` | `/api/core/sample-with-locations` | 03 Core Model |
| Generic data point | via the method resource (`GCDataPoint`, `FTDataPoint`, …) | `/api/<method>/<Entity>` | matching method group |
| Geochem DP | `GCDataPoint` | `/api/geochem/GCDataPoint` | 11 Geochem Data |
| Geochem children | `ElementalConcentration`, `OxideConcentration` | `/api/geochem/…` | 11 Geochem Data |
| Fission track DP | `FTDataPoint` | `/api/fissiontrack/FTDataPoint` | 09 Fission Track Data |
| U-Pb DP | `UPbDataPoint` | `/api/upb/UPbDataPoint` | 06 UPb |
| (U-Th)/He DP | `HeDataPoint` | `/api/helium/HeDataPoint` | 10 Helium Data |
| Ar-Ar DP | `ArArDataPoint` | `/api/arar/ArArDataPoint` | 16 ArAr |
| Lu-Hf DP | `LuHfDataPoint` | `/api/luhf/LuHfDataPoint` | 18 Lu-Hf |

Full method → group map: [reference.md](reference.md).

## Navigating the hierarchy via API

### Sample → its data points (by method)

Most method criteria nest a `dataPointLithoCriteria` (and often `sampleLithoCriteria`). Prefer filtering by sample id:

```bash
# Geochem data points for sample 12345
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/geochem/GCDataPoint/post?page=0&size=50" \
  --body '{
    "allowedAccess": "VIEWABLE",
    "dataPointLithoCriteria": {
      "sampleId": { "equals": 12345 }
    }
  }'
```

Same pattern for `/api/fissiontrack/FTDataPoint/post`, `/api/upb/UPbDataPoint/post`, etc. Confirm nested field names in cached Swagger (`*LithoCriteria` definitions).

### Data point → child measurements

```bash
# Elemental concentrations for a GC data point
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/geochem/ElementalConcentration/post?page=0&size=200" \
  --body '{ "gCDataPointId": { "equals": 99001 } }'
```

Child FK names vary (`gCDataPointId`, `fTDataPointId`, …). Grep Swagger:

```bash
node .cursor/skills/lithosurfer-api/scripts/search-swagger.js "gCDataPointId" --what defs
```

### Known ids

Search that entity with `id.in` on `POST …/post` or `POST …/download/post`. Measurements for known parent ids use the child foreign key (`gCDataPointId.in`, and the equivalent on other methods).

## Identifiers

| Id | Where | Notes |
|---|---|---|
| Internal numeric `id` | Every entity | Primary key for `id.in` and for foreign keys |
| `igsn` | Sample | String filter on `sample-with-locations` |
| `name` | Sample, DataPoint, … | Not globally unique; batch imports uniquify with `\\` |
| `dataPackageId` | Sample, DataPoint | ACL boundary |
| External / DOI | Literature, packages | Separate entities under `/api/core/` |

## Soft delete

List/search endpoints usually exclude soft-deleted rows by default. When counting or auditing, you may need `"deletedTimestamp": { "specified": false }` explicitly — check criteria definitions in Swagger if results look wrong.

## Related

- Regional queries: [geo-queries.md](geo-queries.md)
- Bulk export / raw download: [download-and-export.md](download-and-export.md)
- DB join chain: `.cursor/skills/lithosurfer-datapoint-schema/SKILL.md`
- Imports: `.cursor/skills/lithosurfer-import/SKILL.md`, `.cursor/skills/bulk-geochem-import/SKILL.md`
