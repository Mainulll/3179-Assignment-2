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
