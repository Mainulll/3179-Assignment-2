"""Create a lighter web-display outline; retain original states.geojson unchanged."""
import hashlib
import json
from pathlib import Path
from shapely.geometry import MultiPolygon, mapping, shape
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'data/dv2/states.geojson'
DEST=ROOT/'data/dv2/states-display.geojson'
def count_vertices(value):
    if isinstance(value,(list,tuple)):
        if len(value)==2 and all(isinstance(v,(int,float)) for v in value):return 1
        return sum(count_vertices(v) for v in value)
    return 0
def rounded(value):
    if isinstance(value,(list,tuple)):return [rounded(v) for v in value]
    return round(value,4) if isinstance(value,float) else value
source=json.loads(SOURCE.read_text());features=[];report=[]
for feature in source['features']:
    geometry=shape(feature['geometry'])
    parts=list(geometry.geoms) if geometry.geom_type=='MultiPolygon' else [geometry]
    largest=max(range(len(parts)),key=lambda i:parts[i].area)
    retained=[p for i,p in enumerate(parts) if i==largest or max(p.bounds[2]-p.bounds[0],p.bounds[3]-p.bounds[1])>=.02]
    display=rounded(mapping(MultiPolygon([p.simplify(.005,preserve_topology=True) for p in retained])))
    if feature['properties']['state']=='Australian Capital Territory':display=feature['geometry'];retained=parts
    final=shape(display)
    change=(final.area/geometry.area-1)*100
    if abs(change)>.05:raise ValueError('Excessive display-only planar area change')
    features.append({'type':'Feature','properties':feature['properties'],'geometry':display})
    report.append({'state':feature['properties']['state'],'source_parts':len(parts),'display_parts':len(retained),'source_vertices':count_vertices(feature['geometry']['coordinates']),'display_vertices':count_vertices(display['coordinates']),'planar_area_change_pct_diagnostic':change})
DEST.write_text(json.dumps({'type':'FeatureCollection','features':features},separators=(',',':'))+'\n')
metadata={'method':'Display only: retain largest part of each state; omit detached components with longitude/latitude bounding-box dimensions both below 0.02 degrees; simplify retained boundaries with topology-preserving tolerance 0.005 degrees; round to four decimal places. ACT geometry is copied unchanged. Original geometry, all eight tourism-property records, labels and denominators remain in the repository. Do not use this outline for geographic analysis.','source':'data/dv2/states.geojson','display':'data/dv2/states-display.geojson','source_sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'display_sha256':hashlib.sha256(DEST.read_bytes()).hexdigest(),'source_bytes':SOURCE.stat().st_size,'display_bytes':DEST.stat().st_size,'states':report}
(ROOT/'docs/dv2/national_display.json').write_text(json.dumps(metadata,indent=2)+'\n')
print(f"Display boundary: {metadata['source_bytes']} → {metadata['display_bytes']} bytes; source retained")
