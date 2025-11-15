import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

interface User {
  id: number
  email: string
  role: string
  name?: string
}

interface AuthResponse {
  token?: string
  data?: User
  user?: User
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isParent = computed(() => user.value?.role === 'parent')
  const isKid = computed(() => user.value?.role === 'kid')

  // Actions
  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.login({ email, password }) as unknown as AuthResponse

      console.log('Login response:', response)

      // Handle different response structures
      // Backend returns: {success: true, token: "...", data: {id, email, role, ...}}
      let authToken = response.token
      let userData = response.data

      // Fallback: check if token and user are nested in data
      if (!authToken && response.data && 'token' in response.data) {
        authToken = (response.data as any).token
      }
      if (!userData && response.user) {
        userData = response.user
      }

      if (!authToken || !userData) {
        console.error('Invalid login response structure:', response)
        throw new Error('Invalid response from server')
      }

      console.log('Extracted auth data:', { token: authToken, user: userData })

      // Store token in localStorage
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))

      // Update state
      token.value = authToken
      user.value = userData

      console.log('Auth state updated:', {
        user: user.value,
        token: token.value,
        isAuthenticated: isAuthenticated.value
      })

      return { token: authToken, user: userData }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
      error.value = message
      console.error('Login failed in auth store:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const signup = async (email: string, password: string, role: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.signup({ email, password, role }) as unknown as AuthResponse

      console.log('Signup response:', response)

      // Handle different response structures
      // Backend returns: {success: true, token: "...", data: {id, email, role, ...}}
      let authToken = response.token
      let userData = response.data

      // Fallback: check if token and user are nested in data
      if (!authToken && response.data && 'token' in response.data) {
        authToken = (response.data as any).token
      }
      if (!userData && response.user) {
        userData = response.user
      }

      if (!authToken || !userData) {
        console.error('Invalid signup response structure:', response)
        throw new Error('Invalid response from server')
      }

      console.log('Extracted signup data:', { token: authToken, user: userData })

      // Store token and user in localStorage
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))

      // Update state
      token.value = authToken
      user.value = userData

      console.log('Signup auth state updated:', {
        user: user.value,
        token: token.value,
        isAuthenticated: isAuthenticated.value
      })

      return { token: authToken, user: userData }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed. Please try again.'
      error.value = message
      console.error('Signup failed in auth store:', err)
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
      console.log('fetchUser response:', response)

      // Handle different response structures
      const userData = response.user || (response as any).data || response

      user.value = userData as User
      localStorage.setItem('user', JSON.stringify(userData))

      console.log('User data set:', userData)
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

    if (storedToken && storedToken !== 'null' && storedToken !== 'undefined') {
      token.value = storedToken

      if (storedUser && storedUser !== 'null' && storedUser !== 'undefined') {
        try {
          user.value = JSON.parse(storedUser)
        } catch (err) {
          console.error('Failed to parse stored user from localStorage:', err)
          localStorage.removeItem('user')
        }
      }

      // Try to fetch fresh user data from API
      try {
        await fetchUser()
      } catch (err) {
        console.error('initAuth: failed to refresh user data', err)
      }
    } else {
      // Clean up invalid tokens
      localStorage.removeItem('token')
      localStorage.removeItem('user')
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
