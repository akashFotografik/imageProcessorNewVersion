import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PersistConfig } from 'redux-persist';
import { tasksApiService } from '../apis/taskApi';

export interface TaskDetails {
    id: string;
    title: string;
    description: string | null;
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    startDate: string | null;
    dueDate: string | null;
    estimatedHours: number | null;
    companyId: string;
    company: {
        id: string;
        name: string;
    };
    assignedTo: {
        id: string;
        fullName: string;
        email: string;
    } | null;
    department: {
        id: string;
        name: string;
    } | null;
    createdBy: {
        id: string;
        fullName: string;
    };
    isActive: boolean;
    createdAt: string;
}

interface TasksState {
    tasks: TaskDetails[] | null;
    loading: boolean;
    error: string | null;
}

const initialState: TasksState = {
    tasks: null,
    loading: false,
    error: null,
};

export const tasksPersistConfig: PersistConfig<TasksState> = {
    key: 'tasks',
    storage: require('redux-persist/lib/storage').default,
    whitelist: ['tasks'],
};

export const fetchTasks = createAsyncThunk(
    'tasks/fetchTasks',
    async ({ token, companyId }: { token: string; companyId?: string }, { rejectWithValue }) => {
        try {
            const response = await tasksApiService.getTasks(token, companyId);
            return response.tasks;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch tasks');
        }
    }
);

export const createTask = createAsyncThunk(
    'tasks/createTask',
    async (
        { token, data }: {
            token: string;
            data: {
                title: string;
                companyId: string;
                assignedToId?: string;
                description?: string;
                departmentId?: string;
                priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
                startDate?: string;
                dueDate?: string;
                estimatedHours?: number;
            }
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await tasksApiService.createTask(token, data);
            return response.task;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to create task');
        }
    }
);

export const deleteTask = createAsyncThunk(
    'tasks/deleteTask',
    async ({ token, taskId }: { token: string; taskId: string }, { rejectWithValue }) => {
        try {
            await tasksApiService.deleteTask(token, taskId);
            return taskId;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete task');
        }
    }
);

export const assignTaskToUser = createAsyncThunk(
    'tasks/assignTaskToUser',
    async (
        { token, data }: {
            token: string;
            data: { taskId: string; userId: string; companyId: string }
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await tasksApiService.assignTaskToUser(token, data);
            return response.task;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to assign task to user');
        }
    }
);

export const assignTaskToDepartment = createAsyncThunk(
    'tasks/assignTaskToDepartment',
    async (
        { token, data }: {
            token: string;
            data: { taskId: string; departmentId: string; companyId: string }
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await tasksApiService.assignTaskToDepartment(token, data);
            return response.task;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to assign task to department');
        }
    }
);

const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearTasks: (state) => {
            state.tasks = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Tasks
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<TaskDetails[] | undefined>) => {
                state.tasks = action.payload || null;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.error = action.payload as string;
                state.loading = false;
            })
            // Create Task
            .addCase(createTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTask.fulfilled, (state, action: PayloadAction<TaskDetails | undefined>) => {
                if (action.payload) {
                    state.tasks = state.tasks
                        ? [...state.tasks, action.payload]
                        : [action.payload];
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(createTask.rejected, (state, action) => {
                state.error = action.payload as string;
                state.loading = false;
            })
            // Delete Task
            .addCase(deleteTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
                state.tasks = state.tasks
                    ? state.tasks.filter(task => task.id !== action.payload)
                    : null;
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.error = action.payload as string;
                state.loading = false;
            })
            // Assign Task to User
            .addCase(assignTaskToUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(assignTaskToUser.fulfilled, (state, action) => {
                const updatedTask = action.payload;
                if (!updatedTask) {
                    state.loading = false;
                    state.error = null;
                    return;
                }

                if (state.tasks) {
                    state.tasks = state.tasks.map(task =>
                        task.id === updatedTask.id ? updatedTask : task
                    );
                } else {
                    state.tasks = [updatedTask]; // ✅ now it's guaranteed to be TaskDetails[]
                }

                state.loading = false;
                state.error = null;
            })
            .addCase(assignTaskToUser.rejected, (state, action) => {
                state.error = action.payload as string;
                state.loading = false;
            })
            // Assign Task to Department
            .addCase(assignTaskToDepartment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(assignTaskToDepartment.fulfilled, (state, action) => {
                const updatedTask = action.payload;
                if (!updatedTask) {
                    state.loading = false;
                    state.error = null;
                    return;
                }

                if (state.tasks) {
                    state.tasks = state.tasks.map(task =>
                        task.id === updatedTask.id ? updatedTask : task
                    );
                } else {
                    state.tasks = [updatedTask]; // ✅ This is now TaskDetails[], not [undefined]
                }
            })
            .addCase(assignTaskToDepartment.rejected, (state, action) => {
                state.error = action.payload as string;
                state.loading = false;
            });
    },
});

export const { clearError, clearTasks } = tasksSlice.actions;
export default tasksSlice.reducer;