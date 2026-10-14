# Melbourne and beyond

Local-only implementation · 13 October 2026 · Minul Lokuliyana · FIT3179 DV2

## Run locally

The page is portable HTML/CSS/JavaScript with local libraries, fonts, data and
readable chart specifications. From the repository root:

```sh
npm start
```

Open `http://127.0.0.1:8000/`. No deployment or build service is required for the
static page. Development dependencies can be restored with `npm ci`.

```sh
npm run check
npm run build:specs
python3 scripts/build_dv2_data.py /absolute/path/to/FIT3179_Verified_Research
```

Data rebuilding needs the private verified research archive and the installed
Node dependencies. Raw workbooks, the ZIP, municipal source exports and the
digital sketch are intentionally outside the served repository. The earlier
data foundation and project plan have been preserved; this new V2 page reads
only `data/dv2/`.

## Domain, audience and task

Local tourism attractions, beginning in City of Melbourne, widening to Victorian
state-forest records and Australian domestic overnight travel. The audience is
an average Australian reader. The page helps them notice different kinds of
local places, compare route geometry and documented activities, and understand
the wider historical tourism context. Inventories and travel estimates are
separate populations, with no attraction-level attendance linkage.

## Four chapters and eleven chart families

| # | Question | Idiom | Encoding and purpose |
|---|---|---|---|
| 1 | Where could you begin? | Point map | Geographic position locates 94 selected sights; equal size, shape and colour distinguish three source themes. |
| 2 | What types of sights are recorded? | Hierarchical treemap | A genuine root → theme → subtheme layout; leaf area counts records, and parents are derived without double-counting. |
| 3 | What years appear in the artwork catalogue? | Histogram | Adjacent quantitative ten-year intervals count 177 exact recorded years; 25 uncertain values are disclosed. |
| 4 | How do the self-guided routes run? | Route-line map | Actual geometry preserves 34 separate components for 11 routes; cycling is dashed. |
| 5 | How close are recorded toilets to art? | Boxplot | Five areas/169 works; horizontal straight-line distance, median, middle half and explicit min–max whiskers, with n. |
| 6 | How long is each mapped route? | Bar | Zero-based length in derived kilometres, sorted ascending. |
| 7 | Which documented activities occur together? | UpSet | Thirteen exact combinations, top frequency bars, joined recorded flags and correctly weighted activity marginals. All 532 sites remain represented. |
| 8 | What share of state nights is for holidays? | Choropleth | Colour = holiday nights / published all-night denominator, 2024. Australia-centred equal-area projection, eight states/territories. |
| 9 | Why do visitors stay in four tourism regions? | Heatmap | Sixteen cells, purpose nights / published region Total nights, 2024. Shared 0–100% scale. |
| 10 | How did Melbourne trips change? | Line | Six annual historical NVS estimates, 2019–2024, expressed in millions of domestic overnight trips. |
| 11 | How do 2019 and 2024 state trips compare? | Scatter | Eight state points, square plot, identical zero-based domains, equality line and Victoria highlight. Label leaders are purely display annotations. |

The brief v1.2 classifies all map idioms and idioms beyond its listed basic
families as advanced. This implementation supplies 11 families, with 8 advanced
candidates (1, 2, 3, 4, 5, 7, 8, 9) and 3 map families. The forest chart's internal
bars and matrix count once; layers, category filters and repeated views do not
add to the count. Effective application remains for tutor assessment; no grade
is guaranteed.

## Interactions and accessibility

Sight-theme/type selectors and clicks on points/treemap leaves link the first
two charts. The treemap retains the complete 94-record layout while dimming
unselected leaves, so filtering does not imply changed totals. Route selectors
and map/bar clicks link the route views. Reset buttons restore all records.
Forest selection highlights an exact combination without omitting the others.

Native labelled selects and buttons provide keyboard/tap equivalents. Every
chart has an accessible image label, explanatory caption, expandable HTML data
table, source-data link and human-readable JSON specification. Tables and the
wide UpSet chart scroll within their own containers on phones. Category symbols
combine shape and colour. The page honours reduced motion and never replaces
its main chapters.

## Data and geography safeguards

- All 114 payload hashes in the downloaded research archive passed verification
  before data preparation. Library identity and source/output hashes are retained
  in `provenance.json`; no signed transfer URLs are saved in the repository.
- The source POI inventory has 242 rows, filtered to nine cultural/leisure
  subthemes/94 named records. It is not a complete or current visitor register.
- City inventory dates are data-processing metadata: places/art/areas/boundary
  November 2022, toilets August 2024, routes April 2025. They are not independent
  survey or operational-status dates.
- Artwork coordinate validation uses raw GeoJSON point geometry; the reversed
  standalone latitude/longitude fields are never used for distance grouping.
- Exact dates apply only to the histogram. The boxplot starts with all 202
  artwork records, then the n≥10 area rule selects 169; 33 are omitted by this
  transparent group-size rule. CLUE areas are municipal analysis units, not
  official suburbs. Toilet proximity uses 74 source inventory points, not
  walking distance, opening status, safety or accessible paths.
- Route summaries use full-precision geometry-derived lengths. All 34 components
  are kept separate; the contradictory source distance fields are not used.
- Forest null flags are “not recorded”, never false/absent/prohibited. Snapshot
  12 October 2026 is not a complete site-survey date. Stale closure information
  is excluded from the page's claims.
- NVS purpose night shares use unique published Total-night denominators. The
  national section counts trips and nights, not unique people or admissions;
  purpose-trip estimates overlap. State trip totals also overlap when trips
  visit multiple states.
- Only the eight-state ABS geometry is mapped nationally. The approved
  historical NVS series is not spliced with 2025/2026 DoTS. Melbourne tourism
  region, City of Melbourne and Greater Melbourne are different geographies.
- Visual QA found that some rounded ABS offshore polygon parts were degenerate
  or had the wrong spherical winding for D3. Display geometry retains every
  measurable part, normalises winding and omits only parts with area ≤1e-12
  steradians (about 40 m²). The state records and tourism values are unchanged;
  `geometry_validation.json` documents all eight results. Original geometry is
  retained in the private research archive.

## Local validation

`npm run check` validates frozen counts, missingness, arithmetic, keys, exact
Melbourne series, all 34 geodesic route components, forest marginals, state
geometry joins, source hashes and payload size. It compiles and renders all
eleven Vega/Vega-Lite specifications to SVG with finite coordinates and checks
bounded spherical state geometry. SVG QA files are ignored under `output/`.

Browser QA is recorded separately in `BROWSER_QA.md`. The static payload is under
2 MB uncompressed including local chart libraries and font files. The private
research archive and existing foundation datasets are not requested by the page.

## Remaining submission decisions

The brief requires the most recent available data. This page intentionally uses
older static municipal inventories and the comparable 2019–2024 historical NVS
series. Its on-page disclosure does not resolve the assessment requirement;
Minul should discuss this justification with the tutor before submission.

The brief explicitly requests a publicly accessible GitHub page, readable chart
JSON in the same GitHub repository, and a PDF containing the student's actual
physical hand-drawn sketch. It states zero marks if the page/embedded elements
are not publicly accessible on GitHub. A connected Vercel project should not be
assumed to substitute for that requirement without tutor approval. No push,
deployment, visibility change or external communication has been performed.
Publication needs a later approval identifying exact content and destination;
a push to the connected repository may trigger automatic Vercel deployment.

The digital V2 guide is a reference only; it is not a hand-drawn submission.
Tutor feedback, the student's physical sketch, final description/template and
interview preparation remain student submission tasks. AI assistance for
research support, preparation, coding, copy and design is acknowledged on-page.
