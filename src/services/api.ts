// API Client for authentication endpoints

interface LoginCredentials {
  email: string
  password: string
}

interface SignupData {
  email: string
  password: string
  role?: string
}

interface AuthResponse {
  user: {
    id: number
    email: string
    role: string
  }
  token: string
}

class ApiClient {
  // Use ngrok URL for production/mobile, fallback to proxy for web dev
  private baseURL = import.meta.env.VITE_API_URL || 'https://fd112b3ec1da.ngrok-free.app/api'

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token')
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    console.log('API Request:', {
      url: `${this.baseURL}${endpoint}`,
      method: options.method || 'GET',
      headers: config.headers,
      body: options.body
    })

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config)

      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        let errorData
        const contentType = response.headers.get('content-type')
        
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json()
        } else {
          errorData = { message: await response.text() }
        }
        
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        })
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response Data:', data)
      return data
    } catch (error) {
      console.error('API Request Failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getMe(): Promise<{ user: AuthResponse['user'] }> {
    return this.request<{ user: AuthResponse['user'] }>('/auth/me', {
      method: 'GET',
    })
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    })
  }
}

export const api = new ApiClient()
