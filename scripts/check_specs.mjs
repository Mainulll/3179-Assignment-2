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
