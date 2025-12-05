<template>
  <div>
    <h2 class="text-2xl font-bold text-base-content mb-6">步驟 4: 資訊圖表生成</h2>
    <p class="text-base-content opacity-70 mb-4">為每日課程生成精美的資訊圖表</p>
    
    <!-- 將在下一階段完善 -->
    <div class="text-center py-8 bg-base-200 rounded-lg">
      <i class="fas fa-image text-base-content opacity-30 text-5xl mb-3"></i>
      <p class="text-base-content opacity-60">圖表生成功能開發中...</p>
    </div>

    <div class="flex justify-between mt-8">
      <button @click="$emit('prev')" class="btn btn-secondary">
        <i class="fas fa-arrow-left mr-2"></i>
        上一步
      </button>
      <button @click="$emit('next')" class="btn btn-primary">
        下一步
        <i class="fas fa-arrow-right ml-2"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  curriculum: {
    type: Array,
    required: true
  }
})

defineEmits(['update:modelValue', 'next', 'prev'])
</script>
