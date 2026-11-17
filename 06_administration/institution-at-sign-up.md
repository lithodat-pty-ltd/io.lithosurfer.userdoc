# Institution at sign-up

A person who signs up with email and password can get a **home institution** straight away. Two settings decide which one: the email domains of each institution, and the auto-assign institution of each community. An administrator maintains both.

The home institution matters. The person's first package belongs to it, they see the packages it shares, and its [institution admin](../01_using-the-api/institution-admin.md) can manage their licences.

## Order

1. **Email domain.** If exactly one institution lists the domain of the person's email address, they join that institution.
2. **Several institutions list the domain.** The person gets no institution. Support decides.
3. **No institution lists the domain.** The person joins the auto-assign institution of the community that runs the portal they signed up on.
4. **No auto-assign institution** (the portal is unknown, it has no community, or the community leaves the field empty): the person gets no institution.

Support receives an email for every new user. It names the institution and the reason, or asks support to assign one manually.

Sign-up through an identity provider (single sign-on) does not use these settings.

Existing users keep their institution. Changing a setting affects only later sign-ups.

## Institution email domains

Field **Email domains** on the institution, a comma-separated list.

| Entry | Matches |
|---|---|
| `unimelb.edu.au` | `jane@unimelb.edu.au` only |
| `*unimelb.edu.au` (or `*.unimelb.edu.au`) | Subdomains only, such as `jane@geo.unimelb.edu.au`. Not `unimelb.edu.au` itself, and not `notunimelb.edu.au` |

List both entries to cover a domain and its subdomains. An entry must contain a dot, so a lone `*` or `com` is refused. Never list free-mail domains such as `gmail.com`.

A person proves the email domain by activating the account through a link sent to that address.

## Community auto-assign institution

Field **Auto-assign institution** on the community. It applies to every portal of the community.

Leave it empty when sign-ups on this community's portals should not join an institution unless their email domain places them.

The institution does not have to be a member of the community. If it is not, its users do not get the community's shared packages or licences.

### Pick an institution that holds nothing

Unlike the email domain, the portal a person signs up on is not proven: anyone can claim any portal. So the auto-assign institution must give its users nothing beyond what every signed-in user gets:

- no licences assigned to the institution itself,
- no baskets,
- no packages shared with the institution,
- no membership in a community that shares packages or licences, unless every sign-up may have them.

Create a dedicated institution for it, for example "Datametallogenica users", and appoint the lead organisation's contact as its institution admin. Do not use the lead institution itself. Anything a person should get on top, such as a paid licence, is assigned to that person.

### Example

The DM portal belongs to the DM community. Its auto-assign institution is "Datametallogenica users", whose institution admin works at AMIRA.

- Jane signs up with an address on a domain that AMIRA lists, so she joins AMIRA.
- `joe@gmail.com`: no institution lists `gmail.com`, so Joe joins "Datametallogenica users". The institution admin can then give Joe a DM licence.

## Related

- [Institution admin](../01_using-the-api/institution-admin.md)
- [Packages and access](../01_using-the-api/packages-and-access.md)
- [Managing packages](../05_managing-packages/README.md)
