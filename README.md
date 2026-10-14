# Local tourism in Melbourne and Victoria

FIT3179 Data Visualisation 2 · Topic 23: Local Tourism Attractions · Minul Lokuliyana

A tourism data story moving from Melbourne's recorded sights and self-guided routes to Victorian forest activities and Australian overnight travel. Eleven Vega/Vega-Lite visualisations include three maps. Inventories describe recorded places; tourism estimates count trips and nights, not unique people or attraction attendance.

- Website: https://3179-assignment-2.vercel.app/
- Repository: https://github.com/Mainulll/3179-Assignment-2
- Vercel project: https://vercel.com/mainullls-projects/3179-assignment-2
- Production branch: `main`. A push to this branch automatically deploys to Vercel.

## Run and check locally

Use Node.js and Python 3.12 or later:

```sh
git clone https://github.com/Mainulll/3179-Assignment-2.git
cd 3179-Assignment-2
npm ci
npm start
```

Open http://127.0.0.1:8000/. The published page runs entirely from bundled local assets, including charts, datasets, libraries and fonts; it needs no API key or live map service.

```sh
npm run build:specs
npm run check
```

The check validates 68 data/provenance assertions, renders all eleven chart specifications, and checks exact route endpoints, grouped marker completeness, zoom projection and the geographic scale cue. Detailed source definitions and limitations are in `docs/dv2/IMPLEMENTATION.md`, `docs/dv2/provenance.json` and `docs/dv2/MAP_CONTEXT.md`.

## Update the live website

In a fresh clone, update `main`, make edits and verify them before publishing:

```sh
git switch main
git pull --ff-only origin main
npm run check
git add <changed-files>
git commit -m "Describe the change"
git push origin main
```

In the existing Downloads checkout, the new repository is the separate `mainulll` remote; `origin` still points to the preserved Ma1nul repository. To publish a reviewed commit from the current `codex/data-foundation` branch, use `git push mainulll HEAD:main` after confirming the remote is a fast-forward. Do not force-push. Local fixes do not become live until a push is approved and completed.

Vercel uses the Other preset, root directory `./`, no build command, and serves the root static files. No paid service is required.

## Data and map context

The site preserves the 94 selected municipal sights, 34 line components across 11 routes, 532 state-forest records and the historical 2019–2024 NVS tourism series. No 2025 DoTS data is spliced into NVS. Geography and source vintages remain distinct. Missing forest flags mean not recorded, and artwork-to-toilet distances are straight-line distances.

Both Melbourne maps use locally stored, clipped vector context under CC BY 4.0:

- City of Melbourne Street names lines: source September 2021, processed November 2022.
- State of Victoria Vicmap Hydro water-area polygons: extract 14 October 2026.
- Victorian Planning Authority historical open-space polygons: unmaintained inventory, used for background orientation, not current access claims.

Map transformation code, extraction hashes, source URLs and licence links are documented in `docs/dv2/MAP_CONTEXT.md` and `docs/dv2/map_context.json`. Street/place labels retain source coordinates or derive positions along the source lines. All three maps have 1–4× zoom sliders, drag-to-pan and keyboard-arrow panning, reset controls and an approximate scale bar (central Australia for the national map). The national map preserves its equal-area Albers projection; municipal maps use Mercator. Reset view restores both the original extent and zoom. At zoom above 1×, a selected route becomes the view centre. Selecting a route reveals its source-line start/end markers; nearby endpoints share a marker with every original label in its tooltip. These endpoints are not official itinerary starts or finishes. Routes retain their original gaps; these maps do not provide navigation directions.

City and Victorian data are attributed at each map. National estimates are Tourism Research Australia NVS; state boundaries are ABS 2021. Local font and Vega licences are in `vendor/`. Earlier exploratory research remains in `data/` and `docs/` for reference; the page uses `data/dv2/`.

## Assessment checklist

The brief requires a public GitHub Pages assessment link in addition to readable chart JSON in the repository. GitHub Pages is not currently enabled for this new repository; Vercel alone should not be represented as meeting that requirement without a tutor exception. The student's actual hand-drawn sketch PDF, tutor feedback and submission template also remain part of the assessment process; generated reference sketches are not hand-drawn student work. Review and understand the final code, data and design, and follow the tutor's confirmed AI-use requirements.

## Current presentation revision

The introductory title is factual and compact. All panels use one responsive
spacing and typography system; neighbouring headings align using measured
content rather than arbitrary card heights. Per-chart table/JSON controls have
been removed. Readable JSON remains indexed in [specs/README.md](specs/README.md);
each visible figure retains source attribution.

Chart 05 is now a deterministic strip plot of the same 169 artwork distances
in the same five CLUE areas, with exact x positions, medians and sample counts.
The brief calls dot plots basic: this lowers the conservative advanced count
from eight to seven, while retaining eleven charts and three map idioms.
It therefore does not meet the HD row’s eight-advanced-idiom target as written.
See `docs/dv2/RUBRIC_REVIEW.md` for the direct brief check and limitations.
