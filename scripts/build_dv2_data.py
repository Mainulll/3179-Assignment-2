"""Build compact website data from the verified, private research archive.

Usage: python3 scripts/build_dv2_data.py /path/to/FIT3179_Verified_Research
No downloads. The source archive remains outside the served repository.
"""
import collections
import csv
import hashlib
import json
import pathlib
import shutil
import statistics
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = pathlib.Path(sys.argv[1]).resolve()
DEST = ROOT / 'data' / 'dv2'
DEST.mkdir(parents=True, exist_ok=True)
DOCS = ROOT / 'docs' / 'dv2'
DOCS.mkdir(parents=True, exist_ok=True)

def rows(path):
    return list(csv.DictReader((SOURCE / path).open()))

def write(name, value):
    (DEST / (name + '.json')).write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=False))

def number(value):
    return None if value == '' else float(value)

def orient_for_vega(geometry):
    """D3/Vega uses clockwise exterior rings; preserve all original vertices."""
    polygons = geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]
    for polygon in polygons:
        for i, ring in enumerate(polygon):
            signed = sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(ring,ring[1:]))
            if (i == 0 and signed > 0) or (i > 0 and signed < 0):
                ring.reverse()

sights = rows('melbourne/clean/attraction_candidates_94.csv')
short = {
    'Informal Outdoor Facility (Park/Garden/Reserve)': 'Parks & gardens',
    'Art Gallery/Museum': 'Galleries & museums', 'Theatre Live': 'Live theatre',
    'Major Sports & Recreation Facility': 'Major sport',
    'Outdoor Recreation Facility (Zoo, Golf Course)': 'Zoo / golf',
    'Observation Tower/Wheel': 'Tower / wheel', 'Aquarium': 'Aquarium',
    'Cinema': 'Cinema', 'Library': 'Library',
}
for s in sights:
    s['longitude'], s['latitude'] = float(s['longitude']), float(s['latitude'])
    s['display_type'] = short[s['sub_theme']]
    for key in list(s):
        if key.startswith('nearest_'):
            del s[key]
assert len(sights) == len({s['feature_name'] for s in sights}) == 94
counts = collections.Counter((s['theme'], s['sub_theme']) for s in sights)
tree = [{'id': 'root', 'parent': None, 'value': 0, 'label': 'All selected sights'}]
for theme in sorted({s['theme'] for s in sights}):
    tree.append({'id': theme, 'parent': 'root', 'value': 0, 'theme': theme, 'label': theme})
for (theme, sub), n in counts.items():
    tree.append({'id': sub, 'parent': theme, 'theme': theme, 'value': n, 'label': short[sub], 'official': sub})
write('sights', sights)
write('sight-tree', tree)

art = rows('melbourne/clean/outdoor_artworks.csv')
raw_art = {str(s['asset_id']): s for s in json.loads((SOURCE / 'melbourne/raw/outdoor_artworks.json').read_text())}
for s in art:
    # The validated GeoJSON point is authoritative; standalone raw lat/lon are reversed.
    lon, lat = raw_art[s['asset_id']]['geo_shape']['geometry']['coordinates']
    assert abs(lon - float(s['longitude'])) < 1e-9 and abs(lat - float(s['latitude'])) < 1e-9
    s['longitude'], s['latitude'] = lon, lat
    s['nearest_toilet_straight_line_m'] = number(s['nearest_toilet_straight_line_m'])
years = rows('melbourne/clean/artworks_exact_year_177.csv')
bins = collections.Counter(int(s['decade']) for s in years)
write('art-decades', [{'decade': d, 'end': d + 10, 'label': str(d) + 's', 'count': bins[d]} for d in range(1860, 2020, 10)])
write('art-years', [{'asset_id': s['asset_id'], 'title': s['title'], 'recorded_year': int(s['recorded_year'])} for s in years])
area_counts = collections.Counter(s['clue_area'] for s in art)
qualified = {k for k, n in area_counts.items() if n >= 10}
box = []
area_short = {'Melbourne (CBD)': 'Melbourne CBD', 'Melbourne (Remainder)': 'Melbourne remainder'}
for s in art:
    if s['clue_area'] in qualified:
        box.append({'asset_id': s['asset_id'], 'title': s['title'], 'area': s['clue_area'],
                    'area_label': area_short.get(s['clue_area'], s['clue_area']) + ' · n=' + str(area_counts[s['clue_area']]),
                    'metres': s['nearest_toilet_straight_line_m']})
assert len(box) == 169 and len(qualified) == 5
write('art-toilets', box)

routes = rows('melbourne/clean/route_summary.csv')
for s in routes:
    s['geometry_length_km'] = float(s['geometry_length_km'])
    s['parts'] = int(s['parts'])
    s['mode'] = 'Cycling' if s['route_name'] == 'Southbank and Docklands by Bike' else 'Walking'
    del s['source_distance_sum']
route_short = ['Laneways & arcades', 'Fitzroy Gardens', 'Icons & architecture', 'Music', 'Aboriginal Melbourne',
               'Southbank / Docklands', 'Street art', 'Yarra River', 'Gardens & parks', 'Culture & ideas', 'Heart of the city']
for s, label in zip(routes, route_short):
    s['label'] = label
walks = json.loads((SOURCE / 'melbourne/clean/walks.geojson').read_text())
route_by_name = {s['route_name']: s for s in routes}
for feature in walks['features']:
    s = route_by_name[feature['properties']['route_name']]
    feature['properties'].update({'mode': s['mode'], 'geometry_length_km': s['geometry_length_km']})
assert len(walks['features']) == 34 and sum(s['parts'] for s in routes) == 34
write('routes', routes)

combos = rows('melbourne/clean/victorian_activity_combinations.csv')
activities = ['camping', 'picnicing', 'campervanning', 'fishing']
activity_labels = ['Camping', 'Picnicking', 'Campervanning', 'Fishing']
for c in combos:
    for key in activities + ['sites']:
        c[key] = int(c[key])
    c['key'] = ''.join(str(c[k]) for k in activities)
    c['combination'] = ' + '.join(label for key, label in zip(activities, activity_labels) if c[key]) or 'None of these four recorded'
combos.sort(key=lambda c: (-c['sites'], c['key']))
for rank, c in enumerate(combos):
    c['rank'] = rank
write('forest-combinations', combos)
write('forest-totals', [{'activity': label, 'sites': sum(c['sites'] for c in combos if c[key]), 'row': i}
                         for i, (key, label) in enumerate(zip(activities, activity_labels))])
write('forest-dots', [{'key': c['key'], 'rank': c['rank'], 'row': i, 'activity': label, 'recorded': c[key],
                        'sites': c['sites'], 'combination': c['combination']}
                      for c in combos for i, (key, label) in enumerate(zip(activities, activity_labels))])

state_nights = rows('australia/tidy/nvs_8_state_holiday_night_share_2024.csv')
for s in state_nights:
    for key in ['nights_000', 'holiday_nights_000', 'holiday_nights_share_pct']:
        s[key] = float(s[key])
write('state-nights', state_nights)
pairs = rows('australia/tidy/nvs_8_state_trip_pairs_2019_2024.csv')
for s in pairs:
    s['x'] = float(s['trips_2019_000']) / 1000
    s['y'] = float(s['trips_2024_000']) / 1000
    s['change_pct'] = float(s['trips_pct_change'])
    s['abbr'] = next(n['state_abbr'] for n in state_nights if n['state'] == s['state'])
label_positions = {'NT': (5, 1.1), 'ACT': (10, 4.3), 'TAS': (2.5, 8.5), 'SA': (7.5, 12), 'WA': (13, 9.5), 'NSW': (38, 39.7), 'VIC': (33, 28.3), 'QLD': (25, 33)}
for s in pairs:
    s['label_x'], s['label_y'] = label_positions[s['abbr']]
write('state-pairs', pairs)

regions = rows('australia/tidy/nvs_regions_purpose_2019_2024.csv')
regions = [s for s in regions if s['geography_level'] == 'tourism_region' and s['market'] == 'domestic_overnight']
cities = ['Melbourne', 'Sydney', 'Brisbane', 'Adelaide']
purposes = ['Holiday or leisure', 'Visiting friends and relatives', 'Business', 'Other and Not Asked']
purpose_labels = ['Holiday', 'Friends / relatives', 'Business', 'Other']
heat = []
for city in cities:
    subset = [s for s in regions if s['geography'] == city and s['year'] == '2024']
    assert len(subset) == 5 and not any(s['nights_flag'] for s in subset)
    total = float(next(s['nights_000'] for s in subset if s['purpose'] == 'Total'))
    for p, label in zip(purposes, purpose_labels):
        s = next(s for s in subset if s['purpose'] == p)
        heat.append({'city': city, 'purpose': p, 'purpose_label': label, 'nights_000': float(s['nights_000']),
                     'total_nights_000': total, 'share_pct': 100 * float(s['nights_000']) / total,
                     'source_sheet': s['source_sheet'], 'source_cell': s['source_nights_cell']})
    assert abs(sum(s['share_pct'] for s in heat if s['city'] == city) - 100) < .00001
write('city-purposes', heat)
trend = []
for s in regions:
    if s['geography'] == 'Melbourne' and s['purpose'] == 'Total' and 2019 <= int(s['year']) <= 2024:
        assert not s['trips_flag'] and s['trips_000'] != ''
        trend.append({'year': int(s['year']), 'trips_m': float(s['trips_000']) / 1000,
                       'source_sheet': s['source_sheet'], 'source_cell': s['source_trips_cell']})
trend.sort(key=lambda s: s['year'])
assert len(trend) == 6
write('melbourne-trend', trend)

for name, path in [('boundary', 'melbourne/clean/boundary.geojson'), ('areas', 'melbourne/clean/clue_areas.geojson'),
                   ('states', 'australia/tidy/abs_8_states_2021.geojson')]:
    geometry = json.loads((SOURCE / path).read_text())
    if name == 'states':
        for feature in geometry['features']:
            orient_for_vega(feature['geometry'])
            s = next(s for s in state_nights if s['state_code_2021'] == str(feature['properties']['state_code_2021']))
            feature['properties'].update({k: s[k] for k in ['state', 'state_abbr', 'holiday_nights_share_pct', 'nights_000', 'holiday_nights_000']})
    (DEST / (name + '.geojson')).write_text(json.dumps(geometry, separators=(',', ':'), allow_nan=False))
(DEST / 'walks.geojson').write_text(json.dumps(walks, separators=(',', ':')))
labels = rows('australia/tidy/abs_state_reference_points_2021.csv')
for s in labels:
    s['longitude'], s['latitude'] = float(s['longitude']), float(s['latitude'])
write('state-labels', labels)

for source, target in [('melbourne/source_catalog.csv', 'source_catalog_city.csv'), ('australia/source_catalog.json', 'source_catalog_national.json')]:
    shutil.copyfile(SOURCE / source, DOCS / target)
subprocess.run(['node', str(ROOT / 'scripts' / 'normalise_geometry.mjs'), str(DEST / 'states.geojson'), str(DOCS / 'geometry_validation.json')], check=True)
manifest = {'snapshot': '2026-10-12', 'research_library_file_id': 'libfile_23d2fc0bbf0081919239d32087ac33a2',
            'research_zip_sha256': '69ade35667571983da598f4f983132485a390e2f74dea31414291176d770ff47',
            'geometry_transform': 'ABS state polygon winding normalized for D3/Vega; numerically degenerate parts omitted only from display geometry. See geometry_validation.json. No tourism value changes.',
            'inputs': {str(p.relative_to(SOURCE)): hashlib.sha256(p.read_bytes()).hexdigest()
                       for p in SOURCE.rglob('*') if p.is_file() and (p.parent.name in ['clean', 'tidy'] or p.name == 'outdoor_artworks.json')},
            'outputs': {p.name: {'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in DEST.iterdir() if p.is_file()}}
(DOCS / 'provenance.json').write_text(json.dumps(manifest, indent=2))
print('Built', len(manifest['outputs']), 'assets;', sum(s['bytes'] for s in manifest['outputs'].values()), 'bytes')
