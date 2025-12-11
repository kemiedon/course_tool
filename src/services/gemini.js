import axios from 'axios'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

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

// 生成課程宣傳內容
export const generatePromotion = async (courseInfo) => {
  const { className, topic, audience, category } = courseInfo
  
  const prompt = `請為以下課程生成吸引人的宣傳文案（約 200-300 字）：

課程資訊：
- 班級名稱: ${className}
- 課程主題: ${topic}
- 目標客群: ${audience}
- 課程分類: ${category === 'children' ? '兒童課程' : '職訓課程'}

要求：
- 突出課程亮點與特色
- 說明適合對象與學習成果
- 語氣吸引家長/學員報名
- 避免過度誇大

請直接回應宣傳文案內容（不需要 JSON 格式）。`

  const result = await generateText(prompt)
  return result
}

// Gemini Imagen 圖片生成（暫時使用模擬）
export const generateImage = async (unitName, objectives, style, infographicSummary = null) => {
  // 注意: Gemini Imagen 需要特殊的 API 端點和權限
  // 這裡使用改良的 placeholder 圖片服務
  
  const styleMap = {
    'hand-drawn': '手繪插畫風',
    'tech-ai': '科技AI風',
    'manga': '日式漫畫風',
    '8bit': '8bit遊戲風'
  }
  
  // 建立家長友善的資訊內容
  let displayText = unitName
  if (infographicSummary) {
    displayText = `${infographicSummary.unitName}\n`
    if (infographicSummary.objectives && infographicSummary.objectives.length > 0) {
      displayText += infographicSummary.objectives[0].substring(0, 20)
    }
  }
  
  const prompt = `Generate an infographic image for a course lesson:
- Unit Name: ${unitName}
- Learning Objectives: ${objectives.join(', ')}
- Style: ${styleMap[style]}
- Parent-friendly summary: ${JSON.stringify(infographicSummary)}

The image should be visually appealing and clearly represent the learning content.`

  // TODO: 實作真實的 Imagen API 呼叫
  // 目前使用改良的 placeholder,模擬不同風格
  console.log('圖片生成 Prompt:', prompt)
  
  const colorSchemes = {
    'hand-drawn': { bg: 'FFF4E6', text: '8B4513' },
    'tech-ai': { bg: '1E3A8A', text: 'FFFFFF' },
    'manga': { bg: 'FFC0CB', text: '000000' },
    '8bit': { bg: '000000', text: '00FF00' }
  }
  
  const colors = colorSchemes[style] || { bg: 'D4A574', text: '221A15' }
  const encodedText = encodeURIComponent(displayText.substring(0, 30))
  
  return {
    success: true,
    data: {
      imageUrl: `https://placehold.co/1200x630/${colors.bg}/${colors.text}/png?text=${encodedText}&font=roboto`,
      prompt
    }
  }
}

export default {
  generateText,
  generateClassNames,
  generateDayCurriculum,
  generatePromotion,
  generateImage
}
