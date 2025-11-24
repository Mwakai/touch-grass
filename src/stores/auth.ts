import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

interface User {
  id: number | string
  email: string
  role: string
  name?: string
  familyCode?: string
  parentId?: string
  kidId?: string
  age?: number
  interests?: string[]
}

interface NestedAuthData {
  token?: string
  [key: string]: unknown
}

interface AuthResponse {
  token?: string
  data?: User | NestedAuthData
  user?: User
}

interface GetMeResponse {
  user?: User
  data?: User
  [key: string]: unknown
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
      const response = (await api.login({ email, password })) as unknown as AuthResponse

      let authToken = response.token
      let userData: User | undefined = undefined

      // Check if data is a User or contains nested auth data
      if (response.data) {
        if ('token' in response.data && typeof response.data.token === 'string') {
          // data contains nested token
          authToken = authToken || response.data.token
        } else {
          // data is the user object
          userData = response.data as User
        }
      }

      // Fallback: check if user is provided separately
      if (!userData && response.user) {
        userData = response.user
      }

      if (!authToken || !userData) {
        console.error('Invalid login response structure:', response)
        throw new Error('Invalid response from server')
      }

      // Store token in localStorage
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))

      // Update state
      token.value = authToken
      user.value = userData

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

  interface SignupParams {
    email: string
    password: string
    role: string
    familyCode?: string
    name?: string
    age?: number
    interests?: string[]
    avatarColor?: string
  }

  const signup = async (params: SignupParams) => {
    loading.value = true
    error.value = null

    try {
      const response = (await api.signup(params)) as unknown as AuthResponse

      // Handle different response structures
      // Backend returns: {success: true, token: "...", data: {id, email, role, ...}}
      let authToken = response.token
      let userData: User | undefined = undefined

      // Check if data is a User or contains nested auth data
      if (response.data) {
        if ('token' in response.data && typeof response.data.token === 'string') {
          // data contains nested token
          authToken = authToken || response.data.token
        } else {
          // data is the user object
          userData = response.data as User
        }
      }

      // Fallback: check if user is provided separately
      if (!userData && response.user) {
        userData = response.user
      }

      if (!authToken || !userData) {
        console.error('Invalid signup response structure:', response)
        throw new Error('Invalid response from server')
      }

      // Store token and user in localStorage
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))

      // Update state
      token.value = authToken
      user.value = userData

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
      const response = (await api.getMe()) as unknown as GetMeResponse

      // Handle different response structures
      const userData = response.user || response.data || (response as unknown as User)

      user.value = userData as User
      localStorage.setItem('user', JSON.stringify(userData))
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
    initAuth,
  }
})
