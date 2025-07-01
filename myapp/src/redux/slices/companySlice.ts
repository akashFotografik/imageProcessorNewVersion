import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PersistConfig } from 'redux-persist';
import { companiesApiService } from '../apis/companyApi';

export interface CompanyDetails {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo: string | null;
  industry: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  Country: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserCompanyDetails {
  id: string;
  userId: string;
  companyId: string;
  role: string;
  isActive: boolean;
  joinedAt: string;
}

interface CompaniesState {
  companies: CompanyDetails[] | null;
  userCompanies: UserCompanyDetails[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: CompaniesState = {
  companies: null,
  userCompanies: null,
  loading: false,
  error: null,
};

export const companiesPersistConfig: PersistConfig<CompaniesState> = {
  key: 'companies',
  storage: require('redux-persist/lib/storage').default,
  whitelist: ['companies', 'userCompanies'],
};

export const fetchAllCompanies = createAsyncThunk(
  'companies/fetchAllCompanies',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await companiesApiService.getAllCompanies(token);
      return response.companies;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch companies');
    }
  }
);

export const createCompany = createAsyncThunk(
  'companies/createCompany',
  async ({ token, data }: { token: string; data: {
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
  }}, { rejectWithValue }) => {
    try {
      const response = await companiesApiService.createCompany(token, data);
      return response.company;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create company');
    }
  }
);

export const assignCompany = createAsyncThunk(
  'companies/assignCompany',
  async ({ token, data }: { token: string; data: {
    userId: string;
    companyId: string;
    role?: string;
  }}, { rejectWithValue }) => {
    try {
      const response = await companiesApiService.assignCompany(token, data);
      return response.userCompany;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to assign company');
    }
  }
);

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCompanies: (state) => {
      state.companies = null;
      state.userCompanies = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Companies
      .addCase(fetchAllCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCompanies.fulfilled, (state, action: PayloadAction<CompanyDetails[] | undefined>) => {
        state.companies = action.payload || null;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAllCompanies.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      // Create Company
      .addCase(createCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompany.fulfilled, (state, action: PayloadAction<CompanyDetails | undefined>) => {
        if (action.payload) {
          state.companies = state.companies 
            ? [...state.companies, action.payload] 
            : [action.payload];
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      // Assign Company
      .addCase(assignCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignCompany.fulfilled, (state, action: PayloadAction<UserCompanyDetails | undefined>) => {
        if (action.payload) {
          state.userCompanies = state.userCompanies 
            ? [...state.userCompanies, action.payload] 
            : [action.payload];
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(assignCompany.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const { clearError, clearCompanies } = companiesSlice.actions;
export default companiesSlice.reducer;