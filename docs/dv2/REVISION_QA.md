# Map and treemap revision QA — 14 October 2026

Baseline live commit: d40b9f812d690eb855683debf930e6de524d248b.

## Verified

- Firefox: all eleven charts loaded after resizes at 320, 390, 768, 1024 and 1280 CSS pixels.
- Treemap: removed the heading that overflowed the very small Purpose built group; small-cell numbers are vertically centred; all nine category names and counts are available through a complete clickable key. Selecting Parks & gardens updates the point map and readout to 37 of 94.
- Wider laptop layout and SVG containment keep all chart extents within the cards. Desktop maps show extra familiar labels; compact maps limit labels to avoid collisions.
- City and route map backgrounds display actual official street, water and historical open-space geometry. Route view fits the 34 supplied components rather than the whole municipality. Walking is solid clay; cycling is dashed teal; selecting a route preserves map context and leaves source gaps intact.
- `npm run check`: 68 original data/provenance assertions, all eleven chart SVGs, all eight state polygon windings, and all local water/park polygon orientations pass.
- `node --check app.js`: passes.
- 47 local resource URLs exist and retain the GitHub project subpath when resolved under `/3179-Assignment-2/`.
- All static page data/libraries/fonts are local. Uncompressed static payload approximately 3.19 MB. The documented budget is now 4 MB because the two maps include detailed local vectors.

## Visual evidence

Before/after PNGs are saved in ignored `output/revision-qa/`: chart 01, 02 and 04 at 1024 desktop and 390 mobile. They are local review evidence and are excluded from publication. Mobile captures also cover the full treemap and its complete key. Firefox responsive mode was exited after testing.

## Honest limits

Source vintages differ: streets are the City's older 2021/2022 context; Vicmap water is a 14 October 2026 extract; VPA park geography is explicitly not maintained. The maps do not guarantee access, current road conditions or turn-by-turn navigation. All 94 sight records and all 34 route components remain unchanged.

GitHub Pages remains disabled for the new repository, pending specific approval. No Moodle submission is performed by this work.

## Subsequent zoom / endpoints / site spacing checkpoint

The histogram now spans both grid columns, removing its previous empty left column. Supporting text, card padding and section spacing are consistent across charts, and national charts stack sooner at compact laptop widths. Maps include keyboard-accessible zoom/reset controls and an approximate scale bar. Route selection displays grouped source-line endpoint markers.

After the transient shell reconnect, all 68 data checks, all 11 chart renders and syntax checks passed. The production map-projection function was tested at 3×, produced the expected 200 m scale cue, and rendered selected-route endpoint markers to `output/chart-svg/selected-route-zoom.svg`. All 34 components retain exact first/last coordinates and all 68 endpoint labels remain accounted for.

Fresh Firefox screenshots of this latest grouping/spacing checkpoint are pending: the previously callable CUA browser tool is currently absent from the active tool catalog. Earlier screenshots remain baseline evidence, not proof of the latest layout. No push is authorised or attempted for this checkpoint.

## Final repair checkpoint: header, pan and compact labels

The masthead requested for removal is gone. The histogram-only grid rule is now scoped away from Day out; charts 05 and 06 share exactly the same row top at 768/1024/1280 and stack at 320/390. Map pointer drags and keyboard-arrow controls use one shared geographic projection for all layers; Reset view clears pan and zoom. Render requests are serialised per figure so rapid controls cannot replace newer views with an older render.

Mobile boxplot labels show exact n on a second line and explicit 0/400/800 metre ticks. Heatmap headings use a single angled line at the narrowest size. The forest chart has a visible swipe cue and an always-available row key outside the scrolling region, reveals selected combinations automatically, and no longer draws the misplaced count-axis fragments. Every bar retains its direct count.

The previously unavailable browser fallback recovered. Firefox 158 was launched in a new temporary headless profile, without personal accounts. Current screenshots and DOM layout reports are in ignored `output/revision-qa/repair-3-*`: full page, all eleven charts at 1280/390, and compact problem charts at 1024/768/320. All eleven charts loaded at every width; document width matched the CSS viewport at all five sizes. Actual pointer gestures changed map geometry on both maps; reset restored byte-identical path coordinates. Choosing the last forest combination scrolled the chart 430 px into view and retained its row key. See `repair-3-interactions.json` and `repair-3-layout.json`.

`npm run check` and JavaScript syntax checks pass. Fresh anonymous local HTTP verification confirms the latest header-free page with pan guidance and forest key is served at http://127.0.0.1:8000/. Nothing has been pushed for this revision. Independent final recheck remains pending.

## All-map gesture and native-click repair

Pointer capture now begins only after movement exceeds 5 px, so native Vega sight clicks (including 2 px jitter) select the expected 37 park records. Live dragging moves data marks without moving the national colour legend. The Australia choropleth now has the same zoom, drag/touch pan, arrow keys, reset and approximate scale affordances; its equal-area Albers parameters and 0–100% colour scale are preserved. Extra lower padding keeps every legend tick visible on mobile.

Final isolated Firefox 158 tests (`output/revision-qa/repair-5-all-maps.json`) used real mouse gestures at 1280 px and real touch pointer gestures at 390 px. With 37 sights and Fitzroy Gardens selected, every map zoomed to 3×, changed geometry after a 60×25 px drag, and restored byte-identical initial paths after Reset view. Screenshots `repair-5-{1280,390}-map-{01,04,08}-zoom-pan.png` record the result. `repair-4-interactions.json` was refreshed against the final code and confirms native mark clicks at 0/2 px jitter, both municipal pans/resets, and forest selection scrolling. `npm run check` passed 68 data/provenance assertions, eleven chart renders, exact source endpoints, municipal projection checks and national Albers zoom/pan/reset checks. These browser records remain local ignored QA evidence. No push or deployment was performed.

## Presentation revision: panel alignment, factual introduction and clearer distances

- One shared 22 px desktop / 16 px mobile inset and 24 / 22 px gutters now apply to every figure, including formerly tighter forest and national pair cards. Heading number/title/subtitle use a common rhythm and text hierarchy. Neighbouring headings are aligned to the actual measured content height after fonts load and after real resizes; card and chart heights remain natural. City panels stack below 900 px to preserve map/treemap readability. Captions and source notes use one spacing system.
- The large illustrated hero was replaced with a compact factual title and two short metadata/introduction lines. Per-chart table/JSON controls were removed; the interactive nine-type treemap key and all source captions remain. `specs/README.md` indexes every readable JSON specification in the repository.
- Chart 05 now plots all 169 original artwork distances from the same five areas, with exact x values, deterministic vertical offsets, median markers/labels and each area's n. Mobile median text is shorter to avoid clipping. No distance or group-selection rule changed. Chart 06 has sufficient row height for its two wrapped route labels without overlap.
- State names use derived interior anchors; large states have bold multi-line full names, mobile and small states use abbreviations. ACT's original-location dot remains visible with an offset label. The map and heatmap share a more legible sequential teal gradient; the national legend labels every 0/25/50/75/100 percent tick and explicitly states the denominator.
- `npm run check` passes 68 data/provenance checks, eleven SVG renders, all original endpoint/projection tests, eight interior state-label checks and the 169-record exact-distance coverage check. No new production dependencies or fonts were added.
- Isolated Firefox 158 real-resize evidence: `output/revision-qa/alignment-1-layout.json`, full-page screenshots at 1280/768/390/320, all eleven figure screenshots at those sizes and compact checks at 1024. Every viewport loaded all eleven charts, had no page-width overflow, used identical figure insets and contained zero per-chart tool controls. The compact introduction measured naturally without a reserved hero-art column. `repair-5-all-maps.json` and refreshed `repair-4-interactions.json` reconfirm all three zoomed mouse/touch pans, exact resets, native sight clicks with 0/2 px jitter and forest-selection scrolling against this revised runtime.

Assessment trade-off at checkpoint 34b330e (superseded by the violin follow-up below): the actual brief explicitly lists dot plots as basic, so chart 05 was counted as basic. Eleven charts and three map idioms remain; the conservative advanced count is seven, one short of the HD row's eight. See `RUBRIC_REVIEW.md`. GitHub Pages, source freshness, physical sketch and interview requirements are not established by this presentation revision. This is a local review checkpoint; nothing was pushed or deployed.


## Rubric-compatible distance distribution follow-up

The original brief, page 5, explicitly lists basic families (including dot, single-/multi-line and area charts) and then states “Other idioms are considered advanced.” It contains no positive approved list of advanced replacements. An ECDF made of step lines is conservatively basic and was not used to claim eight. The final chart 05 is a recognised violin distribution with original raw points and medians, classified under the “other idioms” clause. It replaces the prior strip plot within the same existing chart, restores eight advanced candidates across eleven charts and three map idioms, and does not restore any box plot or add a gratuitous chart. This is a documented interpretation, not a specific named endorsement or a grade guarantee.

The five shapes estimate Gaussian probability density independently within their actual observed min/max ranges, with a single pooled robust Silverman rule-of-thumb bandwidth (33.512 m). The bandwidth is calculated from all 169 original metre values; it is not chosen to make the groups look different. Every artwork dot retains its exact original x value. Width indicates density, not group count; all five n and median labels remain explicit. The 169/202 inclusion rule and 74 source toilets are unchanged. Small samples and smoothing limit interpretation of fine shape detail; the raw dots/medians provide direct evidence. Formula and primary implementation references are in `RUBRIC_REVIEW.md`.

Meaningful regression checks confirm five distinct density groups, all density samples confined to their group's observed range, and all 169 raw points with unchanged metre values. `npm run check` passes. Updated Firefox evidence is `output/revision-qa/violin-1-*`: figure 05 at 320/390/768/1024/1280, full page at four sizes, and measurements showing eleven charts loaded and no page overflow at every size. Existing all-map interaction tests remain applicable: only chart 05 and its small-screen median-label lookup changed; no map interaction code changed. No push or deployment has been performed.
