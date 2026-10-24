# Consuming data

Guides for **finding, filtering, and exporting scientific data** already in LithoSurfer / EarthBank: samples, data points, and their measurements.

Finding a package, counting what it holds, and downloading it as one ZIP are in [Package catalogue](../05_managing-packages/catalogue/).

General API background (hierarchy, packages, Swagger, reference lists) lives in [`01_using-the-api/`](../01_using-the-api/). This folder is for reading scientific records.

| Guide | Topic |
|---|---|
| [Navigating and hydrating](navigating-and-hydrating.md) | Filtering by sample/parent id, expanding ids to full records, identifiers you can query by, soft-deleted rows |
| [Geographic queries](geographic-queries.md) | Region filters, fitting a map to a selection, GeoJSON, clusters |
| [Download and export](download-and-export.md) | A selection of rows: CSV/JSON, the 50,000-row limit, shapefiles |

## Ground rule

Every read goes through the same access-control layer as writes. Set **`allowedAccess`** (`VIEWABLE`, `WRITEABLE`, `PREVIEWABLE`, or `VIEWABLE_AND_PREVIEWABLE`) on every search — see [Packages and access](../01_using-the-api/packages-and-access.md). An empty result for a query you expect to return data is, in practice, almost always an access issue rather than missing geology.

## Typical workflow

```
1. Confirm the entity and its path in Swagger — see [Endpoints and Swagger](../01_using-the-api/endpoints-and-swagger.md)
2. Set allowedAccess on the query
3. Count before pulling a large selection
4. Filter by parent id, region, or package as needed
5. Prefer findIds + hydrate, or /download/post, over walking huge paginated pages
```

**More than a couple hundred samples, data points, or data-point children?** Use the resource's raw download service (`…/download/post`) instead of paging — see [Download and export](download-and-export.md#rule-for-agents-more-than-a-couple-hundred-rows--raw-download).
