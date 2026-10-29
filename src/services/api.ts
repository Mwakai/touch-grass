// API Client for authentication endpoints
import type { GameSummary, PendingCompletion } from '@/data/game'

interface LoginCredentials {
  email: string
  password: string
}

// Only parents sign up; `consent` records that they accepted the privacy policy
interface SignupData {
  email: string
  password: string
  consent: boolean
}

// Kids have no email: they log in with the family code plus the username and
// PIN their parent set
interface KidLoginCredentials {
  familyCode: string
  username: string
  pin: string
}

interface AuthResponse {
  user: {
    id: number
    email?: string
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

// Adding a kid needs the parent's consent; the login is optional
interface NewKidData extends KidData {
  consent: boolean
  username?: string
  pin?: string
}

interface KidLogin {
  kidId: string
  username: string
  familyCode: string
}

interface Kid {
  id: string
  name: string
  age: number
  avatarColor: string
  interests: string[]
  /** The kid's login account, once their parent has set a username and PIN */
  account?: string | null
  points?: number
  stats?: {
    challenges: number
    badges: number
    outdoorMinutes: number
  }
  createdAt?: string
  updatedAt?: string
}

interface KidResponse {
  id?: string
  _id?: string
  name: string
  age: number
  avatarColor?: string
  avatorColor?: string
  interests: string[]
  account?: string | null
  points?: number
  stats?: {
    challenges: number
    badges: number
    outdoorMinutes: number
  }
  createdAt?: string
  updatedAt?: string
}

interface GetKidsResponse {
  data?: KidResponse[]
  kids?: KidResponse[]
}

interface GetKidResponse {
  data?: KidResponse
  kid?: KidResponse
}

// Unwrap a single-kid response and fill in defaults
const normalizeKid = (response: KidResponse | GetKidResponse): Kid => {
  let kid: KidResponse = response as KidResponse
  if ('data' in response && response.data) {
    kid = response.data
  } else if ('kid' in response && response.kid) {
    kid = response.kid
  }

  return {
    ...kid,
    id: kid.id || kid._id || '',
    avatarColor: kid.avatarColor || kid.avatorColor || '',
    points: kid.points ?? 0,
    stats: kid.stats ?? {
      challenges: 0,
      badges: 0,
      outdoorMinutes: 0,
    },
  }
}

class ApiClient {
  // Use ngrok URL for production/mobile, fallback to proxy for web dev
  private baseURL = import.meta.env.VITE_API_URL || 'https://fd112b3ec1da.ngrok-free.app/api'

  // The privacy policy parents accept, served by the backend next to /api
  readonly privacyPolicyUrl = `${this.baseURL.replace(/\/api\/?$/, '')}/privacy`

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

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config)

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

  async kidLogin(credentials: KidLoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/kid-login', {
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

  // Deletes the parent's account and all their kids' profiles, logins and history
  async deleteAccount(): Promise<void> {
    return this.request<void>('/auth/me', {
      method: 'DELETE',
    })
  }

  // Kids endpoints
  async addKid(kidData: NewKidData): Promise<Kid> {
    const response = await this.request<KidResponse | GetKidResponse>('/kids', {
      method: 'POST',
      body: JSON.stringify(kidData),
    })
    return normalizeKid(response)
  }

  // Creates or changes a kid's username and PIN; also unlocks a locked login
  async setKidLogin(kidId: string, login: { username: string; pin: string }): Promise<KidLogin> {
    const response = await this.request<{ data: KidLogin }>(`/kids/${kidId}/login`, {
      method: 'PUT',
      body: JSON.stringify(login),
    })
    return response.data
  }

  async getKids(): Promise<Kid[]> {
    const response = await this.request<KidResponse[] | GetKidsResponse>('/kids', {
      method: 'GET',
    })

    let kidsArray: KidResponse[] = []

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
      id: kid.id || kid._id || '', // Handle both 'id' and '_id' from backend
      avatarColor: kid.avatarColor || kid.avatorColor || '',
      points: kid.points ?? 0,
      stats: kid.stats ?? {
        challenges: 0,
        badges: 0,
        outdoorMinutes: 0,
      },
    }))
  }

  async getKid(kidId: string): Promise<Kid> {
    const response = await this.request<KidResponse | GetKidResponse>(`/kids/${kidId}`, {
      method: 'GET',
    })
    return normalizeKid(response)
  }

  // The logged-in kid's own profile (kid role only)
  async getMyKid(): Promise<Kid> {
    const response = await this.request<KidResponse | GetKidResponse>('/kids/me', {
      method: 'GET',
    })
    return normalizeKid(response)
  }

  // Kids can change only their avatar and interests
  async updateMyKid(kidData: Partial<Pick<KidData, 'avatarColor' | 'interests'>>): Promise<Kid> {
    const response = await this.request<KidResponse | GetKidResponse>('/kids/me', {
      method: 'PUT',
      body: JSON.stringify(kidData),
    })
    return normalizeKid(response)
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

  // Game endpoints
  async getMyAdventure(): Promise<GameSummary> {
    const response = await this.request<{ data: GameSummary }>('/game/me', { method: 'GET' })
    return response.data
  }

  async submitChallenge(challengeId: string, note?: string): Promise<GameSummary> {
    const response = await this.request<{ data: GameSummary }>(
      `/game/me/challenges/${encodeURIComponent(challengeId)}`,
      { method: 'POST', body: JSON.stringify({ note }) },
    )
    return response.data
  }

  async getKidAdventure(kidId: string): Promise<GameSummary> {
    const response = await this.request<{ data: GameSummary }>(`/game/kids/${kidId}`, {
      method: 'GET',
    })
    return response.data
  }

  async getPendingCompletions(): Promise<PendingCompletion[]> {
    const response = await this.request<{ data: PendingCompletion[] }>('/game/pending', {
      method: 'GET',
    })
    return response.data
  }

  async reviewCompletion(
    completionId: string,
    decision: 'approve' | 'reject',
  ): Promise<GameSummary> {
    const response = await this.request<{ data: GameSummary }>(
      `/game/completions/${completionId}/review`,
      { method: 'POST', body: JSON.stringify({ decision }) },
    )
    return response.data
  }
}

export const api = new ApiClient()
export type { KidData, NewKidData, Kid }
