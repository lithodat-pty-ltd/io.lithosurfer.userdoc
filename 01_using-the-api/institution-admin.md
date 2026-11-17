# Institution admin

An **institution admin** manages the licences of the users of one institution and keeps that institution's description up to date. An administrator appoints institution admins. A person can be an institution admin and a curator of the same institution at once.

The institution admin has no rights on data packages. Package review stays with the curator, as described in [Managing packages](../05_managing-packages/README.md).

## Am I an institution admin?

```
GET /api/management/Institution2User?lithoUserId.equals=<your lithoUserId>&role.equals=INSTITUTION_ADMIN
```

Each row names an institution you administer (`institution2UserDTO.institutionId`). Your `lithoUserId` is the `id` returned by `GET /api/management/litho-users/authenticated-litho-user`.

## The users of your institution

The users of an institution are the people whose home institution it is.

```
GET /api/management/litho-users/of-institution?institutionId=<id>&search=<text>&page=0&size=20
```

Each entry has `id`, `login`, `name` and `email`. `search` is optional and matches login and name. The total count is in the `X-Total-Count` response header.

## Licence assignments

A licence assignment gives one user one licence for a period.

| Action | Request | What you may do |
|---|---|---|
| List | `GET /api/management/LicenseAssignment?lithoUserId.equals=<id>` | Read the assignments of your users |
| Add | `POST /api/management/LicenseAssignment` | Give one of your users any licence. Set `lithoUserId`, `userLicenseId`, `validFrom`, `validTo` and optionally `description`. Leave `institutionId` and `communityId` empty |
| Change | `PUT /api/management/LicenseAssignment` | Change an assignment of one of your users, as long as it stays with a user of your institution |
| Remove | `DELETE /api/management/LicenseAssignment/<id>` | Remove an assignment of one of your users |

You cannot change or remove an assignment that the user paid for. Changing it is refused with an error. Payments keep those assignments up to date, and the user ends them by cancelling the subscription. This also applies to the download licence that comes with a paid licence.

Assignments that belong to a whole institution or community stay with the administrator.

Giving a user a licence does not add data packages to their baskets. (Except the DM_PRO license)

## Your institution

```
GET /api/management/institutions/<id>
PUT /api/management/institutions
```

You may change the name, description, country, logo and the ROR record. The other fields, such as the email domains that decide who joins the institution, stay as they are even when your request sends a different value. Ask support to change them.

## Related

- How new users get their institution: [Institution at sign-up](../99_administration/institution-at-sign-up.md)
- [Packages and access](packages-and-access.md)
- [Endpoints and Swagger](endpoints-and-swagger.md)
- [Managing packages](../05_managing-packages/README.md)
