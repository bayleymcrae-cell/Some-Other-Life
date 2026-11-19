# Custom domain setup

The deployed project is `appgprj_6afbb3daa5008191a05e300a98668901`.

Current platform hostname: `some-other-life.lineddisc3.chatgpt.site`.

The owner has not supplied a custom hostname yet. Do not register an assumed hostname or invent verification records. Once the exact hostname is supplied, call Sites `add_custom_domain` for this project and copy all returned values exactly.

| Hostname type | DNS configuration |
| --- | --- |
| A subdomain such as `www` | CNAME using the exact target returned by Sites |
| Apex / root domain | A record(s) using each exact IPv4 target returned by Sites |
| Validation | Every TXT / CNAME validation record returned by Sites |

Use the registrar's automatic TTL unless a specific returned instruction requires another value. Keep unrelated MX and mail TXT records. Resolve conflicting records only at the selected web hostname. Check validation using Sites `refresh_custom_domain_status` and verify SSL becomes active. Configure both apex and `www` separately if both should serve the site; choose a primary hostname and redirect the other using supported hosting settings.

Set the metadata base URL in `app/layout.tsx` after a custom domain is confirmed. New Sites are owner-private by default; the current preview retains that audience. Public visitor access must be deliberately enabled when the owner requests it.
