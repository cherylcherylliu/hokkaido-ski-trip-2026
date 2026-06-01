const dateTabs = document.getElementById("dateTabs");
const heroCard = document.getElementById("heroCard");
const reminderCard = document.getElementById("reminderCard");
const timelineCard = document.getElementById("timelineCard");
const modal = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const modalSubtitle = document.getElementById("modalSubtitle");
const modalItems = document.getElementById("modalItems");
const dayWarningCard = document.getElementById("dayWarningCard");
const mainSwipeArea = document.getElementById("mainSwipeArea");
const scrollTopBtn = document.getElementById("scrollTopBtn");

let selected = 10;
let weatherCache = null;
const splitPeople = ["Cheryl", "旁旁", "皮皮", "濁濁"];

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>\"]/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[s]));
}

function getTimelineIcon(title, note) {
  const text = `${title} ${note}`.toLowerCase();
  if (text.includes("住宿") || text.includes("check-in") || text.includes("入住") || text.includes("hotel") || text.includes("ibis")) return "home";
  if (text.includes("yoga")) return "self_improvement";
  if (text.includes("晚餐") || text.includes("午餐") || text.includes("早餐") || text.includes("cafe") || text.includes("coffee") || text.includes("pho") || text.includes("tacos") || text.includes("lunch") || text.includes("dinner") || text.includes("熱湯")) return "restaurant";
  if (text.includes("flight") || text.includes("jq") || text.includes("ci") || text.includes("航班")) return "flight_takeoff";
  if (text.includes("bus") || text.includes("linksa") || text.includes("skybus") || text.includes("j1") || text.includes("j2")) return "directions_bus";
  if (text.includes("tram") || text.includes("metro") || text.includes("機捷")) return "tram";
  if (text.includes("car") || text.includes("取車") || text.includes("還車") || text.includes("drive")) return "directions_car";
  if (text.includes("market") || text.includes("shopping") || text.includes("coles") || text.includes("chemist") || text.includes("藥局") || text.includes("補給") || text.includes("買")) return "shopping_bag";
  if (text.includes("koala") || text.includes("wombat") || text.includes("wildlife") || text.includes("企鵝")) return "pets";
  if (text.includes("ferry")) return "directions_boat";
  if (text.includes("高鐵") || text.includes("train")) return "train";
  return "place";
}

function scrollToPageTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  setTimeout(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, 100);
}

function renderTabs() {
  dateTabs.innerHTML = tripDays.map((d, i) => `<button class="date-tab ${i === selected ? "is-active" : ""}" data-index="${i}">${d.label}</button>`).join("");
  document.querySelectorAll(".date-tab").forEach(btn => btn.addEventListener("click", () => {
    selected = Number(btn.dataset.index);
    render();
    scrollToPageTop();
  }));
  const active = document.querySelector(".date-tab.is-active");
  if (active) active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
}

function renderTimelineNav(dayLabel, title) {
  const nav = timelineNavigation?.[`${dayLabel}|${title}`];
  if (!nav) return "";
  const action = nav.url
    ? `<a class="nav-mini-btn" href="${nav.url}" target="_blank" rel="noopener"><span class="material-symbols-rounded">map</span>Open Map</a>`
    : `<span class="nav-mini-btn"><span class="material-symbols-rounded">info</span>Use signs</span>`;
  return `
    <div class="timeline-nav">
      <div class="timeline-nav-head">
        <span class="material-symbols-rounded">${nav.icon || "route"}</span>
        <span>${escapeHtml(nav.mode)}｜${escapeHtml(nav.label)}</span>
      </div>
      <div class="timeline-nav-note">${escapeHtml(nav.note || "")}</div>
      <div class="timeline-nav-actions">${action}</div>
    </div>
  `;
}

function renderOptionCard(dayLabel, title) {
  const card = optionCards?.[`${dayLabel}|${title}`];
  if (!card) return "";
  return `
    <div class="option-card">
      <div class="option-card-head"><span class="material-symbols-rounded">rule</span><strong>${escapeHtml(card.title)}</strong></div>
      ${card.intro ? `<div class="option-card-intro">${escapeHtml(card.intro)}</div>` : ""}
      <div class="option-grid">
        ${card.options.map(opt => `
          <div class="option-item">
            <span class="option-level">${escapeHtml(opt.level || "Option")}</span>
            <div class="option-title">${escapeHtml(opt.title)}</div>
            <div class="option-note">${escapeHtml(opt.note || "")}</div>
            ${opt.url ? `<div class="timeline-nav-actions"><a class="nav-mini-btn" href="${opt.url}" target="_blank" rel="noopener"><span class="material-symbols-rounded">map</span>Open Map</a></div>` : ""}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderTodayMap(label) {
  const url = todayMapLinks?.[label];
  if (!url) return "";
  return `
    <div class="today-map-card">
      <div class="today-map-row">
        <a class="nav-mini-btn" href="${url}" target="_blank" rel="noopener"><span class="material-symbols-rounded">map</span>Open Today Map</a>
        <a class="nav-mini-btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tripDays[selected].city)}" target="_blank" rel="noopener"><span class="material-symbols-rounded">my_location</span>Current Location</a>
      </div>
    </div>
  `;
}

function renderDay() {
  const d = tripDays[selected];
  heroCard.innerHTML = `
    <div class="badges">
      <span class="badge">${escapeHtml(d.label)}</span>
      <span class="badge">${escapeHtml(d.city)}</span>
      ${d.accent ? `<span class="badge">${escapeHtml(d.accent)}</span>` : ""}
    </div>
    <h2 class="hero-title">${escapeHtml(d.title)}</h2>
    <p class="theme">${escapeHtml(d.theme)}</p>
    ${d.accommodation ? `<div class="accommodation" data-accommodation="${escapeHtml(d.accommodation)}"><div class="accommodation-main"><span class="icon-pill"><span class="material-symbols-rounded">home</span></span><div class="accommodation-text"><div class="accommodation-title">${escapeHtml(d.accommodation)}</div><div class="accommodation-subtitle">點開查看住宿詳細資料</div></div></div><span class="material-symbols-rounded">chevron_right</span></div>` : ""}
    ${renderTodayMap(d.label)}
  `;

  reminderCard.innerHTML = `
    <h3 class="section-title"><span class="icon-pill"><span class="material-symbols-rounded">error</span></span>今日重點提醒</h3>
    <div class="reminder-list">
      ${d.reminders.map(r => `<div class="reminder"><span class="dot"></span><span>${escapeHtml(r)}</span></div>`).join("")}
    </div>
  `;

  timelineCard.innerHTML = `
    <h3 class="section-title"><span class="icon-pill"><span class="material-symbols-rounded">schedule</span></span>Timeline</h3>
    <div class="timeline">
      ${d.timeline.map(t => `<div class="timeline-item"><div class="time">${escapeHtml(t[0])}</div><div class="icon-pill"><span class="material-symbols-rounded">${getTimelineIcon(t[1], t[2])}</span></div><div><div class="timeline-title">${escapeHtml(t[1])}</div><div class="timeline-note">${escapeHtml(t[2])}</div>${renderTimelineNav(d.label, t[1])}${renderOptionCard(d.label, t[1])}</div></div>`).join("")}
    </div>
  `;
}

function renderDayWarning() {
  const d = tripDays[selected];
  const warning = daySpecificWarnings?.[d.label];
  if (!warning) { dayWarningCard.hidden = true; return; }
  dayWarningCard.hidden = false;
  dayWarningCard.innerHTML = `<h3 class="section-title"><span class="icon-pill"><span class="material-symbols-rounded">warning</span></span>${escapeHtml(warning.title)}</h3><p class="theme">${escapeHtml(warning.text)}</p>`;
}

function openAccommodationModal(key) {
  const info = accommodationDetails?.[key];
  if (!info) return;
  modalTitle.textContent = info.name;
  modalSubtitle.textContent = "住宿詳細資料";
  modalItems.innerHTML = `
    <div class="detail-grid">
      <div class="detail-row"><strong>地址</strong>${escapeHtml(info.address)}</div>
      <div class="detail-row"><strong>Check-in</strong>${escapeHtml(info.checkIn)}</div>
      <div class="detail-row"><strong>Check-out</strong>${escapeHtml(info.checkOut)}</div>
    </div>
    <h3 class="section-title"><span class="icon-pill"><span class="material-symbols-rounded">info</span></span>Reminders</h3>
    ${info.notes.map(note => `<div class="panel-item"><span class="material-symbols-rounded">check_circle</span><span>${escapeHtml(note)}</span></div>`).join("")}
    <a class="link-btn" href="${info.maps}" target="_blank" rel="noopener" style="margin-top:12px;"><span>Open Google Maps</span><span>Map ›</span></a>
  `;
  modal.classList.add("is-open");
}

function attachAccommodationCard() {
  const card = document.querySelector(".accommodation[data-accommodation]");
  if (card) card.addEventListener("click", () => openAccommodationModal(card.dataset.accommodation));
}

function renderTransportPanel() {
  return `
    <h3 class="section-title"><span class="icon-pill"><span class="material-symbols-rounded">tram</span></span>Official Timetables</h3>
    ${links.map(link => `<a class="link-btn" href="${link.url}" target="_blank" rel="noopener" style="margin-bottom:8px;"><span>${escapeHtml(link.label)}</span><span>${escapeHtml(link.city)} ›</span></a>`).join("")}
    <div class="warning-card" style="margin-top:14px;"><h4>低焦慮規則</h4><p>如果官方 timetable、Google Maps 和現場標示不一致，以現場標示與官方即時班次為準；若拖行李、下雨或焦慮，直接切換 Uber / taxi 備案。</p></div>
  `;
}

async function renderWeatherPanel() {
  modalItems.innerHTML = `<div class="panel-item"><span class="material-symbols-rounded">sync</span><span>正在讀取 5 日天氣預報...</span></div>`;
  try {
    if (!weatherCache) {
      weatherCache = await Promise.all(weatherCities.map(async city => {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=5`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("weather fetch failed");
        const data = await res.json();
        return { ...city, data };
      }));
    }
    modalItems.innerHTML = `
      <div class="weather-grid">
        ${weatherCache.map(city => `<div class="weather-card"><div class="weather-head"><div class="weather-city">${escapeHtml(city.name)}</div><a href="${city.official}" target="_blank" rel="noopener" class="link-btn" style="width:auto;padding:6px 10px;"><span>BoM</span><span>›</span></a></div><div class="weather-days">${city.data.daily.time.map((day, idx) => `<div class="weather-day"><strong>${day.slice(5)}</strong><span>${Math.round(city.data.daily.temperature_2m_min[idx])}–${Math.round(city.data.daily.temperature_2m_max[idx])}°C</span><span>雨 ${city.data.daily.precipitation_probability_max[idx] ?? "-"}%</span><span>風 ${Math.round(city.data.daily.wind_speed_10m_max[idx])}</span></div>`).join("")}</div></div>`).join("")}
      </div>
      <h3 class="section-title"><span class="icon-pill"><span class="material-symbols-rounded">verified</span></span>Official check</h3>
      ${officialWeatherLinks.map(link => `<a class="link-btn" href="${link.url}" target="_blank" rel="noopener" style="margin-bottom:8px;"><span>${escapeHtml(link.label)}</span><span>${escapeHtml(link.city)} ›</span></a>`).join("")}
      <div class="warning-card"><h4>Special reminders</h4><p>6/12 Adelaide 預報 32°C 以上時，Koala Holding 可能取消。Aurora Check 請同時看雲量、降雨、風、月光、體力與夜駕安全。</p></div>`;
  } catch (error) {
    modalItems.innerHTML = `<div class="warning-card"><h4>Weather API 讀取失敗</h4><p>可能是離線、網路阻擋或 API 暫時失效。請使用下方官方連結查詢。</p></div>${officialWeatherLinks.map(link => `<a class="link-btn" href="${link.url}" target="_blank" rel="noopener" style="margin-bottom:8px;"><span>${escapeHtml(link.label)}</span><span>${escapeHtml(link.city)} ›</span></a>`).join("")}`;
  }
}

function renderHelpPanel() {
  return `
    <h3 class="section-title"><span class="icon-pill"><span class="material-symbols-rounded">emergency</span></span>Emergency contacts</h3>
    ${officialHelpContacts.map(contact => `<div class="panel-item" style="align-items:flex-start;"><span class="material-symbols-rounded">${contact.icon}</span><span><strong>${escapeHtml(contact.title)}</strong><br>${contact.lines.map(line => `<span style="display:block;color:#81766b;font-size:13px;">${escapeHtml(line)}</span>`).join("")}</span></div>`).join("")}
    <h3 class="section-title" style="margin-top:16px;"><span class="icon-pill"><span class="material-symbols-rounded">record_voice_over</span></span>English phrase cards</h3>
    ${englishPhraseCards.map(card => `<div class="weather-card" style="margin-bottom:10px;"><div class="weather-head"><div class="weather-city"><span class="material-symbols-rounded" style="font-size:18px;vertical-align:-3px;">${card.icon}</span> ${escapeHtml(card.title)}</div></div>${card.phrases.map(phrase => `<div class="small-card" style="background:#fbf8f2;">${escapeHtml(phrase)}</div>`).join("")}</div>`).join("")}
    <h3 class="section-title" style="margin-top:16px;"><span class="icon-pill"><span class="material-symbols-rounded">verified</span></span>Official links</h3>
    ${helpOfficialLinks.map(link => `<a class="link-btn" href="${link.url}" target="_blank" rel="noopener" style="margin-bottom:8px;"><span>${escapeHtml(link.label)}</span><span>${escapeHtml(link.city)} ›</span></a>`).join("")}
  `;
}

function renderDrivingPanel() {
  return drivingSections.map(section => `
    <h3 class="section-title" style="margin-top:16px;"><span class="icon-pill"><span class="material-symbols-rounded">${section.icon}</span></span>${escapeHtml(section.title)}</h3>
    ${section.items.map(item => `<div class="panel-item"><span class="material-symbols-rounded">check_circle</span><span>${escapeHtml(item)}</span></div>`).join("")}
  `).join("");
}

function renderFlightPanel() {
  return `
    <div class="warning-card"><h4>⚠️ 6/2｜CI0057 → JQ707</h4><p>MEL T2 入境 → 領華航行李 → 食品申報 → T4 Jetstar 重新托運。不要假設行李會直掛 Hobart。</p></div>
    <div class="warning-card"><h4>⚠️ 6/14｜JQ775 → CI0058</h4><p>MEL T4 領 Jetstar 行李 → T2 華航重新托運 → 出境 → lounge / dinner。</p></div>
    <h3 class="section-title" style="margin-top:14px;"><span class="icon-pill"><span class="material-symbols-rounded">luggage</span></span>Baggage Hub</h3>
    <div class="small-card">華航 CI0057 / CI0058：手提 7 kg；托運 2 × 23 kg。Jetstar cabin bag：56 × 36 × 23 cm；手提總重 7 kg。單件托運不可超過 32 kg。</div>
    <h3 class="section-title" style="margin-top:14px;"><span class="icon-pill"><span class="material-symbols-rounded">flight_takeoff</span></span>All Flights</h3>
    ${flights.map(f => `<div class="panel-item" style="align-items:flex-start;"><span class="material-symbols-rounded">flight</span><span><strong>${escapeHtml(f.date)}｜${escapeHtml(f.no)}</strong><br><span style="color:#5b5148;">${escapeHtml(f.route)}</span><br><span style="color:#81766b;font-size:13px;">${escapeHtml(f.time)}</span><br><span style="color:#81766b;font-size:13px;">Carry-on：${escapeHtml(f.carry || "-")}｜Checked：${escapeHtml(f.checked || "-")}</span><br><span style="color:#81766b;font-size:13px;">${escapeHtml(f.note)}</span></span></div>`).join("")}
  `;
}

function normalizeSplitRecord(r) {
  const people = Array.isArray(r?.splitWith) ? r.splitWith : (typeof r?.splitWith === "string" ? r.splitWith.split(/[\/、,]+/).map(x => x.trim()).filter(Boolean) : []);
  return {
    id: r?.id || Date.now(),
    date: r?.date || new Date().toISOString().slice(0, 10),
    store: r?.store || "未命名",
    amount: Number(r?.amount || 0),
    mode: r?.mode === "Personal" ? "Personal" : "Shared",
    payer: splitPeople.includes(r?.payer) ? r.payer : "Cheryl",
    category: r?.category || "其他",
    note: r?.note || "",
    splitWith: people.length ? people.filter(p => splitPeople.includes(p)) : (r?.mode === "Personal" && splitPeople.includes(r?.payer) ? [r.payer] : splitPeople)
  };
}

function getSplitData() {
  try {
    const parsed = JSON.parse(localStorage.getItem("australia2026_split_records") || "[]");
    return Array.isArray(parsed) ? parsed.map(normalizeSplitRecord) : [];
  } catch { return []; }
}
function saveSplitData(records) { localStorage.setItem("australia2026_split_records", JSON.stringify(records)); }
function getRate() { return Number(localStorage.getItem("australia2026_aud_twd_rate") || "19.5"); }
function setRate(rate) { localStorage.setItem("australia2026_aud_twd_rate", String(rate || 19.5)); }

function calculateSettlement(records) {
  const balance = Object.fromEntries(splitPeople.map(p => [p, 0]));
  records.filter(r => r.mode === "Shared").forEach(r => {
    const amount = Number(r.amount) || 0;
    const splitWith = Array.isArray(r.splitWith) && r.splitWith.length ? r.splitWith : splitPeople;
    const share = amount / splitWith.length;
    if (!balance[r.payer] && balance[r.payer] !== 0) balance[r.payer] = 0;
    balance[r.payer] += amount;
    splitWith.forEach(p => {
      if (!balance[p] && balance[p] !== 0) balance[p] = 0;
      balance[p] -= share;
    });
  });
  return balance;
}

function renderSplitPeopleCheckboxes(selectedPeople = splitPeople) {
  return splitPeople.map(p => `
    <label class="split-person-chip">
      <input type="checkbox" name="splitWith" value="${escapeHtml(p)}" ${selectedPeople.includes(p) ? "checked" : ""}>
      <span>${escapeHtml(p)}</span>
    </label>
  `).join("");
}

function renderSplitPanel() {
  const records = getSplitData();
  const rate = getRate();
  const total = records.reduce((s, r) => s + Number(r.amount || 0), 0);
  const shared = records.filter(r => r.mode === "Shared").reduce((s, r) => s + Number(r.amount || 0), 0);
  const personal = records.filter(r => r.mode === "Personal").reduce((s, r) => s + Number(r.amount || 0), 0);
  const balance = calculateSettlement(records);
  modalItems.innerHTML = `
    <div class="split-grid">
      <div class="warning-card"><h4>分帳邏輯</h4><p>「誰付錢」選付款人；「幫誰付 / 誰要分攤」可自由勾選。例如 Cheryl 只幫 旁旁、皮皮 付，勾旁旁＋皮皮，不勾濁濁。</p></div>
      <div class="split-summary">
        <div class="small-card"><strong>Total</strong><br>AUD ${total.toFixed(2)}<br><span class="split-muted">≈ NT$${Math.round(total * rate).toLocaleString()}</span></div>
        <div class="small-card"><strong>Rate</strong><br>1 AUD = <input id="splitRate" type="number" step="0.01" value="${rate}" style="width:90px;"> TWD</div>
        <div class="small-card"><strong>Shared</strong><br>AUD ${shared.toFixed(2)}</div>
        <div class="small-card"><strong>Personal</strong><br>AUD ${personal.toFixed(2)}</div>
      </div>
      <h3 class="section-title"><span class="icon-pill"><span class="material-symbols-rounded">add_circle</span></span>新增消費</h3>
      <div class="split-form">
        <input id="splitStore" placeholder="商店名稱，例如 Coles" />
        <input id="splitAmount" type="number" step="0.01" placeholder="金額 AUD，例如 85.20" />
        <select id="splitMode"><option>Shared</option><option>Personal</option></select>
        <select id="splitPayer">${splitPeople.map(p => `<option>${escapeHtml(p)}</option>`).join("")}</select>
        <select id="splitCategory"><option>餐飲</option><option>交通</option><option>超市</option><option>購物</option><option>咖啡</option><option>門票</option><option>住宿</option><option>其他</option></select>
        <div class="split-people-box">
          <div class="split-label">幫誰付 / 誰要分攤</div>
          <div class="split-people-actions"><button type="button" class="split-link" id="selectAllPeople">全選</button><button type="button" class="split-link" id="selectOnlyPayer">只選付款人</button><button type="button" class="split-link" id="clearPeople">清除</button></div>
          <div class="split-person-grid" id="splitWithBox">${renderSplitPeopleCheckboxes(splitPeople)}</div>
        </div>
        <input id="splitNote" placeholder="備註，可空白" />
        <div class="split-actions"><button class="split-btn" id="addSplitRecord">新增</button><button class="split-btn secondary" id="exportSplitCsv">Export CSV</button><button class="split-btn secondary" id="clearSplitRecords">清空</button></div>
      </div>
      <h3 class="section-title"><span class="icon-pill"><span class="material-symbols-rounded">currency_exchange</span></span>快速換算</h3>
      <div class="split-form"><input id="quickAud" type="number" step="0.01" placeholder="輸入 AUD"><div id="quickTwd" class="small-card">≈ NT$0</div></div>
      <h3 class="section-title"><span class="icon-pill"><span class="material-symbols-rounded">groups</span></span>Settlement</h3>
      ${Object.entries(balance).map(([p, b]) => `<div class="small-card">${escapeHtml(p)}：${b >= 0 ? "應收" : "應付"} AUD ${Math.abs(b).toFixed(2)}</div>`).join("")}
      <h3 class="section-title"><span class="icon-pill"><span class="material-symbols-rounded">receipt_long</span></span>Records</h3>
      ${records.slice().reverse().map(r => `<div class="split-record"><strong>${escapeHtml(r.store)}｜AUD ${Number(r.amount).toFixed(2)} <span class="split-muted">≈ NT$${Math.round(Number(r.amount) * rate).toLocaleString()}</span></strong><span class="split-muted">${escapeHtml(r.mode)}｜Paid by ${escapeHtml(r.payer)}｜Split: ${escapeHtml((r.splitWith || []).join(" / "))}｜${escapeHtml(r.category)}</span><span class="split-muted">${escapeHtml(r.note || "")}</span></div>`).join("") || `<div class="small-card">尚無紀錄。</div>`}
    </div>
  `;

  const checkedPeople = () => Array.from(document.querySelectorAll('input[name="splitWith"]:checked')).map(el => el.value);
  const setCheckedPeople = people => document.querySelectorAll('input[name="splitWith"]').forEach(el => { el.checked = people.includes(el.value); });

  const on = (id, event, handler) => { const el = document.getElementById(id); if (el) el.addEventListener(event, handler); };
  on("splitRate", "change", e => { setRate(Number(e.target.value || 19.5)); renderSplitPanel(); });
  on("quickAud", "input", e => { const out = document.getElementById("quickTwd"); if (out) out.textContent = `≈ NT$${Math.round(Number(e.target.value || 0) * getRate()).toLocaleString()}`; });
  on("selectAllPeople", "click", () => setCheckedPeople(splitPeople));
  on("selectOnlyPayer", "click", () => setCheckedPeople([document.getElementById("splitPayer")?.value || "Cheryl"]));
  on("clearPeople", "click", () => setCheckedPeople([]));
  on("splitPayer", "change", () => {
    if (document.getElementById("splitMode")?.value === "Personal") setCheckedPeople([document.getElementById("splitPayer")?.value || "Cheryl"]);
  });
  on("splitMode", "change", e => {
    if (e.target.value === "Personal") setCheckedPeople([document.getElementById("splitPayer")?.value || "Cheryl"]);
    else setCheckedPeople(splitPeople);
  });
  on("addSplitRecord", "click", () => {
    const store = document.getElementById("splitStore").value.trim();
    const amount = Number(document.getElementById("splitAmount").value);
    const mode = document.getElementById("splitMode").value;
    const payer = document.getElementById("splitPayer").value;
    const category = document.getElementById("splitCategory").value;
    const note = document.getElementById("splitNote").value.trim();
    const splitWith = mode === "Personal" ? [payer] : checkedPeople();
    if (!store || !amount) return alert("請輸入商店名稱與金額");
    if (mode === "Shared" && !splitWith.length) return alert("請至少勾選 1 位分攤對象");
    records.push({ id: Date.now(), date: new Date().toISOString().slice(0, 10), store, amount, mode, payer, category, note, splitWith });
    saveSplitData(records);
    renderSplitPanel();
  });
  on("clearSplitRecords", "click", () => { if (confirm("確定清空所有分帳紀錄？")) { saveSplitData([]); renderSplitPanel(); } });
  on("exportSplitCsv", "click", () => {
    const rows = [["date", "store", "amount_aud", "mode", "payer", "split_with", "category", "note"], ...records.map(r => [r.date, r.store, r.amount, r.mode, r.payer, (r.splitWith || []).join("/"), r.category, r.note])];
    const csv = rows.map(row => row.map(x => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "australia2026_expenses.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}

function openPanel(panelKey) {
  const panel = panels?.[panelKey];
  if (!panel) return;
  const [title, subtitle, items] = panel;
  modalTitle.textContent = title;
  modalSubtitle.textContent = subtitle;
  if (panelKey === "weather") renderWeatherPanel();
  else if (panelKey === "help") modalItems.innerHTML = renderHelpPanel();
  else if (panelKey === "driving") modalItems.innerHTML = renderDrivingPanel();
  else if (panelKey === "transport") modalItems.innerHTML = renderTransportPanel();
  else if (panelKey === "flight") modalItems.innerHTML = renderFlightPanel();
  else if (panelKey === "split") renderSplitPanel();
  else modalItems.innerHTML = items.map(item => `<div class="panel-item"><span class="material-symbols-rounded">check_circle</span><span>${escapeHtml(item)}</span></div>`).join("");
  modal.classList.add("is-open");
}

function render() {
  renderTabs();
  renderDay();
  renderDayWarning();
  attachAccommodationCard();
}

document.querySelectorAll(".icon-btn").forEach(btn => btn.addEventListener("click", () => openPanel(btn.dataset.panel)));
document.addEventListener("click", e => {
  const btn = e.target.closest?.(".icon-btn[data-panel]");
  if (btn) openPanel(btn.dataset.panel);
});
document.getElementById("closeModal").addEventListener("click", () => modal.classList.remove("is-open"));
modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("is-open"); });

let touchStartX = 0;
mainSwipeArea.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
mainSwipeArea.addEventListener("touchend", e => {
  const diff = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(diff) < 70) return;
  if (diff < 0 && selected < tripDays.length - 1) { selected += 1; render(); scrollToPageTop(); }
  if (diff > 0 && selected > 0) { selected -= 1; render(); scrollToPageTop(); }
}, { passive: true });

if (scrollTopBtn) {
  window.addEventListener("scroll", () => scrollTopBtn.classList.toggle("is-visible", window.scrollY > 360), { passive: true });
  scrollTopBtn.addEventListener("click", e => { e.preventDefault(); scrollToPageTop(); });
}

render();
