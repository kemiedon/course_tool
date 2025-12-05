import axios from 'axios'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI

// Google OAuth 授權 URL
export const getAuthUrl = () => {
  const scope = [
    'https://www.googleapis.com/auth/forms.body',
    'https://www.googleapis.com/auth/forms.responses.readonly',
    'https://www.googleapis.com/auth/drive.file'
  ].join(' ')

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'token',
    scope: scope,
    include_granted_scopes: 'true',
    state: 'create_form'
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// 建立 Google 表單
export const createForm = async (accessToken, courseData) => {
  try {
    const { className, promotion, infographics, category } = courseData
    
    // 建立表單
    const formResponse = await axios.post(
      'https://forms.googleapis.com/v1/forms',
      {
        info: {
          title: className,
          documentTitle: className
        }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const formId = formResponse.data.formId
    
    // 建立表單項目
    const items = []
    
    // 課程介紹（說明文字）
    items.push({
      title: '課程介紹',
      description: promotion,
      questionItem: null
    })
    
    // 每日課程圖片
    infographics.forEach((img, index) => {
      items.push({
        title: `第 ${index + 1} 天課程`,
        imageItem: {
          image: {
            sourceUri: img.imageUrl
          }
        }
      })
    })
    
    // 學生姓名
    items.push({
      title: '學生姓名',
      questionItem: {
        question: {
          required: true,
          textQuestion: {
            paragraph: false
          }
        }
      }
    })
    
    // 年級選擇
    items.push({
      title: '年級選擇',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'DROP_DOWN',
            options: [
              { value: '幼兒園' },
              { value: '國小一年級' },
              { value: '國小二年級' },
              { value: '國小三年級' },
              { value: '國小四年級' },
              { value: '國小五年級' },
              { value: '國小六年級' },
              { value: '國中一年級' },
              { value: '國中二年級' },
              { value: '國中三年級' }
            ]
          }
        }
      }
    })
    
    // 家長姓名
    items.push({
      title: '家長姓名',
      questionItem: {
        question: {
          required: true,
          textQuestion: {
            paragraph: false
          }
        }
      }
    })
    
    // 聯絡電話
    items.push({
      title: '聯絡電話',
      questionItem: {
        question: {
          required: true,
          textQuestion: {
            paragraph: false
          }
        }
      }
    })
    
    // Email
    items.push({
      title: 'Email',
      questionItem: {
        question: {
          required: true,
          textQuestion: {
            paragraph: false
          }
        }
      }
    })
    
    // 一週在家使用電腦時間
    items.push({
      title: '一週在家使用電腦的時間',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'RADIO',
            options: [
              { value: '1小時以下' },
              { value: '1-2小時' },
              { value: '2-3小時' },
              { value: '3-4小時' },
              { value: '4-5小時' },
              { value: '5小時以上' }
            ]
          }
        }
      }
    })
    
    // 批次更新表單
    await axios.post(
      `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`,
      {
        requests: items.map((item, index) => ({
          createItem: {
            item,
            location: { index }
          }
        }))
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    const formUrl = `https://docs.google.com/forms/d/${formId}/edit`
    return {
      success: true,
      data: {
        formId,
        formUrl,
        publicUrl: `https://docs.google.com/forms/d/e/${formId}/viewform`
      }
    }
  } catch (error) {
    console.error('建立表單失敗:', error)
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    }
  }
}

export default {
  getAuthUrl,
  createForm
}
