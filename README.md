# Some Other Life

A warm stone and bronze, presentation-led clothing-label teaser built from scratch with Vinext, React and Cloudflare Workers. The Collection / Signature / Details scenes use original architectural imagery and indexed, interactive navigation. The supplied logo and two approved detail crops hint at Collection 01. No people, complete shirt render or manufacturing document is shipped.

## Current experience

- Responsive editorial landing page with three explorable scene states.
- Two enlarged detail studies, a signature section and release-information dialogs.
- Persistent D1 release list with explicit email consent.
- Validation, honeypot, one-hour hashed-network rate limits and duplicate-safe signup.
- Owner-only `/studio` and CSV export. Trusted hosting identity headers are checked server-side against the owner account in `lib/studio-auth.ts`.
- Token-based unsubscribe and a removal-request workflow the owner can fulfil in the studio.
- The user-selected warm architectural image, original supplied logo, two detail crops and coordinated brand graphics.

The full collection remains unrevealed: the complete garment board and shirt renders are absent from the checkout and deployed assets. Only approved detail crops are present. The `scripts/check-release-embargo.mjs` allowlist enforces that policy. Keep the allowlist restrictive until an explicit reveal is authorised.

## Release operations

Registrations persist in D1. **No email service is connected and email is not sent automatically.** The owner can inspect/export the list at `/studio`. Before sending release emails, configure a sending service or import the CSV into an email platform. Include consent-based messaging and an unsubscribe link of the form `/unsubscribe?token=<subscriber token>`. This code does not send messages to subscribers or the owner's team.

No prices, sales, inventory levels, availability counts or launch date have been invented. There is no checkout until products and commercial details are approved.

The first hosted release is owner-private. Preserve that audience until the owner requests public access.

## Development

```sh
npm run dev
npx tsc --noEmit
node scripts/check-release-embargo.mjs
npm run build
```

Use the Sites managed preview and publishing workflow in the connected environment. `.openai/hosting.json` contains the exact Site project and D1 binding. Credentials belong in session memory or hosted runtime settings, never in source.

Drizzle schemas live in `db/schema.ts`. Generate additive migrations with `npm run db:generate`. Publishing applies migrations; local previews use the Wrangler command with the generated `dist/server/wrangler.json` and `.wrangler/state`.

## Validation

TypeScript and production compilation are checked. Browser QA covers the desktop and 390px layouts, scene navigation, detail dialogs, consent and a saved signup. A local D1 query verified that the browser registration persisted. The owner-only studio and public access policy are separate: customer signups never authorise reading the subscriber list.

See [design evidence](docs/design-research.md) and [domain setup](docs/domain-setup.md). An exact custom hostname is still needed to obtain and validate DNS records. Do not invent registrar targets.

## Image provenance

`public/assets/entrance.webp` is a format conversion of the exact warm stone doorway image selected by the user. No people or garments appear in it.

`public/assets/logo.jpg` is the original supplied logo photograph copied without redrawing. CSS frames the central emblem and blends the white background into the warm paper. The logo retains the supplied pixels and original proportions.

`texture-study.webp` and `embroidery-study.webp` are tightly bounded crops from the supplied design board. No full garment shape or placement diagram can be downloaded from these files. The user explicitly requested these first-drop hints. The complete board is not shipped.

The social card contains the brand name on warm paper. The favicon is a small crop of the supplied logo. Other brands' imagery, code and celebrity likenesses were not reused.
