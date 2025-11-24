// API Client for authentication endpoints

interface LoginCredentials {
  email: string
  password: string
}

interface SignupData {
  email: string
  password: string
  role: string
  familyCode?: string
  name?: string
  age?: number
  interests?: string[]
  avatarColor?: string
}

interface AuthResponse {
  user: {
    id: number
    email: string
    role: string
  }
  token: string
}

interface KidData {
  name: string
  age: number
  avatarColor: string
  interests: string[]
}

interface Kid {
  id: string
  name: string
  age: number
  avatarColor: string
  interests: string[]
  points?: number
  stats?: {
    challenges: number
    badges: number
    outdoorMinutes: number
  }
  createdAt?: string
  updatedAt?: string
}

class ApiClient {
  // Use ngrok URL for production/mobile, fallback to proxy for web dev
  private baseURL = import.meta.env.VITE_API_URL || 'https://fd112b3ec1da.ngrok-free.app/api'

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
      body: options.body,
    })

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config)

      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
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
          data: errorData,
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

  // Kids endpoints
  async addKid(kidData: KidData): Promise<Kid> {
    const response = await this.request<any>('/kids', {
      method: 'POST',
      body: JSON.stringify(kidData),
    })

    // Normalize the response with default values
    return {
      ...response,
      id: response.id || response._id,
      avatarColor: response.avatarColor,
      points: response.points ?? 0,
      stats: response.stats ?? {
        challenges: 0,
        badges: 0,
        outdoorMinutes: 0,
      },
    }
  }

  async getKids(): Promise<Kid[]> {
    const response = await this.request<any>('/kids', {
      method: 'GET',
    })

    let kidsArray: any[] = []

    if (Array.isArray(response)) {
      kidsArray = response
    } else if (response.data && Array.isArray(response.data)) {
      kidsArray = response.data
    } else if (response.kids && Array.isArray(response.kids)) {
      kidsArray = response.kids
    } else {
      console.warn('Unexpected getKids response format:', response)
      return []
    }

    // Normalize kids data with default values
    return kidsArray.map((kid) => ({
      ...kid,
      id: kid.id || kid._id, // Handle both 'id' and '_id' from backend
      avatarColor: kid.avatarColor,
      points: kid.points ?? 0,
      stats: kid.stats ?? {
        challenges: 0,
        badges: 0,
        outdoorMinutes: 0,
      },
    }))
  }

  async getKid(kidId: string): Promise<Kid> {
    const response = await this.request<any>(`/kids/${kidId}`, {
      method: 'GET',
    })

    console.log('getKid raw response:', response)

    // Handle different response formats from backend
    let kid = response
    if (response.data) {
      kid = response.data
    } else if (response.kid) {
      kid = response.kid
    }

    // Normalize the response with default values
    return {
      ...kid,
      id: kid.id || kid._id,
      avatarColor: kid.avatarColor || kid.avatorColor,
      points: kid.points ?? 0,
      stats: kid.stats ?? {
        challenges: 0,
        badges: 0,
        outdoorMinutes: 0,
      },
    }
  }

  async updateKid(kidId: string, kidData: Partial<KidData>): Promise<Kid> {
    return this.request<Kid>(`/kids/${kidId}`, {
      method: 'PUT',
      body: JSON.stringify(kidData),
    })
  }

  async deleteKid(kidId: string): Promise<void> {
    return this.request<void>(`/kids/${kidId}`, {
      method: 'DELETE',
    })
  }
}

export const api = new ApiClient()
export type { KidData, Kid }
