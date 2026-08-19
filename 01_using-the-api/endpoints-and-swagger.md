# Endpoints and Swagger

## Swagger is the source of truth

For your deployed server, open the **Swagger UI** (ask Lithodat for the URL if needed). It lists:

- Paths and HTTP methods  
- Request / response DTO fields  
- Criteria objects for search  

This user documentation describes patterns only. Field names can differ slightly by version — match Swagger.

## Common operation pattern (Litho resources)

Most domain entities follow the same shape (example: geochem data point):

| Action | Typical HTTP | Notes |
|---|---|---|
| Create one | `POST /api/…/Entity` | No `id` on the body |
| Create many | `POST /api/…/Entity/batch` | See [batch upload via API](../03_contributing-data/batch-upload-via-api/) |
| Update one | `PUT /api/…/Entity` | Body must include existing `id` — see [update data](../03_contributing-data/update-data/) |
| Get / search | `GET` or `POST …/post` with criteria | Often paged (`page`, `size`); deleted records are omitted — see [delete](#delete) |
| Count | `GET …/count` | Same criteria idea; deleted records are omitted |
| Delete | `DELETE /api/…/Entity/{id}` | Package must be writable — see [delete](#delete) |

There is generally **no** bulk-update batch endpoint — `…/batch` is for **create** only.

## Delete

Deleted records disappear from the UI and from list, search and count. For ordinary use that is the whole of it.

The row is stamped (`deletedTimestamp`) rather than physically dropped, which only matters if you look past the API:

| Consequence | What to do |
|---|---|
| Names of remaining records must stay unique | A deleted name can be reused. Two undeleted samples (or data points) still cannot share a name — see [batch upload](../03_contributing-data/batch-upload-via-api/) |
| Counts look high in SQL | Filter `deleted_timestamp IS NULL` (DTO field `deletedTimestamp`) |
| Updates of deleted rows fail | You cannot PUT a record whose `deletedTimestamp` is set |
| Direct GET by id | May still return the stamped row. Confirm against Swagger for your entity |

Not every table uses this pattern — confirm `deletedTimestamp` on the DTO in Swagger before relying on it.

## Auth

Calls need a logged-in LithoSurfer user (bearer token / session, depending on how you call the API).  
Unauthenticated callers fail before package checks. Package checks still apply after login — see [packages and access](packages-and-access.md).

## Modules

Paths are grouped by domain, for example:

- `/api/management/…` — packages, users, institutions  
- `/api/core/…` — samples, locations, shared core types  
- `/api/geochem/…` — geochemistry  
- `/api/upb/…`, `/api/fissiontrack/…`, `/api/helium/…`, … — other methods  

Hierarchy and example paths: [data hierarchy](data-hierarchy.md).
