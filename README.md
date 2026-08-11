# LithoSurfer / EarthBank user documentation

Task-oriented documentation for working with **LithoSurfer / EarthBank** through its REST API.

It is written for two readers at once:

- **People** — geologists and data contributors who want to understand the data model and prepare data correctly.
- **AI agents** — point your assistant at this repository and it should have enough context to carry out a concrete API task (batch upload, update, lookup resolution) without guessing.

Everything here is plain Markdown. There are no hidden instructions, no framework-specific files: what the agent reads is what you read.

---

## Using this repo with an AI agent

**New here? Start with [`00_getting-started/`](00_getting-started/)** — it walks you through installing an agent, setting your credentials safely, and running a script that lists the data packages you can write to.

In short: clone this repository next to your own working folder, and start the agent from the folder containing both.

```text
lithosurfer/
├── io.lithosurfer.userdoc/   ← this documentation: reference only, never edit
└── my-project/               ← your work: data, scripts, .env
```

Then open the session by saying which folder is which:

```text
Use ./io.lithosurfer.userdoc as reference documentation — read it, never edit it.
Do all work in ./my-project.

Upload the geochemistry data in my-project/lab-export.xlsx to data package 12345.
```

The agent should read this page first, follow the routing table below to the relevant guide, and observe the [ground rules](#ground-rules-for-agents).

Use an agent that runs in **your own shell** — Claude Code, Cursor, or similar. Assistants that execute code in a hosted sandbox cannot reach a LithoSurfer instance on a private network and cannot see credentials set on your machine. See [getting started](00_getting-started/) for the setup.

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
| [`00_getting-started/`](00_getting-started/) | Installing an agent, credentials, first working script | Written |
| [`01_using-the-api/`](01_using-the-api/) | Data model, access control, Swagger, name→id lookups — shared by reading and writing | Written |
| [`02_reading-data/`](02_reading-data/) | Query and download workflows | Planned |
| [`03_writing-data/`](03_writing-data/) | Create, batch upload, update | Written (except *create data packages*) |
| [`04_understanding-data-models/`](04_understanding-data-models/) | What each analytical method records — the science behind the fields | Geochemistry written; other methods planned |

### Pages

| Page | Topic |
|---|---|
| [Getting started](00_getting-started/) | Agent setup, credentials, and a script that lists your writable packages |
| [Data hierarchy](01_using-the-api/data-hierarchy.md) | Subject chain: sample → data point → measurements |
| [Packages and access](01_using-the-api/packages-and-access.md) | Ownership / ACL: writable vs viewable; FINISHED / FROZEN |
| [Endpoints and Swagger](01_using-the-api/endpoints-and-swagger.md) | Where to find operations; create / read / update / delete |
| [Reference lists](01_using-the-api/reference-lists.md) | Resolving names (`Zr`, `Near-total`, …) to numeric IDs |
| [Batch upload via API](03_writing-data/batch-upload-via-api/) | `POST …/batch` rules, `label\\session-id` naming, name→id maps |
| [Update data](03_writing-data/update-data/) | Changing existing records (PUT) |
| [Geochemistry data model](04_understanding-data-models/geochemistry/) | Digestion, quantitation, aliquots, concentrations — what the geochem fields mean |
| [Preparing geochemistry data](03_writing-data/upload-geochemistry-data/) | Shaping a lab export and the pre-flight checklist |
| [Upload geochemistry via API](03_writing-data/upload-geochemistry-data/upload-via-api/) | End-to-end geochem batch pipeline with payloads |

---

## Start here, by task

| I want to… | Read |
|---|---|
| Set up an agent and make my first API call | [Getting started](00_getting-started/) |
| Find out which data packages I can write to | [Getting started](00_getting-started/) |
| Understand how samples, analyses and measurements relate | [Data hierarchy](01_using-the-api/data-hierarchy.md) |
| Work out why I cannot write / why a call was rejected | [Packages and access](01_using-the-api/packages-and-access.md) |
| Find the right endpoint or exact field names | [Endpoints and Swagger](01_using-the-api/endpoints-and-swagger.md) |
| Turn `Zr` or `Near-total` into the ID the API expects | [Reference lists](01_using-the-api/reference-lists.md) |
| Load many records at once | [Batch upload via API](03_writing-data/batch-upload-via-api/) |
| Change records that already exist | [Update data](03_writing-data/update-data/) |
| Understand what a geochem field actually means | [Geochemistry data model](04_understanding-data-models/geochemistry/) |
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
| **This repository is read-only** | It is reference material with an upstream the user pulls from. Write scripts, data and outputs into the user's own working folder. If you were not told which folder that is, ask before creating any file. |
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

## Improving this documentation

Found something wrong, unclear, or missing? Contributions are welcome — this is the one case where you do edit these files.

1. Fork the repository (or branch, if you have write access).
2. Make the change on a branch: `git checkout -b fix-digestion-table`.
3. Open a pull request describing what was wrong.

Keep your own scripts and data out of it — those belong in your working folder, not in a pull request.

---

## Getting help

| Question | Who |
|---|---|
| Data package, access, tokens | Your institution admin or Lithodat |
| Mapping a lab package to the digestion lists | Lithodat (geochem / data team) |
| API errors during a bulk load | Lithodat — include package ID, counts, and the error text |
