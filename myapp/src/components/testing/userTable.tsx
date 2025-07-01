"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAllUsers, useUsersLoading, useUsersError, useAuthToken } from '../../redux/hooks';
import { fetchAllUsers } from '../../redux/slices/usersSlice';

const UsersList: React.FC = () => {
  const dispatch = useAppDispatch();
  const users = useAllUsers();
  const loading = useUsersLoading();
  const error = useUsersError();
  const token = useAuthToken();

  useEffect(() => {
    if (token) {
      dispatch(fetchAllUsers(token));
    }
  }, [dispatch, token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users?.map((user) => (
          <li key={user.id}>
            {user.fullName} - {user.email} ({user.role})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersList;