"""Retain published suppression-aware observations and independent denominators."""
import json,hashlib,sys,shutil
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=Path(sys.argv[1]);mel=Path(sys.argv[2])
for d in [p,mel]:
 for name,sha in json.loads((d/'SHA256SUMS.json').read_text()).items():
  assert hashlib.sha256((d/name).read_bytes()).hexdigest()==sha,name
states=json.loads((p/'states_holiday_nights_YEJune2026.json').read_text());cities=json.loads((p/'cities_purpose_nights_YEJune2026.json').read_text())
assert len(states['records'])==16 and len(cities['records'])==20
s=[]
for r in states['records']:
 assert r['publishability']=='published_numeric' and r['period_end']=='2026-06-30' and r['period_type']=='year_ending'
 if r['purpose']!='Holiday':continue
 t=next(x for x in states['records'] if x['state']==r['state'] and x['purpose']=='Total')
 s.append(dict(state_abbr=r['state'],holiday_nights_000=r['nights']/1000,nights_000=t['nights']/1000,holiday_nights_share_pct=r['nights']/t['nights']*100))
c=[]
for r in cities['records']:
 assert r['publishability']=='published_numeric' and r['period_end']=='2026-06-30'
 if r['purpose']=='Total':continue
 t=next(x for x in cities['records'] if x['region']==r['region'] and x['purpose']=='Total')
 c.append(dict(city=r['region'],purpose=r['purpose'],purpose_label='Friends / relatives' if r['purpose']=='VFR' else r['purpose'],share_pct=r['nights']/t['nights']*100,nights_000=r['nights']/1000,total_nights_000=t['nights']/1000))
for city in {r['city'] for r in c}:
 rr=[r for r in c if r['city']==city];assert abs(sum(r['nights_000'] for r in rr)-rr[0]['total_nights_000'])<=.00101
m=json.loads((mel/'melbourne-victoria-dots-quarters-2025-2026.json').read_text());quarters=[]
months={'March':1,'June':4,'September':7,'December':10}
for r in m:
 if r['geography']!='Melbourne' or r['period_type']!='quarter':continue
 month,_,year=r['period'].split();quarters.append(dict(date=f'{year}-{months[month]:02d}-01',period=r['period'],trips_m=r['trips_000']/1000))
quarters.sort(key=lambda r:r['date']);assert len(quarters)==6
latest=next(r for r in m if r['geography']=='Melbourne' and r['period_type']=='year ending')
assert abs(sum(r['trips_m'] for r in quarters[-4:])-latest['trips_000']/1000)<1e-9
for n,d in [('state-nights-current',s),('city-purposes-current',c),('melbourne-current',quarters)]:
 (root/f'data/dv2/{n}.json').write_text(json.dumps(d,separators=(',',':'))+'\n')
# Publish small transparent audit files, not the full dashboard metadata exports.
for n in ['states_holiday_nights_YEJune2026.json','cities_purpose_nights_YEJune2026.json','teq_query_payload.json','README.txt']:
 shutil.copyfile(p/n,root/'docs/dv2'/('current_'+n))
shutil.copyfile(mel/'melbourne-victoria-dots-quarters-2025-2026.json',root/'docs/dv2/melbourne_current_source.json')
shutil.copyfile(mel/'melbourne_quarterly_query_payload.json',root/'docs/dv2/melbourne_query.json')
print('Verified latest eight-state, four-city and six-quarter Melbourne observations')
