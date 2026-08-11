# LithoSurfer / EarthBank user documentation

Task-oriented documentation for working with **LithoSurfer / EarthBank** through its REST API.

It is written for two readers at once:

- **People** — geologists and data contributors who want to understand the data model and prepare data correctly.
- **AI agents** — point your assistant at this repository and it should have enough context to carry out a concrete API task (batch upload, update, lookup resolution) without guessing.

Everything here is plain Markdown. There are no hidden instructions, no framework-specific files: what the agent reads is what you read.

---

## Using this repo with an AI agent

Clone the repository and point your assistant at the folder, then state the task:

```text
Use the documentation in ./io.lithosurfer.userdoc as your reference for LithoSurfer.
Upload the geochemistry data in ./my-lab-export.xlsx to data package 12345.
```

The agent should read this page first, follow the routing table below to the relevant guide, and observe the [ground rules](#ground-rules-for-agents).

**Before starting a write task, the agent needs from you:**

| Input | Why |
|---|---|
| **Server / Swagger URL** | Paths and DTO fields are version-specific |
| **Auth** (bearer token or session) | Every call is authenticated |
| **Data package ID**, writable for you | All writes are access-checked |
| **Source data** and its column meanings | Labels must be mapped, not assumed |

---

## Documentation map

| Folder | Covers | Status |
|---|---|---|
| [`01_using-the-api/`](01_using-the-api/) | Data model, access control, Swagger, name→id lookups — shared by reading and writing | Written |
| [`02_reading-data/`](02_reading-data/) | Query and download workflows | Planned |
| [`03_writing-data/`](03_writing-data/) | Create, batch upload, update | Written (except *create data packages*) |

### Pages

| Page | Topic |
|---|---|
| [Data hierarchy](01_using-the-api/data-hierarchy.md) | Subject chain: sample → data point → measurements |
| [Packages and access](01_using-the-api/packages-and-access.md) | Ownership / ACL: writable vs viewable; FINISHED / FROZEN |
| [Endpoints and Swagger](01_using-the-api/endpoints-and-swagger.md) | Where to find operations; create / read / update / delete |
| [Reference lists](01_using-the-api/reference-lists.md) | Resolving names (`Zr`, `Near-total`, …) to numeric IDs |
| [Batch upload via API](03_writing-data/batch-upload-via-api/) | `POST …/batch` rules, `label\\session-id` naming, name→id maps |
| [Update data](03_writing-data/update-data/) | Changing existing records (PUT) |
| [Preparing geochemistry data](03_writing-data/upload-geochemistry-data/) | Digestion, quantitation, source codes — what a good geochem row needs |
| [Upload geochemistry via API](03_writing-data/upload-geochemistry-data/upload-via-api/) | End-to-end geochem batch pipeline with payloads |

---

## Start here, by task

| I want to… | Read |
|---|---|
| Understand how samples, analyses and measurements relate | [Data hierarchy](01_using-the-api/data-hierarchy.md) |
| Work out why I cannot write / why a call was rejected | [Packages and access](01_using-the-api/packages-and-access.md) |
| Find the right endpoint or exact field names | [Endpoints and Swagger](01_using-the-api/endpoints-and-swagger.md) |
| Turn `Zr` or `Near-total` into the ID the API expects | [Reference lists](01_using-the-api/reference-lists.md) |
| Load many records at once | [Batch upload via API](03_writing-data/batch-upload-via-api/) |
| Change records that already exist | [Update data](03_writing-data/update-data/) |
| Prepare a lab export before uploading it | [Preparing geochemistry data](03_writing-data/upload-geochemistry-data/) |
| Push a geochemistry dataset through the API | [Upload geochemistry via API](03_writing-data/upload-geochemistry-data/upload-via-api/) |

---

## The 60-second model

1. Physical material is a **sample**. Each analytical session on it is a **data point**, which carries a method specialization (`GCDataPoint`, `FTDataPoint`, `UPbDataPoint`, …) and the child measurements. Measurements hang off the analysis, never off the sample directly.
2. Access is controlled by the **data package** referenced by samples and data points. You can only create, change or delete content in a package that is **writable** for you, and never in a **FINISHED** or **FROZEN** one.
3. The API stores **numeric foreign keys**. Your labels (`Zr`, `Aqua Regia`) must be resolved against reference lists first.
4. **Swagger for your server is the source of truth** for paths and field names. These pages describe patterns.

---

## Ground rules for agents

Follow these unless the user explicitly overrides them.

| Rule | Detail |
|---|---|
| **Verify against Swagger** | Confirm paths and DTO fields for the user's server before sending. DTOs change between versions; do not trust example payloads verbatim. |
| **Never invent IDs** | Resolve every lookup against the live reference list. Do not guess `lElementId`, `digestionCategoryId`, or a data package ID. |
| **Never invent data** | No fabricated detection limits, no converting a partial digest to a "total", no filling blank fields with plausible values. Flag gaps to the user instead. |
| **Confirm the target package** | Check it is writable before a bulk load. Ask the user rather than picking a package yourself. |
| **`…/batch` is create only** | Every DTO needs `id` null or omitted. Updates go through `PUT`, one record at a time. |
| **Parents before children** | Sample → data point → measurements. Keep the returned name→id maps; the next step depends on them. |
| **Use `label\\session-id` names** | Required by batch create, unique within the batch and globally. Use a fresh session-id per run. |
| **Dry-run large loads** | Send a small slice first, verify it in the UI, then send the rest. Batches are all-or-nothing, up to 10,000 items. |
| **Report honestly** | Give counts sent vs. IDs returned, and surface the raw error text on failure. |

---

## Conventions

- Each folder has a `README.md` acting as its index.
- Each guide states its scope in the first lines and links to the general pages rather than repeating them.
- Terse tables over prose; worked payloads over abstract description.
- Version-specific details (exact DTO fields, host URLs, tokens) are deliberately **not** committed here — they belong in Swagger or with your Lithodat contact.

---

## Getting help

| Question | Who |
|---|---|
| Data package, access, tokens | Your institution admin or Lithodat |
| Mapping a lab package to the digestion lists | Lithodat (geochem / data team) |
| API errors during a bulk load | Lithodat — include package ID, counts, and the error text |
