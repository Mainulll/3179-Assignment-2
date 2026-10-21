# Browser QA

The released website at commit f53fec087add06da510cc1853d4c74ff65303e0a was checked in Firefox 158 on production Vercel: all eleven charts loaded at 320, 390, 768, 1024 and 1280 CSS pixels, with no page overflow or generated table/JSON dropdown controls. Native point clicks and all-three-map held mouse/touch drags, 3× zoom and exact resets passed. The retained choropleth also passed continuous native range-slider input to 4×, rapid resets, finite geometry and zero re-embeds/blank-map samples.

The 21 October readiness pass rechecks current remote/live identity and the newly authorised GitHub Pages subpath. Its current screenshots and results are delivered with the local submission pack; this report does not claim that the student's actual sketch, studio details, Moodle upload or interview has been completed.

See [the choropleth performance report](CHOROPLETH_PERFORMANCE.md), [revision QA history](REVISION_QA.md), and the runnable checks in `../../scripts/`. All eleven readable specifications are indexed at `../../specs/README.md`.

## Latest data release — 21 October 2026

Commit3f19ae781ec27ac6533993ceb86a315fa446cb62 was verified on both Vercel and GitHub Pages in isolated Firefox158 at1280 and390 CSS pixels. All13 charts loaded, geography/state selectors worked, current/historical map/heatmap/Melbourne/scatter modes changed correctly, and current choropleth4×/reset restored the original paths and fills. Local responsive checks also passed at320 and768 pixels. Generated resource bytes remain below4MB uncompressed. The forest latest-alter-date audit now parses DD/MM/YYYY and correctly reports2026-10-09.
