import { TaskDetails } from '../slices/taskSlice';
import { authApiService } from './authApi';

interface TaskResponse {
  success: boolean;
  message: string;
  tasks?: TaskDetails[]; // Updated to ensure tasks is not undefined
  task?: TaskDetails;
}

interface CreateTaskData {
  title: string;
  companyId: string;
  assignedToId?: string;
  description?: string;
  departmentId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
}

interface AssignTaskToUserData {
  taskId: string;
  userId: string;
  companyId: string;
}

interface AssignTaskToDepartmentData {
  taskId: string;
  departmentId: string;
  companyId: string;
}

class TasksApiService {
  private baseUrl = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || '';

  constructor() {
    if (!this.baseUrl) {
      console.warn('NEXT_PUBLIC_AUTH_API_BASE_URL is not set in environment variables');
    }
  }

  async getTasks(token: string, companyId?: string): Promise<TaskResponse> {
    const url = companyId
      ? `/task/getTasks?companyId=${encodeURIComponent(companyId)}`
      : '/task/getTasks';
    return await authApiService.apiCall<TaskResponse>(url, {
      method: 'GET',
    }, token);
  }

  async createTask(token: string, data: CreateTaskData): Promise<TaskResponse> {
    return await authApiService.apiCall<TaskResponse>('/task/create', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }, token);
  }

  async deleteTask(token: string, taskId: string): Promise<TaskResponse> {
    return await authApiService.apiCall<TaskResponse>(
      `/task/delete/${encodeURIComponent(taskId)}`,
      {
        method: 'DELETE',
      },
      token
    );
  }

  async assignTaskToUser(token: string, data: AssignTaskToUserData): Promise<TaskResponse> {
    return await authApiService.apiCall<TaskResponse>('/task/assign/user', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }, token);
  }

  async assignTaskToDepartment(
    token: string,
    data: AssignTaskToDepartmentData
  ): Promise<TaskResponse> {
    return await authApiService.apiCall<TaskResponse>('/task/assign/department', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }, token);
  }
}

export const tasksApiService = new TasksApiService();
export default tasksApiService;