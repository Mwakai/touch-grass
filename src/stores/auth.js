import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value)
  const isParent = computed(() => user.value?.role === 'parent')
  const isKid = computed(() => user.value?.role === 'kid')

  // Actions
  const login = async (email, password) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.login({ email, password })

      // Store token in localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      // Update state
      token.value = response.token
      user.value = response.user

      return response
    } catch (err) {
      error.value = err.message || 'Login failed. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const signup = async (email, password, role) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.signup({ email, password, role })

      // Store token and user in localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      // Update state
      token.value = response.token
      user.value = response.user

      return response
    } catch (err) {
      error.value = err.message || 'Signup failed. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      // Call logout endpoint
      await api.logout()
    } catch (err) {
      console.error('Logout API call failed:', err)
      // Continue with local logout even if API call fails
    } finally {
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // Clear state
      token.value = null
      user.value = null
      error.value = null
    }
  }

  const fetchUser = async () => {
    if (!token.value) return

    loading.value = true
    try {
      const response = await api.getMe()
      user.value = response.user
      localStorage.setItem('user', JSON.stringify(response.user))
    } catch (err) {
      console.error('Failed to fetch user:', err)
      // If token is invalid, clear auth state
      await logout()
    } finally {
      loading.value = false
    }
  }

  // Initialize user from localStorage if token exists
  const initAuth = async () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken) {
      token.value = storedToken
      
      // Try to fetch fresh user data from API
      try {
        await fetchUser()
      } catch (err) {
        // If API call fails, fall back to stored user data
        if (storedUser) {
          user.value = JSON.parse(storedUser)
        }
      }
    }
  }

  // Initialize on store creation
  initAuth()

  return {
    // State
    user,
    token,
    loading,
    error,
    // Computed
    isAuthenticated,
    isParent,
    isKid,
    // Actions
    login,
    signup,
    logout,
    fetchUser,
    initAuth
  }
})
