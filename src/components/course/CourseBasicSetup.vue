<template>
  <div class="space-y-8">
    <h2 class="text-2xl font-bold text-base-content mb-6">步驟 1: 課程基本設定</h2>
    
    <!-- 第一部分：基本資訊 -->
    <div class="bg-base-200 rounded-lg p-6 space-y-6">
      <h3 class="text-xl font-semibold text-primary mb-4">
        <i class="fas fa-info-circle mr-2"></i>
        課程資訊
      </h3>
      
      <!-- 課程主題 -->
      <div>
        <label class="input-label">
          課程主題 <span class="text-error">*</span>
        </label>
        <input
          v-model="basicInfo.topic"
          type="text"
          class="w-full"
          placeholder="例如：打造AI自學力，用Gemini 3+ NotebookLM讓孩子自主學習"
        />
      </div>

      <!-- 目標客群 -->
      <div>
        <label class="input-label">
          目標客群 <span class="text-error">*</span>
        </label>
        <input
          v-model="basicInfo.targetAudience"
          type="text"
          class="w-full"
          placeholder="例如：國小5年級-國中2年級家長"
        />
      </div>

      <!-- 課程描述 -->
      <div>
        <label class="input-label">
          課程描述 <span class="text-error">*</span>
        </label>
        <textarea
          v-model="basicInfo.description"
          rows="6"
          class="w-full"
          placeholder="詳細說明課程內容、使用工具、學員可學到的技能...&#10;例如：本課程將教導學員使用 Gemini 3 和 NotebookLM 進行學習資料的整理與分析。學員將學會如何利用 AI 工具整理筆記、提取重點、製作摘要，並透過實際操作培養自主學習的能力。"
        ></textarea>
        <p class="text-sm text-base-content opacity-60 mt-1">
          此描述將作為 AI 生成課綱的重要參考依據
        </p>
      </div>

      <!-- 課程分類 -->
      <div>
        <label class="input-label">
          課程分類 <span class="text-error">*</span>
        </label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="basicInfo.category"
              type="radio"
              value="children"
              class="radio radio-primary"
            />
            <span>兒童課程（國中生可理解）</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="basicInfo.category"
              type="radio"
              value="vocational"
              class="radio radio-primary"
            />
            <span>職訓課程（高中生以上）</span>
          </label>
        </div>
      </div>

      <!-- AI 班級名稱生成 -->
      <div>
        <label class="input-label">
          班級名稱 <span class="text-error">*</span>
        </label>
        <div class="flex gap-2">
          <input
            v-model="basicInfo.className"
            type="text"
            class="flex-1"
            placeholder="選擇 AI 建議或自行輸入"
          />
          <button
            @click="generateClassNames"
            :disabled="!canGenerate || isGenerating"
            class="btn btn-primary"
          >
            <i :class="['fas', isGenerating ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles']"></i>
            <span class="ml-2">{{ isGenerating ? '生成中...' : 'AI 生成' }}</span>
          </button>
        </div>

        <!-- AI 建議的班級名稱 -->
        <div v-if="basicInfo.suggestedNames && basicInfo.suggestedNames.length > 0" class="mt-4 space-y-2">
          <p class="text-sm text-base-content opacity-70">AI 建議：</p>
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="(name, index) in basicInfo.suggestedNames"
              :key="index"
              @click="basicInfo.className = name"
              :class="[
                'text-left p-3 rounded-lg border-2 transition-all',
                basicInfo.className === name
                  ? 'border-primary bg-primary bg-opacity-10'
                  : 'border-base-300 hover:border-primary'
              ]"
            >
              {{ name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二部分：排課設定 -->
    <div class="bg-base-200 rounded-lg p-6 space-y-6">
      <h3 class="text-xl font-semibold text-primary mb-4">
        <i class="fas fa-calendar-alt mr-2"></i>
        排課設定
      </h3>
      
      <!-- 課程時數與天數 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="input-label">
            總課程時數（小時） <span class="text-error">*</span>
          </label>
          <input
            v-model.number="scheduleInfo.totalHours"
            type="number"
            min="1"
            step="1"
            class="w-full"
            placeholder="例如：8"
          />
        </div>

        <div>
          <label class="input-label">
            每日課程時數（小時） <span class="text-error">*</span>
          </label>
          <input
            v-model.number="scheduleInfo.hoursPerDay"
            type="number"
            min="0.5"
            step="0.5"
            class="w-full"
            placeholder="例如：2"
          />
        </div>
      </div>

      <!-- 計算天數顯示 -->
      <div v-if="calculatedDays > 0" class="bg-primary bg-opacity-10 border border-primary rounded-lg p-4">
        <div class="flex items-center gap-3">
          <i class="fas fa-calculator text-primary text-2xl"></i>
          <div>
            <p class="text-base-content font-bold">預計課程天數</p>
            <p class="text-primary text-2xl font-bold">{{ calculatedDays }} 天</p>
          </div>
        </div>
      </div>

      <!-- 開始日期 -->
      <div>
        <label class="input-label">
          課程開始日期 <span class="text-error">*</span>
        </label>
        <input
          ref="startDateInput"
          v-model="scheduleInfo.startDate"
          type="text"
          class="w-full datepicker cursor-pointer"
          placeholder="選擇開始日期"
        />
      </div>

      <!-- 星期選擇 -->
      <div>
        <label class="input-label">
          上課星期 <span class="text-error">*</span>
        </label>
        <div class="grid grid-cols-7 gap-2">
          <label
            v-for="day in weekDays"
            :key="day.value"
            class="cursor-pointer"
          >
            <input
              v-model="scheduleInfo.weekDays"
              type="checkbox"
              :value="day.value"
              class="hidden"
            />
            <div
              :class="[
                'text-center py-3 rounded-lg border-2 transition-all',
                scheduleInfo.weekDays && scheduleInfo.weekDays.includes(day.value)
                  ? 'bg-primary border-primary text-primary-content font-bold'
                  : 'border-base-300 hover:border-primary'
              ]"
            >
              {{ day.label }}
            </div>
          </label>
        </div>
      </div>

      <!-- 上課時間 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="input-label">
            上課時間 <span class="text-error">*</span>
          </label>
          <input
            ref="startTimeInput"
            v-model="scheduleInfo.startTime"
            type="text"
            class="w-full timepicker cursor-pointer"
            placeholder="選擇上課時間"
          />
        </div>

        <div>
          <label class="input-label">
            下課時間 <span class="text-error">*</span>
          </label>
          <input
            ref="endTimeInput"
            v-model="scheduleInfo.endTime"
            type="text"
            class="w-full timepicker cursor-pointer"
            placeholder="選擇下課時間"
          />
        </div>
      </div>

      <!-- 預覽排課結果 -->
      <div v-if="previewDates.length > 0" class="space-y-4">
        <!-- 日期列表預覽 -->
        <div class="bg-base-100 rounded-lg p-6">
          <h4 class="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
            <i class="fas fa-calendar-check text-primary"></i>
            排課預覽
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div
              v-for="(date, index) in previewDates"
              :key="index"
              class="bg-base-200 border border-base-300 rounded-lg p-3 text-center"
            >
              <div class="text-primary font-bold text-lg">第 {{ index + 1 }} 天</div>
              <div class="text-sm text-base-content opacity-70 mt-1">
                {{ formatPreviewDate(date) }}
              </div>
              <div class="text-xs text-base-content opacity-60 mt-1">
                {{ scheduleInfo.startTime }} - {{ scheduleInfo.endTime }}
              </div>
            </div>
          </div>
        </div>

        <!-- FullCalendar 預覽 -->
        <div class="bg-base-100 rounded-lg p-6">
          <h4 class="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
            <i class="fas fa-calendar-alt text-primary"></i>
            行事曆檢視
          </h4>
          <CourseCalendar :events="calendarEvents" />
        </div>
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="errorMessage" class="bg-error bg-opacity-10 border border-error rounded-lg p-4">
        <div class="flex items-start gap-3">
          <i class="fas fa-exclamation-triangle text-error text-xl"></i>
          <p class="text-error">{{ errorMessage }}</p>
        </div>
      </div>
    </div>

    <!-- 底部按鈕 -->
    <div class="flex justify-end mt-8">
      <button @click="handleNext" class="btn btn-primary" :disabled="!isValid">
        下一步
        <i class="fas fa-arrow-right ml-2"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { generateClassNames as generateClassNamesAPI } from '@/services/gemini'
import { useToastStore } from '@/stores/toastStore'
import { calculateScheduledDates, convertToCalendarEvents } from '@/utils/dateUtils'
import CourseCalendar from '@/components/calendar/CourseCalendar.vue'

const props = defineProps({
  basicInfoValue: {
    type: Object,
    required: true
  },
  scheduleValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:basicInfo', 'update:schedule', 'next'])

const toastStore = useToastStore()

// 基本資訊
const basicInfo = reactive({ ...props.basicInfoValue })
const isGenerating = ref(false)

// 排課資訊
const startDateInput = ref(null)
const startTimeInput = ref(null)
const endTimeInput = ref(null)
const scheduleInfo = reactive({ ...props.scheduleValue })
const errorMessage = ref('')

const weekDays = [
  { label: '日', value: 0 },
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
  { label: '四', value: 4 },
  { label: '五', value: 5 },
  { label: '六', value: 6 }
]

// 基本資訊驗證
const canGenerate = computed(() => {
  return basicInfo.topic && basicInfo.targetAudience && basicInfo.description
})

// 排課計算
const calculatedDays = computed(() => {
  if (!scheduleInfo.totalHours || !scheduleInfo.hoursPerDay) return 0
  return Math.ceil(scheduleInfo.totalHours / scheduleInfo.hoursPerDay)
})

const previewDates = computed(() => {
  if (!scheduleInfo.startDate || !scheduleInfo.weekDays || scheduleInfo.weekDays.length === 0 || calculatedDays.value === 0) {
    return []
  }
  
  try {
    return calculateScheduledDates(
      scheduleInfo.startDate,
      calculatedDays.value,
      scheduleInfo.weekDays
    )
  } catch (error) {
    return []
  }
})

const calendarEvents = computed(() => {
  if (previewDates.value.length === 0) return []
  
  return convertToCalendarEvents(
    previewDates.value,
    scheduleInfo.startTime,
    scheduleInfo.endTime,
    '課程'
  )
})

const isValid = computed(() => {
  const hasBasicInfo = !!(basicInfo.topic && 
                       basicInfo.targetAudience && 
                       basicInfo.description && 
                       basicInfo.category && 
                       basicInfo.className)
  
  const hasSchedule = !!(scheduleInfo.totalHours &&
                      scheduleInfo.hoursPerDay &&
                      scheduleInfo.startDate &&
                      scheduleInfo.weekDays.length > 0 &&
                      scheduleInfo.startTime &&
                      scheduleInfo.endTime &&
                      previewDates.value.length > 0)
  
  console.log('isValid 檢查:', { hasBasicInfo, hasSchedule, result: hasBasicInfo && hasSchedule })
  return hasBasicInfo && hasSchedule
})

// 監聽資料變化
watch(basicInfo, (newValue) => {
  emit('update:basicInfo', newValue)
}, { deep: true })

watch(scheduleInfo, (newValue) => {
  emit('update:schedule', newValue)
}, { deep: true })

// AI 生成班級名稱
const generateClassNames = async () => {
  if (!canGenerate.value) {
    toastStore.showToast('請先填寫課程主題、目標客群和課程描述', 'warning')
    return
  }

  isGenerating.value = true
  try {
    const names = await generateClassNamesAPI(
      basicInfo.topic,
      basicInfo.targetAudience,
      basicInfo.description,
      basicInfo.category
    )
    basicInfo.suggestedNames = names
    toastStore.showToast('已生成 AI 建議的班級名稱', 'success')
  } catch (error) {
    toastStore.showToast('生成班級名稱失敗，請稍後再試', 'error')
  } finally {
    isGenerating.value = false
  }
}

const formatPreviewDate = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDay = weekDays[date.getDay()].label
  return `${month}/${day} (${weekDay})`
}

const handleNext = () => {
  console.log('handleNext 被呼叫')
  console.log('表單資料:', { basicInfo, scheduleInfo: scheduleInfo })
  errorMessage.value = ''
  
  // 計算實際時數
  const [startHour, startMin] = scheduleInfo.startTime.split(':').map(Number)
  const [endHour, endMin] = scheduleInfo.endTime.split(':').map(Number)
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  const actualHours = (endMinutes - startMinutes) / 60
  
  console.log('時間計算:', { startTime: scheduleInfo.startTime, endTime: scheduleInfo.endTime, actualHours, hoursPerDay: scheduleInfo.hoursPerDay })
  
  // 驗證時間
  if (endMinutes <= startMinutes) {
    errorMessage.value = '下課時間必須晚於上課時間'
    console.log('時間驗證失敗: 下課時間必須晚於上課時間')
    return
  }
  
  if (actualHours < scheduleInfo.hoursPerDay) {
    errorMessage.value = `上課時段只有 ${actualHours} 小時，少於設定的每日 ${scheduleInfo.hoursPerDay} 小時`
    console.log('時數驗證失敗')
    return
  }
  
  // 儲存排課日期
  scheduleInfo.scheduledDates = previewDates.value
  console.log('發送 next 事件, 排課日期:', scheduleInfo.scheduledDates)
  emit('next')
}

// 初始化 jQuery UI
onMounted(() => {
  setTimeout(() => {
    if (typeof window.$ === 'undefined') return
    
    const $ = window.$
    
    if (typeof $.fn.datepicker === 'undefined' || typeof $.fn.timepicker === 'undefined') {
      console.error('jQuery UI not loaded')
      return
    }
    
    // Datepicker
    if (startDateInput.value) {
      $(startDateInput.value).datepicker({
        dateFormat: 'yy-mm-dd',
        minDate: 0,
        changeMonth: true,
        changeYear: true,
        onSelect: function(dateText) {
          scheduleInfo.startDate = dateText
        }
      })
    }
    
    // Timepicker
    if (startTimeInput.value) {
      $(startTimeInput.value).timepicker({
        timeFormat: 'HH:mm',
        interval: 15,
        minTime: '06:00',
        maxTime: '23:45',
        onSelect: function(time) {
          scheduleInfo.startTime = time
        },
        onClose: function() {
          scheduleInfo.startTime = $(this).val()
        }
      })
    }
    
    if (endTimeInput.value) {
      $(endTimeInput.value).timepicker({
        timeFormat: 'HH:mm',
        interval: 15,
        minTime: '06:00',
        maxTime: '23:45',
        onSelect: function(time) {
          scheduleInfo.endTime = time
        },
        onClose: function() {
          scheduleInfo.endTime = $(this).val()
        }
      })
    }
  }, 500)
})
</script>
