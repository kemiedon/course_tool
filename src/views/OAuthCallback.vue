<template>
  <div>
    <LoadingSpinner text="Google 授權處理中..." />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()

onMounted(() => {
  // 處理 OAuth callback
  const hash = window.location.hash
  if (hash) {
    const params = new URLSearchParams(hash.substring(1))
    const accessToken = params.get('access_token')
    
    if (accessToken) {
      // 儲存 token 並導回課程編輯頁
      sessionStorage.setItem('google_access_token', accessToken)
      router.push('/courses')
    }
  }
})
</script>
