import axios from 'axios';
import { ApiResponse, User, Medicine, MedicineFormData, DashboardSummary, AdherenceStats } from '../types';

// ─── Axios instance ────────────────────────────────────────────────────────────
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mrs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — auto logout
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mrs_token');
      localStorage.removeItem('mrs_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data),

  getMe: () =>
    api.get<ApiResponse<User>>('/auth/me'),
};

// ─── Medicine API ─────────────────────────────────────────────────────────────
export const medicineApi = {
  getAll: (params?: { date?: string; search?: string }) =>
    api.get<ApiResponse<Medicine[]>>('/medicines', { params }),

  getToday: () =>
    api.get<ApiResponse<Medicine[]>>('/medicines/today'),

  getStats: (days?: number) =>
    api.get<ApiResponse<AdherenceStats>>('/medicines/stats', { params: { days } }),

  getById: (id: number) =>
    api.get<ApiResponse<Medicine>>(`/medicines/${id}`),

  create: (data: MedicineFormData) =>
    api.post<ApiResponse<Medicine>>('/medicines', data),

  update: (id: number, data: Partial<MedicineFormData>) =>
    api.put<ApiResponse<Medicine>>(`/medicines/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/medicines/${id}`),

  markTaken: (id: number, taken: boolean) =>
    api.patch<ApiResponse<Medicine>>(`/medicines/${id}/taken`, { taken }),
};

// ─── Dashboard API ────────────────────────────────────────────────────────────
export const dashboardApi = {
  getSummary: () =>
    api.get<ApiResponse<DashboardSummary>>('/dashboard/summary'),

  getAdminData: () =>
    api.get('/dashboard/admin'),
};

export default api;
