import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CourseList from '../views/CourseList.vue'
import CourseCreate from '../views/CourseCreate.vue'
import CourseEdit from '../views/CourseEdit.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首頁 - 課程規劃工具' }
  },
  {
    path: '/courses',
    name: 'CourseList',
    component: CourseList,
    meta: { title: '課程列表 - 課程規劃工具' }
  },
  {
    path: '/courses/create',
    name: 'CourseCreate',
    component: CourseCreate,
    meta: { title: '建立課程 - 課程規劃工具' }
  },
  {
    path: '/courses/:id/edit',
    name: 'CourseEdit',
    component: CourseEdit,
    meta: { title: '編輯課程 - 課程規劃工具' }
  },
  {
    path: '/oauth/callback',
    name: 'OAuthCallback',
    component: () => import('../views/OAuthCallback.vue'),
    meta: { title: 'Google 授權中...' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 設定頁面標題
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '課程規劃工具'
  next()
})

export default router
