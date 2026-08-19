# Using the LithoSurfer API

General information for working with LithoSurfer / EarthBank through the REST API — shared by consuming and contributing.

| Concern | Folder |
|---|---|
| How the API and data model work | **This folder** (`01_using-the-api`) |
| Query / download workflows | [`02_consuming-data/`](../02_consuming-data/) |
| Create, batch upload, update | [`03_contributing-data/`](../03_contributing-data/) |
| What each analytical method records | [`04_data-models/`](../04_data-models/) |

Exact request/response shapes change with server version — always confirm field names in **Swagger UI** for your host.

---

## Contents

| Page | Topic |
|---|---|
| [Data hierarchy](data-hierarchy.md) | Subject chain: sample → data point → measurements (not ACL) |
| [Packages and access](packages-and-access.md) | Ownership / ACL: writable vs viewable; FINISHED / FROZEN |
| [Endpoints and Swagger](endpoints-and-swagger.md) | Where to find operations; create / read / update / delete |
| [Reference lists](reference-lists.md) | Resolving names (`Zr`, `Near-total`, …) to numeric IDs |

**Contributing workflows** (batch create, geochem upload, updates) are under [`03_contributing-data/`](../03_contributing-data/), not here.

---

## Quick orientation

1. Physical material is a **sample**; each analytical session is a **data point** with child measurements — see [data hierarchy](data-hierarchy.md).
2. Access is per **data package** (viewable vs writable) — see [packages and access](packages-and-access.md).
3. Discover endpoints in **Swagger** — see [endpoints and Swagger](endpoints-and-swagger.md).
4. Lookups (elements, digestion, …) need **IDs**, not labels — see [reference lists](reference-lists.md).
5. To **create or change** data, continue in [`03_contributing-data/`](../03_contributing-data/).
