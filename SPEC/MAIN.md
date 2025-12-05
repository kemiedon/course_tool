# 課程規劃工具 - 專案規格書

## 專案概述

**專案名稱**: Course Planning Tool (課程規劃工具)  
**版本**: 1.0.0  
**建立日期**: 2025-12-05  
**目標用戶**: 課程規劃老師、教育機構

### 專案目的

提供一個完整的課程規劃解決方案，從課程設計、排程、視覺化到報名表單生成，協助教師快速規劃並推廣課程。

---

## 功能需求

### 1. 課程主題與客群設定

#### 1.1 使用者輸入

- **課程主題欄位**: 自由文字輸入框
  - 範例：打造 AI 自學力: 用 Gemini3+NotebookLM 讓孩子學會整理、理解、複習
- **目標客群欄位**: 自由文字輸入框
  - 範例：國小 5 年級以上到國 2 生的家長、國中生、職場工作者等
- **課程描述欄位**: 多行文字輸入框（必填）
  - 詳細說明課程會教哪些內容、使用哪些工具、學員可以學到什麼技能
  - 此描述將作為 AI 生成課綱的重要參考依據
  - 範例：本課程將教導學員使用 Gemini 3 和 NotebookLM 進行學習資料的整理與分析。學員將學會如何利用 AI 工具整理筆記、提取重點、製作摘要，並透過實際操作培養自主學習的能力。課程中會帶領學員完成多個實作專案，包括製作個人學習知識庫、自動生成複習筆記等。
- **課程分類選擇**:
  - 兒童課程（使用國中生可理解的語言）
  - 職訓課程（使用高中生以上可理解的語言）

#### 1.2 AI 班級名稱生成

- 根據「課程主題」、「目標客群」和「課程描述」，使用 Gemini 2.0 Flash Exp API 自動生成 3 個班級名稱建議
- **生成策略**（簡短精準、直擊痛點）:
  - 字數控制: 8-12 字
  - 焦慮解決型: 「X 天學會 Y」「零基礎變 Z 高手」
  - 成果展示型: 「做出 X 作品」「拿到 Y 證照」
  - 能力躍升型: 「從 X 到 Y」「突破 Z 關卡」
- 使用者可從 3 個建議中選擇一個，或自行修改
- **範例**:
  - 輸入: 主題「Python 程式設計」、客群「國小高年級」
  - AI 建議: 「AI 實戰營：5 天做出智能助手」、「Python 零基礎速成班」、「小創客證照特訓」

---

### 2. 課程基本設定

#### 2.1 課程時數與天數

- **總課程時數**: 數字輸入（單位：小時）
- **每日課程時數**: 數字輸入（單位：小時）
- **自動計算**: 預計課程天數 = 總時數 / 每日時數
  - 顯示計算結果卡片（帶圖示，主色調背景）

#### 2.2 排課設定

- **課程開始日期**: 日期選擇器（type="date"）
- **上課星期選擇**: 多選 Checkbox（週一至週日）
- **上課時間設定**:
  - 開始時間（type="time"）
  - 結束時間（type="time"）
  - 時間驗證：結束時間必須晚於開始時間
- **自動排程**: 根據選擇的星期重複循環，從開始日期排到達成預計天數為止

#### 2.3 課程日曆顯示

- 使用 **FullCalendar** 顯示完整課程時間表
- 視覺化呈現所有上課日期與時間
- 支援月視圖、週視圖、日視圖切換
- 整合 Coffee 暗色主題樣式
  - 背景色：base-200 (#322626)
  - 主色調：primary (#d4a574)
  - 邊框色：base-300 (#251e1e)
- 顯示預覽日期清單（日期格式：MM/DD）
- 可點擊查看單日課程詳情

---

### 3. 課綱生成

#### 3.1 AI 自動生成課綱

使用 Gemini 2.0 Flash Exp API 根據以下資訊生成課綱：

- 課程主題
- 課程描述（核心參考依據）
- 目標客群
- 課程分類（兒童/職訓）
- 總天數與每日時數
- 班級名稱

#### 3.2 課綱結構

每日課程包含以下欄位（JSON 格式回傳，轉換為 Markdown 顯示）：

- **第 X 天課程**
- **單元名稱**: 該日主題
- **學習目標**: 3-5 個學習目標（條列式）
- **教學內容**: 詳細教學步驟與內容說明（包含實作步驟）
- **小作業**: 課後練習或作業說明

#### 3.3 生成策略

- **緊扣課程描述**: 內容必須緊扣「課程描述」中提到的教學重點、工具和技能
- **循序漸進**: 第 1 天著重基礎概念與環境設定，後續天數逐步深入實作
- **目標明確**: 學習目標要明確可衡量（3-5 個）
- **實作導向**: 教學內容要詳細具體，包含實作步驟
- **鞏固學習**: 小作業要能鞏固當日學習，並與課程描述的目標一致

#### 3.4 語言風格

- **兒童課程**: 使用國中生可理解的語言，活潑有趣
- **職訓課程**: 使用高中生以上可理解的語言，專業清晰

#### 3.5 課綱編輯

- 一鍵生成所有課綱（批次生成）
- 顯示生成進度（已生成 X / 總共 Y 天）
- 生成後可逐日編輯修改
- 提供「重新生成」按鈕（針對單日）
- 編輯模式：Markdown 格式 textarea
- 顯示日期、時間、單元名稱

---

### 4. 資訊圖表生成

#### 4.1 圖表風格選擇

提供 4 種預設風格：

- 🎨 **手繪插畫風** (Hand-drawn Illustration)
- 🤖 **科技 AI 風** (Tech & AI Style)
- 🎌 **日式漫畫風** (Japanese Manga Style)
- 🎮 **8-bit 遊戲風** (8-bit Game Style)

#### 4.2 圖表生成規則

- **生成單位**: 以「天」為單位，每一天的課程生成一張資訊圖表
- **使用 API**: Google Gemini 3 Imagen API
- **圖表內容**: 基於該日的「單元名稱」和「學習目標」
- **圖片尺寸**: 建議 1200x630px（適合社群媒體分享）

#### 4.3 圖表預覽與管理

- 顯示所有已生成的圖表（網格或清單形式）
- 可針對單張圖表重新生成（切換風格或重新生成內容）
- 可下載個別圖表或批次下載

---

### 5. 課程宣傳內容生成

#### 5.1 宣傳介紹

- 使用 Gemini API 生成課程宣傳文案
- 內容包含：
  - 課程亮點（吸引家長/學員報名）
  - 適合對象
  - 課程特色
  - 學習成果
- 字數: 約 200-300 字

#### 5.2 編輯功能

- 可手動編輯 AI 生成的宣傳內容
- 提供「重新生成」按鈕

---

### 6. Google 報名表單生成（僅兒童課程）

#### 6.1 表單生成條件

- 僅當課程分類為「兒童課程」時顯示「生成報名表單」按鈕
- 需確認課綱與資訊圖表無誤後才能生成

#### 6.2 表單欄位

使用 Google Forms API 自動建立表單，包含以下欄位：

| 欄位名稱                 | 類型       | 說明                   |
| ------------------------ | ---------- | ---------------------- |
| **課程名稱**             | 標題       | 自動帶入班級名稱       |
| **課程介紹**             | 說明文字   | 自動帶入宣傳內容       |
| **每日課程圖片**         | 圖片       | 插入所有日期的資訊圖表 |
| **學生姓名**             | 簡答       | 必填                   |
| **年級選擇**             | 下拉式選單 | 必填，選項如下         |
| **家長姓名**             | 簡答       | 必填                   |
| **聯絡電話**             | 簡答       | 必填                   |
| **Email**                | 簡答       | 必填，Email 格式驗證   |
| **一週在家使用電腦時間** | 單選       | 必填，選項如下         |

#### 6.3 年級選擇選項

- 幼兒園
- 國小一年級
- 國小二年級
- 國小三年級
- 國小四年級
- 國小五年級
- 國小六年級
- 國中一年級
- 國中二年級
- 國中三年級

#### 6.4 電腦使用時間選項

- 1 小時以下
- 1-2 小時
- 2-3 小時
- 3-4 小時
- 4-5 小時
- 5 小時以上

#### 6.5 表單生成結果

- 顯示表單連結（可複製）
- 提供「開啟表單」按鈕（新視窗開啟）
- 儲存表單 ID 至 Firebase

---

## 技術規格

### 前端技術棧

| 技術             | 版本 | 用途         |
| ---------------- | ---- | ------------ |
| **Vue.js**       | 3.x  | 核心框架     |
| **Vite**         | 5.x  | 建構工具     |
| **Tailwind CSS** | 3.x  | UI 樣式框架  |
| **jQuery**       | 3.x  | DOM 操作輔助 |
| **FullCalendar** | 6.x  | 課程日曆顯示 |
| **Font Awesome** | 6.x  | 圖示庫       |

### 後端與服務

| 服務                         | 用途                                    |
| ---------------------------- | --------------------------------------- |
| **Firebase Firestore**       | 資料庫（課程資料、課綱、設定）          |
| **Firebase Authentication**  | 使用者驗證                              |
| **Firebase Storage**         | 圖片儲存                                |
| **Google Gemini API**        | AI 文字生成（班級名稱、課綱、宣傳內容） |
| **Google Gemini Imagen API** | AI 圖片生成                             |
| **Google Forms API**         | 自動建立報名表單                        |

### API 整合說明

#### Gemini API

- **版本**: Gemini 2.0 Flash Exp (gemini-2.0-flash-exp)
- **呼叫方式**: 前端直接呼叫
- **API Key**: 儲存於環境變數 `.env` (`VITE_GEMINI_API_KEY`)
- **功能**:
  - 文字生成（班級名稱、課綱、宣傳內容）
  - 圖片生成（Imagen 3，待實作）
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`

#### Firebase

- **資料庫**: Firestore
- **認證**: Firebase Authentication
- **儲存**: Firebase Storage（圖片上傳）
- **配置**: 儲存於環境變數 `.env`
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

#### Google Forms API

- **呼叫方式**: 前端呼叫（需 OAuth 2.0 認證）
- **認證資訊**: 儲存於 `.env`
- **功能**: 自動建立表單並插入內容（僅兒童課程）

---

## 資料庫結構 (Firebase Firestore)

### Collection: `courses`

```javascript
{
  courseId: "auto-generated-id",
  userId: "user-uid",
  createdAt: Timestamp,
  updatedAt: Timestamp,

  // 基本資訊
  basicInfo: {
    topic: "課程主題",
    targetAudience: "目標客群",
    description: "課程描述（詳細說明課程內容、工具、技能）",
    category: "children" | "vocational", // 兒童課程 | 職訓課程
    className: "選擇的班級名稱",
    suggestedNames: ["建議1", "建議2", "建議3"]
  },

  // 課程設定
  schedule: {
    totalHours: 10,
    hoursPerDay: 2,
    startDate: "2025-12-10",
    weekDays: [1, 3, 5], // 週一、三、五
    startTime: "14:00",
    endTime: "16:00",
    scheduledDates: ["2025-12-10", "2025-12-12", ...] // 計算後的所有上課日期
  },

  // 課綱
  curriculum: [
    {
      date: "2025-12-10",
      content: "Markdown 格式的課綱內容（包含單元名稱、學習目標、教學內容、小作業）"
    },
    // ... 其他天數
  ],

  // 資訊圖表
  infographics: {
    style: "hand-drawn" | "tech-ai" | "manga" | "8bit",
    images: [
      {
        day: 1,
        imageUrl: "firebase-storage-url",
        generatedAt: Timestamp
      },
      // ... 其他天數
    ]
  },

  // 宣傳內容
  promotion: {
    content: "課程宣傳介紹文案...",
    characterCount: 285
  },

  // Google 表單（僅兒童課程）
  googleForm: {
    formId: "google-form-id",
    formUrl: "https://forms.google.com/...",
    createdAt: Timestamp
  }
}
```

---

## UI/UX 設計規範

### 主題設計 - Coffee Dark Theme (DaisyUI)

#### 色彩系統

- **Base 背景色**:

  - `base-100`: #3d2f2f（主背景）
  - `base-200`: #322626（卡片背景）
  - `base-300`: #251e1e（邊框色）
  - `base-content`: #d4a574（文字色）

- **主色調**:
  - `primary`: #d4a574（主要操作色、重點標示）
  - `primary-content`: #221a15（primary 上的文字）
- **輔助色**:
  - `secondary`: #3e5a5e（次要操作）
  - `accent`: #4a6fa5（強調）
  - `info`: #7dd3fc（資訊提示）
  - `success`: #84cc16（成功狀態）
  - `warning`: #fbbf24（警告）
  - `error`: #fb7185（錯誤）

#### 元件樣式標準

**按鈕 (Button)**:

- 最小尺寸: 44x44px（符合可用性標準）
- Padding: px-4 py-2
- 圓角: rounded-lg
- 過渡動畫: transition-all duration-200
- 按下效果: active:scale-95
- Disabled 狀態: opacity-50 + cursor-not-allowed

**輸入框 (Input/Textarea/Select)**:

- 最小高度: 48px
- Padding: px-4 py-3
- 邊框: border-2 border-base-300
- 背景: bg-base-200
- 文字: text-base-content (16px)
- Focus 狀態: ring-2 ring-primary + border-primary
- 圓角: rounded-lg
- Placeholder: opacity-40
- Textarea 最小高度: 120px，可垂直調整

**Label**:

- 字體大小: 1rem (16px)
- 粗體: font-bold
- 間距: mb-2
- 顏色: text-base-content

**卡片 (Card)**:

- 背景: bg-base-200
- 邊框: border border-base-300
- 圓角: rounded-box (1rem)
- Padding: p-6
- 陰影: shadow-md

### 色彩與對比

- **背景色**: Coffee 暗色主題（base-100: #3d2f2f）
- **文字色**: 確保文字與背景對比度達 WCAG AA 標準（至少 4.5:1）
- **主色調**: Coffee primary (#d4a574) 作為主要操作色

### jQuery UI Datepicker 主題

- 整合 Coffee 主題樣式：
  - 背景：bg-base-200
  - 邊框：border-base-300
  - 標題列：bg-base-300
  - 今天：bg-secondary
  - 選中日期：bg-primary
  - 週末：text-accent
  - Focus 狀態：ring-primary

### 觸控目標尺寸

- **最小觸控目標**: 44x44px（符合 WCAG 2.1 Level AAA 標準）
- **按鈕**: 48x48px 以上
- **輸入框**: 48px 高度以上
- **間距**: 元件之間至少 8px 間距

### 響應式設計

- **斷點設定**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **元件適配**: 使用 Tailwind 的響應式工具類（md:, lg:）
- **日曆視圖**: 行動裝置顯示日視圖，桌面顯示月視圖

---

## 技術棧

### 前端框架與工具

- **框架**: Vue 3.4.0 (Composition API)
- **建構工具**: Vite 5.x
- **樣式**: Tailwind CSS 3.x + DaisyUI（Coffee 主題）
- **狀態管理**: Pinia
- **路由**: Vue Router 4.x
- **日期處理**: 原生 Date 對象 + 自訂 dateUtils
- **圖示**: Font Awesome 6.5.1
- **日曆**: FullCalendar 6.x
- **HTTP 客戶端**: Axios

### 後端服務

- **資料庫**: Firebase Firestore
- **認證**: Firebase Authentication
- **儲存**: Firebase Storage
- **AI 服務**: Google Gemini 2.0 Flash Exp API
- **表單**: Google Forms API（待整合）

### 開發工具

- **套件管理**: npm
- **版本控制**: Git
- **開發伺服器**: Vite Dev Server (localhost:5173)
- **程式碼編輯器**: VS Code

### 套件使用規範

#### CDN 優先原則

- **jQuery 相關套件**: 所有 jQuery、jQuery UI 及其插件（如 Timepicker Addon）**必須使用 CDN**，不可透過 npm 安裝
  - jQuery UI 的檔案結構不適合現代打包工具（如 Vite）
  - CDN 提供穩定、快速的全球分發
  - 避免打包體積增加和路徑解析問題
- **CDN 載入位置**: 在 `index.html` 的 `<head>` 中載入，於 Vue app 初始化前完成
- **當前使用的 CDN 套件**:

  ```html
  <!-- jQuery Core -->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

  <!-- jQuery UI (Swanky Purse Theme) -->
  <link
    rel="stylesheet"
    href="https://code.jquery.com/ui/1.13.2/themes/swanky-purse/jquery-ui.css"
  />
  <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>

  <!-- jQuery UI Timepicker Addon -->
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/jquery-ui-timepicker-addon/1.6.3/jquery-ui-timepicker-addon.min.css"
  />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-ui-timepicker-addon/1.6.3/jquery-ui-timepicker-addon.min.js"></script>
  ```

- **全域訪問**: CDN 載入的 jQuery 透過 `window.$` 和 `window.jQuery` 在 Vue 元件中使用
- **禁止在 main.js 或元件中 import jQuery**: 避免與 CDN 版本衝突

#### NPM 套件管理

- **Vue 生態系套件**: 使用 npm 安裝（Vue、Vue Router、Pinia 等）
- **現代打包友好的套件**: 使用 npm 安裝（Axios、FullCalendar、Tailwind CSS 等）
- **Firebase SDK**: 使用 npm 安裝，官方推薦方式

---

## 工具函數

### dateUtils.js

```javascript
// 計算排課日期
export const calculateScheduledDates = (startDate, weekDays, totalDays) => {
  const dates = []
  let currentDate = new Date(startDate)

  while (dates.length < totalDays) {
    const dayOfWeek = currentDate.getDay()
    if (weekDays.includes(dayOfWeek)) {
      dates.push(currentDate.toISOString().split('T')[0])
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

// 轉換為 FullCalendar 事件格式
export const convertToCalendarEvents = (
  dates,
  startTime,
  endTime,
  className
) => {
  return dates.map(date => ({
    title: className,
    start: `${date}T${startTime}`,
    end: `${date}T${endTime}`,
    backgroundColor: '#d4a574',
    borderColor: '#d4a574'
  }))
}
```

### validators.js

```javascript
// 必填驗證
export const required = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName}為必填欄位`
  }
  return null
}

// 時間驗證
export const validateTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return null
  if (endTime <= startTime) {
    return '結束時間必須晚於開始時間'
  }
  return null
}
```

---

## 附錄

### A. Gemini API Prompt 範例

#### 班級名稱生成（已優化）

```javascript
const prompt = `你是一位教育行銷專家。請生成 3 個簡短有力、直擊痛點的課程班級名稱：

課程資訊：
- 課程主題: ${topic}
- 目標客群: ${audience}

命名原則：
1. **簡短精準**：控制在 8-12 字，去除冗詞贅字
2. **直擊痛點**：用一個核心痛點詞彙（落後→領先、不會→精通、迷茫→突破）
3. **具體成果**：明確說出能獲得什麼（技能、證書、作品、能力）
4. **易記易傳**：口語化、有節奏感、朗朗上口

三種風格（每個只用一個痛點詞+一個成果詞）：
- 第1個：焦慮解決型 →「X天學會Y」「零基礎變Z高手」
- 第2個：成果展示型 →「做出X作品」「拿到Y證照」  
- 第3個：能力躍升型 →「從X到Y」「突破Z關卡」

範例（注意簡短）：
- "AI實戰營：5天做出智能助手"（8字核心+成果）
- "Python零基礎速成班"（9字解決焦慮）
- "小創客證照特訓"（7字能力+認證）

請以 JSON 格式回應：
{
  "suggestions": ["名稱1", "名稱2", "名稱3"]
}
`
```

#### 課綱生成（已優化）

```javascript
const prompt = `請根據以下課程資訊，生成第 ${day} 天的完整課綱：

課程資訊：
- 班級名稱: ${className}
- 課程主題: ${topic}
- 課程描述: ${description}
- 目標客群: ${audience}
- 課程分類: ${category === 'children' ? '兒童課程' : '職訓課程'}
- 總天數: ${totalDays}
- 每日時數: ${hoursPerDay} 小時

要求：
- ${languageStyle}
- 內容必須緊扣「課程描述」中提到的教學重點、工具和技能
- 內容要符合第 ${day} 天的學習進度（循序漸進）
- 第1天著重基礎概念與環境設定，後續天數逐步深入實作
- 學習目標要明確可衡量（3-5個）
- 教學內容要詳細具體，包含實作步驟
- 小作業要能鞏固當日學習，並與課程描述的目標一致

請以 JSON 格式回應：
{
  "unitName": "單元名稱",
  "learningObjectives": ["目標1", "目標2", "目標3"],
  "teachingContent": "詳細教學內容...",
  "homework": "小作業說明..."
}
`
```

- **主色調**: Coffee primary (#d4a574) 作為主要操作色
- **成功色**: 綠色（#10B981）
- **警告色**: 黃色（#F59E0B）
- **錯誤色**: 紅色（#EF4444）

### 按鈕設計

- **最小點擊區域**: 44x44px（遵循 Apple HIG）
- **按鈕樣式**:
  - 主要按鈕: 填滿色 + 圓角 8px + 陰影
  - 次要按鈕: 邊框 + 透明背景
  - 危險按鈕: 紅色系
- **hover 狀態**: 顏色加深 + 輕微放大（scale: 1.02）
- **disabled 狀態**: 降低透明度至 50% + 禁用游標

### 表單設計

- **標籤**: 位於輸入框上方，粗體，14px
- **輸入框**:
  - 高度: 最小 44px
  - 邊框: 1px solid #D1D5DB
  - focus 狀態: 藍色邊框 + 陰影
  - 圓角: 6px
- **錯誤提示**: 紅色文字，位於輸入框下方
- **必填標記**: 紅色星號（\*）

### 響應式設計

- **斷點**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **FullCalendar**: 手機版使用 list view，桌面版使用 month view

### 載入狀態

- 使用 loading spinner 或 skeleton screen
- 顯示載入進度（如圖片生成進度）
- 防止重複提交（按鈕 disabled）

---

## 使用者流程

### 主要流程圖

```
1. 登入系統
   ↓
2. 建立新課程
   ↓
3. 輸入課程主題 + 目標客群 + 選擇分類
   ↓
4. AI 生成 3 個班級名稱建議 → 選擇或修改
   ↓
5. 設定課程時數、天數
   ↓
6. 設定排課（日期、星期、時間）
   ↓
7. 預覽 FullCalendar 課程表
   ↓
8. 確認後，AI 自動生成課綱
   ↓
9. 檢視/編輯課綱內容
   ↓
10. 選擇資訊圖表風格
    ↓
11. 生成每日資訊圖表（顯示進度）
    ↓
12. AI 生成課程宣傳介紹
    ↓
13. 預覽所有內容（課綱 + 圖表 + 宣傳）
    ↓
14. [僅兒童課程] 生成 Google 報名表單
    ↓
15. 完成！儲存課程 + 複製表單連結
```

---

## 環境變數設定

建立 `.env` 檔案，包含以下變數：

```env
# Firebase 設定
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Google Gemini API
VITE_GEMINI_API_KEY=your-gemini-api-key

# Google Forms API (OAuth 2.0)
VITE_GOOGLE_CLIENT_ID=your-client-id
VITE_GOOGLE_CLIENT_SECRET=your-client-secret
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/callback
```

---

## 專案結構

```
course_tool/
├── public/
├── src/
│   ├── assets/          # 靜態資源
│   ├── components/      # Vue 元件
│   │   ├── course/
│   │   │   ├── CourseBasicInfo.vue      # 課程基本資訊
│   │   │   ├── ClassNameGenerator.vue   # 班級名稱生成
│   │   │   ├── CourseSchedule.vue       # 排課設定
│   │   │   ├── CurriculumEditor.vue     # 課綱編輯器
│   │   │   ├── InfographicGenerator.vue # 圖表生成
│   │   │   └── PromotionEditor.vue      # 宣傳內容編輯
│   │   ├── calendar/
│   │   │   └── CourseCalendar.vue       # FullCalendar 元件
│   │   └── common/
│   │       ├── LoadingSpinner.vue
│   │       ├── ConfirmDialog.vue
│   │       └── ToastNotification.vue
│   ├── views/           # 頁面
│   │   ├── Home.vue
│   │   ├── CourseCreate.vue
│   │   ├── CourseEdit.vue
│   │   └── CourseList.vue
│   ├── services/        # API 服務
│   │   ├── firebase.js
│   │   ├── gemini.js
│   │   └── googleForms.js
│   ├── utils/           # 工具函數
│   │   ├── dateUtils.js
│   │   └── validators.js
│   ├── router/          # Vue Router
│   ├── stores/          # Pinia 狀態管理
│   ├── App.vue
│   └── main.js
├── .env
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 開發階段規劃

### Phase 1: 基礎架構（Week 1）

- [ ] 專案初始化（Vue + Vite + Tailwind）
- [ ] Firebase 設定與連接
- [ ] 路由與基本頁面結構
- [ ] 使用者認證功能

### Phase 2: 課程基本功能（Week 2）

- [ ] 課程主題與客群輸入
- [ ] Gemini API 整合（班級名稱生成）
- [ ] 課程時數與天數設定
- [ ] 排課邏輯實作

### Phase 3: 日曆與課綱（Week 3）

- [ ] FullCalendar 整合與顯示
- [ ] AI 課綱生成
- [ ] 課綱編輯器
- [ ] 課綱資料儲存

### Phase 4: 視覺化與宣傳（Week 4）

- [ ] Gemini Imagen API 整合
- [ ] 資訊圖表生成與管理
- [ ] 風格切換功能
- [ ] 課程宣傳內容生成

### Phase 5: Google 表單整合（Week 5）

- [ ] Google Forms API 整合
- [ ] OAuth 2.0 認證流程
- [ ] 表單自動建立與欄位設定
- [ ] 表單連結顯示與管理

### Phase 6: UI/UX 優化與測試（Week 6）

- [ ] 響應式設計調整
- [ ] 無障礙功能優化
- [ ] 錯誤處理與使用者回饋
- [ ] 整體測試與 Bug 修復

---

## 注意事項與限制

### API 使用限制

- **Gemini API**: 注意請求頻率限制與配額
- **Google Forms API**: 每日建立表單數量限制
- **Firebase**: 注意 Firestore 讀寫次數與儲存空間

### 安全性考量

- API Key 不可暴露於前端（使用 `.env` 並加入 `.gitignore`）
- Firebase Security Rules 需正確設定
- 使用者輸入需進行驗證與清理（防 XSS）

### 效能優化

- 圖片生成採用非同步處理，顯示進度條
- 大量資料使用分頁或虛擬滾動
- 圖片使用 lazy loading

### 瀏覽器相容性

- 支援現代瀏覽器（Chrome, Firefox, Safari, Edge）
- 最低支援版本: Chrome 90+, Firefox 88+, Safari 14+

---

## 未來擴充功能（Optional）

- [ ] 多語言支援（i18n）
- [ ] 課程範本庫
- [ ] 課程複製與匯入/匯出
- [ ] 學員管理功能
- [ ] 課程評價與回饋系統
- [ ] 課程衝突檢查
- [ ] Email 通知（課程提醒）
- [ ] 報表與數據分析
- [ ] 多人協作編輯
- [ ] 版本控制（課綱歷史記錄）

---

## 聯絡資訊

**專案負責人**: [您的名字]  
**Email**: [您的 Email]  
**文件版本**: 1.0.0  
**最後更新**: 2025-12-05

---

## 附錄

### A. Gemini API Prompt 範例

#### 班級名稱生成

```
請根據以下資訊，生成 3 個吸引目標客群的課程班級名稱：
- 課程主題: {topic}
- 目標客群: {audience}

要求：
- 名稱要吸引人且具創意
- 符合目標客群的年齡與興趣
- 長度控制在 15 字以內
- 3 個名稱風格要有差異

請以 JSON 格式回應：
{
  "suggestions": ["名稱1", "名稱2", "名稱3"]
}
```

#### 課綱生成

```
請為以下課程生成第 {day} 天的完整課綱：

課程資訊：
- 班級名稱: {className}
- 課程主題: {topic}
- 目標客群: {audience}
- 課程分類: {category}
- 總天數: {totalDays}
- 每日時數: {hoursPerDay}

要求：
- 語言風格: {category === 'children' ? '國中生可理解' : '高中生以上可理解'}
- 內容要符合該天的學習進度
- 學習目標要明確可衡量

請以 JSON 格式回應：
{
  "unitName": "單元名稱",
  "learningObjectives": ["目標1", "目標2", "目標3"],
  "teachingContent": "詳細教學內容...",
  "homework": "小作業說明..."
}
```

#### 資訊圖表生成

```
Generate an infographic image for a course lesson with the following details:
- Unit Name: {unitName}
- Learning Objectives: {objectives}
- Style: {style} (hand-drawn illustration / tech & AI / Japanese manga / 8-bit game)

The image should be visually appealing, suitable for {audience}, and clearly represent the learning content.
Size: 1200x630px
```

### B. Google Forms API 欄位設定參考

```javascript
const formStructure = {
  info: {
    title: courseName,
    documentTitle: courseName,
  },
  items: [
    {
      title: "課程介紹",
      description: promotionText,
      questionItem: null, // 僅顯示說明
    },
    // 插入圖片
    ...infographics.map(img => ({
      title: `第 ${img.day} 天課程`,
      imageItem: { image: { sourceUri: img.url } }
    })),
    // 表單欄位
    { title: "學生姓名", questionItem: { question: { required: true, textQuestion: {} } } },
    { title: "年級選擇", questionItem: { question: { required: true, choiceQuestion: { options: [...] } } } },
    // ... 其他欄位
  ]
}
```

---

**文件結束**
