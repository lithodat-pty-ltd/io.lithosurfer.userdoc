# Navigating and hydrating

How to move from a starting point — a sample, a data package, a set of ids — to the records you want, and back out to full nested detail.

| Related | Doc |
|---|---|
| Sample → data point → measurements | [Data hierarchy](../01_using-the-api/data-hierarchy.md) |
| Search operators, `/post` criteria bodies | [Endpoints and Swagger](../01_using-the-api/endpoints-and-swagger.md) |
| Region filters | [Geographic queries](geographic-queries.md) |
| Bulk export | [Download and export](download-and-export.md) |

Set `allowedAccess` on every call — see [Packages and access](../01_using-the-api/packages-and-access.md).

---

## Filter by parent id

Most method search endpoints nest a `dataPointLithoCriteria` (and often a `sampleLithoCriteria`). Filtering by sample id is usually the fastest way to get "everything for this sample" in one method.

**Endpoint:** `POST /api/geochem/GCDataPoint/post?page=0&size=50`

```json
{
  "allowedAccess": "VIEWABLE",
  "dataPointLithoCriteria": {
    "sampleId": { "equals": 12345 }
  }
}
```

Same pattern for `/api/fissiontrack/FTDataPoint/post`, `/api/upb/UPbDataPoint/post`, and the other method groups — confirm the exact nested field name (`*LithoCriteria`) against the Swagger definition for that entity, since it varies slightly per method.

## Filter by child, up to the parent

**Endpoint:** `POST /api/geochem/ElementalConcentration/post?page=0&size=200`

```json
{ "gcdataPointId": { "equals": 99001 } }
```

Child foreign-key names vary by method (`gcdataPointId`, `fTDataPointId`, `uPbDataPointId`, …) — check the Swagger definition for the exact field name before writing the filter.

## Expand ids to full detail (hydration)

When you already have ids — from `findIds`, a map click, or a previous search — hydrate instead of re-running a criteria search:

| Endpoint | Expands |
|---|---|
| `GET /api/core/hydrate-samples-by-id?sampleIds=1,2,3` | Samples + location |
| `GET /api/core/hydrate-datapoints-by-id?ids=…` | Generic data points |
| `GET /api/core/hydrate-gc-by-id?ids=…` | Geochemistry, with children in context |
| `GET /api/core/hydrate-fissionTrack-by-id?ids=…` | Fission track |
| `GET /api/core/hydrate-upb-by-id?ids=…` | U-Pb |
| `GET /api/core/hydrate-he-by-id?ids=…` | Helium |
| `GET /api/core/hydrate-arar-by-id?ids=…` | Ar-Ar |
| `GET /api/core/hydrate-luhf-by-id?ids=…` | Lu-Hf |
| `GET /api/core/hydrate-igsn-sample-info?igsn=…` | IGSN landing-style sample info |

Ids are comma-separated query strings. Confirm exact parameter names in Swagger for your server version.

## Identifiers you can query by

| Id | Where | Notes |
|---|---|---|
| Internal numeric `id` | Every entity | What every other filter and hydrate endpoint expects |
| `igsn` | Sample | String filter on `sample-with-locations` |
| `name` | Sample, data point, … | Not globally unique — batch imports uniquify with `\\` (see [Batch upload via API](../03_contributing-data/batch-upload-via-api/)) |
| `dataPackageId` | Sample, data point | The access-control container — see [Packages and access](../01_using-the-api/packages-and-access.md) |

## Soft-deleted records

Search and list endpoints exclude soft-deleted rows by default. If a count or an audit looks short, filter explicitly:

```json
{ "deletedTimestamp": { "specified": false } }
```

Check the entity's criteria definition in Swagger — not every table exposes `deletedTimestamp`. See also [Delete](../01_using-the-api/endpoints-and-swagger.md#delete).

## Related

- Region filters: [Geographic queries](geographic-queries.md)
- Bulk export: [Download and export](download-and-export.md)
- Hierarchy: [Data hierarchy](../01_using-the-api/data-hierarchy.md)
