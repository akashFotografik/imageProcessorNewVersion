import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import usersReducer from './slices/usersSlice';
import companiesReducer from './slices/companySlice';
import departmentsReducer from './slices/departmentSlice';
import tasksReducer from './slices/taskSlice';
import { authPersistConfig } from './slices/authSlice';
import { usersPersistConfig } from './slices/usersSlice';
import { companiesPersistConfig } from './slices/companySlice';
import { departmentsPersistConfig } from './slices/departmentSlice';
import { tasksPersistConfig } from './slices/taskSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'user', 'users', 'companies', 'departments', 'tasks', 'token', 'isAuthenticated'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedUserReducer = persistReducer(persistConfig, userReducer);
const persistedUsersReducer = persistReducer(usersPersistConfig, usersReducer);
const persistedCompaniesReducer = persistReducer(companiesPersistConfig, companiesReducer);
const persistedDepartmentsReducer = persistReducer(departmentsPersistConfig, departmentsReducer);
const persistedTasksReducer = persistReducer(tasksPersistConfig, tasksReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    user: persistedUserReducer,
    users: persistedUsersReducer,
    companies: persistedCompaniesReducer,
    departments: persistedDepartmentsReducer,
    tasks: persistedTasksReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;