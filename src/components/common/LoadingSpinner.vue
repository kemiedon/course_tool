<template>
  <div class="flex items-center justify-center">
    <div class="loading-spinner"></div>
    <span v-if="text" class="ml-3 text-base-content opacity-70">{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: ''
  }
})
</script>
