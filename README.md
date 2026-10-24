# LithoSurfer / EarthBank user documentation

Guides for preparing, uploading, updating, and understanding data through
the LithoSurfer / EarthBank REST API—for people and their AI assistants.

## Start here

**New here? [Getting started](00_getting-started/)** walks you through
setting up a local AI agent, keeping credentials safe, and checking access
to your data packages.

## Find your guide

- **Prepare and upload geochemistry:** [Geochemistry upload guide](03_contributing-data/upload-geochemistry-data/)
- **Upload an Excel template:** [Excel template guide](03_contributing-data/upload-via-excel-template/)
- **Upload records in bulk:** [Batch API guide](03_contributing-data/batch-upload-via-api/)
- **Change existing records:** [Update data](03_contributing-data/update-data/)
- **Find, filter, or export samples and data points:** [Consuming data](02_consuming-data/)
- **Understand the API or troubleshoot access:** [Using the API](01_using-the-api/)
- **Understand analytical fields and measurements:** [Data models](04_data-models/)
- **Find, download, review, or publish a package:** [Managing packages](05_managing-packages/)

## Working with an AI assistant

Tell your assistant:

> Use `io.lithosurfer.userdoc/README.md` as your starting point.
> Read the API guide’s ground rules before making API requests, then
> follow the guide for my task.
> Keep this documentation unchanged; put scripts, data, and outputs
> in `my-project/`. Ask me what I want to do before starting.

Replace `my-project/` with your working folder.
Keep credentials out of chat and out of this repository.

**For agents:** Read and follow the
[ground rules](01_using-the-api/README.md#ground-rules-for-agents).
Use the target server’s Swagger for exact endpoints and field names.

## Help and feedback

For access or account help, contact your institution admin or
[support@lithosurfer.io](mailto:support@lithosurfer.io).
For API errors, include the package ID, counts, and error text—never credentials.

Found a documentation issue? Contributions via pull request are welcome.
Keep project data, scripts, and credentials out of documentation changes.
