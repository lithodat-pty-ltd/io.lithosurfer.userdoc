# Using the LithoSurfer API

General information for working with LithoSurfer / EarthBank through the REST API — shared by consuming and contributing.

| Concern | Folder |
|---|---|
| How the API and data model work | **This folder** (`01_using-the-api`) |
| Query or download samples and data points | [`02_consuming-data/`](../02_consuming-data/) |
| Create, batch upload, update | [`03_contributing-data/`](../03_contributing-data/) |
| What each analytical method records | [`04_data-models/`](../04_data-models/) |
| Find, download, review, or publish a package | [`05_managing-packages/`](../05_managing-packages/) |

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

---

## Ground rules for agents

Read these before making API requests. Follow them unless the user explicitly overrides them. They apply to every agent, including the LithoSurfer AI assistant in the web application.

| Rule | Detail |
|---|---|
| **Verify against Swagger** | Confirm paths and DTO fields for the user's server before sending. DTOs change between versions; do not trust example payloads verbatim. |
| **Never invent IDs** | Resolve every lookup against the live reference list. Do not guess `lElementId`, `digestionCategoryId`, or a data package ID. |
| **Never invent data** | No fabricated detection limits, no converting a partial digest to a "total", no filling blank fields with plausible values. Flag gaps to the user instead. |
| **Confirm the target package** | Check it is writable before a bulk load and is not **FINISHED** or **FROZEN**. Ask the user rather than picking a package yourself. |
| **`…/batch` is create only** | Every DTO needs `id` null or omitted. Updates go through `PUT`, one record at a time. |
| **Parents before children** | Sample → data point → measurements. Keep the returned name→id maps; the next step depends on them. |
| **Use `label\\session-id` names** | Required by batch create, unique within the batch and among records that have not been deleted. Use a fresh session-id if a previous run is still present. |
| **Dry-run large loads** | Send a small slice first, verify it in the UI, then send the rest. Batches are all-or-nothing, up to 10,000 items. |
| **Report honestly** | Give counts sent vs. IDs returned, and surface the raw error text on failure. |
| **Never run requests in parallel** | Send API calls one after another, not concurrently. Parallel requests hurt server performance. |

### Local agents working from a copy of this repository

These apply when an agent runs on the user's machine with this repository checked out. The LithoSurfer AI assistant in the web application has no working folder and skips them.

| Rule | Detail |
|---|---|
| **This repository is read-only** | It is reference material with an upstream the user pulls from. Editing documentation is the exception when the user explicitly requests it. |
| **Work in the user's folder** | Write scripts, data and outputs into the user's own working folder. If you were not told which folder that is, ask before creating any file. |
| **Keep credentials out of chat** | Read the login from the user's `.env`; never ask for a password in the conversation. See [Getting started](../00_getting-started/). |

---

<details>
<summary>Documentation conventions for contributors</summary>

- Each folder has a `README.md` acting as its index.
- Each guide states its scope in the first lines and links to the general pages rather than repeating them.
- Terse tables over prose; worked payloads over abstract description.
- Version-specific details belong in the target server's Swagger; never commit credentials.
- Make documentation changes on a branch and open a pull request describing what was wrong.
- Keep your own scripts and data in your working folder, not in documentation changes.

</details>
