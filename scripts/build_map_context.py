"""Prepare clipped display-only context from saved official GeoJSON exports.
Requires Shapely. Inputs are separate source snapshots; never changes tourism data.
"""
import sys,json,hashlib
from pathlib import Path
from shapely.geometry import shape,box,mapping
from shapely.geometry.polygon import orient
from shapely.ops import transform,unary_union
from shapely import make_valid
source=Path(sys.argv[1] if len(sys.argv)>1 else 'output/map-source')
out=Path('data/dv2')
bounds={'city':(144.903,-37.845,144.994,-37.778),'routes':(144.930,-37.835,144.988,-37.792)}
def rounding(g):return transform(lambda x,y,z=None:([round(a,6) for a in x],[round(a,6) for a in y]),g)
def orient_geometry(g):
 if g.geom_type=='GeometryCollection':
  from shapely.geometry import MultiPolygon
  polygons=[p for p in g.geoms if p.geom_type=='Polygon']
  return MultiPolygon([orient(p,sign=-1) for p in polygons])
 if g.geom_type=='Polygon':return orient(g,sign=-1)
 if g.geom_type=='MultiPolygon':return type(g)([orient(p,sign=-1) for p in g.geoms])
 return g
report={'retrieved':'2026-10-14','license':'CC BY 4.0','role':'Display context only; not used for counts, distances or route geometry.','transform':'Clip to rectangular view bounds; simplify at 0.000005 degrees (~0.5 m), preserve topology; round to six decimal places; orient polygon rings for D3.','bounds':bounds,'sources':{},'outputs':{}}
for kind in ['streets','water','parks']:
 path=source/(kind+'.geojson');raw=path.read_bytes();fc=json.loads(raw)
 urls={'streets':'https://data.melbourne.vic.gov.au/api/explore/v2.1/catalog/datasets/street-names/exports/geojson','water':'https://services-ap1.arcgis.com/P744lA0wf4LlBZ84/ArcGIS/rest/services/Vicmap_Hydro/FeatureServer/1/query','parks':'https://services5.arcgis.com/DmRfik4clMVydXO3/arcgis/rest/services/VPA_Draft_Open_Space_Data/FeatureServer/0/query'}
 report['sources'][kind]={'url':urls[kind],'sha256':hashlib.sha256(raw).hexdigest(),'source_features':len(fc['features'])}
 for view,extent in bounds.items():
  features=[]
  for f in fc['features']:
   props=f['properties']
   if kind=='parks' and ((props.get('OS_ACCESS') != 'Open' or props.get('OS_TYPE') != 'Public open space') or props.get('OS_CATEGOR') not in ['Parks and gardens','Natural and semi-natural open space','Sportsfields and organised recreation','Recreation corridor'] or props.get('WATER_BODY')=='Yes'):continue
   g=shape(f['geometry']).intersection(box(*extent))
   if g.is_empty:continue
   if kind=='streets':props={'name':props.get('name'),'id':props.get('mccid_gis')}
   elif kind=='water':props={k:props[k] for k in ['name','feature_type_code','ufi']}
   else:props={k:props.get(k) for k in ['PARK_NAME','OS_CATEGOR','OS_TYPE','OS_ACCESS']}
   g=orient_geometry(rounding(g.simplify(.000005,preserve_topology=True)))
   features.append({'type':'Feature','properties':props,'geometry':mapping(g)})
  if kind=='parks' and features:
   # Merge overlapping open-space polygons for display; retain the selection in the report.
   g=orient_geometry(unary_union([make_valid(shape(f['geometry'])) for f in features]))
   features=[{'type':'Feature','properties':{'context':'Recorded open public space; historical VPA inventory'},'geometry':mapping(g)}]
  filename=f'{view}-{kind}.geojson';result={'type':'FeatureCollection','features':features};(out/filename).write_text(json.dumps(result,separators=(',',':')))
  report['outputs'][filename]={'features':len(features),'bytes':(out/filename).stat().st_size,'sha256':hashlib.sha256((out/filename).read_bytes()).hexdigest()}
Path('docs/dv2/map_context.json').write_text(json.dumps(report,indent=2)+'\n')
print(report['outputs'])
