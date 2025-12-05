<template>
  <div class="max-w-6xl mx-auto">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-base-content mb-4">
        <i class="fas fa-magic text-primary mr-3"></i>
        AI 課程規劃工具
      </h1>
      <p class="text-xl text-base-content opacity-80 mb-8">
        智慧生成課程內容、自動排程、製作精美資訊圖表
      </p>
      <router-link
        to="/courses/create"
        class="btn btn-primary text-lg px-8 py-3 inline-flex items-center gap-2"
      >
        <i class="fas fa-plus-circle"></i>
        開始建立課程
      </router-link>
    </div>

    <!-- Features -->
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <div class="card text-center hover:shadow-lg transition-shadow">
        <div class="text-primary text-4xl mb-4">
          <i class="fas fa-robot"></i>
        </div>
        <h3 class="text-lg font-bold mb-2">AI 智慧生成</h3>
        <p class="text-base-content opacity-70 text-sm">
          自動生成班級名稱、課綱內容與宣傳文案
        </p>
      </div>

      <div class="card text-center hover:shadow-lg transition-shadow">
        <div class="text-primary text-4xl mb-4">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <h3 class="text-lg font-bold mb-2">智慧排課</h3>
        <p class="text-base-content opacity-70 text-sm">
          自動計算上課日期，視覺化課程時間表
        </p>
      </div>

      <div class="card text-center hover:shadow-lg transition-shadow">
        <div class="text-primary text-4xl mb-4">
          <i class="fas fa-image"></i>
        </div>
        <h3 class="text-lg font-bold mb-2">資訊圖表</h3>
        <p class="text-base-content opacity-70 text-sm">
          4種風格選擇，每日課程自動生成圖表
        </p>
      </div>

      <div class="card text-center hover:shadow-lg transition-shadow">
        <div class="text-primary text-4xl mb-4">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <h3 class="text-lg font-bold mb-2">報名表單</h3>
        <p class="text-base-content opacity-70 text-sm">
          一鍵生成 Google 表單，快速開放報名
        </p>
      </div>
    </div>

    <!-- Recent Courses -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-base-content">
          <i class="fas fa-clock text-primary mr-2"></i>
          最近的課程
        </h2>
        <router-link
          to="/courses"
          class="text-primary hover:opacity-80 font-medium"
        >
          查看全部
          <i class="fas fa-arrow-right ml-1"></i>
        </router-link>
      </div>

      <LoadingSpinner v-if="loading" text="載入中..." />

      <div v-else-if="recentCourses.length === 0" class="text-center py-12">
        <i class="fas fa-folder-open text-base-content opacity-30 text-6xl mb-4"></i>
        <p class="text-base-content opacity-60 text-lg mb-6">尚未建立任何課程</p>
        <router-link to="/courses/create" class="btn btn-primary">
          <i class="fas fa-plus mr-2"></i>
          建立第一個課程
        </router-link>
      </div>

      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="course in recentCourses"
          :key="course.id"
          class="border border-base-300 rounded-box p-4 hover:shadow-md transition-shadow cursor-pointer bg-base-200"
          @click="$router.push(`/courses/${course.id}/edit`)"
        >
          <div class="flex items-start justify-between mb-3">
            <h3 class="font-bold text-base-content">
              {{ course.basicInfo?.className || '未命名課程' }}
            </h3>
            <span
              :class="[
                'px-2 py-1 text-xs rounded-full',
                course.basicInfo?.category === 'children'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              ]"
            >
              {{ course.basicInfo?.category === 'children' ? '兒童課程' : '職訓課程' }}
            </span>
          </div>
          
          <p class="text-sm text-gray-600 mb-2 line-clamp-2">
            {{ course.basicInfo?.topic }}
          </p>
          
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>
              <i class="far fa-calendar mr-1"></i>
              {{ formatDate(course.createdAt) }}
            </span>
            <span v-if="course.schedule?.totalDays">
              {{ course.schedule.totalDays }} 天課程
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCourseStore } from '@/stores/courseStore'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { formatDate } from '@/utils/dateUtils'

const courseStore = useCourseStore()
const { loading, courses } = courseStore

const recentCourses = computed(() => {
  return courses.slice(0, 6)
})

onMounted(async () => {
  await courseStore.fetchCourses()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
