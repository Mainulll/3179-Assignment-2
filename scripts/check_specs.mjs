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
