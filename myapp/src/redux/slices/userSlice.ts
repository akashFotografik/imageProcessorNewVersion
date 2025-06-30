import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loginWithFirebaseToken, logoutUser } from './authSlice';

// Types based on your API response
interface Department {
  id: string;
  name: string;
  description: string;
  headOfDept: string;
}

interface Company {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  industry: string;
}

interface Manager {
  id: string;
  fullName: string;
  email: string;
  employeeId: string;
  designation: string;
}

export interface UserDetails {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  profileImage: string | null;
  employeeId: string;
  designation: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE' | 'INTERN';
  isActive: boolean;
  dateOfJoining: string;
  dateOfBirth: string | null;
  address: string | null;
  emergencyContact: string | null;
  workingHoursPerDay: number;
  department: Department | null;
  company: Company | null;
  firebaseId: string;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  userDetails: UserDetails | null;
  error: string | null;
}

const initialState: UserState = {
  userDetails: null,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    updateUserDetails: (state, action: PayloadAction<Partial<UserDetails>>) => {
      if (state.userDetails) {
        state.userDetails = { ...state.userDetails, ...action.payload };
      }
    },
    clearUserData: (state) => {
      state.userDetails = null;
      state.error = null;
    },
    setUserDetails: (state, action: PayloadAction<UserDetails>) => {
      state.userDetails = action.payload;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
    // Login with Firebase token - handle user data
      .addCase(loginWithFirebaseToken.fulfilled, (state, action) => {
        state.userDetails = action.payload.user;
        state.error = null;
      })
      .addCase(loginWithFirebaseToken.rejected, (state, action) => {
        state.error = action.payload as string;
        state.userDetails = null;
      })
      // Logout - clear user data
      .addCase(logoutUser.fulfilled, (state) => {
        state.userDetails = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Clear user data even if logout fails
        state.userDetails = null;
        state.error = null;
      });
  },
});

export const { clearUserError, updateUserDetails, clearUserData, setUserDetails } = userSlice.actions;
export default userSlice.reducer;

export type { Department, Company, Manager, UserState };