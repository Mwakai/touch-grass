import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

interface User {
  id: number | string
  /** Parents only; kid accounts never have an email */
  email?: string
  role: string
  username?: string
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

  // Pull the token and user out of a signup or login response and save them
  const startSession = (response: AuthResponse) => {
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
      console.error('Invalid auth response structure:', response)
      throw new Error('Invalid response from server')
    }

    // Store token and user in localStorage
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))

    // Update state
    token.value = authToken
    user.value = userData

    return { token: authToken, user: userData }
  }

  // Run an auth request with shared loading and error state
  const authenticate = async (request: () => Promise<unknown>, fallbackMessage: string) => {
    loading.value = true
    error.value = null

    try {
      return startSession((await request()) as AuthResponse)
    } catch (err) {
      error.value = err instanceof Error ? err.message : fallbackMessage
      console.error('Auth request failed in auth store:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions
  const login = (email: string, password: string) =>
    authenticate(() => api.login({ email, password }), 'Login failed. Please try again.')

  // Kids log in with the family code plus the username and PIN their parent set
  const kidLogin = (familyCode: string, username: string, pin: string) =>
    authenticate(
      () => api.kidLogin({ familyCode, username, pin }),
      'Login failed. Please try again.',
    )

  // Only parents sign up; kids get a login from their parent
  const signup = (params: { email: string; password: string; consent: boolean }) =>
    authenticate(() => api.signup(params), 'Signup failed. Please try again.')

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

  // Deletes the parent's account and all their kids' data, then signs out
  const deleteAccount = async () => {
    await api.deleteAccount()
    await logout()
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
    kidLogin,
    signup,
    logout,
    deleteAccount,
    fetchUser,
    initAuth,
  }
})
