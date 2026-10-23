# Curation

How a package is reviewed before it is published, and what the curator decides.

Package creation, the team, workflow, the DOI, and deletion are in [Managing packages](README.md). Who may see a package is in [Packages and access](../01_using-the-api/packages-and-access.md).

Curation is one of the three package settings:

| State | Meaning |
|---|---|
| `NOT_CURATED` | Review has not been requested. This is the state of a new package |
| `WAITING_FOR_CURATION` | A review has been requested. Curators of the owning institution can find the package and change its content |
| `CURATED` | A curator of the owning institution, or an administrator, has accepted the package |

The gate applies when the owning institution has at least one curator. A package that institution owns cannot be switched to `PUBLIC` until it is `CURATED`. When the institution has no curator, the request is rejected and a supervisor publishes directly. That path is in [Managing packages](README.md#4-review-and-publish).

## Who acts

Anyone who can view the package may ask for curation, and only while the state is `NOT_CURATED`.

Only a curator of the owning institution marks the package `CURATED`. An administrator may also do this. Curator is an institution role, held through the person's link to that institution, and one person can curate more than one institution. It is not a seat on the package team.

A supervisor or an institution curator sets distribution to `PUBLIC` once the package is curated. The curator may do that in the same update that marks the package curated.

## Ask for review

The request carries an optional message. Curation becomes `WAITING_FOR_CURATION`. Distribution is left as it is. A second request is rejected.

Every curator of the owning institution is emailed. Replies go to the person who asked.

During the wait, those curators can find the package and can change its content, even when they are not on the team. That includes a package whose distribution is `HIDDEN`.

`HIDDEN` is the review distribution. The package can be opened by a direct link, including a DOI, and it is left out of public discovery. The package team can still find it. A curator of the owning institution can still find it while it is waiting for curation.

## Curate

The server records who curated the package and when. The curator may also record a curation comment.

Two endings, chosen in the same update:

- **Curate and publish.** Curation becomes `CURATED` and distribution becomes `PUBLIC`. Supervisors are told the package is published. Support, and each curator of the owning institution, are told that a package was made public.
- **Curate only.** Curation becomes `CURATED` and distribution stays as it was. Supervisors are told the package is ready to publish.

If the institution has a curator, an update that switches a package to `PUBLIC` while it is not `CURATED` is rejected.

## Publish after review

Once the package is `CURATED`, a supervisor or an institution curator sets distribution to `PUBLIC`.

Moving a package out of `PRIVATE` requires the acting user to belong to an institution. Making a package public notifies support and the curators of the owning institution. The notice names the package contacts.

## Related

- Lifecycle, roles, workflow, licence, DOI, and deletion: [Managing packages](README.md)
- Who can see a package: [Packages and access](../01_using-the-api/packages-and-access.md)
