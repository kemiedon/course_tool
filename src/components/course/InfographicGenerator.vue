<template>
  <div>
    <h2 class="text-2xl font-bold text-base-content mb-6">步驟 3: 資訊圖表生成</h2>
    <p class="text-base-content opacity-70 mb-6">為每日課程生成精美的資訊圖表</p>
    
    <div class="space-y-6">
      <!-- 風格選擇 -->
      <div class="bg-base-200 rounded-lg p-6">
        <h3 class="text-lg font-bold text-base-content mb-4">
          <i class="fas fa-palette mr-2 text-primary"></i>
          選擇圖表風格
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            v-for="style in styles"
            :key="style.value"
            @click="selectedStyle = style.value"
            :class="[
              'p-4 rounded-lg border-2 transition-all text-center',
              selectedStyle === style.value
                ? 'border-primary bg-primary bg-opacity-10'
                : 'border-base-300 hover:border-primary'
            ]"
          >
            <i :class="[style.icon, 'text-3xl mb-2']"></i>
            <div class="font-bold text-sm">{{ style.label }}</div>
            <div class="text-xs opacity-60 mt-1">{{ style.desc }}</div>
          </button>
        </div>
      </div>

      <!-- 生成按鈕 -->
      <div v-if="images.length === 0" class="text-center">
        <button
          @click="generateAllImages"
          :disabled="isGenerating || !selectedStyle"
          class="btn btn-primary btn-lg"
        >
          <i class="fas fa-magic mr-2"></i>
          {{ isGenerating ? '生成中...' : '一鍵生成所有圖表' }}
        </button>
        <p class="text-sm text-base-content opacity-60 mt-3">
          將為 {{ curriculum.length }} 天課程生成 {{ styles.find(s => s.value === selectedStyle)?.label }} 風格圖表
        </p>
      </div>

      <!-- 進度顯示 -->
      <div v-if="isGenerating" class="bg-base-200 rounded-lg p-6">
        <div class="flex items-center justify-between mb-3">
          <span class="text-base-content font-bold">生成進度</span>
          <span class="text-primary font-bold">{{ generatedCount }} / {{ curriculum.length }}</span>
        </div>
        <div class="w-full bg-base-300 rounded-full h-3">
          <div
            class="bg-primary h-3 rounded-full transition-all duration-300"
            :style="{ width: `${(generatedCount / curriculum.length) * 100}%` }"
          ></div>
        </div>
        <p class="text-sm text-base-content opacity-60 mt-3 text-center">
          <i class="fas fa-info-circle mr-1"></i>
          目前使用預覽圖片，實際整合 Imagen API 後將生成真實圖片
        </p>
      </div>

      <!-- 圖表網格 -->
      <div v-if="images.length > 0" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-base-content">
            已生成圖表 ({{ images.length }})
          </h3>
          <div class="flex gap-2">
            <button @click="regenerateAll" class="btn btn-sm btn-secondary">
              <i class="fas fa-sync-alt mr-1"></i>
              全部重新生成
            </button>
            <button @click="downloadAll" class="btn btn-sm btn-secondary">
              <i class="fas fa-download mr-1"></i>
              下載全部
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(img, index) in images"
            :key="index"
            class="card group"
          >
            <div class="relative">
              <img
                :src="img.imageUrl"
                :alt="`第 ${index + 1} 天課程圖表`"
                class="w-full h-48 object-cover rounded-lg"
              />
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  @click="viewImage(img.imageUrl)"
                  class="btn btn-sm btn-primary"
                  title="查看大圖"
                >
                  <i class="fas fa-search-plus"></i>
                </button>
                <button
                  @click="downloadImage(img.imageUrl, index)"
                  class="btn btn-sm btn-secondary"
                  title="下載"
                >
                  <i class="fas fa-download"></i>
                </button>
                <button
                  @click="regenerateImage(index)"
                  :disabled="img.isRegenerating"
                  class="btn btn-sm btn-secondary"
                  title="重新生成"
                >
                  <i class="fas fa-sync-alt" :class="{ 'fa-spin': img.isRegenerating }"></i>
                </button>
              </div>
            </div>
            <div class="mt-3">
              <div class="text-sm font-bold text-primary">第 {{ index + 1 }} 天</div>
              <div class="text-xs text-base-content opacity-60 mt-1">
                {{ curriculum[index]?.date || '' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 圖片預覽 Modal -->
    <div
      v-if="previewImage"
      @click="previewImage = null"
      class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
    >
      <img :src="previewImage" class="max-w-full max-h-full rounded-lg" />
    </div>

    <div class="flex justify-between mt-8">
      <button @click="$emit('prev')" class="btn btn-secondary">
        <i class="fas fa-arrow-left mr-2"></i>
        上一步
      </button>
      <button @click="handleNext" class="btn btn-primary" :disabled="images.length === 0">
        下一步
        <i class="fas fa-arrow-right ml-2"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { generateImage } from '@/services/gemini'
import { uploadImageFromUrl, generateImagePath } from '@/services/storage'
import { useToastStore } from '@/stores/toastStore'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  curriculum: {
    type: Array,
    required: true
  },
  courseId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'next', 'prev'])

const toastStore = useToastStore()

const styles = [
  {
    value: 'hand-drawn',
    label: '手繪插畫風',
    desc: '溫馨可愛',
    icon: 'fas fa-pencil-alt'
  },
  {
    value: 'tech-ai',
    label: '科技 AI 風',
    desc: '現代專業',
    icon: 'fas fa-robot'
  },
  {
    value: 'manga',
    label: '日式漫畫風',
    desc: '活潑趣味',
    icon: 'fas fa-book'
  },
  {
    value: '8bit',
    label: '8-bit 遊戲風',
    desc: '復古像素',
    icon: 'fas fa-gamepad'
  }
]

const selectedStyle = ref(props.modelValue?.style || 'hand-drawn')
const images = reactive(props.modelValue?.images || [])
const isGenerating = ref(false)
const generatedCount = ref(0)
const previewImage = ref(null)

onMounted(() => {
  if (images.length > 0) {
    images.forEach(img => {
      img.isRegenerating = false
    })
  }
})

const generateAllImages = async () => {
  if (!selectedStyle.value) {
    toastStore.showToast('請先選擇圖表風格', 'warning')
    return
  }

  isGenerating.value = true
  generatedCount.value = 0
  images.length = 0

  for (let i = 0; i < props.curriculum.length; i++) {
    await generateImageForDay(i)
    generatedCount.value = i + 1
  }

  isGenerating.value = false
  toastStore.showToast('所有圖表生成完成！', 'success')
  updateModelValue()
}

const generateImageForDay = async (index) => {
  const curriculumItem = props.curriculum[index]
  
  try {
    // 從課綱內容中提取單元名稱和學習目標
    const content = curriculumItem.content || ''
    const unitName = extractUnitName(content) || `第 ${index + 1} 天課程`
    const objectives = extractObjectives(content)
    const homework = extractHomework(content)
    
    // 建立家長友善的摘要
    const infographicSummary = {
      day: index + 1,
      unitName,
      objectives: objectives.slice(0, 3),
      homework: homework.substring(0, 80)
    }

    const result = await generateImage(unitName, objectives, selectedStyle.value, infographicSummary)
    
    if (result.success) {
      let finalImageUrl = result.data.imageUrl
      
      // 如果有 courseId,嘗試上傳到 Firebase Storage
      if (props.courseId) {
        const storagePath = generateImagePath(props.courseId, 'infographic', index)
        const uploadResult = await uploadImageFromUrl(result.data.imageUrl, storagePath)
        
        if (uploadResult.success) {
          finalImageUrl = uploadResult.url
          console.log(`圖片已上傳至 Firebase Storage: ${storagePath}`)
        } else {
          console.warn(`Firebase Storage 上傳失敗,使用原始 URL: ${uploadResult.error}`)
        }
      }
      
      images.push({
        day: index + 1,
        imageUrl: finalImageUrl,
        generatedAt: new Date().toISOString(),
        isRegenerating: false
      })
    } else {
      toastStore.showToast(`第 ${index + 1} 天圖表生成失敗`, 'error')
      // 使用預設圖片
      images.push({
        day: index + 1,
        imageUrl: `https://via.placeholder.com/1200x630/d4a574/221a15?text=第${index + 1}天`,
        generatedAt: new Date().toISOString(),
        isRegenerating: false
      })
    }
  } catch (error) {
    console.error('生成圖片錯誤:', error)
    images.push({
      day: index + 1,
      imageUrl: `https://via.placeholder.com/1200x630/d4a574/221a15?text=第${index + 1}天`,
      generatedAt: new Date().toISOString(),
      isRegenerating: false
    })
  }
}

const extractUnitName = (content) => {
  // 嘗試從 Markdown 中提取第一個標題
  const match = content.match(/^#{1,4}\s+(.+)$/m)
  return match ? match[1] : null
}

const extractObjectives = (content) => {
  // 嘗試提取學習目標列表
  const objectives = []
  const lines = content.split('\n')
  let inObjectives = false
  
  for (const line of lines) {
    if (line.includes('學習目標') || line.includes('教學目標')) {
      inObjectives = true
      continue
    }
    if (inObjectives && (line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./))) {
      const text = line.replace(/^[-*\d.]\s*/, '').trim()
      if (text) objectives.push(text)
    }
    if (inObjectives && line.trim().startsWith('#')) {
      break
    }
  }
  
  return objectives.slice(0, 5) // 最多5個目標
}

const extractHomework = (content) => {
  // 提取小作業內容
  const homeworkMatch = content.match(/##?\s*小作業[\s\S]*?\n([\s\S]*?)(?=\n#|$)/)
  if (homeworkMatch && homeworkMatch[1]) {
    return homeworkMatch[1].trim()
  }
  return ''
}

const regenerateImage = async (index) => {
  images[index].isRegenerating = true
  
  try {
    const curriculumItem = props.curriculum[index]
    const content = curriculumItem.content || ''
    const unitName = extractUnitName(content) || `第 ${index + 1} 天課程`
    const objectives = extractObjectives(content)
    const homework = extractHomework(content)
    
    const infographicSummary = {
      day: index + 1,
      unitName,
      objectives: objectives.slice(0, 3),
      homework: homework.substring(0, 80)
    }

    const result = await generateImage(unitName, objectives, selectedStyle.value, infographicSummary)
    
    if (result.success) {
      let finalImageUrl = result.data.imageUrl
      
      // 如果有 courseId,嘗試上傳到 Firebase Storage
      if (props.courseId) {
        const storagePath = generateImagePath(props.courseId, 'infographic', index)
        const uploadResult = await uploadImageFromUrl(result.data.imageUrl, storagePath)
        
        if (uploadResult.success) {
          finalImageUrl = uploadResult.url
        }
      }
      
      images[index].imageUrl = finalImageUrl
      images[index].generatedAt = new Date().toISOString()
      toastStore.showToast(`第 ${index + 1} 天圖表重新生成完成`, 'success')
    } else {
      toastStore.showToast(`重新生成失敗`, 'error')
    }
  } catch (error) {
    toastStore.showToast(`重新生成失敗`, 'error')
  } finally {
    images[index].isRegenerating = false
    updateModelValue()
  }
}

const regenerateAll = async () => {
  if (!confirm('確定要重新生成所有圖表嗎？')) return
  
  isGenerating.value = true
  generatedCount.value = 0
  
  for (let i = 0; i < images.length; i++) {
    images[i].isRegenerating = true
    await regenerateImage(i)
    generatedCount.value = i + 1
  }
  
  isGenerating.value = false
  toastStore.showToast('所有圖表重新生成完成！', 'success')
}

const viewImage = (url) => {
  previewImage.value = url
}

const downloadImage = (url, index) => {
  const link = document.createElement('a')
  link.href = url
  link.download = `課程圖表_第${index + 1}天.png`
  link.click()
  toastStore.showToast('圖片下載中...', 'info')
}

const downloadAll = () => {
  images.forEach((img, index) => {
    setTimeout(() => {
      downloadImage(img.imageUrl, index)
    }, index * 500) // 延遲避免同時下載太多
  })
  toastStore.showToast(`開始下載 ${images.length} 張圖片`, 'success')
}

const updateModelValue = () => {
  emit('update:modelValue', {
    style: selectedStyle.value,
    images: images.map(img => ({
      day: img.day,
      imageUrl: img.imageUrl,
      generatedAt: img.generatedAt
    }))
  })
}

const handleNext = () => {
  if (images.length === 0) {
    toastStore.showToast('請先生成圖表', 'warning')
    return
  }
  updateModelValue()
  emit('next')
}
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}
</style>
