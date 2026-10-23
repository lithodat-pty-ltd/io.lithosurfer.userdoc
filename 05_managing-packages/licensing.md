# Licensing

A **data licence** states the terms under which a package's content may be reused. The catalogue of those licences is `DataLicense`.

Who may see a package is [distribution](../01_using-the-api/packages-and-access.md). Who may change the licence linked to a package is in [Managing packages](README.md).

## Relationship

Packages and data licences meet in both directions. There is no join table.

| Direction | How it is stored |
|---|---|
| One `DataLicense`, many packages | `data_package.license_id` references `data_license.id`. Any number of packages can link the same catalogue entry. Each package has at most one such link (`license` on the entity, `licenseId` on the API). |
| One package, many licences | That one catalogue link, plus `licenseText`. `licenseText` holds further licences as plain text, with a blank line between them. Those blocks are not further rows pointing at `DataLicense`. |

A new package starts with `licenseText` set to "Creative Commons" and with no catalogue entry linked.

## Catalogue entry

`DataLicense` is a shared list. An administrator creates, updates, and deletes entries. Any signed-in user can read the list.

| Field | Meaning |
|---|---|
| `name` | Short name. Unique. On a DOI this becomes the rights identifier |
| `description` | The licence statement. On a DOI this becomes the rights text |
| `url` | The licence's own web page. On a DOI this becomes the rights URI |
| `image`, `imageContentType` | Logo |
| `validBefore` | An end date recorded on the entry. It can be used as a search filter. Linking the entry to a package, and copying it into a DOI, uses the entry as stored |

## How the two fields meet a DOI

When a supervisor mints a package DOI, or updates its metadata, both fields are written into the DOI as rights:

1. The linked `DataLicense`, when present, becomes one rights entry: `description` as the text, `url` as the URI, `name` as the identifier.
2. `licenseText` is split on blank lines. Each non-empty block becomes a further rights entry that carries only that text.

A package can therefore publish a structured licence and one or more free-text licences together.

## Related

- Who may assign a package's data licence: [Managing packages](README.md)
- Who may see a package: [Packages and access](../01_using-the-api/packages-and-access.md)
