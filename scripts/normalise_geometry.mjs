/* Normalise the archived ABS generalised polygons for D3 spherical rendering.
   Source polygons include tiny rings collapsed by the archive's rounding.
   Retain every measurable polygon; discard only numerically degenerate parts. */
import fs from 'node:fs';
import {geoArea} from 'd3-geo';
const filename=process.argv[2], reportPath=process.argv[3];
const collection=JSON.parse(fs.readFileSync(filename,'utf8'));
const report=[];
for(const feature of collection.features){
  const polygons=feature.geometry.type==='MultiPolygon'?feature.geometry.coordinates:[feature.geometry.coordinates];
  const retained=[];let reversed=0,dropped=0,discardedAreaKm2=0;
  for(const polygon of polygons){
    const area=geoArea({type:'Polygon',coordinates:polygon});
    const smallArea=Math.min(area,Math.abs(4*Math.PI-area));
    if(smallArea<=1e-12){dropped++;discardedAreaKm2+=smallArea*6371.0088**2;continue;}
    if(area>2*Math.PI){polygon.forEach(ring=>ring.reverse());reversed++;}
    const finalArea=geoArea({type:'Polygon',coordinates:polygon});
    if(!(finalArea>0&&finalArea<1))throw new Error('Unresolved spherical polygon: '+feature.properties.state_name_2021);
    retained.push(polygon);
  }
  if(!retained.length)throw new Error('Missing state polygon');
  feature.geometry.coordinates=feature.geometry.type==='MultiPolygon'?retained:retained[0];
  report.push({state:feature.properties.state_name_2021,source_parts:polygons.length,retained_parts:retained.length,reversed_parts:reversed,numerically_degenerate_parts_omitted:dropped,omitted_spherical_area_km2_upper_bound:discardedAreaKm2});
}
fs.writeFileSync(filename,JSON.stringify(collection));
fs.writeFileSync(reportPath,JSON.stringify({method:'Spherical ring orientation normalized for D3/Vega. Parts with area <= 1e-12 steradians (about 40 square metres) are numerically degenerate after source rounding and omitted only from display geometry; tourism statistics are unchanged.',states:report},null,2)+'\n');
console.log('Normalised eight state display geometries; degenerate parts omitted:',report.reduce((n,r)=>n+r.numerically_degenerate_parts_omitted,0));
