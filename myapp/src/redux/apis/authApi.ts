// redux/services/authApi.ts
import { UserDetails } from '../slices/userSlice';

interface TokenDetails {
  firebaseId: string;
  email: string;
  emailVerified: boolean;
  authTime: number;
  iat: number;
  exp: number;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user: UserDetails;
  token: TokenDetails;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class AuthApiService {
  private baseUrl = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || '';

  constructor() {
    if (!this.baseUrl) {
      console.warn('NEXT_PUBLIC_AUTH_API_BASE_URL is not set in environment variables');
    }
  }

  async loginWithToken(idToken: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed due to network error');
    }
  }

  async getCurrentUser(token: string): Promise<{ user: UserDetails }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get user details due to network error');
    }
  }

  async logout(token: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Logout failed due to network error');
    }
  }

  // Generic API call helper
  async apiCall<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`API call failed: ${endpoint}`);
    }
  }
}

export const authApiService = new AuthApiService();
export default authApiService;