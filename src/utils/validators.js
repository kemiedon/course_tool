// 驗證必填欄位
export const required = (value, fieldName = '此欄位') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName}為必填`
  }
  return null
}

// 驗證 Email 格式
export const email = (value) => {
  if (!value) return null
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return '請輸入有效的 Email 地址'
  }
  return null
}

// 驗證電話號碼（台灣手機格式）
export const phone = (value) => {
  if (!value) return null
  const phoneRegex = /^09\d{8}$/
  if (!phoneRegex.test(value.replace(/\s|-/g, ''))) {
    return '請輸入有效的手機號碼（09xxxxxxxx）'
  }
  return null
}

// 驗證數字
export const number = (value, fieldName = '此欄位') => {
  if (!value) return null
  if (isNaN(value)) {
    return `${fieldName}必須為數字`
  }
  return null
}

// 驗證正整數
export const positiveInteger = (value, fieldName = '此欄位') => {
  if (!value) return null
  const num = Number(value)
  if (!Number.isInteger(num) || num <= 0) {
    return `${fieldName}必須為正整數`
  }
  return null
}

// 驗證數字範圍
export const range = (value, min, max, fieldName = '此欄位') => {
  if (!value) return null
  const num = Number(value)
  if (num < min || num > max) {
    return `${fieldName}必須在 ${min} 到 ${max} 之間`
  }
  return null
}

// 驗證字串長度
export const length = (value, min, max, fieldName = '此欄位') => {
  if (!value) return null
  const len = value.length
  if (len < min || len > max) {
    return `${fieldName}長度必須在 ${min} 到 ${max} 字之間`
  }
  return null
}

// 驗證最小長度
export const minLength = (value, min, fieldName = '此欄位') => {
  if (!value) return null
  if (value.length < min) {
    return `${fieldName}至少需要 ${min} 個字`
  }
  return null
}

// 驗證最大長度
export const maxLength = (value, max, fieldName = '此欄位') => {
  if (!value) return null
  if (value.length > max) {
    return `${fieldName}不能超過 ${max} 個字`
  }
  return null
}

// 驗證陣列不為空
export const arrayNotEmpty = (value, fieldName = '此欄位') => {
  if (!Array.isArray(value) || value.length === 0) {
    return `請至少選擇一個${fieldName}`
  }
  return null
}

// 組合多個驗證規則
export const validate = (value, rules) => {
  for (const rule of rules) {
    const error = rule(value)
    if (error) return error
  }
  return null
}

// 驗證整個表單
export const validateForm = (formData, rules) => {
  const errors = {}
  let hasError = false
  
  for (const field in rules) {
    const fieldRules = rules[field]
    const error = validate(formData[field], fieldRules)
    if (error) {
      errors[field] = error
      hasError = true
    }
  }
  
  return { valid: !hasError, errors }
}
