"""Read-only checks of the frozen V2 website inputs and narrative arithmetic."""
import collections
import hashlib
import json
import math
import pathlib
import statistics

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / 'data' / 'dv2'
checks = []
def load(name):
    return json.loads((DATA / name).read_text())
def check(condition, description):
    if not condition:
        raise AssertionError(description)
    checks.append(description)
def near(a, b, eps=1e-7):
    return abs(a-b) < eps
def haversine(a,b):
    lon1,lat1,lon2,lat2 = map(math.radians, [a[0],a[1],b[0],b[1]])
    h=math.sin((lat2-lat1)/2)**2+math.cos(lat1)*math.cos(lat2)*math.sin((lon2-lon1)/2)**2
    return 6371.0088*2*math.asin(math.sqrt(h))

sights=load('sights.json')
check(len(sights)==len({s['feature_name'] for s in sights})==94,'94 unique selected sight records')
check(collections.Counter(s['theme'] for s in sights)=={'Leisure/Recreation':57,'Place Of Assembly':36,'Purpose Built':1},'Sight theme counts reconcile 57 + 36 + 1')
check(len({s['sub_theme'] for s in sights})==9 and sum(s['display_type']=='Parks & gardens' for s in sights)==37,'Nine subthemes; 37 park / garden / reserve records')
check(all(144<s['longitude']<146 and -39<s['latitude']<-37 for s in sights),'Sights have finite Melbourne coordinates')
tree=load('sight-tree.json');leaves=[s for s in tree if s.get('official')]
check(len(leaves)==9 and sum(s['value'] for s in leaves)==94,'Treemap has nine leaves summing to 94, without parent duplication')
hist=load('art-decades.json');years=load('art-years.json')
check(len(hist)==16 and sum(s['count'] for s in hist)==len(years)==177,'16 adjacent histogram bins sum to 177 exact-year artworks')
check(min(s['recorded_year'] for s in years)==1862 and max(s['recorded_year'] for s in years)==2016,'Recorded year range is 1862–2016')
check(next(s['count'] for s in hist if s['decade']==1990)==39 and next(s['count'] for s in hist if s['decade']==2000)==45,'1990s = 39; 2000s = 45; 25 of 202 dates excluded')
box=load('art-toilets.json');groups=collections.defaultdict(list)
for s in box: groups[s['area']].append(s['metres'])
expected={'Melbourne (CBD)':(45,109.9),'Melbourne (Remainder)':(45,152.6),'East Melbourne':(32,174.05),'Docklands':(31,287.7),'Carlton':(16,230.1)}
check(len(box)==169 and set(groups)==set(expected),'Boxplot uses five qualifying areas and 169 of all 202 artworks')
check(all(len(groups[k])==n and near(statistics.median(groups[k]),median) for k,(n,median) in expected.items()),'All five area counts and median distances match the validated source')
check(all(s['metres'] is not None and s['metres']>=0 for s in box),'No missing distance is converted to zero')
routes=load('routes.json');walks=load('walks.geojson')['features']
check(len(routes)==11 and len(walks)==sum(s['parts'] for s in routes)==34,'11 routes and 34 separate LineString components')
check(len({(s['properties']['route_name'],s['properties']['part_id']) for s in walks})==34,'Every route/component key is unique')
lengths=collections.defaultdict(float)
for f in walks:
    check(f['geometry']['type']=='LineString','A mapped component remains a LineString')
    points=f['geometry']['coordinates']
    lengths[f['properties']['route_name']]+=sum(haversine(a,b) for a,b in zip(points,points[1:]))
check(set(lengths)=={s['route_name'] for s in routes},'All route geometry keys join to a summary')
check(all(near(lengths[s['route_name']],s['geometry_length_km']) for s in routes),'All full-precision route totals reconcile to independently computed geometry length')
check(near(min(s['geometry_length_km'] for s in routes),1.4003646272521142) and near(max(s['geometry_length_km'] for s in routes),4.838108874206504),'Route extrema = 1.4004 km and 4.8381 km')
check([s['route_name'] for s in routes if s['mode']=='Cycling']==['Southbank and Docklands by Bike'],'Only the explicitly named bicycle route is cycling')
combos=load('forest-combinations.json');totals=load('forest-totals.json')
check(len(combos)==len({s['key'] for s in combos})==13 and sum(s['sites'] for s in combos)==532,'All 13 forest combinations sum to 532 sites')
check(next(s['sites'] for s in combos if s['key']=='0000')==32,'32 sites have none of the selected activities recorded')
check({s['activity']:s['sites'] for s in totals}=={'Camping':360,'Picnicking':277,'Campervanning':145,'Fishing':113},'Activity marginals reconcile to 360, 277, 145 and 113')
check(all(all(s[k] in [0,1] for k in ['camping','picnicing','campervanning','fishing']) for s in combos),'Forest flags remain recorded / not recorded; null is not absence')
nights=load('state-nights.json');states=load('states.geojson')['features']
check(len(nights)==len(states)==8 and {s['state_code_2021'] for s in nights}=={str(f['properties']['state_code_2021']) for f in states},'Eight state/territory rows join to eight ABS state geometries')
check(all(near(100*s['holiday_nights_000']/s['nights_000'],s['holiday_nights_share_pct']) and 0<=s['holiday_nights_share_pct']<=100 for s in nights),'Each holiday share uses published state Total nights as denominator')
check({s['state_abbr']:round(s['holiday_nights_share_pct'],1) for s in nights if s['state_abbr'] in ['VIC','TAS','ACT']}=={'VIC':50.0,'TAS':58.0,'ACT':28.4},'VIC / TAS / ACT display 50.0%, 58.0%, 28.4%')
heat=load('city-purposes.json')
check(len(heat)==16 and len({(s['city'],s['purpose']) for s in heat})==16,'Heatmap has exactly four regions × four purpose cells')
check(all(abs(sum(s['share_pct'] for s in heat if s['city']==c)-100)<.00001 for c in ['Melbourne','Sydney','Brisbane','Adelaide']),'Each regional night-share row sums to 100% within published rounding')
check(all(near(100*s['nights_000']/s['total_nights_000'],s['share_pct']) for s in heat),'Every heatmap cell divides purpose nights by the matching published total')
trend=load('melbourne-trend.json')
check([s['year'] for s in trend]==list(range(2019,2025)),'Melbourne line includes exactly six historical years')
check(all(near(s['trips_m'],n) for s,n in zip(trend,[11.435398,3.543139,4.361704,8.556485,10.257111,10.410833])),'All six Melbourne millions agree with the historical NVS series')
check(near(100*(trend[-1]['trips_m']/trend[0]['trips_m']-1),-8.95959196,1e-6),'2019–2024 Melbourne change rounds to −9.0%')
pairs=load('state-pairs.json')
check(len(pairs)==8 and all(near(100*(s['y']/s['x']-1),s['change_pct']) for s in pairs),'Eight state trip-pair changes reconcile')
check([s['state'] for s in pairs if s['y']>s['x']]==['Queensland'],'Queensland is the only positive state point estimate')
manifest=json.loads((ROOT/'docs/dv2/provenance.json').read_text())
check(all(hashlib.sha256((DATA/name).read_bytes()).hexdigest()==s['sha256'] for name,s in manifest['outputs'].items()),'All served data files match their generated provenance hashes')
payload=sum(p.stat().st_size for d in ['data/dv2','specs','vendor','assets'] for p in (ROOT/d).rglob('*') if p.is_file())+sum((ROOT/p).stat().st_size for p in ['index.html','styles.css','app.js'])
check(payload<3_000_000,'Static website resources total less than 3 MB uncompressed')
result={'status':'PASS','checks':len(checks),'snapshot':'2026-10-12','data_bytes':sum(p.stat().st_size for p in DATA.iterdir()),'website_bytes_upper_bound':payload,'assertions':checks}
(ROOT/'docs/dv2/validation.json').write_text(json.dumps(result,indent=2))
print('PASS:',len(checks),'data/provenance checks;',payload,'bytes including local libraries and fonts')
