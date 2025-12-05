<template>
  <div>
    <h2 class="text-2xl font-bold text-base-content mb-6">步驟 2: 排課設定</h2>
    <p class="text-base-content opacity-70 mb-6">設定課程時數、天數和上課時間</p>
    
    <div class="space-y-6">
      <!-- 課程時數與天數 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="input-label">
            總課程時數（小時） <span class="text-error">*</span>
          </label>
          <input
            v-model.number="scheduleData.totalHours"
            type="number"
            min="1"
            step="1"
            class="w-full"
            placeholder="例如：8"
            @input="console.log('totalHours changed:', scheduleData.totalHours)"
          />
          <p class="text-sm text-base-content opacity-60 mt-1">
            整個課程的總時數
          </p>
        </div>

        <div>
          <label class="input-label">
            每日課程時數（小時） <span class="text-error">*</span>
          </label>
          <input
            v-model.number="scheduleData.hoursPerDay"
            type="number"
            min="0.5"
            step="0.5"
            class="w-full"
            placeholder="例如：2"
            @input="console.log('hoursPerDay changed:', scheduleData.hoursPerDay)"
          />
          <p class="text-sm text-base-content opacity-60 mt-1">
            每天上課的時數
          </p>
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
          v-model="scheduleData.startDate"
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
              v-model="scheduleData.weekDays"
              type="checkbox"
              :value="day.value"
              class="hidden"
            />
            <div
              :class="[
                'text-center py-3 rounded-lg border-2 transition-all',
                scheduleData.weekDays && scheduleData.weekDays.includes(day.value)
                  ? 'bg-primary border-primary text-primary-content font-bold'
                  : 'border-base-300 hover:border-primary'
              ]"
            >
              {{ day.label }}
            </div>
          </label>
        </div>
        <p class="text-sm text-base-content opacity-60 mt-2">
          選擇每週哪些天上課
        </p>
      </div>

      <!-- 上課時間 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="input-label">
            上課時間 <span class="text-error">*</span>
          </label>
          <input
            ref="startTimeInput"
            v-model="scheduleData.startTime"
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
            v-model="scheduleData.endTime"
            type="text"
            class="w-full timepicker cursor-pointer"
            placeholder="選擇下課時間"
          />
        </div>
      </div>

      <!-- 預覽排課結果 -->
      <div v-if="previewDates.length > 0" class="space-y-4">
        <!-- 日期列表預覽 -->
        <div class="bg-base-200 rounded-lg p-6">
          <h3 class="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
            <i class="fas fa-calendar-check text-primary"></i>
            排課預覽
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div
              v-for="(date, index) in previewDates"
              :key="index"
              class="bg-base-100 border border-base-300 rounded-lg p-3 text-center"
            >
              <div class="text-primary font-bold text-lg">第 {{ index + 1 }} 天</div>
              <div class="text-sm text-base-content opacity-70 mt-1">
                {{ formatPreviewDate(date) }}
              </div>
              <div class="text-xs text-base-content opacity-60 mt-1">
                {{ scheduleData.startTime }} - {{ scheduleData.endTime }}
              </div>
            </div>
          </div>
        </div>

        <!-- FullCalendar 預覽 -->
        <div class="bg-base-200 rounded-lg p-6">
          <h3 class="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
            <i class="fas fa-calendar-alt text-primary"></i>
            行事曆檢視
          </h3>
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

    <div class="flex justify-between mt-8">
      <button @click="$emit('prev')" class="btn btn-secondary">
        <i class="fas fa-arrow-left mr-2"></i>
        上一步
      </button>
      <button @click="handleNext" class="btn btn-primary" :disabled="!isValid">
        下一步
        <i class="fas fa-arrow-right ml-2"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { calculateScheduledDates, convertToCalendarEvents } from '@/utils/dateUtils'
import CourseCalendar from '@/components/calendar/CourseCalendar.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'next', 'prev'])

const startDateInput = ref(null)
const startTimeInput = ref(null)
const endTimeInput = ref(null)

const scheduleData = reactive({ 
  totalHours: null,
  hoursPerDay: null,
  startDate: '',
  weekDays: [],
  startTime: '',
  endTime: '',
  scheduledDates: [],
  ...props.modelValue 
})
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

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const calculatedDays = computed(() => {
  if (!scheduleData.totalHours || !scheduleData.hoursPerDay) return 0
  return Math.ceil(scheduleData.totalHours / scheduleData.hoursPerDay)
})

const previewDates = computed(() => {
  if (!scheduleData.startDate || !scheduleData.weekDays || scheduleData.weekDays.length === 0 || calculatedDays.value === 0) {
    return []
  }
  
  try {
    return calculateScheduledDates(
      scheduleData.startDate,
      calculatedDays.value,
      scheduleData.weekDays
    )
  } catch (error) {
    return []
  }
})

const isValid = computed(() => {
  const hasValidHours = scheduleData.totalHours && scheduleData.totalHours > 0
  const hasValidHoursPerDay = scheduleData.hoursPerDay && scheduleData.hoursPerDay > 0
  const hasStartDate = scheduleData.startDate && scheduleData.startDate.length > 0
  const hasWeekDays = scheduleData.weekDays && scheduleData.weekDays.length > 0
  const hasStartTime = scheduleData.startTime && scheduleData.startTime.length > 0
  const hasEndTime = scheduleData.endTime && scheduleData.endTime.length > 0
  const hasPreview = previewDates.value.length > 0
  
  console.log('驗證狀態:', {
    hasValidHours,
    hasValidHoursPerDay,
    hasStartDate,
    hasWeekDays,
    hasStartTime,
    hasEndTime,
    hasPreview,
    totalHours: scheduleData.totalHours,
    hoursPerDay: scheduleData.hoursPerDay,
    startDate: scheduleData.startDate,
    weekDays: scheduleData.weekDays,
    startTime: scheduleData.startTime,
    endTime: scheduleData.endTime
  })
  
  return hasValidHours &&
         hasValidHoursPerDay &&
         hasStartDate &&
         hasWeekDays &&
         hasStartTime &&
         hasEndTime &&
         hasPreview
})

const calendarEvents = computed(() => {
  if (previewDates.value.length === 0) return []
  
  return convertToCalendarEvents(
    previewDates.value,
    scheduleData.startTime,
    scheduleData.endTime,
    '課程'
  )
})

watch(scheduleData, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

const formatPreviewDate = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDay = weekDays[date.getDay()].label
  return `${month}/${day} (${weekDay})`
}

const handleNext = () => {
  errorMessage.value = ''
  
  // 驗證時間
  if (scheduleData.startTime >= scheduleData.endTime) {
    errorMessage.value = '下課時間必須晚於上課時間'
    return
  }
  
  // 計算實際時數
  const [startHour, startMin] = scheduleData.startTime.split(':').map(Number)
  const [endHour, endMin] = scheduleData.endTime.split(':').map(Number)
  const actualHours = (endHour * 60 + endMin - startHour * 60 - startMin) / 60
  
  if (actualHours < scheduleData.hoursPerDay) {
    errorMessage.value = `上課時段只有 ${actualHours} 小時，少於設定的每日 ${scheduleData.hoursPerDay} 小時`
    return
  }
  
  // 計算並儲存排課日期
  scheduleData.scheduledDates = previewDates.value
  emit('next')
}

// 初始化 Datepicker 和 Timepicker
onMounted(() => {
  // 使用 setTimeout 確保 DOM 和 jQuery UI 完全載入
  setTimeout(() => {
    // 確保 jQuery UI 已載入
    if (typeof window.$ === 'undefined') {
      console.error('jQuery not loaded')
      return
    }
    
    const $ = window.$
    
    // 檢查 datepicker
    if (typeof $.fn.datepicker === 'undefined') {
      console.error('jQuery UI Datepicker not loaded')
      return
    }
    
    // 檢查 timepicker
    if (typeof $.fn.timepicker === 'undefined') {
      console.error('jQuery UI Timepicker not loaded')
      return
    }
    
    console.log('jQuery UI loaded successfully')
    console.log('Refs:', {
      startDateInput: startDateInput.value,
      startTimeInput: startTimeInput.value,
      endTimeInput: endTimeInput.value
    })
    
    // 初始化 Datepicker
    if (startDateInput.value) {
      console.log('Initializing datepicker...')
      $(startDateInput.value).datepicker({
        dateFormat: 'yy-mm-dd',
        minDate: 0,
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        onSelect: function(dateText) {
          console.log('Date selected:', dateText)
          scheduleData.startDate = dateText
        }
      })
      
      // 如果已有值，設置初始值
      if (scheduleData.startDate) {
        $(startDateInput.value).datepicker('setDate', scheduleData.startDate)
      }
      console.log('Datepicker initialized')
    } else {
      console.error('startDateInput ref not found')
    }
    
    // 初始化開始時間 Timepicker
    if (startTimeInput.value) {
      console.log('Initializing start time picker...')
      $(startTimeInput.value).timepicker({
        timeFormat: 'HH:mm',
        interval: 15,
        minTime: '06:00',
        maxTime: '23:45',
        defaultTime: '09:00',
        startTime: '06:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        onSelect: function(time) {
          console.log('Start time selected:', time)
          scheduleData.startTime = time
        },
        onClose: function(time) {
          console.log('Start time closed:', time)
          scheduleData.startTime = $(this).val()
        }
      })
      
      // 監聽手動輸入
      $(startTimeInput.value).on('change', function() {
        console.log('Start time changed:', $(this).val())
        scheduleData.startTime = $(this).val()
      })
      
      // 如果已有值，設置初始值
      if (scheduleData.startTime) {
        $(startTimeInput.value).val(scheduleData.startTime)
      }
      console.log('Start time picker initialized')
    } else {
      console.error('startTimeInput ref not found')
    }
    
    // 初始化結束時間 Timepicker
    if (endTimeInput.value) {
      console.log('Initializing end time picker...')
      $(endTimeInput.value).timepicker({
        timeFormat: 'HH:mm',
        interval: 15,
        minTime: '06:00',
        maxTime: '23:45',
        defaultTime: '10:00',
        startTime: '06:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        onSelect: function(time) {
          console.log('End time selected:', time)
          scheduleData.endTime = time
        },
        onClose: function(time) {
          console.log('End time closed:', time)
          scheduleData.endTime = $(this).val()
        }
      })
      
      // 監聽手動輸入
      $(endTimeInput.value).on('change', function() {
        console.log('End time changed:', $(this).val())
        scheduleData.endTime = $(this).val()
      })
      
      // 如果已有值，設置初始值
      if (scheduleData.endTime) {
        $(endTimeInput.value).val(scheduleData.endTime)
      }
      console.log('End time picker initialized')
    } else {
      console.error('endTimeInput ref not found')
    }
  }, 500)
})
</script>
