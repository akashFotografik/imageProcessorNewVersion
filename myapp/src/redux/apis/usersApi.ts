import { UserDetails } from '../slices/userSlice';
import { authApiService } from './authApi';

interface UserResponse {
  success: boolean;
  message: string;
  users: UserDetails[];
}

class UsersApiService {
  private baseUrl = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || '';

  constructor() {
    if (!this.baseUrl) {
      console.warn('NEXT_PUBLIC_AUTH_API_BASE_URL is not set in environment variables');
    }
  }

  async getAllUsers(token: string): Promise<UserResponse> {
    return await authApiService.apiCall<UserResponse>('/users', {
      method: 'GET',
    }, token);
  }

  async getAllAdmins(token: string): Promise<UserResponse> {
    return await authApiService.apiCall<UserResponse>('/users/admins', {
      method: 'GET',
    }, token);
  }

  async getAllDirectors(token: string): Promise<UserResponse> {
    return await authApiService.apiCall<UserResponse>('/users/directors', {
      method: 'GET',
    }, token);
  }

  async getAllManagers(token: string): Promise<UserResponse> {
    return await authApiService.apiCall<UserResponse>('/users/managers', {
      method: 'GET',
    }, token);
  }
}

export const usersApiService = new UsersApiService();
export default usersApiService;