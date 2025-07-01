import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PersistConfig } from 'redux-persist';
import { usersApiService } from '../apis/usersApi';
import { UserDetails } from './userSlice';

interface UsersState {
  users: UserDetails[] | null;
  admins: UserDetails[] | null;
  directors: UserDetails[] | null;
  managers: UserDetails[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: null,
  admins: null,
  directors: null,
  managers: null,
  loading: false,
  error: null,
};

export const usersPersistConfig: PersistConfig<UsersState> = {
  key: 'users',
  storage: require('redux-persist/lib/storage').default,
  whitelist: ['users', 'admins', 'directors', 'managers'],
};

export const fetchAllUsers = createAsyncThunk(
  'users/fetchAllUsers',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await usersApiService.getAllUsers(token);
      return response.users;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch users');
    }
  }
);

export const fetchAllAdmins = createAsyncThunk(
  'users/fetchAllAdmins',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await usersApiService.getAllAdmins(token);
      return response.users;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch admins');
    }
  }
);

export const fetchAllDirectors = createAsyncThunk(
  'users/fetchAllDirectors',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await usersApiService.getAllDirectors(token);
      return response.users;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch directors');
    }
  }
);

export const fetchAllManagers = createAsyncThunk(
  'users/fetchAllManagers',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await usersApiService.getAllManagers(token);
      return response.users;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch managers');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUsers: (state) => {
      state.users = null;
      state.admins = null;
      state.directors = null;
      state.managers = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<UserDetails[]>) => {
        state.users = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      // Fetch All Admins
      .addCase(fetchAllAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAdmins.fulfilled, (state, action: PayloadAction<UserDetails[]>) => {
        state.admins = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAllAdmins.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      // Fetch All Directors
      .addCase(fetchAllDirectors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDirectors.fulfilled, (state, action: PayloadAction<UserDetails[]>) => {
        state.directors = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAllDirectors.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      // Fetch All Managers
      .addCase(fetchAllManagers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllManagers.fulfilled, (state, action: PayloadAction<UserDetails[]>) => {
        state.managers = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAllManagers.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const { clearError, clearUsers } = usersSlice.actions;
export default usersSlice.reducer;