document.getElementById("doctorForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const doctor = {
    id: "TPE-" + Date.now(),
    name: document.getElementById("name").value,
    clinic: document.getElementById("clinic").value,
    phone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
    lat: parseFloat(document.getElementById("lat").value),
    lng: parseFloat(document.getElementById("lng").value),
    note: "手動新增"
  };

  let doctors = JSON.parse(localStorage.getItem("extraDoctors") || "[]");
  doctors.push(doctor);
  localStorage.setItem("extraDoctors", JSON.stringify(doctors));

  alert("新增成功！");
  this.reset();
});
