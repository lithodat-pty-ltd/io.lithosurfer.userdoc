# Upload via an Excel template

Load data by filling a LithoSurfer Excel template and uploading that workbook in the **EarthBank upload wizard**. You choose the data package in the wizard. The file itself does not have to name it. This page also explains every [problem code](#problem-codes) a file check reports, and how the LithoSurfer AI assistant [helps fix a file](#checking-a-file-with-the-lithosurfer-ai-assistant).

This is the interactive path. For a large, repeatable load, use the [batch API](../batch-upload-via-api/) instead. Geochemistry still needs the [preparation guide](../upload-geochemistry-data/) either way.

| Related | Doc |
|---|---|
| Writable package, not FINISHED or FROZEN | [Packages and access](../../01_using-the-api/packages-and-access.md) |
| Lookup names such as minerals and elements | [Reference lists](../../01_using-the-api/reference-lists.md) |
| Sample → data point → measurements | [Data hierarchy](../../01_using-the-api/data-hierarchy.md) |

The wizard accepts **`.xlsx` only**. Save an `.xls` or `.csv` as `.xlsx` before you start. Download the current template from the wizard for the kind of data you have (Samples, Geochemistry, U-Pb, and the other method templates). An old workbook with renamed sheets will not be recognised.

---

## How the wizard reads the file

The template is a set of sheets. The parent sheet names each record. Child sheets repeat that name to say which record they belong to.

| Rule | What goes wrong if you break it |
|---|---|
| Every sheet of the template is present | The upload is rejected. A sheet may be empty below the header, but it must exist. Copy a missing sheet from a fresh template. |
| The header row is the template's header | The wizard finds the header by the key column, spelled exactly: `sampleName` on a Samples file, `datapointName` on a data-point file. A renamed header, or a space at either end, makes that column disappear. |
| No completely empty row in the middle of the data | Reading **stops at the first empty row**. Everything below it is dropped, with no error. Delete the empty row if the rows underneath are part of the upload. |
| Each parent name is filled in and unique | A blank name, or the same name twice, cannot be loaded. |
| A child row uses a name that exists on the parent sheet | A name that is only on the child sheet has no parent. Fix the spelling, or add the missing parent row. |
| Numeric columns contain numbers | Text such as `bdl`, `n.d.` or `<0.01` is not a number. Leave the cell empty, enter a number, or keep the note in a comment column. Do not invent a detection limit. |
| Dates are text, not Excel date cells | A date-formatted cell arrives as a serial number (`45047`). Store the date as text (`2023-04-02`). |
| No Excel errors in cells | `#N/A`, `#REF!` and similar errors arrive as empty cells. Put the value you actually meant, or leave the cell empty on purpose. |
| No extra spaces on names or lookup values | A leading or trailing space makes a name or a list value fail to match. |
| Only template columns are kept | A column the template does not define is dropped. If the header is a near-miss of a real column, rename it. If you need a value the template has no column for, it cannot travel in that file. |
| Mandatory columns are present and filled | An empty mandatory field blocks the upload. Add the column from a fresh template and fill it. Do not guess ages, concentrations, coordinates or analytical errors. |

Lookups (mineral, element, country, and the rest) must be a value the server already has. The wizard reports the ones it does not know. Pick the real value from the matching reference list rather than a near spelling.

The **data-package** column and the **Tag** column are filled by the wizard at upload time. You can leave them empty in the file. You still need a [writable package](../../01_using-the-api/packages-and-access.md) that is not **FINISHED** or **FROZEN** when you upload.

Fix the sheet structure first (missing sheets, headers, the empty row that truncates the file). Checks of individual cells run only after the structure is valid.

---

## Uploading

1. Download the template for your data type from the EarthBank upload wizard.
2. Fill it, following the rules above.
3. Upload the workbook in the wizard and select the target data package.

If you ask the LithoSurfer AI assistant to check an attached workbook, it can explain these problems and hand back a corrected copy. It does not load the data. You still upload the file in the wizard.

---

## Problem codes

A file check (the assistant's, or your own reading of the rules above) reports problems under these codes. **Error** blocks the upload or loses data, **warning** probably loses or mangles values, and **info** is for awareness only.

| Code | Severity | What it means | Fix |
|---|---|---|---|
| `NOT_A_TEMPLATE` | error | No sheet matches a known template (`Samples`, `GC Datapoints`, `FT Datapoints`, …). | Say which kind of data the file holds, or start from a freshly downloaded template. |
| `MISSING_SHEET` | error | A sheet of the template is missing. | Rename a near-miss sheet to the template name, or copy the sheet from a fresh template. It may stay empty below the header. |
| `HEADER_NOT_FOUND` | error | The key column (`sampleName`, `datapointName`, …) is not on the sheet, spelled exactly, so the wizard cannot find the header row. | Rename the header to the exact template spelling. |
| `HEADER_WHITESPACE` | error | A header has a space at either end and no longer matches its column. | Trim the header. |
| `DUPLICATE_HEADER` | error | The same header appears in two columns; only the last one is imported. | Decide which column holds the right values; rename or delete the other. |
| `ROWS_AFTER_BLANK_ROW` | error | An empty row stops reading; the rows below it are dropped without an error. | Delete the empty row, after checking that the rows below belong to the upload. |
| `TOO_MANY_ROWS` | error | The sheet has more rows than the wizard accepts in one file. | Split the data into several files and upload them one after another. |
| `EMPTY_KEY` | error | A row has no name in the key column. | Give the record a unique name, or delete the row if it is not data. |
| `DUPLICATE_KEY` | error | The same name is used for two records in the file. | Make the names unique. Ask whoever owns the data which record is which; do not merge rows. |
| `ORPHAN_KEY` | error | A child row names a record that is not on the parent sheet. | Correct the spelling (a near match is usually shown), or add the missing parent row. |
| `FORMULA_ERRORS` | error | Cells show `#N/A`, `#REF!`, `#DIV/0!` and similar; they arrive as empty values. | Enter the value that was meant, or clear the cell on purpose. |
| `DATE_CELLS` | warning | Date-formatted cells arrive as serial numbers (`2023-05-01` becomes `45047`). | Store dates as text, e.g. `2023-05-01`. |
| `MIXED_TYPES` | warning | A numeric column contains text such as `<0.01`, `bdl` or `n.d.`. | Per value: leave the cell empty, enter a number, or keep the note in a comment column. Never invent a detection limit. |
| `VALUE_WHITESPACE` | warning on names, info elsewhere | Values have a space at either end, so names and lookups do not match. | Trim the values. |
| `WIZARD_FILLED_COLUMN` | info | The data-package column has values; the wizard overwrites them with the package you choose. | Nothing to do. |

The wizard's own checks report more, in plain messages:

| Wizard finding | What it means | Fix |
|---|---|---|
| Unknown lookup value | A mineral, element, country or other list value the server does not have. | Pick the real value from the matching [reference list](../../01_using-the-api/reference-lists.md), not a near spelling. |
| Mandatory field empty | A required cell has no value. | Fill it from the source data. Do not guess scientific values. |
| Wrong number format | A value the field cannot read as a number. | Enter a plain number, or leave the cell empty. |
| Unknown header | A column the template does not define; its data is dropped. | Rename it if it is a near-miss of a real column (a suggestion is usually shown). |
| Missing mandatory column | The template requires a column the file lacks. | Add the column from a fresh template and fill it. |

Errors about the data-package column and the `Tag` column are expected before upload: the wizard fills both.

---

## Checking a file with the LithoSurfer AI assistant

Attach the `.xlsx` in the chat and ask the assistant to check it. It works through the file like a careful data curator:

1. **Read the file the way the wizard does.** It reports the template it recognised, the sheets, and the problems above with sheet, column and Excel row numbers. If no template is recognised, it asks what kind of data the file holds.
2. **Run the wizard's checks without importing.** If you name the target data package, it checks the package column too. Structure problems come first, because the cell checks only run once the structure is valid.
3. **Give an overview, then one problem group at a time.** For example: "*N* problems in *M* groups; *K* of them block the upload." Most blocking first. For each group, it says what is wrong and where, why it matters, and offers one or two fixes with a recommendation. It asks before doing anything. Similar small fixes are batched into one question ("Trim spaces in all 14 cells?"). It looks at the actual values before proposing a fix.
4. **Change only what you agreed to.** Each round of agreed fixes becomes a new version of the file, `samples (v2).xlsx`, `(v3)`, and so on. The original is never changed, and the next round always starts from the latest version. It never fills in ages, concentrations, coordinates or errors; a missing value is either yours to supply or left empty.
5. **Check again.** After each round, it re-runs the checks on the new version and reports what is left.
6. **Hand over.** When nothing blocking is left, or you want to stop, you download the latest version and upload it in the wizard with the right data package. It names any warnings it left in place on purpose.

The assistant never uploads or imports the data itself, even if asked. Text inside cells is treated as data, never as an instruction to it.
