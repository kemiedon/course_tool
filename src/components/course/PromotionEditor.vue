<template>
  <div>
    <h2 class="text-2xl font-bold text-base-content mb-6">步驟 3: 課程宣傳內容</h2>
    <p class="text-base-content opacity-70 mb-6">AI 生成吸引人的課程介紹文案</p>
    
    <div class="space-y-6">
      <!-- 生成按鈕 -->
      <div v-if="!promotionData.content" class="text-center">
        <button
          @click="generateContent"
          :disabled="isGenerating"
          class="btn btn-primary btn-lg"
        >
          <i class="fas fa-robot mr-2"></i>
          {{ isGenerating ? '生成中...' : 'AI 生成宣傳內容' }}
        </button>
        <p class="text-sm text-base-content opacity-60 mt-3">
          根據課程資訊自動生成吸引人的宣傳文案
        </p>
      </div>

      <!-- 宣傳內容編輯區 -->
      <div v-if="promotionData.content" class="space-y-4">
        <div class="flex items-center justify-between">
          <label class="input-label mb-0">宣傳內容</label>
          <div class="flex gap-2">
            <button
              @click="generateContent"
              :disabled="isGenerating"
              class="btn btn-sm btn-secondary"
            >
              <i class="fas fa-sync-alt mr-1" :class="{ 'fa-spin': isGenerating }"></i>
              重新生成
            </button>
            <button
              @click="copyToClipboard"
              class="btn btn-sm btn-secondary"
            >
              <i class="fas fa-copy mr-1"></i>
              複製
            </button>
          </div>
        </div>

        <textarea
          v-model="promotionData.content"
          class="w-full h-96"
          placeholder="輸入或編輯宣傳內容..."
          @input="handleInput"
        ></textarea>

        <div class="flex items-center justify-between text-sm">
          <span class="text-base-content opacity-60">
            字數統計: {{ contentLength }} 字
          </span>
          <span class="text-base-content opacity-60">
            建議字數: 200-500 字
          </span>
        </div>

        <!-- 預覽 -->
        <div class="bg-base-200 rounded-lg p-6">
          <h3 class="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
            <i class="fas fa-eye text-primary"></i>
            預覽
          </h3>
          <div class="prose prose-sm max-w-none">
            <div class="whitespace-pre-wrap text-base-content">
              {{ promotionData.content }}
            </div>
          </div>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-if="isGenerating" class="flex items-center justify-center py-12">
        <div class="loading-spinner"></div>
        <span class="ml-3 text-base-content opacity-70">AI 正在生成宣傳內容...</span>
      </div>
    </div>

    <div class="flex justify-between mt-8">
      <button @click="$emit('prev')" class="btn btn-secondary">
        <i class="fas fa-arrow-left mr-2"></i>
        上一步
      </button>
      <button @click="handleComplete" class="btn btn-primary" :disabled="!promotionData.content">
        完成並儲存
        <i class="fas fa-check ml-2"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { generatePromotion } from '@/services/gemini'
import { useToastStore } from '@/stores/toastStore'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  courseInfo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'next', 'prev'])

const toastStore = useToastStore()
const isGenerating = ref(false)
const promotionData = reactive({ ...props.modelValue })

const contentLength = computed(() => {
  return promotionData.content ? promotionData.content.length : 0
})

const generateContent = async () => {
  isGenerating.value = true

  try {
    const result = await generatePromotion(props.courseInfo)

    if (result.success) {
      promotionData.content = result.data
      toastStore.showToast('宣傳內容生成成功！', 'success')
      updateModelValue()
    } else {
      toastStore.showToast(`生成失敗: ${result.error}`, 'error')
    }
  } catch (error) {
    toastStore.showToast('生成過程發生錯誤', 'error')
  } finally {
    isGenerating.value = false
  }
}

const handleInput = () => {
  updateModelValue()
}

const updateModelValue = () => {
  emit('update:modelValue', { ...promotionData })
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(promotionData.content)
    toastStore.showToast('已複製到剪貼簿', 'success')
  } catch (error) {
    toastStore.showToast('複製失敗', 'error')
  }
}

const handleComplete = () => {
  if (!promotionData.content) {
    toastStore.showToast('請先生成或輸入宣傳內容', 'warning')
    return
  }
  updateModelValue()
  emit('next')
}
</script>
