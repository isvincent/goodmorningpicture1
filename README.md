# 早安圖集錦

一個繁體中文、手機優先的早安圖展示網站。首頁是 `index.html`，可放在 GitHub Pages；Google Apps Script 只負責讀取指定 Drive 資料夾中的圖片名稱與檔案 ID，圖片仍由 Google Drive 提供。

## 網站功能

- 自動列出 Drive 資料夾內的圖片，檔名作為圖片描述
- 搜尋、主題篩選、排序、收藏及全螢幕圖片檢視
- 設定面板提供全螢幕、音效、裝置、版面、語言、字體與色系七項控制
- Web App Manifest 與 Service Worker，支援安裝及離線快取網站外殼
- 音效由瀏覽器 Web Audio API 即時合成，不需要額外音效檔

## 專案架構

```text
morning-gallery-site/
├── index.html                 # 首頁
├── styles.css                 # 色彩、排版、動畫與響應式樣式
├── app.js                     # 圖片讀取、搜尋、設定、收藏與檢視器
├── config.js                  # Apps Script 網址設定
├── manifest.webmanifest       # PWA 設定
├── service-worker.js          # 網站外殼快取
├── assets/
│   ├── icon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── apps-script/
│   └── Code.gs                # Drive 資料 JSONP 端點
├── .nojekyll
└── README.md
```

## 第一步：建立 Apps Script 資料端點

1. 使用有權讀取早安圖資料夾的 Google 帳號，前往 [script.google.com](https://script.google.com/) 建立新專案。
2. 將 `apps-script/Code.gs` 的完整內容貼進編輯器。預設資料夾 ID 已填入：`1xQUTmUYkkBAPtz58GFzbz0eE6qorRKUl`。若使用別的資料夾，將網址 `/folders/` 後的 ID 換掉。
3. 按「部署」→「新增部署」，類型選「網頁應用程式」。
4. 「執行身分」選「我」，「誰可以存取」選「所有人」，按部署並完成 Google 授權。
5. 複製部署完成後的網頁應用程式網址，格式通常以 `/exec` 結尾。

這個 Apps Script 只讀取檔名、圖片 MIME 類型、修改時間與檔案 ID，不會修改 Drive 檔案。

## 第二步：設定圖片瀏覽權限

GitHub Pages 是公開網站，瀏覽者的 Google 登入狀態不會傳給 Drive。要讓訪客看到縮圖，請在 Google Drive 將早安圖資料夾的「一般存取權」設為「知道連結的任何人」，角色設為「檢視者」。套用到資料夾內圖片後，等候 Google Drive 權限生效。

這會讓持有圖片連結的人可以檢視及下載圖集。若圖片不可公開，請勿部署公開的 GitHub Pages；可改用受 Google Workspace 存取控管的內部網站，並重新設計登入授權流程。

## 第三步：連結網站與 Apps Script

開啟 `config.js`，把 `endpoint` 的內容替換成剛才複製的 Apps Script 網頁應用程式網址：

```js
window.GALLERY_CONFIG = {
  endpoint: "https://script.google.com/macros/s/你的部署識別碼/exec",
  folderUrl: "https://drive.google.com/drive/folders/1xQUTmUYkkBAPtz58GFzbz0eE6qorRKUl"
};
```

儲存後，以本機伺服器預覽（例如 VS Code 的 Live Server）。直接雙擊 `index.html` 會因瀏覽器安全限制而無法測試 Service Worker。

## 第四步：上傳 GitHub 並開啟 Pages

1. 在 GitHub 建立新的 Repository。若是公開圖集，Repository 可設為 Public。
2. 將本資料夾內所有檔案上傳到 Repository 根目錄，確認 `index.html` 位於根目錄。
3. 開啟 Repository 的 **Settings → Pages**。
4. 在 **Build and deployment** 選 **Deploy from a branch**，分支選 `main`、資料夾選 `/(root)`，按 Save。
5. 等候部署完成，GitHub Pages 會提供網站網址。第一次安裝 PWA 或 Service Worker 請使用 HTTPS 網址。

若用 Git 指令操作，在本資料夾執行：

```bash
git init
git add .
git commit -m "建立早安圖集錦網站"
git branch -M main
git remote add origin https://github.com/你的帳號/你的Repository.git
git push -u origin main
```

## 更新圖集

新增或移除 Drive 圖片後，網站會在重新載入時重新讀取資料夾，不需重新上傳網站程式。圖片檔案請使用 PNG、JPG、WebP 或其他瀏覽器可顯示的圖片格式，建議檔名直接使用圖片上的句子。

## 一般瀏覽器載入失敗時

若無痕／隱私視窗可以載入，但一般視窗出現「無法連線到 Apps Script」，通常是一般視窗的擴充功能或舊版 Service Worker 快取造成。依序檢查：

1. 在錯誤畫面按「在新分頁檢查 Apps Script 端點」。若看到 Google 登入畫面或權限錯誤，回到 Apps Script 的「部署 → 管理部署」，確認執行身分為「我」、存取權為「所有人」，再編輯部署並選擇新版本。
2. 若端點沒有要求登入，先在網站按 `Ctrl + Shift + R`（Mac：`Command + Shift + R`）強制重新載入。
3. 暫時停用廣告封鎖、隱私防護或腳本封鎖擴充功能再測試。若停用後恢復，將 `script.google.com` 與 `script.googleusercontent.com` 加入允許清單。
4. 若仍載入舊畫面，在 Chrome／Edge 開啟開發者工具的 **Application → Service Workers**，對網站按 **Unregister**，再到 **Storage → Clear site data**，關閉開發者工具後重新載入。
5. 更新網站檔案到 GitHub 後，等待 Pages 部署完成，再重新載入。新版 Service Worker 會使用新快取並自動移除舊快取。

新分頁直接開啟 `/exec` 網址時若看到「callback 必須是合法名稱」，代表端點已回應；此頁面本來是給網站加上 JSONP callback 呼叫的。若看到 Google 登入或存取拒絕，則是 Apps Script 部署或 Workspace 管理政策問題。

## 注意事項

- 訪客收藏與顯示設定保存在各自瀏覽器的 `localStorage`，不會同步到其他裝置。
- Service Worker 快取網站程式外殼。圖集清單與原始圖片需連線讀取 Drive。
- Apps Script 有 Google 帳戶的每日服務配額；非常大的資料夾或高流量網站應改用正式圖片 CDN 或後端服務。
- 若 Apps Script 程式變更，請在「部署 → 管理部署」編輯既有部署並建立新版本。
