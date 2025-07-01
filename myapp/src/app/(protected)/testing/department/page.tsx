"use client";

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useAllCompanies, useAllUsers, useAllDepartments, useUserDepartments, useCompaniesLoading, useUsersLoading, useDepartmentsLoading, useCompaniesError, useUsersError, useDepartmentsError, useAuthToken } from '../../../../redux/hooks';
import { fetchAllCompanies } from '../../../../redux/slices/companySlice';
import { fetchAllUsers } from '../../../../redux/slices/usersSlice';
import { fetchDepartments, createDepartment, updateUserDepartment } from '../../../../redux/slices/departmentSlice';

interface CreateDepartmentForm {
    name: string;
    companyId: string;
    description: string;
    headOfDeptId: string;
}

interface UpdateUserDepartmentForm {
    userId: string;
    departmentId: string;
    companyId: string;
}

const DepartmentsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const token: string = useAppSelector((state) => state.auth.token) || '';
    const companies = useAllCompanies();
    const users = useAllUsers();
    const departments = useAllDepartments();
    const userDepartments = useUserDepartments();
    const companiesLoading = useCompaniesLoading();
    const usersLoading = useUsersLoading();
    const departmentsLoading = useDepartmentsLoading();
    const companiesError = useCompaniesError();
    const usersError = useUsersError();
    const departmentsError = useDepartmentsError();

    const [createForm, setCreateForm] = useState<CreateDepartmentForm>({
        name: '',
        companyId: '',
        description: '',
        headOfDeptId: '',
    });
    const [assignForm, setAssignForm] = useState<UpdateUserDepartmentForm>({
        userId: '',
        departmentId: '',
        companyId: '',
    });
    const [companyIdFilter, setCompanyIdFilter] = useState<string>('');

    useEffect(() => {
        if (token) {
            dispatch(fetchAllCompanies(token));
            dispatch(fetchAllUsers(token));
            dispatch(fetchDepartments({ token, companyId: companyIdFilter || undefined }));
        }
    }, [dispatch, token, companyIdFilter]);

    const handleCreateDepartment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            alert('Please authenticate to create a department');
            return;
        }
        await dispatch(createDepartment({
            token, data: {
                name: createForm.name,
                companyId: createForm.companyId,
                description: createForm.description || undefined,
                headOfDeptId: createForm.headOfDeptId || undefined,
            }
        }));
        setCreateForm({ name: '', companyId: '', description: '', headOfDeptId: '' });
    };

    const handleAssignDepartment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            alert('Please authenticate to assign a department');
            return;
        }
        await dispatch(updateUserDepartment({
            token, data: {
                userId: assignForm.userId,
                departmentId: assignForm.departmentId,
                companyId: assignForm.companyId,
            }
        }));
        setAssignForm({ userId: '', departmentId: '', companyId: '' });
    };

    return (
        <div className="container mx-auto p-4 flex flex-col space-y-8">
            <h1 className="text-3xl font-bold mb-6">Departments Management</h1>

            {/* Error Messages */}
            {companiesError && <p className="text-red-500 mb-4">{companiesError}</p>}
            {usersError && <p className="text-red-500 mb-4">{usersError}</p>}
            {departmentsError && <p className="text-red-500 mb-4">{departmentsError}</p>}

            {/* Fetch Departments */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Fetch Departments</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Filter by Company (Optional for SUPER_ADMIN)</label>
                    <select
                        value={companyIdFilter}
                        onChange={(e) => setCompanyIdFilter(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                        <option value="">All Companies</option>
                        {companies?.map((company) => (
                            <option key={company.id} value={company.id}>{company.name}</option>
                        ))}
                    </select>
                </div>
                {departmentsLoading && <p>Loading departments...</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments?.map((dept) => (
                        <div key={dept.id} className="border rounded-lg p-4 shadow-md">
                            <h3 className="text-lg font-semibold">{dept.name}</h3>
                            <p>Company: {dept.company.name}</p>
                            <p>Description: {dept.description || 'N/A'}</p>
                            <p>Head: {dept.headOfDept?.fullName || 'N/A'}</p>
                            <p>Active: {dept.isActive ? 'Yes' : 'No'}</p>
                            <p>Created: {new Date(dept.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Department */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Create Department</h2>
                <form onSubmit={handleCreateDepartment} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Department Name</label>
                        <input
                            type="text"
                            value={createForm.name}
                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company</label>
                        <select
                            value={createForm.companyId}
                            onChange={(e) => setCreateForm({ ...createForm, companyId: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            required
                        >
                            <option value="">Select a company</option>
                            {companies?.map((company) => (
                                <option key={company.id} value={company.id}>{company.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={createForm.description}
                            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Head of Department</label>
                        <select
                            value={createForm.headOfDeptId}
                            onChange={(e) => setCreateForm({ ...createForm, headOfDeptId: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="">Select a user (optional)</option>
                            {users?.map((user) => (
                                <option key={user.id} value={user.id}>{user.fullName || user.email}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={departmentsLoading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                    >
                        Create Department
                    </button>
                </form>
            </div>

            {/* Assign Department */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Assign User to Department</h2>
                <form onSubmit={handleAssignDepartment} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">User</label>
                        <select
                            value={assignForm.userId}
                            onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            required
                        >
                            <option value="">Select a user</option>
                            {users?.map((user) => (
                                <option key={user.id} value={user.id}>{user.fullName || user.email}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company</label>
                        <select
                            value={assignForm.companyId}
                            onChange={(e) => setAssignForm({ ...assignForm, companyId: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            required
                        >
                            <option value="">Select a company</option>
                            {companies?.map((company) => (
                                <option key={company.id} value={company.id}>{company.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <select
                            value={assignForm.departmentId}
                            onChange={(e) => setAssignForm({ ...assignForm, departmentId: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            required
                        >
                            <option value="">Select a department</option>
                            {departments?.filter((dept) => dept.companyId === assignForm.companyId).map((dept) => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={departmentsLoading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                    >
                        Assign Department
                    </button>
                </form>
            </div>

            {/* User Department Assignments */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">User Department Assignments</h2>
                {departmentsLoading && <p>Loading user departments...</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userDepartments?.map((ud) => (
                        <div key={ud.id} className="border rounded-lg p-4 shadow-md">
                            <p>User ID: {ud.id}</p>
                            <p>Department: {ud.department?.name || 'N/A'}</p>
                            <p>Company: {ud.userCompanies?.[0]?.company.name || 'N/A'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DepartmentsPage;