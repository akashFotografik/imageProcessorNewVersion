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