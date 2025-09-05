const MAP_CENTER = [25.0330, 121.5654];
const MAP_ZOOM = 12;
let map; let markerLayer; let allData = []; let markers = [];
const $ = (sel) => document.querySelector(sel);

async function init() {
  initMap();
  await loadDataAndGeocode();
  buildDistrictOptions(allData);
  render(allData);
  bindEvents();
}

function initMap() {
  map = L.map('map', { zoomControl: true }).setView(MAP_CENTER, MAP_ZOOM);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
}

async function loadDataAndGeocode() {
  try {
    const res = await fetch('doctors.json');
    allData = await res.json();
  } catch (err) {
    console.error('載入資料失敗', err);
    alert('無法載入 doctors.json，請確定檔案存在或使用伺服器開啟。');
    return;
  }
  for (let i = 0; i < allData.length; i++) {
    const item = allData[i];
    if (typeof item.lat === 'number' && typeof item.lng === 'number') continue;
    const key = 'geo:' + item.address;
    const cached = localStorage.getItem(key);
    if (cached) {
      const obj = JSON.parse(cached);
      item.lat = obj.lat; item.lng = obj.lng; continue;
    }
    await new Promise(r => setTimeout(r, 900));
    try {
      const q = encodeURIComponent(item.address + ' 台灣 台北市');
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1&addressdetails=0`;
      const gres = await fetch(url, { headers: { 'Accept-Language': 'zh-TW' } });
      const gj = await gres.json();
      if (gj && gj.length > 0) { item.lat = parseFloat(gj[0].lat); item.lng = parseFloat(gj[0].lon); localStorage.setItem(key, JSON.stringify({lat: item.lat, lng: item.lng})); }
      else { console.warn('無法取得座標', item.address); }
    } catch (e) { console.error('地理編碼錯誤', e); }
  }
}

function buildDistrictOptions(data) {
  const select = $('#district');
  const districts = Array.from(new Set(data.map(x => x.district || '').filter(Boolean))).sort();
  for (const d of districts) { const opt = document.createElement('option'); opt.value = d; opt.textContent = d; select.appendChild(opt); }
}

function getFilters() { const q = $('#q').value.trim().toLowerCase(); const d = $('#district').value; return { q, d }; }
function filterData(data) {
  const { q, d } = getFilters();
  return data.filter(item => {
    const inDistrict = d ? (item.district === d) : true;
    if (!q) return inDistrict;
    const str = [item.name, item.clinic, item.phone, item.address, item.note || ''].join(' ').toLowerCase();
    return inDistrict && str.includes(q);
  });
}

function render(data) {
  markerLayer.clearLayers(); markers = [];
  const valid = data.filter(it => typeof it.lat === 'number' && typeof it.lng === 'number');
  valid.forEach(item => {
    const m = L.marker([item.lat, item.lng]).addTo(markerLayer);
    const html = `<div class="popup"><strong>${item.name}</strong>（根管專科）<br/>${item.clinic}<br/><a href="tel:${(item.phone||'').replace(/[^0-9+]/g,'')}">${item.phone||''}</a><br/>${item.address}<br/><small style="color:#64748b">${item.district||''}</small></div>`;
    m.bindPopup(html);
    markers.push({ id: item.id||item.name, marker: m, item });
  });
  updateList(data);
  $('#count').textContent = data.length;
  if (markers.length > 0) { const group = L.featureGroup(markers.map(m => m.marker)); map.fitBounds(group.getBounds().pad(0.2)); }
  else { map.setView(MAP_CENTER, MAP_ZOOM); }
}

function updateList(data) {
  const box = $('#list'); box.innerHTML = '';
  data.forEach((item) => {
    const el = document.createElement('div'); el.className = 'item'; el.setAttribute('data-id', item.id || item.name);
    el.innerHTML = `<h3>${item.name}（${item.clinic}）</h3><p class="meta">☎️ <a href="tel:${(item.phone||'').replace(/[^0-9+]/g,'')}">${item.phone||''}</a><br/>📍 ${item.address}｜${item.district||''}</p>`;
    el.addEventListener('click', () => focusOn(item.id || item.name)); box.appendChild(el);
  });
}

function focusOn(id) { const found = markers.find(x => (x.id === id)); if (!found) return; const { marker } = found; map.setView(marker.getLatLng(), 16, { animate: true }); marker.openPopup(); }

let timer = null;
function bindEvents() { $('#q').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(applyFilters, 150); }); $('#district').addEventListener('change', applyFilters); $('#reset').addEventListener('click', () => { $('#q').value = ''; $('#district').value = ''; applyFilters(); }); }
function applyFilters() { const filtered = filterData(allData); render(filtered); }
init();
