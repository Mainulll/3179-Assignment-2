"""Derive source-line endpoints; do not infer itinerary order or official starts."""
import json
from pathlib import Path
from collections import defaultdict
walks=json.loads(Path('data/dv2/walks.geojson').read_text())['features']
counts=defaultdict(int);rows=[]
for f in walks:
 p=f['properties'];name=p['route_name'];counts[name]+=1;n=counts[name];a=f['geometry']['coordinates'][0];b=f['geometry']['coordinates'][-1];closed=a==b
 for point,kind,label in [(a,'Closed line' if closed else 'Line start',f'{n}↻' if closed else f'{n}A')]+([] if closed else [(b,'Line end',f'{n}B')]):
  rows.append({'route_name':name,'part_id':p['part_id'],'component':n,'longitude':point[0],'latitude':point[1],'kind':kind,'label':label,'meaning':'Source line endpoint, not an official itinerary start/finish'})
Path('data/dv2/route-endpoints.json').write_text(json.dumps(rows,separators=(',',':')))
print(len(rows),'source endpoints for',len(walks),'components; closed lines use one loop marker')
# Combine only nearby endpoints for display; anchor each group on a real source point.
# Every original endpoint remains in route-endpoints.json and in the group's tooltip.
import math
def metres(a,b):
 lat=math.radians((a['latitude']+b['latitude'])/2)
 return 6371008.8*math.hypot(math.radians(a['latitude']-b['latitude']),math.radians(a['longitude']-b['longitude'])*math.cos(lat))
groups=[]
for route in counts:
 remaining=[dict(r) for r in rows if r['route_name']==route]
 while remaining:
  members=[remaining.pop(0)];changed=True
  while changed:
   changed=False
   for r in remaining[:]:
    if any(metres(r,m)<=15 for m in members):members.append(r);remaining.remove(r);changed=True
  anchor=members[0];kinds=set(m['kind'] for m in members)
  label=anchor['label'] if len(members)==1 else 'A/B' if len(kinds)>1 else 'A' if 'Line start' in kinds else 'B'
  groups.append({'route_name':route,'longitude':anchor['longitude'],'latitude':anchor['latitude'],'label':label,'endpoints':' · '.join(m['label'] for m in members),'kind':' / '.join(sorted(kinds)),'endpoint_count':len(members),'meaning':'Nearby source endpoints grouped within 15 m for readability; not official itinerary start/finish'})
Path('data/dv2/route-endpoint-groups.json').write_text(json.dumps(groups,separators=(',',':')))
print(len(groups),'display endpoint groups, retaining all source endpoint labels')
