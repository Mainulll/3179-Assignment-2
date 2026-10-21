"""Build chart data from the verified official-workbook extraction bundle."""
import json,sys,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
src=Path(sys.argv[1]); manifest=json.loads((src/'SHA256SUMS.json').read_text())
for name,sha in manifest.items():
 assert hashlib.sha256((src/name).read_bytes()).hexdigest()==sha,name
q=json.loads((src/'dots-compatible-quarterly-2019-2026.json').read_text())
rows=[dict(area=r['area'],year=r['year'],quarter=r['quarter'],period=r['period'],date=f"{r['year']}-{(r['quarter']-1)*3+1:02d}-01",method=r['method'],trips_m=r['trips_000']/1000,nights_m=r['nights_000']/1000,spend_bn=r['spend_aud_m']/1000) for r in q['records']]
assert len(rows)==270 and len({r['area'] for r in rows})==9
pairs=json.loads((src/'dots-state-pairs-june-2019-2026.json').read_text())
old=json.loads((root/'data/dv2/state-pairs.json').read_text()); abbr={r['state']:r['abbr'] for r in old}
pos={'NSW':(8.8,9.8),'VIC':(7.9,7.1),'QLD':(5.4,6.9),'SA':(1.4,2.4),'WA':(2.9,2.8),'TAS':(.7,1.3),'NT':(.9,.25),'ACT':(1.7,.7)}
ps=[]
for p in pairs:
 if p['area']=='Australia':continue
 a=abbr[p['area']];x,y=pos[a]
 ps.append(dict(state=p['area'],abbr=a,x=p['x_2019_trips_m'],y=p['y_2026_trips_m'],change_pct=p['change_pct'],label_x=x,label_y=y,x_method=p['x_method'],y_method=p['y_method']))
for name,data in [('dots-quarterly-history',rows),('dots-state-pairs',ps)]:
 (root/f'data/dv2/{name}.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
provenance={k:v for k,v in q.items() if k!='records'}
provenance['workbook_sha256']={k:v for k,v in manifest.items() if k.endswith('.xlsx')}
provenance['source_cells']=[{k:r[k] for k in ['area','period','source_url','source_cells']} for r in q['records']]
(root/'docs/dv2/dots_history_sources.json').write_text(json.dumps(provenance,indent=2)+'\n')
print('Verified 270 quarter observations and eight June-quarter state pairs')
