const map = L.map('map').setView([25.033, 121.5654], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 載入 doctors.json
fetch('doctors.json')
  .then(res => res.json())
  .then(data => {
    renderDoctors(data);

    // 同時載入 localStorage 的醫師
    let extraDoctors = JSON.parse(localStorage.getItem("extraDoctors") || "[]");
    renderDoctors(extraDoctors);
  })
  .catch(err => console.error("載入 doctors.json 失敗:", err));

function renderDoctors(doctors) {
  doctors.forEach(doc => {
    L.marker([doc.lat, doc.lng])
      .addTo(map)
      .bindPopup(`<b>${doc.name}</b><br>${doc.clinic}<br>${doc.phone}<br>${doc.address}`);
  });
}
