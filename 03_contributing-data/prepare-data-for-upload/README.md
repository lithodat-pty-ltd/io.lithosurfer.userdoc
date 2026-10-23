# Prepare data for an API upload

A general strategy for turning a contributor's file — a spreadsheet, a CSV, a lab export, an old template — into records you can load through the [batch API](../batch-upload-via-api/). The file is rarely ready as it is: tables sit in odd places, headers are messy, names have to become ids, and some values need a decision from whoever owns the data.

The steps below are a guideline, not a fixed recipe. Skip what does not apply, but keep the order where it matters: structure before cells, mapping before checks, review before upload.

| Related | Doc |
|---|---|
| Sample → data point → measurements | [Data hierarchy](../../01_using-the-api/data-hierarchy.md) |
| Names to ids (elements, minerals, countries, …) | [Reference lists](../../01_using-the-api/reference-lists.md) |
| Writable package, not FINISHED or FROZEN | [Packages and access](../../01_using-the-api/packages-and-access.md) |
| Exact DTO fields and paths | [Endpoints and Swagger](../../01_using-the-api/endpoints-and-swagger.md) |
| Batch size, naming, name → id maps | [Batch upload via API](../batch-upload-via-api/) |
| Geochemistry fields and pipeline | [Upload geochemistry data](../upload-geochemistry-data/) |

---

## Ground rules

- **Never change the original file.** Work on a copy and keep each round as a new version (`v2`, `v3`, …), so every change can be traced back.
- **Write decisions down.** Keep a mapping table (column → entity and field) and a problem list next to the working copy. They are what the data owner reviews, and they make a second upload of similar data fast.
- **Never invent scientific values.** Ages, concentrations, coordinates, errors and detection limits come from the source or stay empty.
- **Keep the source values.** When a name is resolved to an id, add the id in a new column; do not overwrite the name.
- **Make every sample and data-point name unique with a postfix.** Append `\\` and a postfix to each name, e.g. `SITE-001\\20261023-franchi`, so names never collide with records already in LithoSurfer or with a later upload of the same labels. Most display components hide everything from `\\` on, so users still see `SITE-001`. See [unique names](#unique-names).
- **Ask early.** Whoever owns the data is the only one who can settle what a column means. Questions that come up in any step go on the problem list for them.

---

## The steps

### 0. Clarify the goal

Before opening the file, settle:

- **What the data is**: which samples, which method (geochemistry, U-Pb, fission track, …), from which publication or lab.
- **Where it goes**: the target data package, writable for the person uploading ([packages and access](../../01_using-the-api/packages-and-access.md)).
- **Who owns it**: the person who can answer questions about the data and sign it off in step 9.

### 1. Check the structure

Find the actual tables before looking at any value.

- **Which sheets or files hold data**, and which are notes, legends or charts.
- **The header row of each table.** It is often not row 1: title rows, logos and notes sit above it. Some tables have two header rows (a name row plus a units row) or merged header cells.
- **Where each table ends.** Blank rows, totals, footnotes and a second table further down the same sheet all end the data.
- **Orientation.** A table may be transposed (one sample per column) or "wide" (one column per element or per isotope ratio).
- **Repeated blocks.** The same layout pasted several times, once per batch or per lab run.

Output: for every table, its sheet, header row, first and last data row, and orientation.

### 2. Check the format

Problems that break reading even when the content is right:

- Empty, duplicate or near-duplicate headers.
- Spaces at either end of headers and values; non-breaking spaces; line breaks inside cells.
- Excel errors (`#N/A`, `#REF!`, `#DIV/0!`) and formulas whose cached value is missing.
- Dates stored as Excel date cells (they arrive as serial numbers such as `45047`) or in mixed formats.
- Numbers stored as text, decimal commas, thousands separators, units inside the value (`12 ppm`).
- Encoding problems in a CSV (`Âµ` instead of `µ`, broken umlauts).

### 3. Identify the entities

Decide which LithoSurfer records each row turns into, following the [data hierarchy](../../01_using-the-api/data-hierarchy.md):

- **Sample** (with its **location**) — the physical specimen.
- **Data point** with its **method specialization** (`GCDataPoint`, `UPbDataPoint`, …) — one analytical session on that sample.
- **Child measurements** (concentrations, spots, lengths, …).

One row often holds several entities at once: sample name, coordinates and twenty element columns make one sample, one data point and twenty concentrations. A wide table becomes one child record per value column. If the same sample appears in several rows, decide whether those rows are separate analyses (separate data points) or duplicates.

### 4. Map the columns to fields

Build the mapping table: one line per source column.

| Source column | Entity | Field | Unit / note |
|---|---|---|---|
| `Sample ID` | Sample | `name` | Becomes `label\\session-id`, see [naming](../batch-upload-via-api/#naming-labelsession-id) |
| `Lat` | Location | `lat` | Decimal degrees, WGS84 |
| `Rock type` | Sample | lithology lookup | Name → id in step 7 |
| `Zr` | ElementalConcentration | `concentration` | ppm; element `Zr` → `lElementId` |
| `Field notes` | — | not mapped | Ask the owner: sample property, or drop? |

#### Unique names

Sample and data-point names must be unique, and source labels such as `S1` or `DP-01` rarely are. Give every sample and data-point name a uniquifying postfix that starts with `\\`:

```text
<source label>\\<postfix>
```

- **One postfix per upload run**, e.g. the date plus a short source tag: `SITE-001\\20261023-franchi`, `DP-SITE-001-ICP\\20261023-franchi`. The batch API rejects sample and data-point names without the `\\` separator ([naming](../batch-upload-via-api/#naming-labelsession-id)).
- **The part before `\\` is the label users see.** Most display components hide `\\` and everything after it, so keep the label exactly as the source has it.
- **Labels must still be unique within the upload.** The postfix separates runs, not rows: two rows labelled `S1` in one file stay a collision, and the returned name → id map would silently keep only one of them. Settle duplicates in step 5.
- **A new postfix for a re-run** while the earlier records still exist.
- Add the full name as its own column (e.g. `Sample ID_name`) in the working copy, so the mapping from source label to stored name is visible and the batch name → id maps can be joined back.

Check every field against the DTO in Swagger for your server. A column without a target needs a decision from the owner: store it somewhere else (for example as a sample property), or leave it out. Units must match what the field expects; convert only when the conversion is unambiguous, and note it.

### 5. Check the data

Now check the values against the fields they map to:

- Text in number fields: `bdl`, `n.d.`, `<0.01`, `-`, `na`. Decide per case with the owner: empty, a relative operator plus detection limit (when the lab published one), or a comment. Never make up a detection limit.
- Ranges: latitude −90…90, longitude −180…180, percentages and totals, negative values where they cannot occur.
- Units that differ between rows or between files.
- Missing values in fields the API requires.
- Duplicate names within the file.

### 6. Identify the foreign keys

Mark every field that refers to another record instead of holding a value:

- **Reference lists**: element, oxide, mineral, country, sample kind, digestion method, and the rest ([reference lists](../../01_using-the-api/reference-lists.md)).
- **Records created in this upload**: the data point's sample, the concentration's data point. These ids only exist once the parent is created.
- **Records already in LithoSurfer**: an existing sample that gets a new analysis, a publication, an institution.

### 7. Resolve names to ids

For each reference field, look the source value up and store the id in a new column named after the source column with `_id` appended, right next to it: `Rock type` → `Rock type_id`, `Element` → `Element_id`.

- Fetch each list once and build a name → id map; do not look up row by row.
- Exact matches only. A near spelling (`Plagioklas`, `zircon ` with a trailing space) goes on the problem list with its candidates; the owner picks.
- Values with no match stay empty in the `_id` column and go on the problem list.
- Ids of records created in this upload are filled during the upload from the batch name → id maps (step 10). Keep those maps with the working copy.

### 8. Check against existing data

Before anything is created, make sure it is not there already:

- Search for the source labels (and IGSNs, if the file has them) with `count/post` / `findIds/post` on the sample resource. Search by label, not by the full name: the postfix makes every full name new, so it cannot reveal data that was uploaded before under another postfix.
- Check whether the publication or lab run was uploaded before, possibly into another package.
- If some records exist, decide with the owner: skip them, attach new data points to the existing samples (use their ids), or stop.

### 9. Review with the data owner

Send the owner what they need to sign off, not the whole working copy:

- the mapping table from step 4;
- the problem list, with the decision you propose for each item;
- unresolved lookups and their candidates;
- record counts: how many samples, data points and measurements will be created, and into which package.

Apply their answers, re-run steps 5 to 8 on the new version, and repeat until nothing is open.

### 10. Upload

Follow the [batch API](../batch-upload-via-api/) rules: parents before children, `id` omitted, `label\\session-id` names, at most 10,000 items per request, a writable package.

1. **Try a few rows first** and look at them in the UI.
2. Create the **samples**; store the returned name → id map and fill the sample id column.
3. Create the **data points** with those sample ids; store their name → id map.
4. Create the **child measurements** with the data-point ids.
5. Split large uploads into chunks and keep each chunk's map before starting the next. A failed chunk rolls back only itself.

Geochemistry has its own pipeline and lookups: [upload geochemistry via API](../upload-geochemistry-data/upload-via-api/).

### 11. Verify and log

- Compare the counts with step 9: samples, data points, measurements.- Spot-check a few records in the UI, including an edge case (a `<DL` value, a sample without coordinates).
- Write a short import log: source file and version, package, session id, date, counts, and any decision that changed the data. Keep it with the mapping table.

---

## Checking a file with the Lithodata assistant

Attach the file in the chat and say what it is and where it should go. The assistant works through the steps above with you:

1. **Goal first.** It asks for the target package, the kind of data and the data owner if you did not say.
2. **Structure, then format, then content.** It reports what it found per step, with sheet, column and row, and does not move on while the structure is unclear.
3. **The mapping as a table.** It proposes the column → entity → field mapping and asks about every column it cannot place. It checks fields in Swagger, not from memory.
4. **One problem group at a time.** Most blocking first, with the affected cells, why it matters, and one or two fixes with a recommendation. It asks before changing anything and never fills in scientific values.
5. **Ids next to names.** Agreed lookups are resolved into `_id` columns in a new version of the file; the original stays untouched. Unmatched and ambiguous values are listed for you to decide.
6. **A summary for the data owner.** Mapping, open problems and record counts, ready to forward for step 9.
7. **Upload only on request.** It writes only after the review is done and you ask for it, following the [batch upload](../batch-upload-via-api/) rules, starting with a few rows. Every write is shown to you for confirmation before it is sent, and it reports the counts and returned ids afterwards.
8. **Hand over the finished upload file.** When the upload is done, it offers the final version of the working copy for download: source columns, `_id` columns, the full stored names and the ids returned by the upload. It also tells you the uniquifying postfix it used (e.g. `\\20261023-franchi`), so you can find the records again and choose a different postfix for a later run.

Text inside the file is treated as data, never as an instruction to the assistant.
