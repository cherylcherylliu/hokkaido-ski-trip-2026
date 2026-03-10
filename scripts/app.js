const STORAGE='trip-local-expenses-v2';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const state={page:'itinerary',dayIndex:0,view:'timeline',local:JSON.parse(localStorage.getItem(STORAGE)||'[]')};
let cfg,trip,foods,souvenirs,expenses,docs,ski;
const yen=n=>`¥ ${Number(n||0).toLocaleString('zh-TW')}`;
const twd=n=>`NT$ ${Number(n||0).toLocaleString('zh-TW')}`;
async function j(u){return fetch(u).then(r=>r.json())}
async function init(){
  [cfg,trip,foods,souvenirs,expenses,docs,ski]=await Promise.all([
    j('config/site-config.json'),j('data/trip.json'),j('data/food.json'),j('data/souvenirs.json'),j('data/expenses.json'),j('data/documents.json'),j('data/ski-helper.json')
  ]);
  $('#siteName').textContent=cfg.siteName;
  $('#siteSubtitle').textContent=cfg.subtitle;
  $('#splitPreviewText').textContent='JPY / TWD';
  $('#skiPreviewText').textContent=`${ski.current.weather} · ${ski.current.tempC}°C`;
  renderWeatherPreview();
  renderTabs();renderItinerary();renderFoods();renderSouvenirs();renderExpenses();
  $('#expDay').innerHTML=trip.map(d=>`<option value="${d.dayLabel}">${d.dayLabel} · ${d.dateLabel}</option>`).join('');
  bind();
}
function renderWeatherPreview(){
  const mapping={Sunny:'☀️',Cloudy:'☁️',Snow:'❄️',Rain:'🌧️'};
  const icon=mapping[ski.current.weather]||'🌤️';
  $('#weatherPreviewIcon').textContent=icon;
  $('#weatherPreviewText').textContent='札幌 · 3°C';
}
function bind(){
  $$('.tab').forEach(b=>b.onclick=()=>{
    state.page=b.dataset.pageTarget;
    $$('.tab').forEach(x=>x.classList.toggle('active',x===b));
    $$('.page').forEach(p=>p.classList.toggle('active',p.dataset.page===state.page));
    window.scrollTo({top:0,behavior:'smooth'});
  });
  $$('.seg-btn').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;$$('.seg-btn').forEach(x=>x.classList.toggle('active',x===b));renderItinerary()});
  $('#splitBtn').onclick=()=>document.querySelector('[data-page-target="expense"]').click();
  $('#weatherBtn').onclick=()=>openSheet('札幌天氣',`<div class="kpi-row two"><div class="kpi"><label>預設位置</label><b>札幌王子飯店附近</b></div><div class="kpi"><label>快速查看</label><b>札幌市區 3°C</b></div></div><div class="grid"><a class="card info-card" href="https://www.data.jma.go.jp/multi/index.html?lang=cn_zt" target="_blank"><h3>JMA 日本氣象廳</h3><p class="muted">查札幌城市天氣與官方預報</p></a><a class="card info-card" href="https://weathernews.jp/s/ski/" target="_blank"><h3>Weathernews Ski</h3><p class="muted">查滑雪場角度天氣與雪況</p></a><a class="card info-card" href="https://sapporo-teine.com/snow/" target="_blank"><h3>手稻官方 Snow 頁</h3><p class="muted">查手稻當日雪況與纜車資訊</p></a></div>`);
  $('#skiBtn').onclick=()=>openSheet('手稻滑雪小助手',`<p class="muted">Build snapshot：${ski.buildSnapshot}</p><div class="kpi-row three"><div class="kpi"><label>今日新雪</label><b>${ski.current.newSnow24hCm} cm</b></div><div class="kpi"><label>山頂積雪</label><b>${ski.current.peakDepthCm} cm</b></div><div class="kpi"><label>山腳積雪</label><b>${ski.current.baseDepthCm} cm</b></div></div><div class="grid"><article class="card info-card"><h3>❄️ 雪況</h3><p>${ski.current.status}｜${ski.current.weather}｜${ski.current.tempC}°C</p><p class="muted">雪質：${ski.current.snowQuality}</p></article><article class="card info-card"><h3>🗺 區域</h3>${ski.zones.map(z=>`<p><b>${z.name}</b><br>${z.summary}</p>`).join('')}</article><article class="card info-card"><h3>🍜 餐廳</h3>${ski.restaurants.map(r=>`<p><b>${r.name}</b>｜${r.zone}<br><span class="muted">${r.what}</span></p>`).join('')}</article><article class="card info-card"><h3>🚌 交通</h3>${ski.access.map(a=>`<p><b>${a.type}</b><br>${a.detail}</p>`).join('')}</article></div><div class="actions" style="margin-top:14px">${ski.links.map(l=>`<a class="btn secondary" href="${l.url}" target="_blank">${l.label}</a>`).join('')}</div>`);
  $('#closeSheet').onclick=()=>$('#sheetDialog').close();
  $('#addExpenseBtn').onclick=()=>{
    const title=$('#expTitle').value.trim(),day=$('#expDay').value,currency=$('#expCurrency').value,amount=Number($('#expAmount').value);
    if(!title||!amount){alert('請先填項目與金額');return}
    state.local.unshift({title,day,currency,amount,paidBy:'Cheryl',note:'本機新增'});
    localStorage.setItem(STORAGE,JSON.stringify(state.local));
    $('#expTitle').value='';$('#expAmount').value='';renderExpenses();
  };
  $('#clearLocalBtn').onclick=()=>{state.local=[];localStorage.setItem(STORAGE,'[]');renderExpenses()};
  if('serviceWorker' in navigator){navigator.serviceWorker.register('./service-worker.js').catch(()=>{})}
}
function openSheet(t,html){$('#sheetTitle').textContent=t;$('#sheetBody').innerHTML=html;$('#sheetDialog').showModal()}
function renderTabs(){const wrap=$('#dayTabs');wrap.innerHTML='';trip.forEach((d,i)=>{const b=document.createElement('button');b.className='day-tab'+(i===state.dayIndex?' active':'');b.innerHTML=`<strong>${d.dayLabel}</strong><div>${d.dateLabel}</div>`;b.onclick=()=>{state.dayIndex=i;renderTabs();renderItinerary()};wrap.appendChild(b)})}
function renderItinerary(){const day=trip[state.dayIndex];$('#itineraryTimeline').classList.toggle('hidden',state.view!=='timeline');$('#itineraryMap').classList.toggle('hidden',state.view!=='map');$('#itineraryTimeline').innerHTML=`<div class="timeline">${day.events.map(ev=>`<article class="timeline-item"><div class="timeline-time">${ev.time||'彈性'}</div><div class="card event-card"><div class="event-top"><div class="event-main"><div class="event-icon">${ev.icon}</div><div>${ev.section?`<div class="event-kicker">${ev.section}</div>`:''}<div class="event-title">${ev.title.replaceAll('
','<br>')}</div></div></div>${ev.costJPY?`<div class="price">${yen(ev.costJPY)}</div>`:''}</div>${ev.note?`<div class="event-note">${ev.note}</div>`:''}<div class="tag-row">${ev.fileInfo?`<span class="tag">文件：${ev.fileInfo}</span>`:''}${ev.linkLabel?`<span class="tag">連結：${ev.linkLabel}</span>`:''}</div><div class="actions"><a class="btn secondary" href="${ev.searchUrl}" target="_blank">📍 地圖</a>${ev.routeUrl?`<a class="btn primary" href="${ev.routeUrl}" target="_blank">🚆 最快 / 最便宜</a>`:''}</div></div></article>`).join('')}</div>`;$('#itineraryMap').innerHTML=`<div class="grid">${day.events.map((ev,idx)=>`<article class="card info-card"><div class="event-kicker">Stop ${idx+1} · ${ev.time||'彈性'}</div><h3>${ev.icon} ${ev.title.replaceAll('
',' / ')}</h3>${ev.note?`<p class="muted">${ev.note}</p>`:''}<div class="actions"><a class="btn secondary" href="${ev.searchUrl}" target="_blank">📍 開地圖</a>${ev.routeUrl?`<a class="btn primary" href="${ev.routeUrl}" target="_blank">🚆 交通</a>`:''}</div></article>`).join('')}</div>`}
function renderFoods(){$('#foodGrid').innerHTML=foods.map(f=>`<article class="card info-card"><div class="event-kicker">${f.day}</div><h3>🍽️ ${f.name}</h3><p class="muted">${f.tag}</p>${f.note?`<p>${f.note}</p>`:''}<div class="actions"><a class="btn secondary" href="${f.mapUrl}" target="_blank">Google Maps</a></div></article>`).join('')}
function renderSouvenirs(){$('#souvenirGrid').innerHTML=souvenirs.map(s=>`<article class="card info-card souvenir-card"><div class="tag-row">${s.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div><h3>${s.name}</h3><p class="muted">${s.jpName}</p><p>${s.usage}</p><p class="muted">${s.price}｜${s.buyAt}</p><div class="actions"><button class="btn secondary" onclick='openSouvenir("${s.id}")'>查看詳細</button></div></article>`).join('');window.openSouvenir=id=>{const s=souvenirs.find(x=>x.id===id);openSheet(s.name,`<p class="muted">${s.jpName}</p><p style="margin-top:8px">${s.usage}</p><div class="grid" style="margin-top:14px">${s.ingredients.map(i=>`<div class="card info-card"><h3>${i.en}</h3><p>${i.jp}</p><p class="muted">${i.zh}｜${i.role}</p></div>`).join('')}</div><p class="muted" style="margin-top:14px">${s.note}</p>`)} }
function renderExpenses(){const all=[...expenses,...state.local],jpy=all.filter(x=>x.currency==='JPY').reduce((a,b)=>a+Number(b.amount||0),0),tw=all.filter(x=>x.currency==='TWD').reduce((a,b)=>a+Number(b.amount||0),0);$('#summaryGrid').innerHTML=`<article class="card summary-card"><strong>JPY 總花費</strong><div>${yen(jpy)}</div></article><article class="card summary-card"><strong>TWD 總花費</strong><div>${twd(tw)}</div></article><article class="card summary-card"><strong>每人 JPY share</strong><div>${yen(Math.round(jpy/(cfg.travelers?.length||4)))} </div></article>`;const g={};all.forEach(e=>{(g[e.day||'未分類']??=[]).push(e)});$('#expenseList').innerHTML=Object.entries(g).map(([day,items])=>`<section class="card expense-group"><div class="event-top"><div><div class="event-kicker">${day}</div><div class="event-title">交易明細</div></div><div class="price">${yen(items.filter(x=>x.currency==='JPY').reduce((a,b)=>a+Number(b.amount||0),0))}</div></div><div class="grid" style="margin-top:14px">${items.map(i=>`<article class="card info-card"><h3>${i.title}</h3><p class="muted">${i.currency}｜Paid by ${i.paidBy||'Cheryl'}</p><p>${i.note||''}</p><div class="price" style="display:inline-flex;margin-top:12px">${i.currency==='TWD'?twd(i.amount):yen(i.amount)}</div></article>`).join('')}</div></section>`).join('')}
init();