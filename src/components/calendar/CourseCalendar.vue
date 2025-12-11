<template>
  <div class="course-calendar">
    <div ref="calendarEl"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import zhTwLocale from '@fullcalendar/core/locales/zh-tw'

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  },
  initialView: {
    type: String,
    default: 'dayGridMonth'
  }
})

const calendarEl = ref(null)
let calendar = null

onMounted(() => {
  calendar = new Calendar(calendarEl.value, {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: props.initialView,
    locale: zhTwLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    buttonText: {
      today: '今天',
      month: '月',
      week: '週',
      day: '日'
    },
    height: 'auto',
    events: props.events,
    eventClick: (info) => {
      alert(`課程: ${info.event.title}\n時間: ${info.event.start.toLocaleString('zh-TW')}`)
    },
    themeSystem: 'standard',
    eventColor: '#d4a574', // Coffee theme primary color
    eventTextColor: '#221a15' // Coffee theme primary-content color
  })
  
  calendar.render()
})

watch(() => props.events, (newEvents) => {
  if (calendar) {
    calendar.removeAllEvents()
    calendar.addEventSource(newEvents)
  }
}, { deep: true })
</script>

<style scoped>
.course-calendar {
  background: var(--color-base-100);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

/* FullCalendar 樣式覆蓋 */
:deep(.fc) {
  --fc-border-color: var(--color-base-300);
  --fc-button-bg-color: var(--color-primary);
  --fc-button-border-color: var(--color-primary);
  --fc-button-hover-bg-color: var(--color-primary-600);
  --fc-button-hover-border-color: var(--color-primary-600);
  --fc-button-active-bg-color: var(--color-primary-600);
  --fc-button-active-border-color: var(--color-primary-600);
  --fc-today-bg-color: rgba(212, 165, 116, 0.1);
}

:deep(.fc-theme-standard td),
:deep(.fc-theme-standard th) {
  border-color: var(--color-base-300);
}

:deep(.fc-col-header-cell) {
  background: var(--color-base-200);
  color: var(--color-base-content);
  font-weight: bold;
}

:deep(.fc-daygrid-day-number),
:deep(.fc-timegrid-slot-label),
:deep(.fc-toolbar-title) {
  color: var(--color-base-content);
}

:deep(.fc-button) {
  text-transform: none;
  font-weight: 500;
}

/* 事件顏色覆蓋 - Coffee 主題色 */
:deep(.fc-event) {
  background-color: #d4a574 !important;
  border-color: #d4a574 !important;
  color: #221a15 !important;
}

:deep(.fc-event-main) {
  color: #221a15 !important;
}

:deep(.fc-daygrid-event) {
  background-color: #d4a574 !important;
  border-color: #d4a574 !important;
}

:deep(.fc-timegrid-event) {
  background-color: #d4a574 !important;
  border-color: #d4a574 !important;
}

:deep(.fc-h-event) {
  background-color: #d4a574 !important;
  border-color: #d4a574 !important;
}
</style>
