import axios from 'axios'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleGenAI } from '@google/genai'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

// 初始化 Google AI 客戶端（舊版文字生成）
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

// 初始化新版 Google GenAI 客戶端（圖片生成）
const genAINew = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

// Gemini 文字生成 API
export const generateText = async (prompt, config = {}) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_BASE}/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: config.temperature || 0.7,
          topK: config.topK || 40,
          topP: config.topP || 0.95,
          maxOutputTokens: config.maxOutputTokens || 2048,
        }
      }
    )
    
    const text = response.data.candidates[0].content.parts[0].text
    return { success: true, data: text }
  } catch (error) {
    console.error('Gemini API 錯誤:', error)
    return { success: false, error: error.message }
  }
}

// 生成班級名稱建議
export const generateClassNames = async (topic, audience, keywords = '') => {
  // 建構關鍵字提示
  const keywordsPrompt = keywords ? `- 關鍵字: ${keywords}（必須自然融入名稱中）\n` : ''
  const keywordsRule = keywords ? '\n5. **關鍵字融入**: 必須自然地將關鍵字融入名稱中，讓名稱讀起來流暢' : ''
  
  const prompt = `你是一位教育行銷專家。請生成 3 個簡短有力、直擊痛點的課程班級名稱：

課程資訊：
- 課程主題: ${topic}
- 目標客群: ${audience}
${keywordsPrompt}
命名原則：
1. **簡短精準**：控制在 8-12 字，去除冗詞贅字
2. **直擊痛點**：用一個核心痛點詞彙（落後→領先、不會→精通、迷茫→突破）
3. **具體成果**：明確說出能獲得什麼（技能、證書、作品、能力）
4. **易記易傳**：口語化、有節奏感、朗朗上口${keywordsRule}

三種風格（每個只用一個痛點詞+一個成果詞）：
- 第1個：焦慮解決型 →「X天學會Y」「零基礎變Z高手」
- 第2個：成果展示型 →「做出X作品」「拿到Y證照」  
- 第3個：能力躍升型 →「從X到Y」「突破Z關卡」

範例（注意簡短）：
${keywords ? `有關鍵字範例（關鍵字：${keywords}）：
- "NotebookLM筆記魔法師：AI實戰"（融入關鍵字）
- "AI學習力：NotebookLM零基礎班"（自然融入）
- "NotebookLM+AI突破營"（簡潔有力）
` : `無關鍵字範例：
- "AI實戰營：5天做出智能助手"（8字核心+成果）
- "Python零基礎速成班"（9字解決焦慮）
- "小創客證照特訓"（7字能力+認證）
`}
請以 JSON 格式回應：
{
  "suggestions": ["名稱1", "名稱2", "名稱3"]
}`

  const result = await generateText(prompt)
  if (result.success) {
    try {
      // 清理 markdown 格式
      let jsonText = result.data.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(jsonText)
      return { success: true, data: parsed.suggestions }
    } catch (e) {
      console.error('解析 JSON 失敗:', e)
      return { success: false, error: '無法解析 AI 回應' }
    }
  }
  return result
}

// 生成單日課綱
export const generateDayCurriculum = async (courseInfo, day) => {
  const { className, topic, description, audience, category, totalDays, hoursPerDay } = courseInfo
  const languageStyle = category === 'children' ? '使用國中生可理解的語言，活潑有趣' : '使用高中生以上可理解的語言，專業清晰'
  
  const prompt = `請根據以下課程資訊，生成第 ${day} 天的完整課綱，並依照 120 分鐘活動節奏分段設計：

課程資訊：
- 班級名稱: ${className}
- 課程主題: ${topic}
- 課程描述: ${description}
- 目標客群: ${audience}
- 課程分類: ${category === 'children' ? '兒童課程' : '職訓課程'}
- 總天數: ${totalDays}
- 每日時數: ${hoursPerDay} 小時

請務必依照下列「120 分鐘課程活動設計」分段，明確標註每個時段的重點與建議活動：
---
0–10 分鐘：進場、設備測試、暖身互動（打招呼、用投票/聊天室連結上節課或課前任務，讓學生進入狀態）
10–40 分鐘：教學區塊 A（老師短講＋示範＋個人小練習＋全班即時講解）
40–45 分鐘：休息 1（離開螢幕、伸展、喝水，提醒回來時間）
45–75 分鐘：教學區塊 B（分組活動或討論＋小組分享與統整）
75–80 分鐘：休息 2（腦力/肢體小遊戲、猜謎、氣氛活化）
80–110 分鐘：教學區塊 C（整合應用、迷你專題或作品發表）
110–120 分鐘：收尾整理＋回饋與說明課後任務（重點整理、小投票/回饋、下次預告）
---
此節奏把長時間切成 3 段，每段 25–30 分鐘實作為主，搭配 5 分鐘休息，接近「番茄鐘」型式，對注意力較短的學童與國中生特別有幫助。

要求：
- ${languageStyle}
- 內容必須緊扣「課程描述」中提到的教學重點、工具和技能
- 內容要符合第 ${day} 天的學習進度（循序漸進）
- 第1天著重基礎概念與環境設定，後續天數逐步深入實作
- 學習目標要明確可衡量（3-5個）
- 教學內容要詳細具體，包含每個分段的活動與實作步驟
- 小作業要能鞏固當日學習，並與課程描述的目標一致

請以 JSON 格式回應：
{
  "unitName": "單元名稱",
  "learningObjectives": ["目標1", "目標2", "目標3"],
  "teachingContent": {
    "0-10": "...",
    "10-40": "...",
    "40-45": "...",
    "45-75": "...",
    "75-80": "...",
    "80-110": "...",
    "110-120": "..."
  },
  "homework": "小作業說明..."
}`

  const result = await generateText(prompt)
  if (result.success) {
    try {
      let jsonText = result.data.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(jsonText)
      return { success: true, data: parsed }
    } catch (e) {
      console.error('解析 JSON 失敗:', e)
      return { success: false, error: '無法解析 AI 回應' }
    }
  }
  return result
}

// 生成課程宣傳內容（根據課綱重點）- v1.6.3 更新語氣與架構
export const generatePromotion = async (courseInfo, curriculum = [], schedule = null, courseFee = null) => {
  const { className, topic, audience, category, description } = courseInfo
  
  // 格式化課程日期與時間資訊
  let scheduleInfo = ''
  let startDateFormatted = ''
  let timeFormatted = ''
  let totalDays = 0
  let totalHoursFormatted = ''
  
  if (schedule) {
    const { startDate, scheduledDates = [], startTime, endTime, hoursPerDay, totalHours } = schedule
    
    // 格式化開始日期 - 使用更簡潔的格式 (YYYY / MM / DD)
    if (startDate) {
      const date = new Date(startDate)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      startDateFormatted = `${year} / ${month} / ${day}`
    }
    
    // 格式化上課時間
    timeFormatted = startTime && endTime ? `${startTime} - ${endTime}` : ''
    
    // 計算課程總天數和時數
    totalDays = scheduledDates.length || 0
    totalHoursFormatted = `${totalHours || 0} 小時`
    
    scheduleInfo = `\n\n課程時間資訊：
- 開課日期: ${startDateFormatted}
- 上課時間: ${timeFormatted}
- 課程天數: ${totalDays} 天
- 總課程時數: ${totalHoursFormatted}`
  }
  
  // 從課綱提取學習目標
  let mainLearningObjectives = []
  
  if (curriculum && curriculum.length > 0) {
    curriculum.forEach((item, index) => {
      if (item.content) {
        // 提取所有學習目標
        const objectivesMatch = item.content.match(/##\s+學習目標\n((?:- .+\n?)+)/)
        
        if (objectivesMatch) {
          const objectivesList = objectivesMatch[1]
            .split('\n')
            .filter(o => o.trim())
            .map(o => o.replace(/^-\s*/, '').trim())
          mainLearningObjectives.push(...objectivesList)
        }
      }
    })
    
    // 提取前4-5個主要學習目標
    mainLearningObjectives = mainLearningObjectives.slice(0, 5)
  }
  
  // 格式化主要學習目標為 ✅ 格式
  const learningObjectivesText = mainLearningObjectives.length > 0 
    ? `\n\n主要學習目標：\n${mainLearningObjectives.map(obj => `✅ ${obj}`).join('\n')}`
    : ''
  
  const prompt = `你是一位深諳家長心理的教育文案專家。請參考以下範本的語氣與架構，為這門課程撰寫宣傳文案。

【參考範本 - 語氣與架構】
如果你開始擔心：未來只會更競爭，孩子準備好了嗎？

現在的孩子不是不聰明，而是不知道怎麼學才有效。
筆記抄了一堆、考前狂背，成績卻起伏很大，久了連自信都被磨掉。

AI 已經不是未來，而是孩子現在就會用到的學習工具。
重點不是「會不會用 AI」，而是——
👉 會不會用 AI 幫自己學習、整理、複習與檢查盲點。

這門課不是教孩子玩 AI，
而是教他把 AI 變成「會陪他讀書的小助教」。

課程中，孩子會一步步學會：

✅ 用 AI 幫自己抓重點，不再整頁照抄卻看不懂
✅ 把課本內容變成「會互動的測驗」，邊玩邊複習
✅ 知道怎麼「問對問題」，讓 AI 給出有用的學習回饋
✅ 從被動寫作業，轉為能主動檢查自己學會了沒

這些能力，會直接影響孩子
✔ 讀書效率
✔ 考前壓力
✔ 長期的自學能力與信心

透過大量實作與引導，
讓孩子真正把 AI 用在「學習本身」，
而不是只是看熱鬧、跟風玩工具。

📅 體驗日期：2026 / 01 / 03
🕘 課程時數：1 小時
👨‍💻 上課方式：線上(Discord線上教室)
👨‍👩‍👧‍👦 適合對象：
✅ 國小高年級～國中二年級
✅ 已經開始感受到考試與課業壓力
✅ 願意嘗試不同學習方式、不只死背的孩子

如果你希望孩子
不是只會照著大人安排念書，
而是慢慢學會為自己的學習負責，
這門課，會是一個很好的開始。

---

【本課程資訊】
- 班級名稱: ${className}
- 課程主題: ${topic}
- 課程描述: ${description}
- 目標客群: ${audience}
${scheduleInfo}
${courseFee ? `- 課程費用: ${courseFee}` : ''}
${learningObjectivesText}

【撰寫要求】
1. **完全參考範本的語氣**：
   - 用家長的擔心作為開頭
   - 描述孩子目前的學習困境（具體、有畫面）
   - 點出關鍵問題不是工具本身，而是如何運用
   - 說明這門課的定位與差異
   
2. **必須包含的實際資訊**（使用 emoji 圖示）：
   📅 開課日期：${startDateFormatted}
   🕘 課程時數：${totalHoursFormatted}
   ${courseFee ? `💰 課程費用：${courseFee}` : ''}
   👨‍💻 上課方式：(請根據課程描述判斷，如：線上/實體/混合)
   👨‍👩‍👧‍👦 適合對象：(請根據目標客群 "${audience}" 改寫為 3 個 ✅ 條列)

3. **學習成果描述**：
   - 將提取的學習目標改寫為「孩子會一步步學會」的格式
   - 使用 ✅ 開頭
   - 每個目標都要具體、可操作、有畫面感

4. **結尾語氣**：
   - 溫暖鼓勵
   - 強調孩子的成長與改變
   - 邀請家長一起參與這個學習轉變

5. **整體要求**：
   - 語氣要像在跟家長聊天，不是在推銷
   - 文字要有溫度、有同理心
   - 避免行銷術語，用具體情境取代
   - 每個段落之間適當空行，增加可讀性

請直接輸出完整宣傳文案（不需要標題，直接從擔心開始寫）：`

  const result = await generateText(prompt, { maxOutputTokens: 1024, temperature: 0.85 })
  return result
}

// ===== Imagen 4.0 圖片生成 - Roadmap 風格 =====
// Gemini Imagen 4.0 API 圖片生成 - Roadmap 風格
export const generateImageWithImagen3 = async (unitName, objectives, style, infographicSummary = null, courseCategory = 'children') => {
  // 根據課程分類和風格定義視覺風格
  const isChildren = courseCategory === 'children'
  
  const styleDescriptions = {
    'hand-drawn': {
      children: '可愛童趣的手繪插畫風格，使用柔和線條、粉彩暖色調、圓潤可愛圖案、微笑的卡通角色，充滿溫馨童趣感',
      vocational: '專業手繪插畫風格，結合商務氣息與藝術感，使用精緻線條、現代配色、專業圖示，既友善又專業'
    },
    'tech-ai': {
      children: '未來科技風但保持可愛，使用圓潤幾何圖形、繽紛漸層色彩、可愛機器人和太空元素，充滿趣味科技感',
      vocational: '高科技專業風格，使用銳利幾何圖形、科技藍紫漸層、未來感介面元素、3D效果，展現專業與創新'
    },
    'manga': {
      children: '活力日系漫畫風格，使用鮮豔色彩、Q版大頭身比例、對話框、可愛表情、動態線條，充滿活潑能量',
      vocational: '成熟日系漫畫風格，使用現代配色、寫實比例角色、專業場景、簡潔對話框，兼具動感與專業'
    },
    '8bit': {
      children: '復古可愛像素遊戲風格，使用像素化圖形、明亮遊戲配色、可愛像素角色、遊戲道具，充滿懷舊趣味',
      vocational: '復古專業像素風格，使用像素化圖形、商務配色、專業像素圖示、復古遊戲介面，展現創意與經典'
    }
  }
  
  const visualStyle = styleDescriptions[style][isChildren ? 'children' : 'vocational']

  // 整理視覺化內容 - 只使用標題、學習目標、小作業
  let visualContent = {
    title: unitName,
    objectives: [],
    homework: ''
  }
  
  if (infographicSummary) {
    // 學習目標（2-3個重點）
    if (infographicSummary.objectives && infographicSummary.objectives.length > 0) {
      visualContent.objectives = infographicSummary.objectives.slice(0, 3).map(obj => 
        obj.length > 40 ? obj.substring(0, 40) + '...' : obj
      )
    }
    
    // 課後作業
    if (infographicSummary.homework) {
      visualContent.homework = infographicSummary.homework.length > 80 
        ? infographicSummary.homework.substring(0, 80) + '...' 
        : infographicSummary.homework
    }
  } else {
    visualContent.objectives = objectives.slice(0, 3)
  }
  
  // 構建學習目標描述
  const objectivesText = visualContent.objectives.length > 0 
    ? visualContent.objectives.join(', ') 
    : objectives.join(', ')
  
  // 根據課程分類調整視覺元素
  const visualElements = isChildren ? {
    character: 'cute cartoon mascot character, friendly and encouraging',
    icons: 'playful colorful icons',
    decoration: 'stars, clouds, hearts, cheerful patterns',
    colors: 'bright, vibrant, cheerful colors with high saturation',
    mood: 'fun, playful, encouraging, child-friendly'
  } : {
    character: 'professional business character or avatar',
    icons: 'modern professional icons',
    decoration: 'geometric shapes, tech patterns, professional elements',
    colors: 'modern professional color palette with gradients',
    mood: 'professional, motivating, achievement-oriented'
  }

  // 建立清楚的 Road Map 風格 prompt - 簡化版本，專注於標題、學習目標、小作業
  const imagePrompt = `Create a clear and simple ROAD MAP educational infographic poster in 16:9 format (1200x630 pixels):

【VISUAL STYLE】
${visualStyle}

【TARGET AUDIENCE】
${isChildren ? 'Elementary to middle school students (ages 8-14) and their parents' : 'Adult learners and professionals'}
Visual tone: ${visualElements.mood}

【CORE CONTENT STRUCTURE - Keep it Simple and Clear】

LAYOUT: Three-Section Vertical Design

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: COURSE TITLE (Top 25% - Eye-catching Header)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 Large, bold title: "${visualContent.title}"
• ${isChildren ? 'Decorative border with fun elements (stars, badges)' : 'Professional modern border with clean lines'}
• ${visualElements.character} placed on the left or right
• ${isChildren ? 'Bright background with gradient' : 'Professional color gradient'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: LEARNING ROADMAP (Middle 50% - Main Focus)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 "Learning Goals" / "學習目標" header with icon

Draw a simple HORIZONTAL PATH/ROAD from left to right across the section:

${visualContent.objectives.map((obj, index) => {
  return `
MILESTONE ${index + 1}:
• Position: ${index === 0 ? 'Start (Left)' : index === visualContent.objectives.length - 1 ? 'End (Right)' : 'Middle'}
• Icon: ${isChildren ? 'Large colorful badge or milestone marker' : 'Professional checkpoint icon'}
• Label: "${obj}"
• Visual: ${isChildren ? 'Fun illustration related to the goal' : 'Clean icon related to the goal'}
`
}).join('\n')}

Connect all milestones with:
• ${isChildren ? 'A playful winding path/road with dotted or colorful lines' : 'A professional gradient line or arrow path'}
• ${visualElements.character} walking along the path (can appear 1-2 times)
• ${visualElements.decoration} scattered around the path
• ${isChildren ? 'Achievement badges or stars at each milestone' : 'Checkmarks or progress indicators'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3: HOMEWORK MISSION (Bottom 25% - Action Zone)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 "Mission" / "小作業" header with icon

${visualContent.homework ? `
• Task description: "${visualContent.homework}"
• ${isChildren ? 'Treasure chest, trophy, or completion badge' : 'Achievement certificate or task completion icon'}
• ${isChildren ? 'Encouraging message like "You can do it!" with emoji' : 'Professional motivational message'}
` : `
• Placeholder: "Complete your practice task!"
• ${isChildren ? 'Star badges and encouraging emoji' : 'Professional completion checklist icon'}
`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【DESIGN PRINCIPLES】
✓ CLARITY: Large fonts, high contrast, easy to read from distance
✓ SIMPLICITY: Focus on 3 main elements - Title, Goals, Homework
✓ VISUAL APPEAL: Rich ${visualElements.icons} and ${visualElements.decoration}
✓ BALANCE: Even distribution of visual elements
✓ COLOR: ${visualElements.colors}
✓ CONSISTENCY: All elements match ${style} style

【AVOID】
✗ No complex time schedules or detailed teaching flow
✗ No cluttered text blocks
✗ No hard-to-read small fonts
✗ No messy layouts

【TECHNICAL SPECS】
• Aspect Ratio: 16:9 (1200x630 pixels)
• All text must be clearly readable
• Visual elements should be illustrations, not just text
• Suitable for social media sharing and printing`

  try {
    console.log('🎨 使用 Gemini 3.0 Pro Image Preview 生成 Roadmap 風格圖表...')
    console.log('風格:', style, '| 分類:', courseCategory)
    
    // 使用 @google/genai SDK 調用 gemini-3-pro-image-preview 模型
    const chat = genAINew.chats.create({
      model: "gemini-3-pro-image-preview",
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    })

    const response = await chat.sendMessage({ message: imagePrompt })
    
    // 從回應中提取圖片
    if (response && response.candidates && response.candidates[0]) {
      const parts = response.candidates[0].content.parts
      
      for (const part of parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data
          const mimeType = part.inlineData.mimeType || 'image/png'
          const imageUrl = `data:${mimeType};base64,${imageData}`
          
          console.log('✅ Gemini 3.0 圖片生成成功')
          
          return {
            success: true,
            data: {
              imageUrl,
              prompt: imagePrompt,
              isRealImage: true,
              style: style,
              category: courseCategory
            }
          }
        }
      }
      
      console.warn('⚠️ Gemini 3.0 API 回應中未找到圖片，使用備用方案')
      throw new Error('No image data in response')
    } else {
      console.warn('⚠️ Gemini 3.0 API 回應格式異常，使用備用方案')
      throw new Error('Invalid response format from Gemini API')
    }
  } catch (error) {
    console.warn('❌ Gemini 3.0 圖片生成失敗，使用備用 placeholder:', error.message)
    console.error('錯誤詳情:', error)
    // 如果 Gemini 3.0 失敗，使用備用的 placeholder
  }

  // 備用方案：使用 placeholder
  const colorSchemes = {
    'hand-drawn': { bg: 'FFF4E6', text: '8B4513' },
    'tech-ai': { bg: '1E3A8A', text: 'FFFFFF' },
    'manga': { bg: 'FFC0CB', text: '000000' },
    '8bit': { bg: '000000', text: '00FF00' }
  }
  
  const colors = colorSchemes[style] || { bg: 'D4A574', text: '221A15' }
  const encodedText = encodeURIComponent(unitName.substring(0, 30))
  
  return {
    success: true,
    data: {
      imageUrl: `https://placehold.co/1200x630/${colors.bg}/${colors.text}/png?text=${encodedText}&font=roboto`,
      prompt: imagePrompt,
      isRealImage: false
    }
  }
}

// 向後兼容的別名
export const generateImage = generateImageWithImagen3

export default {
  generateText,
  generateClassNames,
  generateDayCurriculum,
  generatePromotion,
  generateImage
}
