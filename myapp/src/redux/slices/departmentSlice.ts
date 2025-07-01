import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PersistConfig } from 'redux-persist';
import { departmentsApiService } from '../apis/departmentApi';

export interface DepartmentDetails {
  id: string;
  name: string;
  description: string | null;
  headOfDeptId: string | null;
  headOfDept: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  companyId: string;
  company: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
}

// Update the UserDepartmentDetails interface
export interface UserDepartmentDetails {
  id: string; // Changed from userId to id to match backend response
  department?: {
    id: string;
    name: string;
    companyId: string;
  } | null;
  userCompanies?: Array<{
    company: {
      id: string;
      name: string;
    };
  }> | null;
}

interface DepartmentsState {
  departments: DepartmentDetails[] | null;
  userDepartments: UserDepartmentDetails[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: DepartmentsState = {
  departments: null,
  userDepartments: null,
  loading: false,
  error: null,
};

export const departmentsPersistConfig: PersistConfig<DepartmentsState> = {
  key: 'departments',
  storage: require('redux-persist/lib/storage').default,
  whitelist: ['departments', 'userDepartments'],
};

export const fetchDepartments = createAsyncThunk(
  'departments/fetchDepartments',
  async ({ token, companyId }: { token: string; companyId?: string }, { rejectWithValue }) => {
    try {
      const response = await departmentsApiService.getDepartments(token, companyId);
      return response.departments;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch departments');
    }
  }
);

export const createDepartment = createAsyncThunk(
  'departments/createDepartment',
  async ({ token, data }: { token: string; data: {
    name: string;
    companyId: string;
    description?: string;
    headOfDeptId?: string;
  }}, { rejectWithValue }) => {
    try {
      const response = await departmentsApiService.createDepartment(token, data);
      return response.department;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create department');
    }
  }
);

export const updateUserDepartment = createAsyncThunk(
  'departments/updateUserDepartment',
  async ({ token, data }: { token: string; data: {
    userId: string;
    departmentId: string;
    companyId: string;
  }}, { rejectWithValue }) => {
    try {
      const response = await departmentsApiService.updateUserDepartment(token, data);
      return response.user;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update user department');
    }
  }
);

// Update the extraReducers section for updateUserDepartment.fulfilled
const departmentsSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDepartments: (state) => {
      state.departments = null;
      state.userDepartments = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Departments
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action: PayloadAction<DepartmentDetails[] | undefined>) => {
        state.departments = action.payload || null;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      // Create Department
      .addCase(createDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDepartment.fulfilled, (state, action: PayloadAction<DepartmentDetails | undefined>) => {
        if (action.payload) {
          state.departments = state.departments
            ? [...state.departments, action.payload]
            : [action.payload];
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      // Update User Department
      .addCase(updateUserDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserDepartment.fulfilled, (state, action: PayloadAction<UserDepartmentDetails | undefined>) => {
        if (action.payload && action.payload.id) { // Use id instead of userId
          state.userDepartments = state.userDepartments
            ? [...state.userDepartments.filter(ud => ud.id !== action.payload!.id), action.payload]
            : [action.payload];
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUserDepartment.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const { clearError, clearDepartments } = departmentsSlice.actions;
export default departmentsSlice.reducer;