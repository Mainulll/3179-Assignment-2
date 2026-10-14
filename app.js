/* All resources are local. Major story chapters remain visible at all times. */
(() => {
  'use strict';
  const views = new Map();
  const specs = new Map();
  const cache = new Map();
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
  async function render(figure) {
    const name=figure.dataset.chart, element=figure.querySelector('.chart');
    if(views.has(name))views.get(name).finalize();
    const original=specs.get(name),spec=structuredClone(original);
    const available=Math.max(190,Math.floor(element.parentElement.classList.contains('chart-scroll') ? 760 : element.clientWidth));
    const isVega=spec.$schema.includes('/vega/v');
    if(isVega){spec.width=name.startsWith('07')?Math.max(760,available-10):available-4;}
    else {spec.width=available;if(name.startsWith('11')){const inner=Math.max(145,available-70);spec.width=inner;spec.height=inner;spec.autosize={type:'none',contains:'content'};spec.padding={left:52,right:10,top:10,bottom:55};}if(name.startsWith('08'))spec.height=Math.min(500,available*1.12);}
    try{
      const result=await vegaEmbed(element,spec,{actions:false,renderer:'svg',tooltip:{theme:'light'},defaultStyle:false});
      const view=result.view;views.set(name,view);
      figure.dataset.ready='true';
      for(const key of Object.keys(state)){try{view.signal(key,state[key]);}catch{}}
      await view.runAsync();
      view.addEventListener('click',(_,item)=>{
        if(!item?.datum)return;const d=item.datum;
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
