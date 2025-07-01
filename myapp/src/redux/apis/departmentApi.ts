import { DepartmentDetails } from '../slices/departmentSlice';
import { authApiService } from './authApi';

interface DepartmentResponse {
  success: boolean;
  message: string;
  departments?: DepartmentDetails[];
  department?: DepartmentDetails;
  user?: {
    id: string;
    department?: {
      id: string;
      name: string;
      companyId: string;
    };
    userCompanies?: Array<{
      company: {
        id: string;
        name: string;
      };
    }>;
  };
}

interface CreateDepartmentData {
  name: string;
  companyId: string;
  description?: string;
  headOfDeptId?: string;
}

interface UpdateUserDepartmentData {
  userId: string;
  departmentId: string;
  companyId: string;
}

class DepartmentsApiService {
  private baseUrl = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || '';

  constructor() {
    if (!this.baseUrl) {
      console.warn('NEXT_PUBLIC_AUTH_API_BASE_URL is not set in environment variables');
    }
  }

  async getDepartments(token: string, companyId?: string): Promise<DepartmentResponse> {
    const url = companyId ? `/getDepartments?companyId=${encodeURIComponent(companyId)}` : '/getDepartments';
    return await authApiService.apiCall<DepartmentResponse>(url, {
      method: 'GET',
    }, token);
  }

  async createDepartment(token: string, data: CreateDepartmentData): Promise<DepartmentResponse> {
    return await authApiService.apiCall<DepartmentResponse>('/department/create', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }, token);
  }

  async updateUserDepartment(token: string, data: UpdateUserDepartmentData): Promise<DepartmentResponse> {
    return await authApiService.apiCall<DepartmentResponse>('/department/assign', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }, token);
  }
}

export const departmentsApiService = new DepartmentsApiService();
export default departmentsApiService;