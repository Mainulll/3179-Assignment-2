# Melbourne map context

These display-only layers give streets, water, parks and familiar labels to the two Melbourne maps. They do not change tourism counts, route components or distance calculations. All map coordinates come from source geometry or existing municipal landmark points.

## Sources and permission

All three sources permit reuse under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). Attribution appears beneath each map.

- **© City of Melbourne — Street names.** [Dataset](https://data.melbourne.vic.gov.au/explore/dataset/street-names/), [GeoJSON export](https://data.melbourne.vic.gov.au/api/explore/v2.1/catalog/datasets/street-names/exports/geojson). The publisher describes these lines as intended for creating and labelling city maps. 2,876 source lines. Source modified 30 September 2021; data processed 13 November 2022. This is an older context snapshot, not a current transport network.
- **© State of Victoria — Vicmap Hydro Water Area polygons.** [Catalogue](https://discover.data.vic.gov.au/dataset/vicmap-hydro-rest-api), [GeoJSON-capable layer](https://services-ap1.arcgis.com/P744lA0wf4LlBZ84/ArcGIS/rest/services/Vicmap_Hydro/FeatureServer/1), [licence metadata](https://www.arcgis.com/sharing/rest/content/items/1e37a8817bc7497da0fbe6abdf5fade5?f=json). Extracted 14 October 2026: 32 polygons intersecting the source envelope. The extraction date is not a survey date.
- **Victorian Planning Authority — Open space.** [Catalogue and licence](https://discover.data.vic.gov.au/en_AU/dataset/open-space), [source layer](https://services5.arcgis.com/DmRfik4clMVydXO3/arcgis/rest/services/VPA_Draft_Open_Space_Data/FeatureServer/0). Extracted 14 October 2026: 1,705 returned features. This inventory is explicitly not maintained. Only records classed as Public open space with Open access, in parks/gardens, natural space, sports/recreation or recreation corridors, are shown. These fields are historical descriptions, not proof of current access.

The Overpass endpoint rejected the attempted OSM download; no OSM basemap was added. No Google imagery, tiles, keys or external map runtime is used.

## Reproducible preparation

`map_context.json` records input SHA-256 hashes, bounding boxes and output sizes/counts. Source exports are retained locally in ignored `output/map-source/`; retrieve the source snapshots matching those hashes to reproduce exactly. Repeating a live export later can return changed data.

Use Python with Shapely installed to run:

```sh
python3 scripts/build_map_context.py output/map-source
python3 scripts/build_map_labels.py
npm run build:specs
npm run check
```

The city view covers all 94 points with padding. The route view covers all 34 actual components with padding, rather than using the whole municipality. Context is clipped to these rectangular view bounds, simplified by 0.000005 degrees (about half a metre), and rounded to six decimals. Polygon rings are oriented for D3/Vega; historical open-space patches are dissolved to reduce duplicate drawing, with invalid rounding artefacts repaired and zero-area fragments omitted from display geometry. None of these transformations is used in analysis.

Street-label anchors are midpoints along selected source lines. Familiar place labels use the source sight coordinates and short display names. Labels and context remain visible when sights/routes are filtered. Both maps use Mercator; the route legend distinguishes solid clay walking routes from dashed teal cycling. Route gaps are never connected.

The static payload budget increased from 3 to 4 MB to accommodate the local vector context; no remote tiles are required. Validation continues to check the budget and all original data invariants.

## Zoom and source endpoints

Both maps share one Mercator projection across all layers at each zoom level. Sliders range from 1× to 4×; Reset view returns to 1×. A selected route supplies the view centre above 1×. The horizontal scale bar is an approximate east–west distance at that latitude, calculated with Earth mean radius 6371.0088 km. It is not a walking-distance estimate.

`build_route_endpoints.py` retains first/last coordinates of all 34 supplied LineStrings (68 endpoints in this snapshot). A/B indicate source-line start/end, not official itinerary direction. Exactly closed components use one loop marker. Nearby endpoints within 15 m are grouped for legibility, anchored at a real source coordinate; all source labels remain in the tooltip and raw endpoint file. Components are never joined or reordered into an itinerary.

Panning supports pointer dragging and arrow keys on the focused map. Every background, route, point and label layer uses the same updated geographic projection. Panning is bounded to the stored context envelope; Reset view clears pan and zoom. Real mouse gestures in an isolated Firefox profile confirmed both maps move and reset restores identical source path geometry.
