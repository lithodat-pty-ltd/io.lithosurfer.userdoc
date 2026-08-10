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
| Create many | `POST /api/…/Entity/batch` | See [batch upload via API](../03_writing-data/batch-upload-via-api/) |
| Update one | `PUT /api/…/Entity` | Body must include existing `id` — see [update data](../03_writing-data/update-data/) |
| Get / search | `GET` or `POST …/post` with criteria | Often paged (`page`, `size`) — see [`02_reading-data/`](../02_reading-data/) when guides exist |
| Count | `GET …/count` | Same criteria idea |
| Delete | `DELETE /api/…/Entity/{id}` | Package must be writable |

There is generally **no** bulk-update batch endpoint — `…/batch` is for **create** only.

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
