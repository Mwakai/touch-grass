import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock successful login
      const mockToken = 'mock-token-' + Math.random().toString(36).substring(7)
      const mockUser = {
        id: 1,
        email: email,
        role: 'parent' // Default role for login
      }

      // Store token in localStorage
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))

      // Update state
      token.value = mockToken
      user.value = mockUser

      return { user: mockUser, token: mockToken }
    } catch (err) {
      error.value = 'Login failed. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const signup = async (email, password, role) => {
    loading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock successful signup
      const mockToken = 'mock-token-' + Math.random().toString(36).substring(7)
      const mockUser = {
        id: Date.now(),
        email: email,
        role: role
      }

      // Store token and user in localStorage
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))

      // Update state
      token.value = mockToken
      user.value = mockUser

      return { user: mockUser, token: mockToken }
    } catch (err) {
      error.value = 'Signup failed. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // Clear state
    token.value = null
    user.value = null
    error.value = null
  }

  // Initialize user from localStorage if token exists
  const initAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
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
    initAuth
  }
})
