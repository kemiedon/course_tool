import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  getDoc,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../services/firebase'

export const useCourseStore = defineStore('course', () => {
  // State
  const courses = ref([])
  const currentCourse = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const getCourseById = computed(() => {
    return (id) => courses.value.find(course => course.id === id)
  })

  // Actions
  const fetchCourses = async () => {
    loading.value = true
    error.value = null
    try {
      const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      courses.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return { success: true }
    } catch (e) {
      error.value = e.message
      console.error('獲取課程失敗:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const fetchCourse = async (id) => {
    loading.value = true
    error.value = null
    try {
      const docRef = doc(db, 'courses', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        currentCourse.value = {
          id: docSnap.id,
          ...docSnap.data()
        }
        return { success: true, data: currentCourse.value }
      } else {
        error.value = '課程不存在'
        return { success: false, error: '課程不存在' }
      }
    } catch (e) {
      error.value = e.message
      console.error('獲取課程失敗:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const createCourse = async (courseData) => {
    loading.value = true
    error.value = null
    try {
      const docRef = await addDoc(collection(db, 'courses'), {
        ...courseData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      
      const newCourse = {
        id: docRef.id,
        ...courseData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
      
      courses.value.unshift(newCourse)
      currentCourse.value = newCourse
      
      return { success: true, data: newCourse }
    } catch (e) {
      error.value = e.message
      console.error('建立課程失敗:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const updateCourse = async (id, courseData) => {
    loading.value = true
    error.value = null
    try {
      const docRef = doc(db, 'courses', id)
      await updateDoc(docRef, {
        ...courseData,
        updatedAt: Timestamp.now()
      })
      
      const index = courses.value.findIndex(c => c.id === id)
      if (index !== -1) {
        courses.value[index] = {
          ...courses.value[index],
          ...courseData,
          updatedAt: Timestamp.now()
        }
      }
      
      if (currentCourse.value?.id === id) {
        currentCourse.value = {
          ...currentCourse.value,
          ...courseData,
          updatedAt: Timestamp.now()
        }
      }
      
      return { success: true }
    } catch (e) {
      error.value = e.message
      console.error('更新課程失敗:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const deleteCourse = async (id) => {
    loading.value = true
    error.value = null
    try {
      await deleteDoc(doc(db, 'courses', id))
      courses.value = courses.value.filter(c => c.id !== id)
      if (currentCourse.value?.id === id) {
        currentCourse.value = null
      }
      return { success: true }
    } catch (e) {
      error.value = e.message
      console.error('刪除課程失敗:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const setCurrentCourse = (course) => {
    currentCourse.value = course
  }

  const clearCurrentCourse = () => {
    currentCourse.value = null
  }

  return {
    courses,
    currentCourse,
    loading,
    error,
    getCourseById,
    fetchCourses,
    fetchCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    setCurrentCourse,
    clearCurrentCourse
  }
})
