<template>
  <div v-if="toasts.length > 0" class="fixed top-20 right-4 z-50 space-y-2">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast-item', `toast-${toast.type}`]"
        class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-[500px]"
      >
        <i :class="getIcon(toast.type)" class="text-xl"></i>
        <span class="flex-1">{{ toast.message }}</span>
        <button
          @click="removeToast(toast.id)"
          class="text-white hover:opacity-75 transition-opacity"
          aria-label="關閉"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toastStore'

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)
const { removeToast } = toastStore

const getIcon = (type) => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }
  return icons[type] || icons.info
}
</script>

<style scoped>
.toast-item {
  animation: slideIn 0.3s ease;
}

.toast-success {
  @apply bg-amber-400 text-neutral-900 font-bold shadow-lg border-2 border-amber-300;
}

.toast-error {
  @apply bg-rose-400 text-neutral-900 font-bold shadow-lg border-2 border-rose-300;
}

.toast-warning {
  @apply bg-yellow-300 text-neutral-900 font-bold shadow-lg border-2 border-yellow-200;
}

.toast-info {
  @apply bg-sky-400 text-neutral-900 font-bold shadow-lg border-2 border-sky-300;
}

.toast-enter-active {
  animation: slideIn 0.3s ease;
}

.toast-leave-active {
  animation: slideOut 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}
</style>
