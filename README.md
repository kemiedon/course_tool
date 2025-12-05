# 課程規劃工具 (Course Planning Tool)

一個結合 AI 技術的智能課程規劃系統，協助教育工作者快速創建專業的課程內容。

## 🎯 專案簡介

本專案是一個全功能的課程規劃工具，整合 Google Gemini 2.0 Flash Exp API，提供從基本資訊設定到宣傳內容生成的完整工作流程。

## ✨ 主要功能

### 已完成功能

1. **課程基本設定**
   - 課程資訊填寫（主題、目標客群、描述、類別）
   - AI 智能生成班級名稱（8-12字，三種策略）
   - 排課設定（總時數、每日時數、開始日期）
   - jQuery UI Datepicker & Timepicker（Swanky Purse 主題）
   - FullCalendar 即時預覽

2. **課綱自動生成**
   - 基於課程描述的 AI 課綱生成
   - 緊扣課程描述，循序漸進
   - 可編輯與調整

3. **宣傳內容生成**
   - AI 自動產生專業宣傳文案
   - 結合課程資訊與課綱內容

4. **課程儲存**
   - Firebase Firestore 資料持久化
   - 完整課程資料結構

### 開發中功能

- 資訊圖表生成（Gemini Imagen API）
- 課程列表與編輯頁面
- Google Forms API 整合

## 🛠 技術棧

- **Vue 3.4.0** - Composition API
- **Vite 5.x** - 開發伺服器
- **Tailwind CSS 3.x + DaisyUI** - Coffee 主題
- **jQuery UI 1.13.2** - Datepicker & Timepicker (CDN)
- **FullCalendar 6.x** - 行事曆元件
- **Firebase 10.7.1** - Firestore, Auth, Storage
- **Gemini 2.0 Flash Exp API** - AI 內容生成
- **Pinia** - 狀態管理

## 📦 開始使用

### 安裝依賴

```bash
npm install
```

### 環境設定

建立 `.env` 檔案：

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 啟動開發伺服器

```bash
npm run dev
```

### 建置生產版本

```bash
npm run build
```

## 📝 開發紀錄

### 2025-12-05
- ✅ 完成 CourseBasicSetup 元件（合併步驟 1 和 2）
- ✅ 整合 jQuery UI Datepicker & Timepicker（Swanky Purse 主題）
- ✅ 實作 Timepicker Coffee 主題樣式
- ✅ 修正表單驗證與時間比較邏輯
- ✅ 完成 CurriculumEditor 課綱生成
- ✅ 完成 PromotionEditor 宣傳內容生成
- ✅ 完成課程儲存至 Firebase

## 📄 授權

本專案為教育用途開發。

---

**最後更新**: 2025-12-05

## 專案結構

```
course_tool/
├── SPEC/                    # 專案規格文件
├── public/                  # 靜態資源
├── src/
│   ├── assets/             # 圖片、樣式等
│   ├── components/         # Vue 元件
│   ├── views/              # 頁面
│   ├── services/           # API 服務
│   ├── stores/             # Pinia 狀態管理
│   ├── router/             # Vue Router
│   ├── utils/              # 工具函數
│   └── main.js             # 入口檔案
├── .env.example            # 環境變數範例
└── package.json
```

## 開發指南

詳見 `SPEC/MAIN.md` 專案規格書。

## License

MIT
