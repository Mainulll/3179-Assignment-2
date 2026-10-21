/* All resources are local. Major story chapters remain visible at all times. */
(() => {
  'use strict';
  const views = new Map();
  const specs = new Map();
  const cache = new Map();
  const mapZoom = {'01':1,'04':1,'08':1};
  const mapPan = {'01':{longitude:0,mercator:0},'04':{longitude:0,mercator:0},'08':{longitude:0,mercator:0}};
  const mapProjection = {};
  const renderQueues = new Map();
  const renderVersions = new Map();
  let lastPanAt=0,lastRouteFilter='All',lastCombo='All',currentGeography='Victoria',historyArea='Victoria',scatterPeriod='current',tourismPeriod='current',melbournePeriod='current';
  const state = {themeFilter:'All',subFilter:'All',routeFilter:'All',selectedCombo:'All'};
  const $ = id => document.getElementById(id);
  const fetchJSON = async url => {
    if (!cache.has(url)) cache.set(url, fetch(url,{cache:'no-store'}).then(r => {if (!r.ok) throw new Error(`${r.status}: ${url}`); return r.json();}));
    return cache.get(url);
  };
  function buildTypeKey(figure,records){
    const key=document.createElement('div');key.className='type-key';key.setAttribute('aria-label','All sight types and record counts');
    for(const r of records.filter(r=>r.official)){const b=document.createElement('button');b.type='button';b.textContent=`${r.label} · ${r.value}`;b.dataset.theme=r.theme;b.addEventListener('click',()=>selectType(r.id,r.theme));key.append(b);}figure.querySelector('.chart').after(key);
  }
  function alignPanelHeadings(){
    const rows=new Map();
    for(const figure of document.querySelectorAll('[data-chart]')){
      const heading=figure.querySelector('.figure-heading');heading.style.minHeight='0px';
    }
    for(const figure of document.querySelectorAll('[data-chart]')){
      const heading=figure.querySelector('.figure-heading'),top=Math.round(figure.getBoundingClientRect().top+scrollY);
      if(!rows.has(top))rows.set(top,[]);rows.get(top).push(heading);
    }
    for(const headings of rows.values()){if(headings.length<2)continue;const height=Math.max(...headings.map(h=>h.getBoundingClientRect().height));for(const h of headings)h.style.minHeight=height+'px';}
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
  const nationalFits=new Map();
  async function setMapView(spec,name,available) {
    const id=name.slice(0,2),zoom=mapZoom[id];
    if(id==='08')return setNationalView(spec,available);
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
  async function setNationalView(spec,available){
    const id='08',zoom=mapZoom[id],width=available-10,height=spec.height;
    const projection=vega.projection('albers')().rotate([-132,0,0]).center([0,-27]).parallels([-18,-36]);
    const [states,labels]=await Promise.all([fetchJSON('data/dv2/states-display.geojson'),fetchJSON('data/dv2/state-map-labels.json')]);
    const key=width+':'+height;
    if(!nationalFits.has(key)){projection.fitExtent([[8,8],[width-8,height-8]],states);nationalFits.set(key,{scale:projection.scale(),translate:projection.translate()});}
    const fitted=nationalFits.get(key),scale=fitted.scale*zoom,baseTranslate=fitted.translate;
    // Inline one cached geometry/label set: zoom must never reload the boundaries.
    const current=tourismPeriod==='current'?await fetchJSON('data/dv2/state-nights-current.json'):null;
    spec.layer[0].data={values:current?states.features.map(f=>({...f,properties:{...f.properties,...current.find(r=>r.state_abbr===f.properties.state_abbr)}})):states.features};
    for(const layer of spec.layer){if(layer.data?.url?.endsWith('state-map-labels.json'))layer.data={values:labels};}
    const translate=[width/2+(baseTranslate[0]-width/2)*zoom-mapPan[id].longitude*Math.PI/180*scale,height/2+(baseTranslate[1]-height/2)*zoom+mapPan[id].mercator*scale];
    spec.width=width;spec.autosize={type:'none',contains:'content'};spec.padding={left:5,right:5,top:5,bottom:80};
    spec.projection={type:'albers',rotate:[-132,0,0],center:[0,-27],parallels:[-18,-36],scale,translate};
    mapProjection[id]={scale};
    for(const layer of spec.layer)layer.mark={...layer.mark,clip:true};
    projection.scale(scale).translate(translate);
    const a=projection([132,-27]),b=projection([132+1/(111.195*Math.cos(27*Math.PI/180)),-27]);
    const pixelsPerKm=Math.hypot(a[0]-b[0],a[1]-b[1]);
    const km=[1000,500,200,100,50,20,10].find(k=>k*pixelsPerKm<=95)||5;
    $('scale-bar-'+id).style.width=km*pixelsPerKm+'px';
    $('scale-label-'+id).textContent=`≈ ${km} km near central Australia`;
    $('zoom-value-'+id).textContent=zoom+'×';
  }
  function makeNationalSignals(spec){
    const {scale,translate}=spec.projection;
    spec.params=[{name:'nationalScale',value:scale},{name:'nationalTranslate',value:translate}];
    spec.projection.scale={expr:'nationalScale'};spec.projection.translate={expr:'nationalTranslate'};
  }
  async function updateNationalProjection(view,projection){
    await view.signal('nationalScale',projection.scale).signal('nationalTranslate',projection.translate).runAsync();
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
    element.addEventListener('pointerdown',e=>{if(!e.isPrimary || (e.pointerType==='mouse' && e.button!==0))return;drag={x:e.clientX,y:e.clientY,moved:false};});
    element.addEventListener('dragstart',e=>e.preventDefault());
    element.addEventListener('pointermove',e=>{
      if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(!drag.moved && Math.hypot(dx,dy)>5){
        drag.moved=true;element.setPointerCapture(e.pointerId);
        drag.marks=[...element.querySelectorAll('svg g.role-mark')].map(mark=>({mark,transform:mark.getAttribute('transform')}));
      }
      if(drag.moved){
        e.preventDefault();element.dataset.dragging='true';
        for(const {mark,transform} of drag.marks)mark.setAttribute('transform',`translate(${dx},${dy}) ${transform||''}`);
      }
    });
    const finish=(e,cancel=false)=>{
      if(!drag)return;const ended=drag;drag=null;delete element.dataset.dragging;
      for(const {mark,transform} of ended.marks||[]){if(transform===null)mark.removeAttribute('transform');else mark.setAttribute('transform',transform);}
      if(element.hasPointerCapture(e.pointerId))element.releasePointerCapture(e.pointerId);
      if(ended.moved&&!cancel){lastPanAt=Date.now();applyMapPan(id,e.clientX-ended.x,e.clientY-ended.y);render(figure);}
    };
    element.addEventListener('pointerup',e=>finish(e));element.addEventListener('pointercancel',e=>finish(e,true));
    element.addEventListener('keydown',e=>{const offset={ArrowLeft:[60,0],ArrowRight:[-60,0],ArrowUp:[0,60],ArrowDown:[0,-60]}[e.key];if(offset){e.preventDefault();lastPanAt=Date.now();applyMapPan(id,...offset);render(figure);}});
  }
  async function render(figure) {
    const name=figure.dataset.chart;
    const version=(renderVersions.get(name)||0)+1;renderVersions.set(name,version);
    const task=(renderQueues.get(name)||Promise.resolve()).catch(()=>{}).then(()=>{
      if(name.startsWith('08') && version!==renderVersions.get(name))return;
      return renderFigure(figure);
    });
    renderQueues.set(name,task);return task;
  }
  async function renderFigure(figure) {
    const name=figure.dataset.chart, element=figure.querySelector('.chart');
    const previousView=views.get(name);
    const original=specs.get(name.startsWith('11')&&scatterPeriod==='current'?'11-state-scatter-current':name.startsWith('10')&&melbournePeriod==='current'?'10-melbourne-current':name),spec=structuredClone(original);
    if(name.startsWith('13'))spec.params[0].value=historyArea;
    if(name.startsWith('09')&&tourismPeriod==='current')spec.data={url:'data/dv2/city-purposes-current.json'};
    const available=Math.max(190,Math.floor(element.parentElement.classList.contains('chart-scroll') ? 760 : element.clientWidth));
    const isVega=spec.$schema.includes('/vega/v');
    if(name.startsWith('12')){
      const panels=spec.hconcat,columns=available>=950?4:available>=600?2:1;
      for(const panel of panels)panel.width=Math.max(125,Math.floor(available/columns)-88);
      spec.params[0].value=currentGeography;
      delete spec.width;delete spec.height;
      if(columns===1){delete spec.hconcat;spec.vconcat=panels;}
      if(columns===2){delete spec.hconcat;spec.vconcat=[{hconcat:panels.slice(0,2),spacing:24},{hconcat:panels.slice(2),spacing:24}];}
    }
    if(isVega){spec.width=name.startsWith('07')?Math.max(760,available-10):Math.max(120,available-8);if(name.startsWith('02'))spec.height=Math.max(300,Math.min(400,available*1.04));}
    else {if(!name.startsWith('12'))spec.width=available;if(name.startsWith('01')||name.startsWith('04')){spec.height=Math.min(520,Math.max(285,available*.9));spec.params.find(p=>p.name==='mapDetail').value=available<430?1:name.startsWith('01')?2:3;}if(name.startsWith('11')){const inner=Math.max(145,available-70);spec.width=inner;spec.height=inner;spec.autosize={type:'none',contains:'content'};spec.padding={left:52,right:10,top:10,bottom:55};}if(name.startsWith('08'))spec.height=Math.min(440,Math.max(250,available*.9));}
    if(name.startsWith('05') && available<430){spec.encoding.x.title='Distance (m)';spec.encoding.x.axis.values=[0,400,800];spec.encoding.y.axis.labelFontSize=11;spec.encoding.y.axis.labelLimit=112;spec.layer.find(l=>l.mark.type==='text').transform[1].calculate="format(datum.median_metres, '.0f') + ' m'";}
    if(name.startsWith('06') && available<430){for(const layer of spec.layer){if(layer.encoding?.x?.scale)layer.encoding.x.scale.domain=[0,6];if(layer.encoding?.x?.axis)layer.encoding.x.axis.tickCount=4;}}
    if(name.startsWith('09') && available<430){spec.encoding.x.axis.labelFontSize=11;spec.encoding.x.axis.labelExpr="datum.label === 'Friends / relatives' ? ['Friends /','relatives'] : [datum.label]";spec.encoding.x.axis.labelLimit=85;if(available<300){spec.encoding.x.axis.labelLimit=160;spec.encoding.x.axis.labelExpr='datum.label';spec.encoding.x.axis.labelAngle=-45;spec.encoding.x.axis.labelAlign='left';spec.encoding.x.axis.labelBaseline='middle';spec.encoding.x.axis.labelPadding=18;}}
    if(name.startsWith('08') && available<430){for(const layer of spec.layer){if(layer.encoding?.text?.field==='map_label')layer.encoding.text.field='state_abbr';}spec.layer[0].encoding.color.legend.gradientLength=Math.min(240,available-30);}
    if(['01','04','08'].includes(name.slice(0,2)))await setMapView(spec,name,available);
    if(name.startsWith('08')){
      if(previousView && element.dataset.renderWidth===String(available) && element.dataset.renderPeriod===tourismPeriod){
        await updateNationalProjection(previousView,spec.projection);
        figure.dataset.ready='true';return;
      }
      makeNationalSignals(spec);
    }
    if(previousView)previousView.finalize();
    try{
      const result=await vegaEmbed(element,spec,{actions:false,renderer:'svg',tooltip:{theme:'light'},defaultStyle:false});
      const view=result.view;views.set(name,view);
      figure.dataset.ready='true';
      for(const key of Object.keys(state)){try{view.signal(key,state[key]);}catch{}}
      await view.runAsync();
      element.dataset.renderWidth=String(available);if(name.startsWith('08'))element.dataset.renderPeriod=tourismPeriod;
      view.addEventListener('click',(_,item)=>{
        if(Date.now()-lastPanAt<250 || !item?.datum)return;const d=item.datum;
        if(name.startsWith('01') && d.sub_theme)selectType(d.sub_theme,d.theme);
        if(name.startsWith('02') && d.official)selectType(d.id,d.theme);
        if(name.startsWith('04') && d.properties?.route_name)selectRoute(d.properties.route_name);
        if(name.startsWith('06') && d.route_name)selectRoute(d.route_name);
        if(name.startsWith('07') && d.key){state.selectedCombo=state.selectedCombo===d.key?'All':d.key;$('combo-filter').value=state.selectedCombo;updateSignals();}
      });
      const svg=element.querySelector('svg');if(svg){svg.setAttribute('role','img');svg.setAttribute('aria-label',element.getAttribute('aria-label'));}
    }catch(error){figure.dataset.ready='error';element.replaceChildren();const p=document.createElement('p');p.className='chart-error';p.textContent='This chart could not load. Source data and readable chart specifications remain in the repository.';element.append(p);console.error(name,error);}
  }
  async function init(){
    const figures=[...document.querySelectorAll('[data-chart]')];
    // Begin boundary/data reads while fonts load, rather than serialising both waits.
    const startup=Promise.all(['sights.json','routes.json','forest-combinations.json','states-display.geojson','state-map-labels.json'].map(n=>fetchJSON('data/dv2/'+n)));
    await document.fonts.ready;
    const [sights,routes,combos]=await startup;
    populateTypes(sights);
    for(const id of ['01','04','08']){
      const figure=document.querySelector(`[data-chart^="${id}"]`);let zoomTimer;bindMapPan(figure,id);
      $('zoom-'+id).addEventListener('input',e=>{mapZoom[id]=Number(e.target.value);$('zoom-value-'+id).textContent=mapZoom[id]+'×';clearTimeout(zoomTimer);if(id==='08')render(figure);else zoomTimer=setTimeout(()=>render(figure),100);});
      $('zoom-reset-'+id).addEventListener('click',()=>{clearTimeout(zoomTimer);mapZoom[id]=1;mapPan[id]={longitude:0,mercator:0};$('zoom-'+id).value='1';render(figure);});
    }
    for(const r of [...routes].sort((a,b)=>a.geometry_length_km-b.geometry_length_km))addOption($('route-filter'),r.route_name,`${r.route_name} (${r.mode.toLowerCase()})`);
    for(const c of combos)addOption($('combo-filter'),c.key,`${c.combination} · ${c.sites} ${c.sites===1?"site":"sites"}`);
    $('theme-filter').addEventListener('change',e=>{state.themeFilter=e.target.value;state.subFilter='All';populateTypes(sights);updateSignals();});
    $('type-filter').addEventListener('change',e=>{state.subFilter=e.target.value;updateSignals();});
    $('reset-city').addEventListener('click',()=>{state.themeFilter='All';state.subFilter='All';$('theme-filter').value='All';populateTypes(sights);updateSignals();});
    $('route-filter').addEventListener('change',e=>{state.routeFilter=e.target.value;updateSignals();});
    $('reset-route').addEventListener('click',()=>{state.routeFilter='All';$('route-filter').value='All';updateSignals();});
    $('current-geography').addEventListener('change',async e=>{currentGeography=e.target.value;$('current-readout').textContent=currentGeography+' · June quarter 2026 versus June quarter 2025';const view=views.get('12-current-quarter');if(view)await view.signal('currentGeography',currentGeography).runAsync();});
    $('tourism-period').addEventListener('change',async e=>{tourismPeriod=e.target.value;const current=tourismPeriod==='current';const map=document.querySelector('[data-chart="08-holiday-map"]'),heat=document.querySelector('[data-chart="09-city-heatmap"]');map.querySelector('.figure-heading p').textContent=current?'Holiday nights ÷ all domestic overnight nights · year ending June 2026':'Holiday nights ÷ all domestic overnight nights · calendar 2024 NVS';heat.querySelector('.figure-heading p').textContent=current?'Share of tourism-region nights (%) · year ending June 2026':'Share of tourism-region nights (%) · calendar 2024 NVS';map.querySelector('figcaption').innerHTML=current?'<strong>Latest DoTS: July 2025–June 2026.</strong> Each state uses its own published total-night denominator. The ACT is marked for visibility. <a href="docs/dv2/current_states_holiday_nights_YEJune2026.json">TEQ / TRA source observations</a> · ABS 2021 boundaries.':'<strong>Historical calendar 2024 NVS.</strong> Victoria 50.0%, Tasmania 58.0%, ACT 28.4%. This is a different period and collection from the current view; the toggle does not measure growth.';heat.querySelector('figcaption').innerHTML=current?'Melbourne: holiday 39.0%, friends or relatives 42.3%. Four TRA tourism regions, each with its own published total denominator. All shown values pass the source publication threshold. Other is a published category; independent rounding can leave a one-night discrepancy. <a href="docs/dv2/current_cities_purpose_nights_YEJune2026.json">TEQ / TRA source observations</a>':'Historical calendar 2024 NVS. Melbourne: holiday 37.7%, friends or relatives 35.3%. Other includes Other and Not Asked. Do not infer regional growth across the NVS / DoTS methodology break.';await Promise.all([render(map),render(heat)]);});
    $('melbourne-period').addEventListener('change',async e=>{melbournePeriod=e.target.value;const f=document.querySelector('[data-chart="10-melbourne-trend"]'),c=melbournePeriod==='current';f.querySelector('.figure-heading p').textContent=c?'Quarterly DoTS · January 2025–June 2026':'Annual NVS · calendar 2019–2024';f.querySelector('figcaption').innerHTML=c?'June quarter 2026: 3.217m overnight trips, down 1.7% on the same quarter in 2025. Latest year ending June 2026: 13.447m trips. Trips are not unique people. No comparable regional backcast is available; the old annual NVS series stays separate. <a href="docs/dv2/melbourne_current_source.json">DJSIR / TRA source observations</a>':'Six historical annual NVS observations, 2019–2024; 10.4m overnight trips in 2024. Annual totals cannot be compared directly to quarterly totals. No line joins these observations to the new DoTS collection.';await render(f);});
    $('history-area').addEventListener('change',async e=>{historyArea=e.target.value;const view=views.get('13-state-history');if(view)await view.signal('historyArea',historyArea).runAsync();});
    $('scatter-period').addEventListener('change',async e=>{scatterPeriod=e.target.value;const f=document.querySelector('[data-chart="11-state-scatter"]');f.querySelector('h3').textContent=scatterPeriod==='current'?'State trips: June quarters 2019 and 2026':'State trips: calendar years 2019 and 2024';f.querySelector('.figure-heading p').textContent=scatterPeriod==='current'?'Same quarter · revised 2019 backcast and 2026 DoTS':'Full calendar years · historical NVS';f.querySelector('figcaption').innerHTML=scatterPeriod==='current'?'Above the dashed line means more trips in June quarter 2026 than in the revised June quarter 2019 backcast. Victoria: 7.251m to 7.301m (+0.7%). Small differences are not proof of statistical significance. <a href="docs/dv2/dots_history_sources.json">TRA workbook sources and cells</a>':'Historical NVS calendar-year totals, 2019 versus 2024. Queensland is the only state above the equality line. These annual totals cannot be compared directly to the current quarterly view.';await render(f);});
    $('combo-filter').addEventListener('change',e=>{state.selectedCombo=e.target.value;updateSignals();});
    specs.set('11-state-scatter-current',await fetchJSON('specs/11-state-scatter-current.json'));
    specs.set('10-melbourne-current',await fetchJSON('specs/10-melbourne-current.json'));
    await Promise.all(figures.map(async figure=>{
      const name=figure.dataset.chart;
      const [spec,records]=await Promise.all([fetchJSON(`specs/${name}.json`),fetchJSON(`data/dv2/${figure.dataset.table}.json`)]);
      specs.set(name,spec);if(name.startsWith('02'))buildTypeKey(figure,records);await render(figure);
    }));
    const refreshStatus=()=>{
    const errors=figures.filter(f=>f.dataset.ready!=='true');
    document.body.dataset.chartsReady=String(figures.length-errors.length);
    $('load-status').textContent=errors.length?`${errors.length} charts could not load. Try refreshing the page.`:`All ${figures.length} charts have loaded. Use the labelled filters, source links and map controls.`;
    };
    alignPanelHeadings();refreshStatus();
    let timer;let lastWidth=window.innerWidth;
    window.addEventListener('resize',()=>{if(window.innerWidth===lastWidth)return;lastWidth=window.innerWidth;clearTimeout(timer);timer=setTimeout(async()=>{document.body.dataset.chartsReady='0';$('load-status').textContent='Resizing charts…';await Promise.all(figures.map(render));alignPanelHeadings();refreshStatus();},180);});
  }
  init().catch(error=>{console.error('Page setup failed',error);$('load-status').className='notice wrap';$('load-status').textContent='The charts could not be prepared. Try refreshing the page, or open the source files from the links below.';});
})();
