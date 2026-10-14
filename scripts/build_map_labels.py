import json,sys
from pathlib import Path
from shapely.geometry import shape
source=json.load(open('data/dv2/sights.json'))
names={'Royal Park':'Royal Park','Princes Park':'Princes Park','Fitzroy Gardens':'Fitzroy Gardens','Flagstaff Gardens':'Flagstaff Gardens','Royal Botanic Gardens':'Botanic Gardens','Federation Square':'Federation Sq','Melbourne Zoo':'Melbourne Zoo','Royal Exhibition Building':'Exhibition Building'}
streets={'SWANSTON STREET':'Swanston St','ELIZABETH STREET':'Elizabeth St','BOURKE STREET':'Bourke St','COLLINS STREET':'Collins St','FLINDERS STREET':'Flinders St'}
for view in ['city','routes']:
 fc=json.load(open('data/dv2/'+view+'-streets.geojson')); labels=[]
 for name,label in streets.items():
  candidates=[shape(f['geometry']) for f in fc['features'] if ' '.join(str(f['properties']['name']).split())==name]
  if candidates:
   g=max(candidates,key=lambda g:g.length);p=g.interpolate(.5,normalized=True);labels.append({'label':label,'longitude':p.x,'latitude':p.y,'kind':'street','priority':3,'source_name':name})
 for row in source:
  n=row['feature_name']
  if n in names and (view=='city' or (144.930<row['longitude']<144.988 and -37.835<row['latitude']<-37.792)):
   labels.append({'label':names[n],'longitude':row['longitude'],'latitude':row['latitude'],'kind':'place','priority':1 if n in ['Royal Park','Fitzroy Gardens','Royal Botanic Gardens'] else 2,'source_name':n})
 Path('data/dv2/'+view+'-labels.json').write_text(json.dumps(labels,separators=(',',':')))
 print(view,len(labels))
