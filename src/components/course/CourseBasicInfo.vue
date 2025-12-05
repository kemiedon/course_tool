<template>
  <div>
    <h2 class="text-2xl font-bold text-base-content mb-6">步驟 1: 基本資訊</h2>

    <div class="space-y-6">
      <!-- 課程主題 -->
      <div>
        <label class="input-label">
          課程主題 <span class="text-error">*</span>
        </label>
        <input
          v-model="formData.topic"
          type="text"
          class="input-field"
          placeholder="例如: 打造AI自學力: 用Gemini3+NotebookLM讓孩子學會整理、理解、複習"
        />
        <p v-if="errors.topic" class="input-error">{{ errors.topic }}</p>
      </div>

      <!-- 目標客群 -->
      <div>
        <label class="input-label">
          主要需求客群 <span class="text-error">*</span>
        </label>
        <input
          v-model="formData.targetAudience"
          type="text"
          class="input-field"
          placeholder="例如: 國小5年級以上到國2生的家長"
        />
        <p v-if="errors.targetAudience" class="input-error">{{ errors.targetAudience }}</p>
      </div>

      <!-- 課程描述 -->
      <div>
        <label class="input-label">
          課程描述 <span class="text-error">*</span>
        </label>
        <textarea
          v-model="formData.description"
          class="w-full"
          rows="6"
          placeholder="請詳細說明這個課程會教哪些內容、使用哪些工具、學員可以學到什麼技能等...&#10;&#10;例如：本課程將教導學員使用 Gemini 3 和 NotebookLM 進行學習資料的整理與分析。學員將學會如何利用 AI 工具整理筆記、提取重點、製作摘要，並透過實際操作培養自主學習的能力。課程中會帶領學員完成多個實作專案，包括製作個人學習知識庫、自動生成複習筆記等。"
        ></textarea>
        <p class="text-sm text-base-content opacity-60 mt-1">
          <i class="fas fa-info-circle mr-1"></i>
          此描述將作為 AI 生成課綱的重要參考依據，請盡可能詳細說明
        </p>
        <p v-if="errors.description" class="input-error">{{ errors.description }}</p>
      </div>

      <!-- 課程分類 -->
      <div>
        <label class="input-label">
          課程分類 <span class="text-error">*</span>
        </label>
        <div class="flex gap-4">
          <label class="flex items-center cursor-pointer">
            <input
              v-model="formData.category"
              type="radio"
              value="children"
              class="w-5 h-5 text-primary accent-primary"
            />
            <span class="ml-2">兒童課程</span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input
              v-model="formData.category"
              type="radio"
              value="vocational"
              class="w-5 h-5 text-primary accent-primary"
            />
            <span class="ml-2">職訓課程</span>
          </label>
        </div>
        <p class="text-sm text-base-content opacity-60 mt-1">
          兒童課程將使用國中生可理解的語言，職訓課程使用高中生以上可理解的語言
        </p>
      </div>

      <!-- AI 生成班級名稱 -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="input-label mb-0">
            班級名稱 <span class="text-error">*</span>
          </label>
          <button
            @click="generateNames"
            :disabled="!canGenerate || generating"
            class="btn btn-secondary text-sm"
          >
            <i :class="generating ? 'fas fa-spinner fa-spin' : 'fas fa-magic'" class="mr-1"></i>
            {{ generating ? 'AI 生成中...' : 'AI 生成建議' }}
          </button>
        </div>

        <!-- AI 建議的班級名稱 -->
        <div v-if="formData.suggestedNames.length > 0" class="mb-3">
          <p class="text-sm text-base-content opacity-70 mb-2">選擇一個建議名稱或自行輸入：</p>
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="(name, index) in formData.suggestedNames"
              :key="index"
              @click="selectName(name)"
              :class="[
                'p-3 border-2 rounded-box text-left transition-all hover:shadow-md',
                formData.className === name
                  ? 'border-primary bg-primary bg-opacity-10'
                  : 'border-base-300 hover:border-primary'
              ]"
            >
              <i class="fas fa-lightbulb text-warning mr-2"></i>
              {{ name }}
            </button>
          </div>
        </div>

        <!-- 自訂班級名稱 -->
        <input
          v-model="formData.className"
          type="text"
          class="input-field"
          placeholder="選擇AI建議或自行輸入班級名稱"
        />
        <p v-if="errors.className" class="input-error">{{ errors.className }}</p>
      </div>
    </div>

    <!-- 按鈕 -->
    <div class="flex justify-end mt-8">
      <button @click="handleNext" class="btn btn-primary">
        下一步
        <i class="fas fa-arrow-right ml-2"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { generateClassNames } from '@/services/gemini'
import { useToastStore } from '@/stores/toastStore'
import { required } from '@/utils/validators'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'next'])

const toastStore = useToastStore()

const formData = reactive({ ...props.modelValue })
const errors = reactive({})
const generating = ref(false)

// 監聽變化並同步到父組件
watch(formData, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })

const canGenerate = computed(() => {
  return formData.topic && formData.targetAudience && formData.description
})

const generateNames = async () => {
  if (!canGenerate.value) {
    toastStore.warning('請先填寫課程主題、目標客群和課程描述')
    return
  }

  generating.value = true
  try {
    const result = await generateClassNames(formData.topic, formData.targetAudience)
    if (result.success) {
      formData.suggestedNames = result.data
      toastStore.success('AI 建議生成成功！')
    } else {
      toastStore.error('生成失敗：' + result.error)
    }
  } catch (error) {
    toastStore.error('生成失敗：' + error.message)
  } finally {
    generating.value = false
  }
}

const selectName = (name) => {
  formData.className = name
}

const validate = () => {
  errors.topic = required(formData.topic, '課程主題')
  errors.targetAudience = required(formData.targetAudience, '目標客群')
  errors.description = required(formData.description, '課程描述')
  errors.className = required(formData.className, '班級名稱')

  return !errors.topic && !errors.targetAudience && !errors.description && !errors.className
}

const handleNext = () => {
  if (validate()) {
    emit('next')
  } else {
    toastStore.error('請填寫所有必填欄位')
  }
}
</script>
