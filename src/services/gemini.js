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
export const generateClassNames = async (topic, audience) => {
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
export const generateImage = async (unitName, objectives, style) => {
  // 注意: Gemini Imagen 需要特殊的 API 端點和權限
  // 這裡先使用 placeholder 圖片服務模擬
  
  const styleMap = {
    'hand-drawn': '手繪插畫風',
    'tech-ai': '科技AI風',
    'manga': '日式漫畫風',
    '8bit': '8bit遊戲風'
  }
  
  const prompt = `Generate an infographic image for a course lesson:
- Unit Name: ${unitName}
- Learning Objectives: ${objectives.join(', ')}
- Style: ${styleMap[style]}

The image should be visually appealing and clearly represent the learning content.`

  // TODO: 實作真實的 Imagen API 呼叫
  // 目前返回 placeholder
  console.log('圖片生成 Prompt:', prompt)
  
  return {
    success: true,
    data: {
      imageUrl: `https://via.placeholder.com/1200x630/3B82F6/FFFFFF?text=${encodeURIComponent(unitName)}`,
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
