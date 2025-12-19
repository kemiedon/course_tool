# 開發指南

## 🎯 目前開發進度

### ✅ 已完成功能

#### Phase 1: 基礎架構 (100% 完成)

**基礎設定**

- [x] Vue 3 + Vite 專案結構
- [x] Tailwind CSS + DaisyUI (Coffee 主題)
- [x] Vue Router 路由設定
- [x] Pinia 狀態管理
- [x] Firebase 服務整合 (Firestore, Auth, Storage)
- [x] Gemini API 服務 (gemini-2.0-flash-exp)
- [x] Google Forms API 服務骨架

**共用元件**

- [x] ToastNotification (通知系統完整實作)
- [x] LoadingSpinner (載入動畫)
- [x] ConfirmDialog (確認對話框)
- [x] CourseCalendar (FullCalendar 整合完成)

**工具函數**

- [x] dateUtils.js (日期計算、排課邏輯、日曆事件轉換)
- [x] validators.js (表單驗證)

#### Phase 2: 課程建立流程 (約 70% 完成)

**步驟 1: 課程基本設定 (95% 完成)**

- [x] 課程主題、目標客群、課程描述輸入
- [x] 課程分類選擇 (兒童課程/職訓課程)
- [x] AI 班級名稱生成 (3 個建議,可選擇或自訂)
- [x] 總課程時數、每日時數設定
- [x] 自動計算預計天數
- [x] 課程開始/結束日期選擇 (jQuery UI Datepicker)
- [x] 上課星期多選 (週一至週日)
- [x] 上課時間設定 (jQuery UI Timepicker)
- [x] 自動計算排課日期 (支援按天數/按日期範圍兩種模式)
- [x] FullCalendar 日曆預覽
- [x] 排課日期清單預覽
- [x] 完整表單驗證與錯誤提示
- [x] CourseBasicSetup 元件 (整合基本資訊與排課設定)

**步驟 2: 課綱生成 (95% 完成)**

- [x] AI 批次生成所有課綱 (Gemini 2.0 Flash Exp API)
- [x] 顯示生成進度 (已生成 X / 總共 Y 天)
- [x] 每日課綱卡片顯示 (日期、時間、單元名稱)
- [x] 課綱內容顯示 (學習目標、教學內容、小作業)
- [x] 120 分鐘課程節奏設計 (已整合到 Gemini prompt)
- [x] 課綱編輯功能 (Markdown textarea)
- [x] 單日課綱重新生成
- [x] 編輯模式切換
- [x] CurriculumEditor 元件完整實作
- [x] **課程時間資訊卡片顯示（開始日期、結束日期、上課時間）(v1.6.1)**
- [ ] 課綱 Markdown 渲染優化 (目前純文字顯示)

**步驟 3: 宣傳內容 (95% 完成)**

- [x] AI 生成宣傳文案按鈕
- [x] 文案編輯區域 (可手動修改)
- [x] 重新生成功能
- [x] 字數統計 (更新為 250-300 字)
- [x] 預覽顯示
- [x] 複製到剪貼簿功能
- [x] PromotionEditor 元件
- [x] **整合課程日期與時間資訊 (v1.6.0)**
- [x] **自動提取主要學習目標 (v1.6.0)**
- [x] **優化文案結構（痛點 → 時間 → 目標 → 成果）(v1.6.0)**
- [ ] Gemini API 宣傳文案生成實際測試

**步驟 4: 資訊圖表生成 (95% 完成)**

- [x] 4 種圖表風格選擇器（手繪、科技、漫畫、8-bit）
- [x] 批次生成所有圖表
- [x] 生成進度顯示
- [x] 圖片網格預覽（響應式）
- [x] 圖片管理功能（查看、下載、重新生成）
- [x] 圖片預覽 Modal
- [x] 單張/全部重新生成
- [x] 單張/批次下載
- [x] Firebase Storage 整合
- [x] Gemini Imagen3 API 整合
- [x] **課程時間資訊卡片顯示（開始日期、結束日期、上課時間）(v1.6.1)**
- [ ] 真實 Imagen3 API 測試

**頁面結構**

- [x] Home.vue (首頁 - 功能介紹與快速開始)
- [x] CourseCreate.vue (課程建立 - 4 步驟流程完整實作)
- [x] CourseList.vue (課程列表 - 僅骨架)
- [x] CourseEdit.vue (課程編輯 - 僅骨架)
- [x] OAuthCallback.vue (Google 授權回調 - 骨架)

**新增功能 (v1.1)**

- [x] 班級名稱關鍵字欄位 (選填)
- [x] 關鍵字自然融入 AI 生成邏輯
- [x] 更新 Gemini API prompt 支援關鍵字

### ⏳ 進行中功能

**待實際測試項目:**

- [ ] 完整課程建立流程測試 (步驟 1-4)
- [ ] Markdown 渲染效果驗證
- [ ] 資訊圖表生成與下載功能測試
- [ ] 宣傳內容生成測試

### ❌ 待開發功能

#### Phase 4: 課程管理 (15% 完成)

**課程列表頁 (CourseList.vue)**

- [x] 頁面骨架
- [ ] 從 Firebase Firestore 載入課程列表
- [ ] 卡片式顯示課程
- [ ] 篩選功能 (分類、日期)
- [ ] 搜尋功能
- [ ] 排序功能 (日期、名稱)
- [ ] 刪除課程 (含確認對話框)
- [ ] 點擊進入編輯頁

**課程編輯頁 (CourseEdit.vue)**

- [x] 頁面骨架
- [ ] 根據 ID 載入現有課程資料
- [ ] 複用 CourseCreate 的所有元件
- [ ] 允許修改所有欄位
- [ ] 更新課程到 Firebase
- [ ] Google 表單生成按鈕 (僅兒童課程)

#### Phase 5: Google 表單整合 (0% 完成)

- [ ] Google Cloud Console 專案設定
- [ ] 啟用 Google Forms API
- [ ] OAuth 2.0 認證流程實作
- [ ] 處理 access token
- [ ] 自動建立 Google 表單
- [ ] 插入課程名稱與介紹
- [ ] 插入每日課程圖片
- [ ] 設定表單欄位:
  - [ ] 學生姓名 (必填)
  - [ ] 年級選擇 (下拉式選單)
  - [ ] 家長姓名 (必填)
  - [ ] 聯絡電話 (必填)
  - [ ] Email (必填,格式驗證)
  - [ ] 一週電腦使用時間 (單選)
- [ ] 顯示表單連結
- [ ] 複製表單連結功能
- [ ] 儲存表單 ID 至 Firebase
- [ ] 僅兒童課程顯示生成按鈕

---

## 🚀 啟動專案

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

編輯 `.env` 檔案，填入您的 API Keys：

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=你的-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=你的-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=你的-project-id
VITE_FIREBASE_STORAGE_BUCKET=你的-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=你的-messaging-sender-id
VITE_FIREBASE_APP_ID=你的-firebase-app-id

# Google Gemini API
VITE_GEMINI_API_KEY=你的-gemini-api-key

# Google Forms API (OAuth 2.0)
VITE_GOOGLE_CLIENT_ID=你的-google-client-id
VITE_GOOGLE_CLIENT_SECRET=你的-google-client-secret
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/callback
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

瀏覽器會自動開啟 `http://localhost:5173`

---

## 📋 下一步開發重點

### Phase 2: 完善核心功能

#### 1. CourseSchedule.vue (排課設定)

**需要實作的功能：**

- [ ] 總課程時數輸入
- [ ] 上課天數輸入
- [ ] 開始/結束日期選擇器
- [ ] 星期選擇（多選）
- [ ] 上課時間設定（開始/結束時間）
- [ ] 自動計算排課日期
- [ ] 整合 FullCalendar 顯示

**參考範例資料：**

```javascript
{
  totalHours: 10,
  totalDays: 5,
  startDate: '2025-12-10',
  endDate: '2025-12-20',
  weekdays: [1, 3, 5], // 週一、三、五
  startTime: '14:00',
  endTime: '16:00',
  scheduledDates: ['2025-12-10', '2025-12-12', ...] // 自動計算
}
```

**使用的工具函數：**

- `calculateScheduledDates()` from `utils/dateUtils.js`
- `convertToCalendarEvents()` from `utils/dateUtils.js`

---

#### 2. CurriculumEditor.vue (課綱編輯器)

**需要實作的功能：**

- [ ] 顯示所有上課日期（根據 schedule）
- [ ] AI 自動生成每日課綱按鈕
- [ ] 顯示生成進度（X/總天數）
- [ ] 每日課綱卡片顯示：
  - 單元名稱
  - 學習目標（列表）
  - 教學內容
  - 小作業
- [ ] 手動編輯功能
- [ ] 單日重新生成按鈕
- [ ] 全部重新生成按鈕

**Gemini API 呼叫：**

```javascript
import { generateDayCurriculum } from '@/services/gemini'

const generateCurriculum = async day => {
  const courseInfo = {
    className: '小小 AI 魔法師',
    topic: '打造AI自學力...',
    audience: '國小5年級以上到國2生',
    category: 'children',
    totalDays: 5,
    hoursPerDay: 2
  }

  const result = await generateDayCurriculum(courseInfo, day)
  if (result.success) {
    // 儲存到 curriculum 陣列
  }
}
```

---

#### 3. InfographicGenerator.vue (資訊圖表生成)

**需要實作的功能：**

- [ ] 風格選擇器（4 種風格）
  - 手繪插畫風
  - 科技 AI 風
  - 日式漫畫風
  - 8-bit 遊戲風
- [ ] 為每日課程生成圖表按鈕
- [ ] 顯示生成進度
- [ ] 圖片網格顯示（含預覽）
- [ ] 單張圖片重新生成
- [ ] 下載功能
- [ ] 切換風格並重新生成

**Gemini Imagen API 呼叫：**

```javascript
import { generateImage } from '@/services/gemini'

const generateInfographic = async (day, curriculum) => {
  const { unitName, learningObjectives } = curriculum
  const result = await generateImage(
    unitName,
    learningObjectives,
    selectedStyle.value // 'hand-drawn', 'tech-ai', 'manga', '8bit'
  )

  if (result.success) {
    // 儲存圖片 URL
  }
}
```

**注意：** 目前 `generateImage()` 使用 placeholder 圖片，需要您後續整合真實的 Imagen API。

---

#### 4. PromotionEditor.vue (宣傳內容編輯)

**需要實作的功能：**

- [ ] AI 生成宣傳文案按鈕
- [ ] 顯示生成的文案（可編輯）
- [ ] 重新生成按鈕
- [ ] 字數統計
- [ ] 預覽效果

**Gemini API 呼叫：**

```javascript
import { generatePromotion } from '@/services/gemini'

const generatePromotionText = async () => {
  const courseInfo = {
    className: '小小 AI 魔法師',
    topic: '打造AI自學力...',
    audience: '國小5年級以上到國2生',
    category: 'children'
  }

  const result = await generatePromotion(courseInfo)
  if (result.success) {
    promotionText.value = result.data
  }
}
```

---

#### 5. CourseCalendar.vue (FullCalendar 整合)

**需要實作的功能：**

- [ ] 安裝並設定 FullCalendar
- [ ] 顯示課程事件
- [ ] 響應式設計（手機用 list view）
- [ ] 點擊事件顯示詳情

**FullCalendar 設定範例：**

```vue
<script setup>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'

const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,listWeek'
  },
  events: props.events,
  locale: 'zh-tw',
  buttonText: {
    today: '今天',
    month: '月',
    week: '週',
    list: '列表'
  }
}
</script>

<template>
  <FullCalendar :options="calendarOptions" />
</template>
```

---

### Phase 3: 課程列表與編輯

#### 6. CourseList.vue (課程列表頁)

**需要實作的功能：**

- [ ] 顯示所有課程（卡片式）
- [ ] 篩選功能（分類、日期）
- [ ] 搜尋功能
- [ ] 排序功能
- [ ] 刪除課程（含確認對話框）
- [ ] 點擊進入編輯頁

#### 7. CourseEdit.vue (課程編輯頁)

**需要實作的功能：**

- [ ] 載入現有課程資料
- [ ] 複用 CourseCreate 的所有元件
- [ ] 允許修改所有欄位
- [ ] 儲存變更
- [ ] Google 表單生成按鈕（僅兒童課程）

---

### Phase 4: Google 表單整合

#### 8. Google Forms API 完整實作

**需要完成的步驟：**

1. **Google Cloud Console 設定**

   - 建立專案
   - 啟用 Google Forms API
   - 建立 OAuth 2.0 憑證
   - 設定 OAuth 同意畫面

2. **前端整合**

   - 實作授權流程
   - 處理 access token
   - 呼叫 createForm API
   - 顯示表單連結

3. **表單內容**
   - 課程名稱與介紹
   - 每日課程圖片
   - 學生與家長資訊欄位
   - 年級與電腦使用時間選項

**參考檔案：** `src/services/googleForms.js`

---

## 🧪 測試資料

開發時可使用以下範例資料：

```javascript
const testCourseData = {
  basicInfo: {
    topic: '打造AI自學力: 用Gemini3+NotebookLM讓孩子學會整理、理解、複習',
    targetAudience: '國小5年級以上到國2生的家長',
    category: 'children',
    className: '小小 AI 學習魔法師',
    suggestedNames: [
      '小小 AI 學習魔法師',
      'Gemini 超能力養成班',
      '未來學霸訓練營'
    ]
  },
  schedule: {
    totalHours: 10,
    totalDays: 5,
    startDate: '2025-12-10',
    endDate: '2025-12-20',
    weekdays: [1, 3, 5],
    startTime: '14:00',
    endTime: '16:00'
  }
}
```

---

## 🔧 常見問題

### Q: Firebase 連線失敗？

**A:** 檢查 `.env` 檔案中的 Firebase 設定是否正確。可以在 Firebase Console 的專案設定中找到這些資訊。

### Q: Gemini API 呼叫失敗？

**A:**

1. 確認 API Key 是否正確
2. 檢查是否有 API 配額
3. 查看瀏覽器 Console 的錯誤訊息

### Q: 圖片生成失敗？

**A:** 目前使用 placeholder 圖片。真實的 Imagen API 需要特殊權限，請參考 Google AI Studio 文件。

---

## 📚 參考文件

- [Vue 3 文件](https://vuejs.org/)
- [Vite 文件](https://vitejs.dev/)
- [Tailwind CSS 文件](https://tailwindcss.com/)
- [FullCalendar 文件](https://fullcalendar.io/)
- [Firebase 文件](https://firebase.google.com/docs)
- [Google Gemini API](https://ai.google.dev/)
- [Google Forms API](https://developers.google.com/forms)

---

## 💡 開發建議

1. **逐步開發**：按照 Phase 順序完成功能
2. **頻繁測試**：每完成一個元件就測試
3. **使用 Toast**：善用 `toastStore` 給予使用者回饋
4. **錯誤處理**：所有 API 呼叫都要處理錯誤情況
5. **響應式設計**：確保在手機上也能正常使用

---

**祝開發順利！🎉**
