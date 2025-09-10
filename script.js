/* 台大根管專科醫師查詢 */
/* 功能：
   1) 載入 doctors.json
   2) Leaflet 顯示地圖與標記
   3) 依「關鍵字」與「行政區」篩選
   4) 右側清單可點擊 → 地圖定位並開啟資訊窗
*/

const MAP_CENTER = [25.0330, 121.5654]; // 台北 101 附近
const MAP_ZOOM = 12;

let map;
let markerLayer;
let allData = [];
let markers = []; // 存 Leaflet marker 實例

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

async function init() {
  initMap();
  await loadData();
  buildDistrictOptions(allData);
  render(allData);
  bindEvents();
}

function initMap() {
  map = L.map('map', { zoomControl: true }).setView(MAP_CENTER, MAP_ZOOM);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> 貢獻者'
  }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);
}

async function loadData() {
  try {
    const res = await fetch('doctors.json');
    allData = await res.json();
  } catch (err) {
    console.error('載入資料失敗', err);
    alert('無法載入 doctors.json，請用本機伺服器開啟（例如：python -m http.server）。');
    allData = [];
  }
}

function buildDistrictOptions(data) {
  const select = $('#district');
  const districts = Array.from(new Set(data.map(x => x.district))).sort();
  for (const d of districts) {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    select.appendChild(opt);
  }
}

function getFilters() {
  const q = $('#q').value.trim().toLowerCase();
  const d = $('#district').value;
  return { q, d };
}

function filterData(data) {
  const { q, d } = getFilters();
  return data.filter(item => {
    const inDistrict = d ? item.district === d : true;
    if (!q) return inDistrict;
    const str = [
      item.name,
      item.clinic,
      item.phone,
      item.address,
      item.note || ''
    ].join(' ').toLowerCase();
    return inDistrict && str.includes(q);
  });
}

function render(data) {
  // 1) 清空 marker
  markerLayer.clearLayers();
  markers = [];

  // 2) 依資料建立 marker
  data.forEach((item, idx) => {
    const m = L.marker([item.lat, item.lng]).addTo(markerLayer);
    const html = `
      <div class="popup">
        <strong>${item.name}</strong>（根管專科）<br/>
        ${item.clinic}<br/>
        <a href="tel:${item.phone.replace(/-/g,'')}">${item.phone}</a><br/>
        ${item.address}<br/>
        <small style="color:#64748b">${item.district}</small>
      </div>
    `;
    m.bindPopup(html);
    markers.push({ id: item.id, marker: m, item });
  });

  // 3) 更新清單與統計
  updateList(data);
  $('#count').textContent = data.length;

  // 4) 自動視野（若有資料）
  if (data.length > 0) {
    const group = L.featureGroup(markers.map(m => m.marker));
    map.fitBounds(group.getBounds().pad(0.2));
  } else {
    map.setView(MAP_CENTER, MAP_ZOOM);
  }
}

function updateList(data) {
  const box = $('#list');
  box.innerHTML = '';
  data.forEach((item) => {
    const el = document.createElement('div');
    el.className = 'item';
    el.setAttribute('data-id', item.id);
    el.innerHTML = `
      <h3>${item.name}（${item.clinic}）</h3>
      <p class="meta">
        ☎️ <a href="tel:${item.phone.replace(/-/g,'')}">${item.phone}</a><br/>
        📍 ${item.address}｜${item.district}
      </p>
    `;
    el.addEventListener('click', () => focusOn(item.id));
    box.appendChild(el);
  });
}

function focusOn(id) {
  const found = markers.find(x => x.id === id);
  if (!found) return;
  const { marker } = found;
  map.setView(marker.getLatLng(), 16, { animate: true });
  marker.openPopup();
}

// 事件綁定與簡單防抖
let timer = null;
function bindEvents() {
  $('#q').addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(applyFilters, 150);
  });
  $('#district').addEventListener('change', applyFilters);
  $('#reset').addEventListener('click', () => {
    $('#q').value = '';
    $('#district').value = '';
    applyFilters();
  });
}

function applyFilters() {
  const filtered = filterData(allData);
  render(filtered);
}

init();
