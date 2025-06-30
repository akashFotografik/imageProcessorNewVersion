import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApiService } from '../apis/authApi';
import { PersistConfig } from 'redux-persist';

interface TokenDetails {
  firebaseId: string;
  email: string;
  emailVerified: boolean;
  authTime: number;
  iat: number;
  exp: number;
}

interface AuthState {
  token: string | null;
  tokenDetails: TokenDetails | null;
  isAuthenticated: boolean;
  error: string | null;
  user: any | null; // Add user property to AuthState
}

interface LoginResponse {
  success: boolean;
  message: string;
  user: any;
  token: TokenDetails;
}

// Initialize state without accessing localStorage
const initialState: AuthState = {
  token: null,
  tokenDetails: null,
  isAuthenticated: false, // Let redux-persist handle rehydration
  error: null,
  user: null, // Initialize user property to null
};

// Configure redux-persist for auth slice
export const authPersistConfig: PersistConfig<AuthState> = {
  key: 'auth',
  storage: require('redux-persist/lib/storage').default,
  whitelist: ['token', 'isAuthenticated', 'tokenDetails', 'user'], // Persist token, isAuthenticated, and tokenDetails
};

export const loginWithFirebaseToken = createAsyncThunk(
  'auth/loginWithFirebaseToken',
  async (idToken: string, { rejectWithValue }) => {
    try {
      const response = await authApiService.loginWithToken(idToken);
      console.log('i am response', response);
      return { 
        idToken, 
        tokenDetails: response.token, 
        user: response.user 
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      
      if (state.auth.token) {
        await authApiService.logout(state.auth.token);
      }

      return true;
    } catch (error) {
      console.warn('Logout API call failed:', error);
      return true;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.token = null;
      state.tokenDetails = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithFirebaseToken.fulfilled, (state, action) => {
        state.token = action.payload.idToken;
        state.tokenDetails = action.payload.tokenDetails;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginWithFirebaseToken.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.token = null;
        state.tokenDetails = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.tokenDetails = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.token = null;
        state.tokenDetails = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;