<template>
  <teleport to="body">
    <transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="close"
      >
        <div class="bg-base-100 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div class="flex items-start gap-4">
            <div
              :class="iconColorClass"
              class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
            >
              <i :class="iconClass" class="text-2xl"></i>
            </div>
            
            <div class="flex-1">
              <h3 class="text-lg font-bold text-base-content mb-2">
                {{ title }}
              </h3>
              <p class="text-base-content opacity-70">
                {{ message }}
              </p>
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="close"
              class="btn btn-secondary"
            >
              {{ cancelText }}
            </button>
            <button
              @click="confirm"
              :class="['btn', type === 'danger' ? 'btn-danger' : 'btn-primary']"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: '確認'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'warning', // 'warning', 'danger', 'info'
    validator: (value) => ['warning', 'danger', 'info'].includes(value)
  },
  confirmText: {
    type: String,
    default: '確認'
  },
  cancelText: {
    type: String,
    default: '取消'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const iconClass = computed(() => {
  const icons = {
    warning: 'fas fa-exclamation-triangle',
    danger: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle'
  }
  return icons[props.type]
})

const iconColorClass = computed(() => {
  const colors = {
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-600'
  }
  return colors[props.type]
})

const close = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const confirm = () => {
  emit('update:modelValue', false)
  emit('confirm')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9);
}
</style>
