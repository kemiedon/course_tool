import axios from 'axios'
import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

// 初始化 Google AI 客戶端
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

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

// 生成課程宣傳內容（根據課綱重點）
export const generatePromotion = async (courseInfo, curriculum = []) => {
  const { className, topic, audience, category, description } = courseInfo
  
  // 從課綱提取重點
  let curriculumHighlights = ''
  if (curriculum && curriculum.length > 0) {
    curriculumHighlights = '\n\n課程重點摘要：\n'
    curriculum.forEach((item, index) => {
      if (item.content) {
        // 提取單元名稱
        const unitMatch = item.content.match(/^#\s+(.+)$/m)
        const unitName = unitMatch ? unitMatch[1] : `第 ${index + 1} 天`
        
        // 提取前2個學習目標
        const objectivesMatch = item.content.match(/##\s+學習目標\n((?:- .+\n?){1,2})/)
        const objectives = objectivesMatch ? objectivesMatch[1].trim() : ''
        
        curriculumHighlights += `第 ${index + 1} 天【${unitName}】\n${objectives}\n\n`
      }
    })
  }
  
  const painPoints = category === 'children' 
    ? '家長痛點：孩子學習動力不足、缺乏實用技能、無法跟上AI時代、課業壓力大需要有效學習方法'
    : '學員痛點：職場競爭力不足、技能跟不上時代、想轉職但缺乏實戰經驗、工作效率需要提升'
  
  const prompt = `你是一位專業的教育行銷文案撰寫專家。請根據以下資訊，撰寫一篇**精準200字**的課程宣傳文案，直擊目標客群痛點。

課程資訊：
- 班級名稱: ${className}
- 課程主題: ${topic}
- 課程描述: ${description}
- 目標客群: ${audience}
- 課程分類: ${category === 'children' ? '兒童課程（家長視角）' : '職訓課程（學員視角）'}
${curriculumHighlights}

目標客群痛點：
${painPoints}

文案撰寫要求：
1. **字數嚴格控制在200字左右**（不超過220字）
2. **開頭直擊痛點**（第1句話就要讓目標客群有共鳴）
3. **中間說明解決方案**（課程如何解決痛點，結合課綱重點）
4. **結尾強調成果**（學完後能獲得什麼具體能力或改變）
5. **語氣**：${category === 'children' ? '親切溫暖，站在家長角度說話' : '專業有力，站在學員職涯發展角度'}
6. **避免**：空泛形容詞、過度誇大、行銷術語堆砌

範例架構：
- 兒童課程：「您是否擔心孩子___？（痛點）本課程透過___方法，讓孩子在___天內學會___（解決方案+課綱重點）。完成後，孩子將能___（具體成果）」
- 職訓課程：「職場上是否常遇到___困境？（痛點）本課程教您___技能，涵蓋___實戰項目（解決方案+課綱重點）。結業後立即應用於___（具體成果）」

請直接輸出200字宣傳文案（不需要標題、不需要JSON格式、不需要任何額外說明）：`

  const result = await generateText(prompt, { maxOutputTokens: 512, temperature: 0.8 })
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

  // 提取課綱教學流程時間軸資訊
  let roadmapStages = []
  if (infographicSummary && infographicSummary.fullContent) {
    // 從完整課綱提取時間段與活動
    const timePattern = /###\s*(\d+[-–]\d+)\s*分鐘[：:：]\s*(.+?)\n([\s\S]*?)(?=###|\n##|$)/g
    let match
    
    while ((match = timePattern.exec(infographicSummary.fullContent)) !== null) {
      const timeRange = match[1]
      const stageName = match[2].trim()
      const content = match[3].trim().substring(0, 80) // 取前80字作為活動描述
      
      roadmapStages.push({
        time: timeRange,
        name: stageName,
        activity: content
      })
    }
  }
  
  // 如果沒有提取到時間段，使用預設的120分鐘結構
  if (roadmapStages.length === 0) {
    roadmapStages = [
      { time: '0-10', name: '暖身互動', activity: '進場、測試設備、課前互動' },
      { time: '10-40', name: '教學區塊A', activity: '核心概念教學與示範' },
      { time: '40-45', name: '休息1', activity: '離開螢幕休息' },
      { time: '45-75', name: '教學區塊B', activity: '分組活動與討論' },
      { time: '75-80', name: '休息2', activity: '腦力遊戲活化' },
      { time: '80-110', name: '教學區塊C', activity: '整合應用與作品發表' },
      { time: '110-120', name: '收尾整理', activity: '重點整理與課後任務' }
    ]
  }
  
  // 整理視覺化內容
  let visualContent = {
    title: unitName,
    objectives: [],
    roadmap: roadmapStages,
    homework: ''
  }
  
  if (infographicSummary) {
    // 學習目標（2-3個重點）
    if (infographicSummary.objectives && infographicSummary.objectives.length > 0) {
      visualContent.objectives = infographicSummary.objectives.slice(0, 3).map(obj => 
        obj.length > 30 ? obj.substring(0, 30) + '...' : obj
      )
    }
    
    // 課後作業
    if (infographicSummary.homework) {
      visualContent.homework = infographicSummary.homework.length > 50 
        ? infographicSummary.homework.substring(0, 50) + '...' 
        : infographicSummary.homework
    }
  } else {
    visualContent.objectives = objectives.slice(0, 3)
  }

  // 構建 Roadmap 時間軸描述
  const roadmapDescription = visualContent.roadmap.map((stage, index) => {
    const stageType = stage.name.includes('休息') ? 'break' : 'teaching'
    return `Stage ${index + 1} [${stage.time} min] ${stage.name}: ${stage.activity}`
  }).join(' → ')
  
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

  // 建立詳細的 Roadmap 風格 prompt
  const imagePrompt = `Create a visual ROADMAP-style educational infographic poster in 16:9 format (1200x630 pixels):

【VISUAL STYLE】
${visualStyle}

【TARGET AUDIENCE】
${isChildren ? 'Elementary to middle school students (ages 8-14)' : 'Adult learners and professionals'}
Visual tone: ${visualElements.mood}

【CORE CONTENT】
Course Title: "${visualContent.title}"
Learning Objectives: ${objectivesText}
Homework Mission: ${visualContent.homework}

【ROADMAP LAYOUT STRUCTURE - HORIZONTAL JOURNEY】

1. LEFT PANEL (20% width) - Starting Point:
   • Large course title at top with ${isChildren ? 'fun decorative' : 'professional'} border
   • "Learning Goals" section below with ${isChildren ? '3 colorful badge icons' : '3 professional checkmarks'}
   • ${visualElements.character} standing at start line
   • ${isChildren ? 'Decorative elements like flags or balloons' : 'Professional achievement icons'}

2. CENTER ROADMAP (60% width) - Learning Journey:
   • Draw a horizontal winding path/road from left to right
   • Place ${visualContent.roadmap.length} milestone stations along the road:
${visualContent.roadmap.map((stage, i) => `     ${i + 1}. [${stage.time} min] ${stage.name} - ${stage.activity.substring(0, 40)}`).join('\n')}
   
   Visual treatment for each milestone:
   • Teaching blocks: ${isChildren ? 'colorful houses/buildings with activity icons' : 'professional office buildings/workstations'}
   • Break stations: ${isChildren ? 'park benches, playgrounds, or rest areas with trees' : 'coffee stations, zen gardens, or modern lounge areas'}
   • Each milestone: time label above, activity icon in center, brief description below
   • Connect all milestones with a ${isChildren ? 'playful dotted or rainbow path' : 'professional gradient line'}
   • Add ${visualElements.character} at 2-3 positions walking the journey
   
3. RIGHT PANEL (20% width) - Achievement Zone:
   • ${isChildren ? 'Trophy, star badge, or treasure chest' : 'Achievement certificate or success medal'} at top
   • "Mission Complete" or "Homework" label
   • ${visualContent.homework}
   • ${isChildren ? 'Encouraging stickers and emojis' : 'Professional completion badge'}

【VISUAL ENRICHMENT】
• Background: ${isChildren ? 'light pastel gradient with floating decorative elements' : 'subtle professional gradient with geometric patterns'}
• Decorations: ${visualElements.decoration}
• Icons: ${visualElements.icons} for each activity type
• Colors: ${visualElements.colors}
• Typography: ${isChildren ? 'playful rounded fonts for titles, clear sans-serif for content' : 'modern professional sans-serif fonts throughout'}
• Ensure all text is clearly readable with strong contrast

【TECHNICAL REQUIREMENTS】
• Aspect Ratio: 16:9 (1200x630 pixels)
• Visual richness: Include illustrations, not just text
• Clarity: High contrast, readable from a distance
• Balance: Visual elements distributed evenly
• Theme consistency: All elements match the chosen style (${style})`

  try {
    console.log('🎨 使用 Imagen 3.0 生成 Roadmap 風格圖表...')
    console.log('風格:', style, '| 分類:', courseCategory)
    
    // 使用 REST API 直接調用 Imagen 3.0
    const response = await axios.post(
      `${GEMINI_API_BASE}/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`,
      {
        instances: [{
          prompt: imagePrompt
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '16:9',
          negativePrompt: 'blurry, low quality, text errors, distorted, messy layout, cluttered, unprofessional',
          safetyFilterLevel: 'block_some',
          personGeneration: 'allow_adult'
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    
    // 從回應中提取圖片
    if (response.data && response.data.predictions && response.data.predictions[0]) {
      const imageData = response.data.predictions[0]
      
      // Imagen3 返回 base64 編碼的圖片
      let imageUrl = imageData.bytesBase64Encoded 
        ? `data:image/png;base64,${imageData.bytesBase64Encoded}`
        : imageData.image?.bytesBase64Encoded
        ? `data:image/png;base64,${imageData.image.bytesBase64Encoded}`
        : null

      if (imageUrl) {
        console.log('✅ Imagen 3.0 圖片生成成功')
        
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
      } else {
        console.warn('⚠️ Imagen 3.0 API 回應格式異常，使用備用方案')
        throw new Error('No image data in response')
      }
    } else {
      console.warn('⚠️ Imagen 3.0 API 回應格式異常，使用備用方案')
      throw new Error('Invalid response format from Imagen API')
    }
  } catch (error) {
    console.warn('❌ Imagen 3.0 API 失敗，使用備用 placeholder:', error.message)
    console.error('錯誤詳情:', error)
    // 如果 Imagen 失敗，使用備用的 placeholder
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
