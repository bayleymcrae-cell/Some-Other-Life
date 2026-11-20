# Original SOME OTHER LIFE website

This repository contains the SOME OTHER LIFE experience, based on source commit bd6efa150990852d4c9fac8d567fa493ae0e199e. The original home-screen doorway photograph and hero layout are preserved. The collection editorial uses the seven supplied photographs: three material studies, two emblem and embroidery views, studio notes and First Notice. Each image retains its full framing and can be enlarged. The owner-approved Collection 01 front-only garment previews appear below the original hero. The full manufacturing board, technical flats and measurement documents remain private.

Publish GitHub Pages from main, / (root). The root CNAME is someotherlife.studio. Root index.html and assets are the built public site. The original app, components, public, database schema and Worker source are retained for continued development.

GitHub Pages serves static files. The three public forms use the existing Site at https://some-other-life.lineddisc3.chatgpt.site so registrations remain in the existing database. Studio stays at that Site and retains its existing owner authentication. No subscriber data, credentials or runtime secrets are stored in this repository.

Daily inspiration uses an expandable glass panel, adapted from the owner's SET ON YOU experience. The bundled note collection rotates by the Australia/Brisbane calendar date and refreshes at midnight or when a visitor returns to the tab. Its clock uses 12-hour Queensland time. Long studio reflections and short sourced artist excerpts keep separate credits. Edit lib/daily-inspiration.ts to maintain the note collection.

The build adapter in github-pages changes only form destinations and the Studio link at build time. Edit components/collection-experience.tsx and app/globals.css for the public experience. To regenerate: install the pinned dependencies, run node scripts/check-release-embargo.mjs and node scripts/build-pages.mjs, and copy dist/pages into the repository root. Deploy backend changes separately through ChatGPT Sites.

DNS for GitHub Pages: set apex A records to 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153. Set www CNAME to bayleymcrae-cell.github.io. Preserve existing mail records. Configure the custom domain in GitHub Pages before switching DNS and enable HTTPS after the certificate is ready.

The Collection 01 preview has three selectable colourways and clearly labels the images as designs with the sample in development. The existing release form now saves optional colour and size preferences through the same signup backend. Final pricing and checkout remain unpublished.
