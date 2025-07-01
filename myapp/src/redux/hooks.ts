import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAuth = () => {
  return useAppSelector((state) => state.auth);
};

export const useUser = () => {
  return useAppSelector((state) => state.user);
};

export const useIsAuthenticated = () => {
  return useAppSelector((state) => state.auth.isAuthenticated);
};

export const useAuthToken = () => {
  return useAppSelector((state) => state.auth.token);
};

export const useUserDetails = () => {
  return useAppSelector((state) => state.user.userDetails);
};

export const useAuthError = () => {
  return useAppSelector((state) => state.auth.error);
};

export const useUserError = () => {
  return useAppSelector((state) => state.user.error);
};

export const useTokenDetails = () => {
  return useAppSelector((state) => state.auth.tokenDetails);
};

export const useAllUsers = () => {
  return useAppSelector((state) => state.users.users);
};

export const useAllAdmins = () => {
  return useAppSelector((state) => state.users.admins);
};

export const useAllDirectors = () => {
  return useAppSelector((state) => state.users.directors);
};

export const useAllManagers = () => {
  return useAppSelector((state) => state.users.managers);
};

export const useUsersLoading = () => {
  return useAppSelector((state) => state.users.loading);
};

export const useUsersError = () => {
  return useAppSelector((state) => state.users.error);
};

export const useAllCompanies = () => {
  return useAppSelector((state) => state.companies.companies);
};

export const useUserCompanies = () => {
  return useAppSelector((state) => state.companies.userCompanies);
};

export const useCompaniesLoading = () => {
  return useAppSelector((state) => state.companies.loading);
};

export const useCompaniesError = () => {
  return useAppSelector((state) => state.companies.error);
};

export const useAllDepartments = () => {
  return useAppSelector((state) => state.departments.departments);
};

export const useUserDepartments = () => {
  return useAppSelector((state) => state.departments.userDepartments);
};

export const useDepartmentsLoading = () => {
  return useAppSelector((state) => state.departments.loading);
};

export const useDepartmentsError = () => {
  return useAppSelector((state) => state.departments.error);
};

export const useAllTasks = () => {
  return useAppSelector((state) => state.tasks.tasks);
};

export const useTasksLoading = () => {
  return useAppSelector((state) => state.tasks.loading);
};

export const useTasksError = () => {
  return useAppSelector((state) => state.tasks.error);
};