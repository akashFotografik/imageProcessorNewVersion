"use client";

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { fetchAllCompanies, createCompany, assignCompany, clearError } from '../../../../redux/slices/companySlice';
import { useAuthToken, useCompaniesError, useCompaniesLoading, useAllCompanies, useUserCompanies } from '../../../../redux/hooks';
import { useAllUsers } from '../../../../redux/hooks';

const CompaniesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const token = useAuthToken();
  const companies = useAllCompanies();
  const userCompanies = useUserCompanies();
  const loading = useCompaniesLoading();
  const error = useCompaniesError();
  const users = useAllUsers();

  // State for create company form
  const [companyForm, setCompanyForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    industry: '',
    gstNumber: '',
    panNumber: '',
    Country: '',
  });

  // State for assign company form
  const [assignForm, setAssignForm] = useState({
    userId: '',
    companyId: '',
    role: 'EMPLOYEE',
  });

  useEffect(() => {
    if (token) {
      dispatch(fetchAllCompanies(token));
    }
  }, [dispatch, token]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      await dispatch(createCompany({ token, data: companyForm }));
      setCompanyForm({
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        logo: '',
        industry: '',
        gstNumber: '',
        panNumber: '',
        Country: '',
      });
    }
  };

  const handleAssignCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      await dispatch(assignCompany({ token, data: assignForm }));
      setAssignForm({ userId: '', companyId: '', role: 'EMPLOYEE' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompanyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssignForm((prev) => ({ ...prev, [name]: value }));
  };

  const clearErrorMessage = () => {
    dispatch(clearError());
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Company Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={clearErrorMessage} className="ml-2 text-sm underline">Clear</button>
        </div>
      )}

      {loading && <p className="text-blue-600">Loading...</p>}

      {/* Fetch Companies Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">All Companies</h2>
        {companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <div key={company.id} className="border p-4 rounded shadow">
                <h3 className="text-lg font-medium">{company.name}</h3>
                <p>Email: {company.email || 'N/A'}</p>
                <p>Phone: {company.phone || 'N/A'}</p>
                <p>Address: {company.address || 'N/A'}</p>
                <p>Industry: {company.industry || 'N/A'}</p>
                <p>Country: {company.Country || 'N/A'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No companies found.</p>
        )}
      </div>

      {/* Create Company Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Create New Company (SUPER_ADMIN only)</h2>
        <form onSubmit={handleCreateCompany} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Company Name *</label>
            <input
              type="text"
              name="name"
              value={companyForm.name}
              onChange={handleInputChange}
              className="mt-1 p-2 border rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={companyForm.email}
              onChange={handleInputChange}
              className="mt-1 p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input
              type="text"
              name="phone"
              value={companyForm.phone}
              onChange={handleInputChange}
              className="mt-1 p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input
              type="text"
              name="address"
              value={companyForm.address}
              onChange={handleInputChange}
              className="mt-1 p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Industry</label>
            <input
              type="text"
              name="industry"
              value={companyForm.industry}
              onChange={handleInputChange}
              className="mt-1 p-2 border rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Country</label>
            <input
              type="text"
              name="Country"
              value={companyForm.Country}
              onChange={handleInputChange}
              className="mt-1 p-2 border rounded w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            Create Company
          </button>
        </form>
      </div>

      {/* Assign Company Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Assign Company to User (SUPER_ADMIN only)</h2>
        <form onSubmit={handleAssignCompany} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">User</label>
            <select
              name="userId"
              value={assignForm.userId}
              onChange={handleAssignInputChange}
              className="mt-1 p-2 border rounded w-full"
              required
            >
              <option value="">Select User</option>
              {users && users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName || user.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Company</label>
            <select
              name="companyId"
              value={assignForm.companyId}
              onChange={handleAssignInputChange}
              className="mt-1 p-2 border rounded w-full"
              required
            >
              <option value="">Select Company</option>
              {companies && companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              name="role"
              value={assignForm.role}
              onChange={handleAssignInputChange}
              className="mt-1 p-2 border rounded w-full"
            >
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="INTERN">INTERN</option>
              <option value="DIRECTOR">DIRECTOR</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            Assign Company
          </button>
        </form>
      </div>

      {/* User Companies Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">User-Company Assignments</h2>
        {userCompanies && userCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCompanies.map((uc) => (
              <div key={uc.id} className="border p-4 rounded shadow">
                <p>User ID: {uc.userId}</p>
                <p>Company ID: {uc.companyId}</p>
                <p>Role: {uc.role}</p>
                <p>Joined: {new Date(uc.joinedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No user-company assignments found.</p>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;