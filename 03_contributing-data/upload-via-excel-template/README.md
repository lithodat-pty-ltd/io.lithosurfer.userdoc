# Upload via an Excel template

Load data by filling a LithoSurfer Excel template and uploading that workbook in the **EarthBank upload wizard**. You choose the data package in the wizard. The file itself does not have to name it.

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

If you ask the Lithodata assistant to check an attached workbook, it can explain these problems and hand back a corrected copy. It does not load the data. You still upload the file in the wizard.
