<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-base-content mb-2">
        <i class="fas fa-plus-circle text-primary mr-2"></i>
        建立新課程
      </h1>
      <p class="text-base-content opacity-70">按照步驟完成課程規劃</p>
    </div>

    <!-- 進度指示器 -->
    <div class="card mb-6">
      <div class="flex items-center justify-between">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex items-center flex-1"
        >
          <div class="flex flex-col items-center flex-1">
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all',
                currentStep >= index + 1
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-300 text-base-content opacity-50'
              ]"
            >
              {{ index + 1 }}
            </div>
            <span
              :class="[
                'text-sm mt-2 text-center',
                currentStep >= index + 1 ? 'text-primary font-medium' : 'text-base-content opacity-50'
              ]"
            >
              {{ step }}
            </span>
          </div>
          <div
            v-if="index < steps.length - 1"
            :class="[
              'h-1 flex-1 mx-2',
              currentStep > index + 1 ? 'bg-primary' : 'bg-base-300'
            ]"
          ></div>
        </div>
      </div>
    </div>

    <!-- 步驟內容 -->
    <div class="card">
      <!-- Step 1: 基本設定（合併基本資訊與排課） -->
      <CourseBasicSetup
        v-if="currentStep === 1"
        :basic-info-value="courseData.basicInfo"
        :schedule-value="courseData.schedule"
        @update:basicInfo="courseData.basicInfo = $event"
        @update:schedule="courseData.schedule = $event"
        @next="nextStep"
      />

      <!-- Step 2: 課綱生成 -->
      <CurriculumEditor
        v-if="currentStep === 2"
        v-model="courseData.curriculum"
        :course-info="courseData.basicInfo"
        :schedule="courseData.schedule"
        @next="nextStep"
        @prev="prevStep"
      />

      <!-- Step 3: 宣傳內容 -->
      <PromotionEditor
        v-if="currentStep === 3"
        v-model="courseData.promotion"
        :course-info="courseData.basicInfo"
        @next="nextStep"
        @prev="prevStep"
      />

      <!-- Step 4: 資訊圖表 -->
      <InfographicGenerator
        v-if="currentStep === 4"
        v-model="courseData.infographics"
        :curriculum="courseData.curriculum"
        :courseId="currentCourseId"
        @next="saveCourse"
        @prev="prevStep"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/courseStore'
import { useToastStore } from '@/stores/toastStore'
import CourseBasicSetup from '@/components/course/CourseBasicSetup.vue'
import CurriculumEditor from '@/components/course/CurriculumEditor.vue'
import InfographicGenerator from '@/components/course/InfographicGenerator.vue'
import PromotionEditor from '@/components/course/PromotionEditor.vue'

const router = useRouter()
const courseStore = useCourseStore()
const toastStore = useToastStore()

const steps = ['基本設定', '課綱生成', '宣傳內容', '資訊圖表']
const currentStep = ref(1)
const currentCourseId = ref(null)

const courseData = reactive({
  basicInfo: {
    topic: '',
    targetAudience: '',
    description: '',
    category: 'children',
    className: '',
    nameKeywords: '',
    suggestedNames: []
  },
  schedule: {
    totalHours: null,
    hoursPerDay: null,
    startDate: '',
    weekDays: [],
    startTime: '',
    endTime: '',
    scheduledDates: []
  },
  curriculum: [],
  infographics: {
    style: 'hand-drawn',
    images: []
  },
  promotion: {
    content: ''
  },
  googleForm: null
})

const nextStep = async () => {
  console.log('nextStep 被呼叫, 當前步驟:', currentStep.value)
  
  // 在進入圖表生成步驟前,先建立草稿以獲得 courseId
  if (currentStep.value === 3 && !currentCourseId.value) {
    await saveDraft()
  }
  
  if (currentStep.value < steps.length) {
    currentStep.value++
    console.log('切換到步驟:', currentStep.value)
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const saveDraft = async () => {
  try {
    const courseToSave = {
      basicInfo: courseData.basicInfo,
      schedule: courseData.schedule,
      curriculum: courseData.curriculum,
      infographic: courseData.infographics,
      promotion: courseData.promotion,
      status: 'draft'
    }

    if (currentCourseId.value) {
      // 更新現有課程
      const result = await courseStore.updateCourse(currentCourseId.value, courseToSave)
      if (result.success) {
        toastStore.showToast('草稿已儲存', 'success')
      }
    } else {
      // 建立新課程
      const result = await courseStore.createCourse(courseToSave)
      if (result.success) {
        currentCourseId.value = result.data.id
        toastStore.showToast('草稿已建立', 'success')
      }
    }
  } catch (error) {
    console.error('儲存草稿錯誤:', error)
  }
}

const saveCourse = async () => {
  try {
    const courseToSave = {
      basicInfo: courseData.basicInfo,
      schedule: courseData.schedule,
      curriculum: courseData.curriculum,
      infographic: courseData.infographics,
      promotion: courseData.promotion,
      status: 'published'
    }

    let result
    if (currentCourseId.value) {
      result = await courseStore.updateCourse(currentCourseId.value, courseToSave)
    } else {
      result = await courseStore.createCourse(courseToSave)
    }
    
    if (result.success) {
      toastStore.showToast('課程建立成功！', 'success')
      setTimeout(() => {
        router.push('/course/list')
      }, 1000)
    } else {
      toastStore.showToast('課程建立失敗：' + result.error, 'error')
    }
  } catch (error) {
    toastStore.showToast('儲存課程時發生錯誤', 'error')
  }
}
</script>
