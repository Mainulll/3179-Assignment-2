# Choropleth zoom and loading repair

The reported failure was reproduced against the preserved Mac version. Zoom input recompiled and re-embedded the whole Vega-Lite chart, finalised the prior view and reloaded state geometry. In the repeated-slider sample this produced 17 embeds, 19 geometry requests and 17 samples without a map path. The serial render queue could also retain requests superseded by newer slider input. The previous tests changed one zoom value and waited, which did not cover this behaviour.

The national map now retains one Vega view. Zoom/pan update only reactive projection scale and translation signals; Albers type, rotation, centre and standard parallels are unchanged. Fitted base projection values are cached per viewport size. Superseded pending national renders are skipped, input updates immediately, and reset supplies the latest projection state. A full rebuild occurs only when the chart width changes. One cached geometry and label set is embedded inline, so interactive zoom makes no new data requests.

The original `states.geojson` remains unchanged. `build_national_display.py` creates a separate 205,276-byte display outline, down from 495,527 bytes (58.6% smaller). It retains every state's largest part, omits detached components whose bounding box is less than 0.02 degrees in both dimensions, simplifies retained rings at 0.005 degrees and rounds to four decimal places. ACT is copied exactly. Eight tourism-property objects and all denominators remain byte-equivalent after JSON parsing; labels remain inside their state outlines. `national_display.json` records hashes, per-state part/vertex counts and a planar-area diagnostic; the display outline is not for geographic analysis. Original source geometry and data remain available.

## Final Firefox measurements

Actual Firefox 158, isolated profile, unthrottled localhost:

| Check | Previous repeated-slider sample | Final desktop / mobile sample |
|---|---:|---:|
| Full chart embeds during interaction | 17 | 0 / 0 |
| Geometry requests, initial plus interaction | 19 | 1 / 1 |
| Samples without a map path | 17 | 0 / 0 |
| Original SVG retained | No | Yes / Yes |
| Median projection update | Not a signal update | 19 / 20 ms |
| Slowest measured projection update | Not a signal update | 30 / 29 ms |
| Native slider reached 4× | Not measured | Yes / Yes |
| Rapid reset exactly restored initial paths | Not measured | Yes / Yes |

Initial national ready times were 14,641 ms in the original sample and 1,993 / 142 ms in the final desktop/mobile runs. These are observed local page-load timings, not a controlled cold-cache or production-speed guarantee: local filesystem hydration and font/library caching varied. The request counts, preserved SVG, smaller payload and same-view update timings directly verify the repaired work.

The final workload includes sustained 140 ms input, rapid 25 ms bursts followed by reset, and an actual one-second native range-slider drag. Both widths kept finite geometry and reached exact reset without captured errors. Earlier single-step zoom checks are supplemented, not treated as proof the report was mistaken.

Local review evidence is in ignored `output/revision-qa/national-perf-before.json`, `national-perf-final-{desktop,mobile}.json` and their native-slider screenshots. Five-width layout, native sight click and all-three-map held mouse/touch regression evidence is prefixed `release-20261018-v2-`. No public deployment is represented by these local results.
