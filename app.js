/* All resources are local. Major story chapters remain visible at all times. */
(() => {
  'use strict';
  const views = new Map();
  const specs = new Map();
  const cache = new Map();
  const mapZoom = {'01':1,'04':1};
  const mapPan = {'01':{longitude:0,mercator:0},'04':{longitude:0,mercator:0}};
  const mapProjection = {};
  const renderQueues = new Map();
  let lastPanAt=0,lastRouteFilter='All',lastCombo='All';
  const state = {themeFilter:'All',subFilter:'All',routeFilter:'All',selectedCombo:'All'};
  const $ = id => document.getElementById(id);
  const fetchJSON = async url => {
    if (!cache.has(url)) cache.set(url, fetch(url).then(r => {if (!r.ok) throw new Error(`${r.status}: ${url}`); return r.json();}));
    return cache.get(url);
  };
  const tableColumns = {
    'sights': [['feature_name','Place'],['theme','Source theme'],['sub_theme','Source type'],['clue_area','CLUE area']],
    'sight-tree': [['label','Type'],['theme','Source theme'],['official','Full source label'],['value','Records']],
    'art-decades': [['label','Recorded decade'],['count','Artworks']],
    'routes': [['route_name','Source route name'],['mode','Derived mode'],['geometry_length_km','Mapped km'],['parts','Components']],
    'art-toilets': [['area','CLUE area'],['n','Artworks'],['min','Min m'],['q1','Lower quartile m'],['median','Median m'],['q3','Upper quartile m'],['max','Max m']],
    'forest-combinations': [['combination','Recorded activities'],['sites','Sites']],
    'state-nights': [['state','State / territory'],['holiday_nights_share_pct','Holiday share %'],['holiday_nights_000','Holiday nights (000)'],['nights_000','All nights (000)']],
    'city-purposes': [['city','Tourism region'],['purpose','Official purpose'],['share_pct','Night share %'],['nights_000','Purpose nights (000)'],['total_nights_000','All nights (000)']],
    'melbourne-trend': [['year','Calendar year'],['trips_m','Domestic overnight trips (m)']],
    'state-pairs': [['state','State / territory'],['x','2019 trips (m)'],['y','2024 trips (m)'],['change_pct','Change %']]
  };
  const fmt = x => x == null ? 'Not recorded' : typeof x === 'number' ? Number.isInteger(x) ? x.toLocaleString('en-AU') : x.toLocaleString('en-AU',{maximumFractionDigits:3}) : x;
  const quantile = (a,p) => {const h=(a.length-1)*p,i=Math.floor(h); return a[i]+(a[Math.min(i+1,a.length-1)]-a[i])*(h-i);};
  function boxSummary(rows) {
    const groups = new Map();
    for (const row of rows) {if (!groups.has(row.area)) groups.set(row.area,[]); groups.get(row.area).push(row.metres);}
    return [...groups].map(([area,values]) => {const a=values.sort((a,b)=>a-b);return {area,n:a.length,min:a[0],q1:quantile(a,.25),median:quantile(a,.5),q3:quantile(a,.75),max:a.at(-1)};});
  }
  function buildTable(figure, dataset, records) {
    if (dataset === 'sight-tree') records=records.filter(r=>r.official);
    if (dataset === 'art-toilets') records=boxSummary(records);
    if(dataset==='sight-tree') {
      const key=document.createElement('div');key.className='type-key';key.setAttribute('aria-label','All sight types and record counts');
      for(const r of records){const b=document.createElement('button');b.type='button';b.textContent=`${r.label} · ${r.value}`;b.dataset.theme=r.theme;b.addEventListener('click',()=>selectType(r.id,r.theme));key.append(b);}figure.querySelector('.chart').after(key);
    }
    const tools=document.createElement('div');tools.className='figure-tools';
    const details=document.createElement('details');
    const summary=document.createElement('summary');summary.textContent=`Data table (${records.length} rows)`;details.append(summary);
    const scroll=document.createElement('div');scroll.className='table-scroll';scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label',`${figure.querySelector('h3').textContent} data table`);
    const table=document.createElement('table');
    const caption=document.createElement('caption');caption.textContent=figure.querySelector('h3').textContent;table.append(caption);
    const head=document.createElement('thead'),hrow=document.createElement('tr');
    for(const [,label] of tableColumns[dataset]){const cell=document.createElement('th');cell.scope='col';cell.textContent=label;hrow.append(cell);}head.append(hrow);table.append(head);
    const body=document.createElement('tbody');
    for(const record of records){const row=document.createElement('tr');for(const [key] of tableColumns[dataset]){const cell=document.createElement('td');cell.textContent=fmt(record[key]);row.append(cell);}body.append(row);}table.append(body);scroll.append(table);details.append(scroll);
    const raw=document.createElement('a');raw.href=`data/dv2/${dataset}.json`;raw.textContent='Source data JSON';raw.className='data-download';details.append(raw);
    const spec=document.createElement('a');spec.href=`specs/${figure.dataset.chart}.json`;spec.textContent='Chart JSON';spec.setAttribute('aria-label',`${figure.querySelector('h3').textContent}: chart JSON specification`);
    tools.append(details,spec);figure.append(tools);
  }
  function addOption(select, value, text) {const o=document.createElement('option');o.value=value;o.textContent=text;select.append(o);}
  function populateTypes(sights) {
    const select=$('type-filter');select.replaceChildren();addOption(select,'All','All types in this theme');
    const types=new Map(sights.filter(s=>state.themeFilter==='All'||s.theme===state.themeFilter).map(s=>[s.sub_theme,s.display_type]));
    for(const [value,label] of [...types].sort((a,b)=>a[1].localeCompare(b[1])))addOption(select,value,label);
    if(!types.has(state.subFilter))state.subFilter='All';select.value=state.subFilter;
  }
  async function updateSignals() {
    await Promise.all([...views.values()].map(async view=>{for(const key of Object.keys(state)){try{view.signal(key,state[key]);}catch{ /* This view does not use the shared key. */ }}await view.runAsync();}));
    const routeChanged=state.routeFilter!==lastRouteFilter;
    if(routeChanged){mapPan['04']={longitude:0,mercator:0};lastRouteFilter=state.routeFilter;}
    if(routeChanged || mapZoom['04']>1){const f=document.querySelector('[data-chart="04-city-routes"]');if(f)await render(f);}
    if(lastCombo!==state.selectedCombo){
      lastCombo=state.selectedCombo;const scroll=document.querySelector('.chart-scroll'),forest=views.get('07-forest-upset');
      if(scroll && forest){const x=state.selectedCombo==='All'?0:forest.scale('x')(state.selectedCombo);scroll.scrollLeft=state.selectedCombo==='All'?0:Math.max(0,x-scroll.clientWidth/2+20);}
    }
    const sights=await fetchJSON('data/dv2/sights.json');
    const n=sights.filter(s=>(state.themeFilter==='All'||s.theme===state.themeFilter)&&(state.subFilter==='All'||s.sub_theme===state.subFilter)).length;
    $('sight-count').textContent=`${n} of 94 selected records`;
    const routes=await fetchJSON('data/dv2/routes.json');
    const route=routes.find(r=>r.route_name===state.routeFilter);
    $('route-readout').textContent=route?`${route.mode} · ${route.geometry_length_km.toFixed(2)} mapped km`:'10 walking routes · 1 cycling route';
  }
  function selectType(type,theme) {
    if(state.subFilter===type){state.subFilter='All';}else{state.subFilter=type;state.themeFilter=theme;}
    $('theme-filter').value=state.themeFilter;
    fetchJSON('data/dv2/sights.json').then(s=>{populateTypes(s);updateSignals();});
  }
  function selectRoute(route) {state.routeFilter=state.routeFilter===route?'All':route;$('route-filter').value=state.routeFilter;updateSignals();}
  const mercatorY=latitude=>Math.log(Math.tan(Math.PI/4+latitude*Math.PI/360));
  async function setMapView(spec,name,available) {
    const id=name.slice(0,2),zoom=mapZoom[id];
    const bounds=id==='01'?[144.903,-37.845,144.994,-37.778]:[144.930,-37.835,144.988,-37.792];
    let longitude=(bounds[0]+bounds[2])/2,latitude=(bounds[1]+bounds[3])/2;
    if(id==='04' && zoom>1 && state.routeFilter!=='All'){
      const walks=await fetchJSON('data/dv2/walks.geojson');
      const points=walks.features.filter(f=>f.properties.route_name===state.routeFilter).flatMap(f=>f.geometry.coordinates);
      longitude=(Math.min(...points.map(p=>p[0]))+Math.max(...points.map(p=>p[0])))/2;
      latitude=(Math.min(...points.map(p=>p[1]))+Math.max(...points.map(p=>p[1])))/2;
    }
    longitude=Math.max(bounds[0],Math.min(bounds[2],longitude+mapPan[id].longitude));
    latitude=2*Math.atan(Math.exp(mercatorY(latitude)+mapPan[id].mercator))*180/Math.PI-90;
    latitude=Math.max(bounds[1],Math.min(bounds[3],latitude));
    spec.width=available-10;spec.autosize={type:'none',contains:'content'};spec.padding=5;
    const base=Math.min((spec.width-12)/((bounds[2]-bounds[0])*Math.PI/180),(spec.height-12)/(mercatorY(bounds[3])-mercatorY(bounds[1])));
    const scale=base*zoom;
    mapProjection[id]={scale,longitude,latitude};
    spec.projection={type:'mercator',center:[longitude,latitude],scale,translate:[spec.width/2,spec.height/2]};
    for(const layer of spec.layer){layer.mark={...layer.mark,clip:true};}
    const pixelsPerKm=scale/(6371.0088*Math.cos(latitude*Math.PI/180));
    const km=[2,1,.5,.2,.1].find(k=>k*pixelsPerKm<=95)||.05;
    $('scale-bar-'+id).style.width=(km*pixelsPerKm)+'px';
    $('scale-label-'+id).textContent=`≈ ${km>=1?km+' km':Math.round(km*1000)+' m'} at map centre`;
    $('zoom-value-'+id).textContent=zoom+'×';
  }
  function applyMapPan(id,dx,dy){
    const projection=mapProjection[id];if(!projection)return;
    mapPan[id].longitude-=dx/projection.scale*180/Math.PI;
    mapPan[id].mercator+=dy/projection.scale;
  }
  function bindMapPan(figure,id){
    const element=figure.querySelector('.chart');let drag;
    element.dataset.pannable='true';element.tabIndex=0;
    element.setAttribute('aria-label',element.getAttribute('aria-label')+'. Drag to pan, or use arrow keys when focused.');
    element.addEventListener('pointerdown',e=>{if(!e.isPrimary || (e.pointerType==='mouse' && e.button!==0))return;drag={x:e.clientX,y:e.clientY,moved:false};element.setPointerCapture(e.pointerId);});
    element.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)drag.moved=true;if(drag.moved){element.dataset.dragging='true';const svg=element.querySelector('svg');if(svg)svg.style.transform=`translate(${dx}px,${dy}px)`;}});
    const finish=(e,cancel=false)=>{if(!drag)return;const ended=drag;drag=null;delete element.dataset.dragging;const svg=element.querySelector('svg');if(svg)svg.style.transform='';if(element.hasPointerCapture(e.pointerId))element.releasePointerCapture(e.pointerId);if(ended.moved&&!cancel){lastPanAt=Date.now();applyMapPan(id,e.clientX-ended.x,e.clientY-ended.y);render(figure);}};
    element.addEventListener('pointerup',e=>finish(e));element.addEventListener('pointercancel',e=>finish(e,true));
    element.addEventListener('keydown',e=>{const offset={ArrowLeft:[60,0],ArrowRight:[-60,0],ArrowUp:[0,60],ArrowDown:[0,-60]}[e.key];if(offset){e.preventDefault();lastPanAt=Date.now();applyMapPan(id,...offset);render(figure);}});
  }
  async function render(figure) {
    const name=figure.dataset.chart;
    const task=(renderQueues.get(name)||Promise.resolve()).catch(()=>{}).then(()=>renderFigure(figure));
    renderQueues.set(name,task);return task;
  }
  async function renderFigure(figure) {
    const name=figure.dataset.chart, element=figure.querySelector('.chart');
    if(views.has(name))views.get(name).finalize();
    const original=specs.get(name),spec=structuredClone(original);
    const available=Math.max(190,Math.floor(element.parentElement.classList.contains('chart-scroll') ? 760 : element.clientWidth));
    const isVega=spec.$schema.includes('/vega/v');
    if(isVega){spec.width=name.startsWith('07')?Math.max(760,available-10):Math.max(120,available-8);if(name.startsWith('02'))spec.height=Math.max(300,Math.min(400,available*1.04));}
    else {spec.width=available;if(name.startsWith('01')||name.startsWith('04')){spec.height=Math.min(520,Math.max(285,available*.9));spec.params.find(p=>p.name==='mapDetail').value=available<430?1:name.startsWith('01')?2:3;}if(name.startsWith('11')){const inner=Math.max(145,available-70);spec.width=inner;spec.height=inner;spec.autosize={type:'none',contains:'content'};spec.padding={left:52,right:10,top:10,bottom:55};}if(name.startsWith('08'))spec.height=Math.min(500,available*1.12);}
    if(name.startsWith('05') && available<430){spec.encoding.x.title='Distance (m)';spec.encoding.x.axis.tickCount=3;spec.encoding.x.axis.values=[0,400,800];spec.encoding.y.axis.labelFontSize=11;spec.encoding.y.axis.labelLimit=112;}
    if(name.startsWith('06') && available<430){for(const layer of spec.layer){if(layer.encoding?.x?.scale)layer.encoding.x.scale.domain=[0,6];if(layer.encoding?.x?.axis)layer.encoding.x.axis.tickCount=4;}}
    if(name.startsWith('09') && available<430){spec.encoding.x.axis.labelFontSize=11;spec.encoding.x.axis.labelExpr="datum.label === 'Friends / relatives' ? ['Friends /','relatives'] : [datum.label]";spec.encoding.x.axis.labelLimit=85;if(available<300){spec.encoding.x.axis.labelLimit=160;spec.encoding.x.axis.labelExpr='datum.label';spec.encoding.x.axis.labelAngle=-45;spec.encoding.x.axis.labelAlign='left';spec.encoding.x.axis.labelBaseline='middle';spec.encoding.x.axis.labelPadding=18;}}
    if(name.startsWith('01')||name.startsWith('04'))await setMapView(spec,name,available);
    try{
      const result=await vegaEmbed(element,spec,{actions:false,renderer:'svg',tooltip:{theme:'light'},defaultStyle:false});
      const view=result.view;views.set(name,view);
      figure.dataset.ready='true';
      for(const key of Object.keys(state)){try{view.signal(key,state[key]);}catch{}}
      await view.runAsync();
      view.addEventListener('click',(_,item)=>{
        if(Date.now()-lastPanAt<250 || !item?.datum)return;const d=item.datum;
        if(name.startsWith('01') && d.sub_theme)selectType(d.sub_theme,d.theme);
        if(name.startsWith('02') && d.official)selectType(d.id,d.theme);
        if(name.startsWith('04') && d.properties?.route_name)selectRoute(d.properties.route_name);
        if(name.startsWith('06') && d.route_name)selectRoute(d.route_name);
        if(name.startsWith('07') && d.key){state.selectedCombo=state.selectedCombo===d.key?'All':d.key;$('combo-filter').value=state.selectedCombo;updateSignals();}
      });
      const svg=element.querySelector('svg');if(svg){svg.setAttribute('role','img');svg.setAttribute('aria-label',element.getAttribute('aria-label'));}
    }catch(error){figure.dataset.ready='error';element.replaceChildren();const p=document.createElement('p');p.className='chart-error';p.textContent='This chart could not load. The data table and JSON links below are still available.';element.append(p);console.error(name,error);}
  }
  async function init(){
    const figures=[...document.querySelectorAll('[data-chart]')];
    await document.fonts.ready;
    const [sights,routes,combos]=await Promise.all(['sights','routes','forest-combinations'].map(n=>fetchJSON(`data/dv2/${n}.json`)));
    populateTypes(sights);
    for(const id of ['01','04']){
      const figure=document.querySelector(`[data-chart^="${id}"]`);let zoomTimer;bindMapPan(figure,id);
      $('zoom-'+id).addEventListener('input',e=>{mapZoom[id]=Number(e.target.value);$('zoom-value-'+id).textContent=mapZoom[id]+'×';clearTimeout(zoomTimer);zoomTimer=setTimeout(()=>render(figure),100);});
      $('zoom-reset-'+id).addEventListener('click',()=>{clearTimeout(zoomTimer);mapZoom[id]=1;mapPan[id]={longitude:0,mercator:0};$('zoom-'+id).value='1';render(figure);});
    }
    for(const r of [...routes].sort((a,b)=>a.geometry_length_km-b.geometry_length_km))addOption($('route-filter'),r.route_name,`${r.route_name} (${r.mode.toLowerCase()})`);
    for(const c of combos)addOption($('combo-filter'),c.key,`${c.combination} · ${c.sites} ${c.sites===1?"site":"sites"}`);
    $('theme-filter').addEventListener('change',e=>{state.themeFilter=e.target.value;state.subFilter='All';populateTypes(sights);updateSignals();});
    $('type-filter').addEventListener('change',e=>{state.subFilter=e.target.value;updateSignals();});
    $('reset-city').addEventListener('click',()=>{state.themeFilter='All';state.subFilter='All';$('theme-filter').value='All';populateTypes(sights);updateSignals();});
    $('route-filter').addEventListener('change',e=>{state.routeFilter=e.target.value;updateSignals();});
    $('reset-route').addEventListener('click',()=>{state.routeFilter='All';$('route-filter').value='All';updateSignals();});
    $('combo-filter').addEventListener('change',e=>{state.selectedCombo=e.target.value;updateSignals();});
    await Promise.all(figures.map(async figure=>{
      const name=figure.dataset.chart;
      const [spec,records]=await Promise.all([fetchJSON(`specs/${name}.json`),fetchJSON(`data/dv2/${figure.dataset.table}.json`)]);
      specs.set(name,spec);buildTable(figure,figure.dataset.table,records);await render(figure);
    }));
    const refreshStatus=()=>{
    const errors=figures.filter(f=>f.dataset.ready!=='true');
    document.body.dataset.chartsReady=String(figures.length-errors.length);
    $('load-status').textContent=errors.length?`${errors.length} charts could not load. Use their data tables.`:'All eleven charts have loaded. Use the labelled filters, source links and data tables.';
    };
    refreshStatus();
    let timer;let lastWidth=window.innerWidth;
    window.addEventListener('resize',()=>{if(window.innerWidth===lastWidth)return;lastWidth=window.innerWidth;clearTimeout(timer);timer=setTimeout(async()=>{document.body.dataset.chartsReady='0';$('load-status').textContent='Resizing charts…';await Promise.all(figures.map(render));refreshStatus();},180);});
  }
  init().catch(error=>{console.error('Page setup failed',error);$('load-status').className='notice wrap';$('load-status').textContent='The charts could not be prepared. Try refreshing the page, or open the source files from the links below.';});
})();
