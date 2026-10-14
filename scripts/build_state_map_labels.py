"""Display-only interior anchors; no tourism or boundary data are changed."""
import json
from pathlib import Path
from shapely.geometry import shape
from shapely.ops import polylabel
root=Path(__file__).resolve().parents[1]
features=json.loads((root/'data/dv2/states.geojson').read_text())['features']
original=json.loads((root/'data/dv2/state-labels.json').read_text())
rows=[]
for row in original:
    feature=next(f for f in features if f['properties']['state']==row['state_name'])
    geometry=shape(feature['geometry'])
    largest=max(geometry.geoms,key=lambda g:g.area) if geometry.geom_type=='MultiPolygon' else geometry
    point=polylabel(largest,tolerance=.01)
    # ACT's marker remains at the supplied ABS reference point, with an offset label.
    if row['state_abbr']=='ACT': x,y=row['longitude'],row['latitude']
    else: x,y=point.x,point.y
    rows.append({**row,'longitude':round(x,6),'latitude':round(y,6),'map_label':{'WA':'Western\nAustralia','NT':'Northern\nTerritory','SA':'South\nAustralia','QLD':'Queensland','NSW':'New South\nWales'}.get(row['state_abbr'],row['state_abbr']),'source':'Display anchor: maximum-clearance interior point of largest ABS polygon; ACT uses original ABS reference point. Labels are not destinations.'})
(root/'data/dv2/state-map-labels.json').write_text(json.dumps(rows,indent=2)+'\n')
