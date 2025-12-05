<template>
  <div id="app" class="min-h-screen">
    <!-- 導覽列 -->
    <nav class="bg-base-200 shadow-md sticky top-0 z-50 border-b border-base-300">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <router-link to="/" class="flex items-center space-x-2">
              <i class="fas fa-graduation-cap text-primary text-2xl"></i>
              <span class="text-xl font-bold text-base-content">課程規劃工具</span>
            </router-link>
          </div>
          
          <div class="flex items-center space-x-4">
            <router-link 
              to="/" 
              class="text-base-content hover:text-primary transition-colors"
            >
              <i class="fas fa-home mr-2"></i>首頁
            </router-link>
            <router-link 
              to="/courses" 
              class="text-base-content hover:text-primary transition-colors"
            >
              <i class="fas fa-list mr-2"></i>課程列表
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要內容 -->
    <main class="container mx-auto px-4 py-8">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Toast 通知 -->
    <ToastNotification />
  </div>
</template>

<script setup>
import ToastNotification from './components/common/ToastNotification.vue'
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
