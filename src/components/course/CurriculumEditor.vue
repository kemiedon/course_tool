<template>
  <div>
    <h2 class="text-2xl font-bold text-base-content mb-6">步驟 2: 課綱生成</h2>
    <p class="text-base-content opacity-70 mb-6">AI 自動生成完整課程綱要</p>
    
    <div class="space-y-6">
      <!-- 生成所有課綱按鈕 -->
      <div v-if="!allGenerated" class="text-center">
        <button
          @click="generateAllCurriculum"
          :disabled="isGenerating"
          class="btn btn-primary btn-lg"
        >
          <i class="fas fa-robot mr-2"></i>
          {{ isGenerating ? '生成中...' : '一鍵生成所有課綱' }}
        </button>
        <p class="text-sm text-base-content opacity-60 mt-3">
          將為 {{ scheduledDates.length }} 天課程生成課綱內容
        </p>
      </div>

      <!-- 複製全部課綱按鈕 -->
      <div v-if="curriculumList.length > 0" class="flex justify-end mb-2">
        <button @click="copyAllCurriculum" class="btn btn-outline btn-sm">
          <i class="fas fa-copy mr-1"></i> 複製全部課綱到剪貼簿
        </button>
      </div>
      <!-- 課綱列表 -->
      <div v-if="curriculumList.length > 0" class="space-y-4">
        <div
          v-for="(item, index) in curriculumList"
          :key="index"
          class="card"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-lg font-bold text-primary">
                第 {{ index + 1 }} 天 - {{ formatDate(item.date) }}
              </h3>
              <p class="text-sm text-base-content opacity-60">
                {{ startTime }} - {{ endTime }}
              </p>
            </div>
            <div class="flex gap-2">
              <button
                v-if="!item.isEditing"
                @click="toggleEdit(index)"
                class="btn btn-sm btn-secondary"
                title="編輯"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                @click="regenerateCurriculum(index)"
                :disabled="item.isRegenerating"
                class="btn btn-sm btn-secondary"
                title="重新生成"
              >
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': item.isRegenerating }"></i>
              </button>
            </div>
          </div>

          <!-- 顯示模式 - Markdown 渲染 -->
          <div v-if="!item.isEditing && item.content" class="curriculum-content">
            <div class="prose prose-sm max-w-none" v-html="renderMarkdown(item.content)"></div>
          </div>

          <!-- 編輯模式 -->
          <div v-else-if="item.isEditing" class="space-y-3">
            <textarea
              v-model="editingContent"
              class="w-full h-64"
              placeholder="編輯課綱內容..."
            ></textarea>
            <div class="flex justify-end gap-2">
              <button @click="cancelEdit(index)" class="btn btn-sm btn-secondary">
                取消
              </button>
              <button @click="saveEdit(index)" class="btn btn-sm btn-primary">
                <i class="fas fa-save mr-1"></i>
                儲存
              </button>
            </div>
          </div>

          <!-- 載入中 -->
          <div v-if="item.isLoading" class="flex items-center justify-center py-8">
            <div class="loading-spinner"></div>
            <span class="ml-3 text-base-content opacity-70">AI 生成中...</span>
          </div>
        </div>
      </div>

      <!-- 進度顯示 -->
      <div v-if="isGenerating" class="bg-base-200 rounded-lg p-6">
        <div class="flex items-center justify-between mb-3">
          <span class="text-base-content font-bold">生成進度</span>
          <span class="text-primary font-bold">{{ generatedCount }} / {{ scheduledDates.length }}</span>
        </div>
        <div class="w-full bg-base-300 rounded-full h-3">
          <div
            class="bg-primary h-3 rounded-full transition-all duration-300"
            :style="{ width: `${(generatedCount / scheduledDates.length) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>

    <div class="flex justify-between mt-8">
      <button @click="$emit('prev')" class="btn btn-secondary">
        <i class="fas fa-arrow-left mr-2"></i>
        上一步
      </button>
      <button @click="handleNext" class="btn btn-primary" :disabled="!allGenerated">
        下一步
        <i class="fas fa-arrow-right ml-2"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { marked } from 'marked'
import { generateDayCurriculum } from '@/services/gemini'
import { useToastStore } from '@/stores/toastStore'

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true
})

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  },
  courseInfo: {
    type: Object,
    required: true
  },
  schedule: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'next', 'prev'])

const toastStore = useToastStore()
const curriculumList = reactive([])
const isGenerating = ref(false)
const generatedCount = ref(0)

const scheduledDates = computed(() => props.schedule.scheduledDates || [])
const startTime = computed(() => props.schedule.startTime)
const endTime = computed(() => props.schedule.endTime)

const allGenerated = computed(() => {
  return curriculumList.length === scheduledDates.value.length &&
         curriculumList.every(item => item.content && !item.isLoading)
})

onMounted(() => {
  // 初始化課綱列表
  if (props.modelValue && props.modelValue.length > 0) {
    curriculumList.push(...props.modelValue.map(item => ({
      ...item,
      isEditing: false,
      isLoading: false,
      isRegenerating: false,
      originalContent: item.content
    })))
  } else {
    scheduledDates.value.forEach(date => {
      curriculumList.push({
        date,
        content: '',
        isEditing: false,
        isLoading: false,
        isRegenerating: false,
        originalContent: ''
      })
    })
  }
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const generateAllCurriculum = async () => {
  isGenerating.value = true
  generatedCount.value = 0

  for (let i = 0; i < curriculumList.length; i++) {
    if (!curriculumList[i].content) {
      await generateCurriculumForDay(i)
    }
    generatedCount.value = i + 1
  }

  isGenerating.value = false
  toastStore.showToast('所有課綱生成完成！', 'success')
  updateModelValue()
}

const generateCurriculumForDay = async (index) => {
  const item = curriculumList[index]
  item.isLoading = true

  try {
    const courseInfo = {
      className: props.courseInfo.className,
      topic: props.courseInfo.topic,
      description: props.courseInfo.description,
      audience: props.courseInfo.targetAudience,
      category: props.courseInfo.category,
      totalDays: scheduledDates.value.length,
      hoursPerDay: props.schedule.hoursPerDay
    }

    const result = await generateDayCurriculum(courseInfo, index + 1)

    if (result.success) {
      item.content = formatCurriculumContent(result.data)
      item.originalContent = item.content
    } else {
      toastStore.showToast(`第 ${index + 1} 天課綱生成失敗: ${result.error}`, 'error')
      item.content = `# 第 ${index + 1} 天課綱\n\n（生成失敗，請手動編輯或重新生成）`
    }
  } catch (error) {
    toastStore.showToast(`第 ${index + 1} 天課綱生成錯誤`, 'error')
    item.content = `# 第 ${index + 1} 天課綱\n\n（生成錯誤，請手動編輯或重新生成）`
  } finally {
    item.isLoading = false
  }
}

// 格式化課綱內容為 Markdown
const formatCurriculumContent = (data) => {
  let content = `# ${data.unitName}\n\n`
  
  content += `## 學習目標\n`
  data.learningObjectives.forEach(obj => {
    content += `- ${obj}\n`
  })
  
  content += `\n## 教學內容\n\n`
  
  // 處理 teachingContent 可能是物件或字串
  if (typeof data.teachingContent === 'object') {
    // 如果是物件，按時段展示
    const timeSlots = [
      { key: '0-10', label: '0–10 分鐘：暖身互動' },
      { key: '10-40', label: '10–40 分鐘：教學區塊 A' },
      { key: '40-45', label: '40–45 分鐘：休息 1' },
      { key: '45-75', label: '45–75 分鐘：教學區塊 B' },
      { key: '75-80', label: '75–80 分鐘：休息 2' },
      { key: '80-110', label: '80–110 分鐘：教學區塊 C' },
      { key: '110-120', label: '110–120 分鐘：收尾整理' }
    ]
    
    timeSlots.forEach(slot => {
      if (data.teachingContent[slot.key]) {
        content += `### ${slot.label}\n${data.teachingContent[slot.key]}\n\n`
      }
    })
  } else {
    // 如果是字串，直接顯示
    content += `${data.teachingContent}\n\n`
  }
  
  content += `## 小作業\n${data.homework}\n`
  
  return content
}

const regenerateCurriculum = async (index) => {
  const item = curriculumList[index]
  item.isRegenerating = true
  
  await generateCurriculumForDay(index)
  
  item.isRegenerating = false
  toastStore.showToast(`第 ${index + 1} 天課綱重新生成完成`, 'success')
  updateModelValue()
}

const copyAllCurriculum = async () => {
  try {
    // 整理所有課綱內容為純文字格式
    let allContent = ''
    curriculumList.forEach((item, index) => {
      allContent += `========================================\n`
      allContent += `第 ${index + 1} 天 - ${formatDate(item.date)}\n`
      allContent += `時間: ${startTime.value} - ${endTime.value}\n`
      allContent += `========================================\n\n`
      allContent += item.content || '（尚未生成）'
      allContent += '\n\n\n'
    })
    
    // 複製到剪貼簿
    await navigator.clipboard.writeText(allContent)
    toastStore.showToast('✅ 所有課綱已複製到剪貼簿！', 'success')
  } catch (error) {
    console.error('複製失敗:', error)
    toastStore.showToast('複製失敗，請手動複製', 'error')
  }
}

const toggleEdit = (index) => {
  curriculumList[index].isEditing = true
}

const cancelEdit = (index) => {
  curriculumList[index].content = curriculumList[index].originalContent
  curriculumList[index].isEditing = false
}

const saveEdit = (index) => {
  curriculumList[index].originalContent = curriculumList[index].content
  curriculumList[index].isEditing = false
  toastStore.showToast('課綱已儲存', 'success')
  updateModelValue()
}

const updateModelValue = () => {
  emit('update:modelValue', curriculumList.map(item => ({
    date: item.date,
    content: item.content
  })))
}

const renderMarkdown = (content) => {
  if (!content) return ''
  return marked(content)
}

// 提取資訊圖表摘要（給家長看的簡化版）
const extractInfographicSummary = (curriculumData) => {
  const summaries = []
  
  curriculumList.forEach((item, index) => {
    if (!item.content) return
    
    // 從 Markdown 提取單元名稱
    const unitMatch = item.content.match(/^#\s+(.+)$/m)
    const unitName = unitMatch ? unitMatch[1] : `第 ${index + 1} 天課程`
    
    // 提取學習目標
    const objectivesMatch = item.content.match(/##\s+學習目標\n([\s\S]*?)(?=\n##|$)/)
    const objectives = []
    if (objectivesMatch) {
      const objectiveLines = objectivesMatch[1].match(/^[-*]\s+(.+)$/gm)
      if (objectiveLines) {
        objectiveLines.forEach(line => {
          const obj = line.replace(/^[-*]\s+/, '').trim()
          if (obj) objectives.push(obj)
        })
      }
    }
    
    // 提取教學流程（整理時間段）
    let teachingFlow = ''
    const flowMatches = item.content.matchAll(/###\s+(.+?)\n([\s\S]*?)(?=\n###|\n##|$)/g)
    const flowSegments = []
    for (const match of flowMatches) {
      const timeLabel = match[1] // 例如: "0–10 分鐘：暖身互動"
      const content = match[2].trim().substring(0, 50) // 取前50字
      if (timeLabel.includes('分鐘')) {
        flowSegments.push(`${timeLabel}: ${content}`)
      }
    }
    if (flowSegments.length > 0) {
      teachingFlow = flowSegments.join(' → ')
    }
    
    // 提取小作業
    const homeworkMatch = item.content.match(/##\s+小作業\n([\s\S]*?)$/)
    const homework = homeworkMatch ? homeworkMatch[1].trim() : ''
    
    summaries.push({
      day: index + 1,
      unitName,
      objectives: objectives.slice(0, 3), // 最多3個目標
      teachingFlow, // 新增教學流程
      homework: homework.substring(0, 100), // 最多100字
      fullContent: item.content // 記錄完整課綱內容
    })
  })
  
  return summaries
}

const handleNext = () => {
  if (!allGenerated.value) {
    toastStore.showToast('請先生成所有課綱', 'warning')
    return
  }
  
  // 記錄完整課綱內容到 localStorage
  const fullCurriculum = curriculumList.map(item => ({
    date: item.date,
    content: item.content,
    generatedAt: new Date().toISOString()
  }))
  localStorage.setItem('course_curriculum_backup', JSON.stringify(fullCurriculum))
  console.log('✅ 課綱已記錄', fullCurriculum.length, '天')
  
  // 傳遞課綱摘要給資訊圖表生成使用（包含教學流程）
  const summaries = extractInfographicSummary()
  emit('update:infographicData', summaries)
  
  updateModelValue()
  emit('next')
}
</script>

<style scoped>
/* Markdown 渲染樣式 */
.curriculum-content :deep(.prose) {
  color: var(--fallback-bc, oklch(var(--bc) / 1));
}

.curriculum-content :deep(.prose h1),
.curriculum-content :deep(.prose h2),
.curriculum-content :deep(.prose h3),
.curriculum-content :deep(.prose h4) {
  color: var(--fallback-p, oklch(var(--p) / 1));
  font-weight: bold;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.curriculum-content :deep(.prose h1) { font-size: 1.5em; }
.curriculum-content :deep(.prose h2) { font-size: 1.3em; }
.curriculum-content :deep(.prose h3) { font-size: 1.1em; }
.curriculum-content :deep(.prose h4) { font-size: 1em; }

.curriculum-content :deep(.prose ul),
.curriculum-content :deep(.prose ol) {
  margin-left: 1.5em;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.curriculum-content :deep(.prose li) {
  margin-top: 0.25em;
  margin-bottom: 0.25em;
}

.curriculum-content :deep(.prose p) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  line-height: 1.6;
}

.curriculum-content :deep(.prose strong) {
  color: var(--fallback-p, oklch(var(--p) / 1));
  font-weight: bold;
}

.curriculum-content :deep(.prose code) {
  background-color: var(--fallback-b2, oklch(var(--b2) / 1));
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

.curriculum-content :deep(.prose pre) {
  background-color: var(--fallback-b2, oklch(var(--b2) / 1));
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
}

.curriculum-content :deep(.prose blockquote) {
  border-left: 4px solid var(--fallback-p, oklch(var(--p) / 1));
  padding-left: 1em;
  margin-left: 0;
  font-style: italic;
  opacity: 0.8;
}

.curriculum-content :deep(.prose hr) {
  border-color: var(--fallback-bc, oklch(var(--bc) / 0.2));
  margin: 1.5em 0;
}

.curriculum-content :deep(.prose table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

.curriculum-content :deep(.prose th),
.curriculum-content :deep(.prose td) {
  border: 1px solid var(--fallback-bc, oklch(var(--bc) / 0.2));
  padding: 0.5em;
  text-align: left;
}

.curriculum-content :deep(.prose th) {
  background-color: var(--fallback-b2, oklch(var(--b2) / 1));
  font-weight: bold;
}
</style>
