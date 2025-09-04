# 台北市根管專科醫師查詢（MVP）

> 這是可直接部署的最小可行產品（純前端、無後端）。
> 功能：搜尋（關鍵字 + 行政區）、地圖定位、清單點擊定位。

## 使用方式（本機）
1. 下載本專案後解壓縮。
2. 在資料夾內開啟終端機（或使用 VS Code 的 Terminal）。
3. 啟動本機伺服器：
   - 若有 Python：`python -m http.server 5500`
   - 然後在瀏覽器打開 `http://localhost:5500`
   - （或用 VS Code 安裝 Live Server 外掛後右鍵 `index.html` → Open with Live Server）

> 為什麼需要伺服器？直接用 `file://` 打開會因瀏覽器安全限制，`fetch('doctors.json')` 讀不到檔案。

## 部署（選一）
- **GitHub Pages**：把整個資料夾上傳到 GitHub repo → Settings → Pages → Source=main /root → 等幾分鐘就能拿到網址。
- **Netlify / Vercel**：登入後把資料夾拖上去即可。

## 匯入正式名單
- 將 `doctors.json` 換成你的正式資料，欄位格式如下：
```json
[
  {
    "id": "TPE-001",
    "name": "王小明",
    "clinic": "OOO 牙醫診所",
    "phone": "02-1234-5678",
    "address": "台北市OO區OO路OO號",
    "district": "OO區",
    "lat": 25.0,
    "lng": 121.5,
    "note": "備註（可省略）"
  }
]
```
- 若只有地址沒有經緯度，可後續再加「批次地理編碼（geocoding）」流程。

## 後續可做的事（延伸）
- 加入 **Marker Cluster** 提升大量點位的效能與可讀性。
- 加入 **地理編碼工具** 把地址轉換成經緯度（例如：以外部批次工具或伺服器端處理）。
- 新增 **後端 API**（Flask/Node）與資料庫，支援更進階的篩選（例如週六看診、是否近捷運）。
- 新增 **收藏/分享**、**多語介面**、**路線導航**（開啟 Google Maps）。
