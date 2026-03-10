# Hokkaido Ski Trip 2026 v2

這是更新後的旅行 Web App 專案，已整理成比較接近未來 template 的結構。

## 這版已包含
- 5 個主分頁：行程 / 美食 / 伴手禮 / 花費 / 文件
- Banner 按鈕：天氣 / 分帳 / 手稻滑雪
- 手稻滑雪小助手（雪況快照、交通、兩區設施、餐廳）
- PWA（可加到手機主畫面）
- 文件資料已整理成卡片 metadata

## 很重要：關於 PDF
你上傳的原始 PDF 已放在：`private_docs_not_for_public_upload/`
這些檔案包含個人資訊，不建議直接公開部署到 GitHub Pages。

## GitHub Pages 部署
1. 建立 repo：`hokkaido-ski-trip-2026`
2. 上傳本資料夾內容到 repo 根目錄
3. Settings → Pages
4. Source 選 `Deploy from a branch`
5. Branch 選 `main`，Folder 選 `/ (root)`

## 你之後可以改的資料檔
- `data/trip.json`
- `data/food.json`
- `data/souvenirs.json`
- `data/expenses.json`
- `data/documents.json`
- `data/ski-helper.json`
- `config/site-config.json`
