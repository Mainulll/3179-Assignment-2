import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as vega from 'vega';
import * as vl from 'vega-lite';
import {geoArea} from 'd3-geo';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output','chart-svg');fs.mkdirSync(output,{recursive:true});
const states=JSON.parse(fs.readFileSync(path.join(root,'data/dv2/states.geojson')));
for(const feature of states.features){
  const area=geoArea(feature);
  if(!(area>0 && area<1))throw new Error('State geometry winding includes a spherical complement: '+feature.properties.state_name_2021);
}
console.log('PASS all eight state polygon windings render bounded geographic areas');
for(const name of ['city-water','routes-water','city-parks','routes-parks']){
 const context=JSON.parse(fs.readFileSync(path.join(root,'data/dv2',name+'.geojson')));
 for(const feature of context.features){if(!(geoArea(feature)>0 && geoArea(feature)<.01))throw new Error(name+': invalid or inverted display polygon');}
}
console.log('PASS local water and park polygon orientations');
let warnings=[];const logger=vega.logger(vega.Warn);logger.warn=(...args)=>{warnings.push(args.join(' '));return logger;};
for(const filename of fs.readdirSync(path.join(root,'specs')).filter(f=>f.endsWith('.json')).sort()){
  warnings=[];
  const spec=JSON.parse(fs.readFileSync(path.join(root,'specs',filename),'utf8'));
  const compiled=spec.$schema.includes('/vega-lite/')?vl.compile(spec,{logger}).spec:spec;
  const view=new vega.View(vega.parse(compiled),{renderer:'none',logger,loader:vega.loader({baseURL:root+'/'})});
  await view.runAsync();const svg=await view.toSVG();
  if(svg.includes('NaN')||svg.length<1000)throw new Error(filename+': invalid SVG');
  fs.writeFileSync(path.join(output,filename.replace('.json','.svg')),svg);
  console.log('PASS',filename,...warnings.map(x=>'WARN: '+x));view.finalize();
}
// Display-only label anchors must remain within their own state polygons.
const {geoContains}=await import('d3-geo');
const labels=JSON.parse(fs.readFileSync(path.join(root,'data/dv2/state-map-labels.json')));
for(const label of labels){
 const feature=states.features.find(f=>f.properties.state===label.state_name);
 if(!feature || !geoContains(feature,[label.longitude,label.latitude]))throw new Error('State label outside boundary: '+label.state_name);
}
const distances=JSON.parse(fs.readFileSync(path.join(root,'data/dv2/art-toilets.json')));
const strip=JSON.parse(fs.readFileSync(path.join(root,'specs/05-art-toilets.json')));
if(distances.length!==169 || new Set(distances.map(d=>d.area)).size!==5 || strip.encoding.x.field!=='metres' || strip.transform.some(t=>t.filter))throw new Error('Strip plot coverage or exact distance encoding changed');
console.log('PASS interior state labels and all 169 exact-distance artwork records');
// The violin is a density view, with five separate shapes and unchanged raw observations.
const violinView=new vega.View(vega.parse(vl.compile(strip).spec),{renderer:'none',loader:vega.loader({baseURL:root+'/'})});
await violinView.runAsync();
const density=violinView.data('data_0'),dots=violinView.data('data_1');
if(dots.length!==169 || dots.some(d=>d.metres!==distances.find(r=>r.asset_id===d.asset_id).metres))throw new Error('Raw violin dots displaced or omitted');
if(new Set(density.map(d=>d.area_row)).size!==5 || strip.layer[0].encoding.detail.field!=='area_row')throw new Error('Violin groups joined');
for(let i=0;i<5;i++){
 const raw=dots.filter(d=>d.area_row===i).map(d=>d.metres),curve=density.filter(d=>d.area_row===i);
 if(curve.some(d=>d.distance<Math.min(...raw)-1e-6 || d.distance>Math.max(...raw)+1e-6 || d.density<0))throw new Error('Violin exceeds observed range');
}
violinView.finalize();console.log('PASS five independent violin shapes within observed ranges and all 169 unchanged dots');

const displayStates=JSON.parse(fs.readFileSync(path.join(root,'data/dv2/states-display.geojson')));
if(displayStates.features.length!==8)throw new Error('Display geometry lost a state');
for(const f of displayStates.features){
 const original=states.features.find(s=>s.properties.state===f.properties.state);
 if(JSON.stringify(original.properties)!==JSON.stringify(f.properties)||!(geoArea(f)>0&&geoArea(f)<1))throw new Error('Display state properties/winding changed');
 if(f.properties.state==='Australian Capital Territory'&&JSON.stringify(f.geometry)!==JSON.stringify(original.geometry))throw new Error('ACT display geometry changed');
 const label=labels.find(l=>l.state_name===f.properties.state);
 if(!geoContains(f,[label.longitude,label.latitude]))throw new Error('Label outside display outline');
}
console.log('PASS all eight display states retain exact tourism properties, interior labels and unchanged ACT');
const current=JSON.parse(fs.readFileSync(path.join(root,'data/dv2/dots-quarter.json')));
if(current.length!==16||new Set(current.map(r=>r.geography)).size!==2||current.some(r=>![2025,2026].includes(r.year)||Math.abs(r.value*1000-r.raw_value)>1e-7))throw new Error('Current DoTS units/coverage failed');
if(current.find(r=>r.geography==='Victoria'&&r.metric==='overnight_trips'&&r.year===2026).raw_value!==7301.035)throw new Error('Current source-cell fidelity failed');
console.log('PASS current DoTS quarter comparison:16 source cells, units and separate2025/2026 periods');
const history=JSON.parse(fs.readFileSync(path.join(root,'data/dv2/dots-quarterly-history.json')));
if(history.length!==270||new Set(history.map(r=>r.area)).size!==9||new Set(history.map(r=>r.area+':'+r.period)).size!==270)throw new Error('Compatible history coverage/uniqueness');
for(const area of new Set(history.map(r=>r.area))){const rows=history.filter(r=>r.area===area);if(rows.length!==30||rows.some(r=>r.method!==(r.year<2025?'DoTS-compatible revised backcast':'DoTS')))throw new Error('Quarterly method/coverage mismatch');}
const latestStates=JSON.parse(fs.readFileSync(path.join(root,'data/dv2/state-nights-current.json'))),latestCities=JSON.parse(fs.readFileSync(path.join(root,'data/dv2/city-purposes-current.json')));
if(latestStates.length!==8||latestCities.length!==16)throw new Error('Current map/heatmap coverage');
for(const r of latestStates)if(Math.abs(r.holiday_nights_000/r.nights_000*100-r.holiday_nights_share_pct)>1e-9)throw new Error('State denominator changed');
for(const city of new Set(latestCities.map(r=>r.city))){const rows=latestCities.filter(r=>r.city===city);if(rows.length!==4||Math.abs(rows.reduce((n,r)=>n+r.nights_000,0)-rows[0].total_nights_000)>.00101)throw new Error('City published total reconciliation');}
const currentMelbourne=JSON.parse(fs.readFileSync(path.join(root,'data/dv2/melbourne-current.json')));
if(currentMelbourne.length!==6||Math.abs(currentMelbourne.slice(-4).reduce((n,r)=>n+r.trips_m,0)-13.447119938309399)>1e-10)throw new Error('Melbourne quarters/year-ending mismatch');
console.log('PASS 270 unique state quarters, method boundary, current denominators and Melbourne year-ending reconciliation');
