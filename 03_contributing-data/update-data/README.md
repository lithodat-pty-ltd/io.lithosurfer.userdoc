# Updating data

Rudimentary notes on changing records that are already in LithoSurfer / EarthBank.

**General API patterns** (hierarchy, packages, Swagger, create vs update): see [`01_using-the-api/`](../../01_using-the-api/).  
**Field shapes and exact URLs:** Swagger UI for your server.

---

## Access

Updates are allowed only in **writable** packages (not merely viewable).  
FINISHED / FROZEN packages cannot be edited.

Details: [Packages and access](../../01_using-the-api/packages-and-access.md).

---

## How updates are done

1. Open Swagger (or the LithoSurfer UI for the entity).
2. Use the entity’s **update** operation — usually HTTP **PUT** (see [Endpoints and Swagger](../../01_using-the-api/endpoints-and-swagger.md)).
3. Send the DTO including its existing **`id`**.
4. The server checks package write access before applying the change.

`POST …/batch` is for **create only**, not bulk update ([batch upload via API](../batch-upload-via-api/)).

---

## Extra points

- **Moving a record between packages** (changing `dataPackageId`) requires write access to **both** the current and the destination package.
- **Children follow the parent package.** You cannot update concentrations (etc.) if the parent analysis is in a non-writable package.
- **Lookup lists** (elements, digestion category, …) are shared reference data — not package-content edits.
- **Ids stay.** Update changes fields; it does not re-key the record.
- On rejection, messages such as *Package is not writable by user* mean you need editor access or a different package.

---

## Related

- [Writing data index](../)
- [Batch upload via API](../batch-upload-via-api/) (create only)
- [Using the API](../../01_using-the-api/)
- [Preparing geochemistry data](../upload-geochemistry-data/)
- [Create data packages](../create-datapackages/) (when available)
