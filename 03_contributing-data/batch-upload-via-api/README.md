# Batch upload via API

Use `POST …/batch` when **creating** many rows at once. This is typically far faster than one `POST` per record.

| Related | Doc |
|---|---|
| Hierarchy, packages, Swagger, lookups | [`01_using-the-api/`](../../01_using-the-api/) |
| Writable packages | [Packages and access](../../01_using-the-api/packages-and-access.md) |
| Geochem-specific pipeline | [Upload geochemistry via API](../upload-geochemistry-data/upload-via-api/) |
| Updating existing rows | [Update data](../update-data/) — batch is **create only** |

Exact DTO fields: **Swagger UI** for your server.

---

## Rules

| Rule | Detail |
|---|---|
| Max size | **10,000** items per request (prefer 2,000–5,000) |
| Transaction | The whole batch succeeds or fails together |
| New rows only | Every DTO must have `id` null / omitted |
| Package | Content must go to a **writable** package ([packages and access](../../01_using-the-api/packages-and-access.md)) |
| Same package | Some batch endpoints require every item in the call to share one `dataPackageId` (e.g. GC data points) |
| Order | Create parents before children ([data hierarchy](../../01_using-the-api/data-hierarchy.md)) |

---

## Naming (`label\\session-id`)

Sample and data-point names used with batch create must contain a double backslash uniquifier:

```text
<label>\\<session-id>
```

Examples: `SITE-001\\20260810-import`, `DP-SITE-001\\20260810-import`

| Rule | Why |
|---|---|
| Labels unique **within** a batch | Otherwise the returned name→id map overwrites silently |
| Full names unique among records that have not been deleted | Deleted names do not block reuse. If the previous run is still present, use a new session-id — see [delete](../../01_using-the-api/endpoints-and-swagger.md#delete) |
| Same session-id for one run | Keeps the batch identifiable |
| New session-id on re-run while the previous rows are still present | Avoids collisions with existing names |

If the separator is missing, the API rejects the batch.

---

## Name → id response

Batch create for named entities (samples, data points) usually returns a map:

```json
{ "SITE-001\\20260810-import": "67890", "SITE-002\\20260810-import": "67891" }
```

Save that map — child steps need the numeric ids.  
Some child batch endpoints (e.g. concentrations) return an empty map `{}` because those rows have no public name.

---

## Large datasets

Split into sequential chunks under the size limit. Log each chunk’s name→id map before continuing. A failed chunk rolls back only that chunk.

---

## Common errors

| Message | Fix |
|---|---|
| `Batch size N exceeds the maximum of 10000` | Split the batch |
| `Batch create does not allow an existing id` | Omit `id` on create |
| Name missing `\\` separator | Add `\\session-id` |
| Package write / bouncer errors | Use a writable package |
| Unknown parent id | Create parents first; use ids from the previous name→id map |
