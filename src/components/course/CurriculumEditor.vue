<template>
  <div>
    <h2 class="text-2xl font-bold text-base-content mb-6">步驟 3: 課綱生成</h2>
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

          <!-- 顯示模式 -->
          <div v-if="!item.isEditing && item.content" class="prose prose-sm max-w-none">
            <div class="whitespace-pre-wrap text-base-content">{{ item.content }}</div>
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
import { generateDayCurriculum } from '@/services/gemini'
import { useToastStore } from '@/stores/toastStore'

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
  
  content += `\n## 教學內容\n${data.teachingContent}\n\n`
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

const handleNext = () => {
  if (!allGenerated.value) {
    toastStore.showToast('請先生成所有課綱', 'warning')
    return
  }
  updateModelValue()
  emit('next')
}
</script>
