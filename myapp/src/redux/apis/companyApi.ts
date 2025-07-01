import { CompanyDetails } from '../slices/companySlice';
import { authApiService } from './authApi';

interface CompanyResponse {
  success: boolean;
  message: string;
  companies?: CompanyDetails[];
  company?: CompanyDetails;
  userCompany?: {
    id: string;
    userId: string;
    companyId: string;
    role: string;
    isActive: boolean;
    joinedAt: string;
  };
}

interface CreateCompanyData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  industry?: string;
  gstNumber?: string;
  panNumber?: string;
  Country?: string;
}

interface AssignCompanyData {
  userId: string;
  companyId: string;
  role?: string;
}

class CompaniesApiService {
  private baseUrl = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || '';

  constructor() {
    if (!this.baseUrl) {
      console.warn('NEXT_PUBLIC_AUTH_API_BASE_URL is not set in environment variables');
    }
  }

  async getAllCompanies(token: string): Promise<CompanyResponse> {
    return await authApiService.apiCall<CompanyResponse>('/getAllCompanies', {
      method: 'GET',
    }, token);
  }

  async createCompany(token: string, data: CreateCompanyData): Promise<CompanyResponse> {
    return await authApiService.apiCall<CompanyResponse>('/company/create', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }, token);
  }

  async assignCompany(token: string, data: AssignCompanyData): Promise<CompanyResponse> {
    return await authApiService.apiCall<CompanyResponse>('/assignCompany', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }, token);
  }
}

export const companiesApiService = new CompaniesApiService();
export default companiesApiService;