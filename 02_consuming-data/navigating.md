# Navigating records

How to move from a starting point — a sample, a data package, a set of ids — to the records you want.

| Related | Doc |
|---|---|
| The shared filters | [Search samples and data points](search.md) |
| Sample → data point → measurements | [Data hierarchy](../01_using-the-api/data-hierarchy.md) |
| Search operators, `/post` criteria bodies | [Endpoints and Swagger](../01_using-the-api/endpoints-and-swagger.md) |
| Region filters | [Geographic queries](geographic-queries.md) |
| Bulk export | [Download and export](download-and-export.md) |

Set `allowedAccess` on every call — see [Packages and access](../01_using-the-api/packages-and-access.md).

---

## Filter by parent id

Most method search endpoints nest a `dataPointLithoCriteria` (and often a `sampleLithoCriteria`). Filtering by sample id is usually the fastest way to get everything for this sample in one method. The rest of the shared filters — name, package, tag, literature, mineral — are in [Search samples and data points](search.md).

**Endpoint:** `POST /api/geochem/GCDataPoint/post?page=0&size=50`

```json
{
  "dataPointLithoCriteria": {
    "allowedAccess": "VIEWABLE",
    "sampleId": { "equals": 12345 }
  }
}
```

`allowedAccess` for a method search sits inside `dataPointLithoCriteria`. The same body, with that path swapped, searches fission track (`/api/fissiontrack/FTDataPoint/post`), U–Pb (`/api/upb/UPbDataPoint/post`), and the other methods. Confirm the path in Swagger.

## Filter by child, up to the parent

**Endpoint:** `POST /api/geochem/ElementalConcentration/post?page=0&size=200`

```json
{ "gcdataPointId": { "equals": 99001 } }
```

Child foreign-key names vary by method (`gcdataPointId`, `fTDataPointId`, `uPbDataPointId`, …) — check the Swagger definition for the exact field name before writing the filter.

## Known ids

When you already have ids, search that entity with `id.in`. The same body works on `POST …/post` and on `POST …/download/post`.

**Endpoint:** `POST /api/core/sample-with-locations/post?page=0&size=50`

```json
{
  "allowedAccess": "VIEWABLE",
  "id": { "in": [1, 2, 3] }
}
```

A method data point is the same call on that method's path, with `id.in` on the method criteria. Measurements for known parent ids use the child foreign key, as in the section above (`gcdataPointId.in`, and the equivalent on other methods).

## Identifiers you can query by

| Id | Where | Notes |
|---|---|---|
| Internal numeric `id` | Every entity | What every other filter expects |
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
