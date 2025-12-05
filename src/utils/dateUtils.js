// 日期格式化
export const formatDate = (date) => {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('zh-TW')
}

export const formatDateTime = (date) => {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleString('zh-TW')
}

export const formatTime = (time) => {
  if (!time) return ''
  return time
}

// 計算排課日期
export const calculateScheduledDates = (startDate, endDate, weekdays) => {
  const dates = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // 將 weekdays 轉換為 JavaScript 的星期表示 (0-6, 0是週日)
  const selectedDays = weekdays.map(day => day === 7 ? 0 : day)
  
  let current = new Date(start)
  while (current <= end) {
    const dayOfWeek = current.getDay()
    if (selectedDays.includes(dayOfWeek)) {
      dates.push(new Date(current).toISOString().split('T')[0])
    }
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

// 驗證日期範圍
export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return start <= end
}

// 取得日期差異（天數）
export const getDaysDifference = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// 取得今天日期（YYYY-MM-DD）
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0]
}

// 取得明天日期（YYYY-MM-DD）
export const getTomorrowDate = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

// 將星期數字轉換為中文
export const getWeekdayName = (day) => {
  const names = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']
  return names[day === 7 ? 0 : day]
}

// 將日期字串轉換為 FullCalendar 事件格式
export const convertToCalendarEvents = (scheduledDates, startTime, endTime, title) => {
  return scheduledDates.map((date, index) => ({
    id: `event-${index}`,
    title: `${title} - 第 ${index + 1} 天`,
    start: `${date}T${startTime}`,
    end: `${date}T${endTime}`,
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
    textColor: '#FFFFFF'
  }))
}
