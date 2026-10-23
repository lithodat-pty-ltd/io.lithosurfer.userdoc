# Contributing data

Guides for **creating and changing** data in LithoSurfer / EarthBank.

General API background (hierarchy, packages, Swagger, reference lists) lives in [`01_using-the-api/`](../01_using-the-api/). This folder is for contribution workflows.

| Guide | Topic |
|---|---|
| [Prepare data for an API upload](prepare-data-for-upload/) | General strategy: from a contributor's file to records ready for the batch API |
| [Batch upload via API](batch-upload-via-api/) | General `POST …/batch` rules, naming, name→id maps |
| [Create data packages](create-datapackages/) | Setting up packages to write into |
| [Update data](update-data/) | Changing existing records (PUT); writable-package rules |
| [Upload geochemistry data](upload-geochemistry-data/) | Preparing geochem + geochem batch pipeline |
| [Upload via an Excel template](upload-via-excel-template/) | Filling a wizard workbook and fixing the errors that block it |
