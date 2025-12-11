<template>
  <div class="container mx-auto p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold">編輯課程</h1>
        <p v-if="courseStore.currentCourse" class="text-sm text-base-content/60 mt-1">
          {{ courseStore.currentCourse.basicInfo?.className || '未命名課程' }}
        </p>
      </div>
      <router-link to="/course/list" class="btn btn-ghost">
        <i class="fas fa-arrow-left mr-2"></i>返回列表
      </router-link>
    </div>

    <!-- Loading -->
    <LoadingSpinner v-if="loading" message="載入課程資料中..." />

    <!-- Error -->
    <div v-else-if="error" class="alert alert-error">
      <i class="fas fa-exclamation-circle"></i>
      <span>{{ error }}</span>
      <router-link to="/course/list" class="btn btn-sm">返回列表</router-link>
    </div>

    <!-- Edit Form -->
    <div v-else-if="courseData" class="space-y-6">
      <!-- Progress Steps -->
      <div class="card bg-base-200">
        <div class="card-body">
          <ul class="steps steps-horizontal w-full">
            <li 
              class="step"
              :class="{ 'step-primary': currentStep >= 1 }"
            >
              基本資訊
            </li>
            <li 
              class="step"
              :class="{ 'step-primary': currentStep >= 2 }"
            >
              課程課綱
            </li>
            <li 
              class="step"
              :class="{ 'step-primary': currentStep >= 3 }"
            >
              宣傳文案
            </li>
            <li 
              class="step"
              :class="{ 'step-primary': currentStep >= 4 }"
            >
              視覺設計
            </li>
          </ul>
        </div>
      </div>

      <!-- Step Components -->
      <div class="card bg-base-200">
        <div class="card-body">
          <!-- Step 1: Basic Info -->
          <CourseBasicSetup
            v-if="currentStep === 1"
            :basicInfo="courseData.basicInfo"
            :schedule="courseData.schedule"
            @update:basicInfo="updateBasicInfo"
            @update:schedule="updateSchedule"
            @next="nextStep"
          />

          <!-- Step 2: Curriculum -->
          <CurriculumEditor
            v-else-if="currentStep === 2"
            :curriculum="courseData.curriculum"
            :basicInfo="courseData.basicInfo"
            @update:curriculum="updateCurriculum"
            @next="nextStep"
            @prev="prevStep"
          />

          <!-- Step 3: Promotion -->
          <PromotionEditor
            v-else-if="currentStep === 3"
            :promotion="courseData.promotion"
            :basicInfo="courseData.basicInfo"
            :curriculum="courseData.curriculum"
            @update:promotion="updatePromotion"
            @next="nextStep"
            @prev="prevStep"
          />

          <!-- Step 4: Infographic -->
          <InfographicGenerator
            v-else-if="currentStep === 4"
            :infographic="courseData.infographic"
            :curriculum="courseData.curriculum"
            :courseId="courseId"
            @update:infographic="updateInfographic"
            @prev="prevStep"
            @save="saveCourse"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between">
        <button 
          v-if="currentStep > 1"
          @click="prevStep"
          class="btn btn-ghost"
        >
          <i class="fas fa-arrow-left mr-2"></i>上一步
        </button>
        <div v-else></div>

        <div class="flex gap-2">
          <button 
            @click="saveDraft"
            class="btn btn-ghost"
            :disabled="saving"
          >
            <i class="fas fa-save mr-2"></i>儲存草稿
          </button>
          <button 
            v-if="currentStep < 4"
            @click="nextStep"
            class="btn btn-primary"
          >
            下一步<i class="fas fa-arrow-right ml-2"></i>
          </button>
          <button 
            v-else
            @click="saveCourse"
            class="btn btn-primary"
            :disabled="saving"
          >
            <i class="fas fa-check mr-2"></i>{{ saving ? '儲存中...' : '完成編輯' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <ToastNotification />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '../stores/courseStore'
import { useToastStore } from '../stores/toastStore'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ToastNotification from '../components/common/ToastNotification.vue'
import CourseBasicSetup from '../components/course/CourseBasicSetup.vue'
import CurriculumEditor from '../components/course/CurriculumEditor.vue'
import InfographicGenerator from '../components/course/InfographicGenerator.vue'
import PromotionEditor from '../components/course/PromotionEditor.vue'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const toastStore = useToastStore()

const courseId = route.params.id
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const currentStep = ref(1)

const courseData = ref(null)

// Methods
const updateBasicInfo = (data) => {
  courseData.value.basicInfo = { ...courseData.value.basicInfo, ...data }
}

const updateSchedule = (data) => {
  courseData.value.schedule = { ...courseData.value.schedule, ...data }
}

const updateCurriculum = (data) => {
  courseData.value.curriculum = data
}

const updateInfographic = (data) => {
  courseData.value.infographic = data
}

const updatePromotion = (data) => {
  courseData.value.promotion = data
}

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const saveDraft = async () => {
  saving.value = true
  try {
    const result = await courseStore.updateCourse(courseId, {
      ...courseData.value,
      status: 'draft'
    })

    if (result.success) {
      toastStore.showToast('草稿已儲存', 'success')
    } else {
      toastStore.showToast('儲存失敗: ' + result.error, 'error')
    }
  } catch (e) {
    toastStore.showToast('儲存失敗: ' + e.message, 'error')
  } finally {
    saving.value = false
  }
}

const saveCourse = async () => {
  saving.value = true
  try {
    const result = await courseStore.updateCourse(courseId, {
      ...courseData.value,
      status: 'published'
    })

    if (result.success) {
      toastStore.showToast('課程已更新', 'success')
      setTimeout(() => {
        router.push('/course/list')
      }, 1000)
    } else {
      toastStore.showToast('儲存失敗: ' + result.error, 'error')
    }
  } catch (e) {
    toastStore.showToast('儲存失敗: ' + e.message, 'error')
  } finally {
    saving.value = false
  }
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    const result = await courseStore.fetchCourse(courseId)
    
    if (result.success) {
      // Initialize courseData with fetched data
      courseData.value = {
        basicInfo: result.data.basicInfo || {
          courseType: 'parent',
          topic: '',
          audience: '',
          className: '',
          nameKeywords: '',
          startDate: '',
          endDate: ''
        },
        schedule: result.data.schedule || {
          totalHours: '',
          sessionsPerWeek: '',
          hoursPerSession: '',
          sessions: []
        },
        curriculum: result.data.curriculum || '',
        infographic: result.data.infographic || {
          style: 'hand-drawn',
          images: []
        },
        promotion: result.data.promotion || {
          content: '',
          charCount: 0
        },
        status: result.data.status || 'draft'
      }
    } else {
      error.value = result.error || '載入課程失敗'
      toastStore.showToast('載入課程失敗: ' + result.error, 'error')
    }
  } catch (e) {
    error.value = e.message
    toastStore.showToast('載入課程失敗: ' + e.message, 'error')
  } finally {
    loading.value = false
  }
})
</script>
