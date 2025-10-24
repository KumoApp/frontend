import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, LoginRequest, LoginResponse, CheckTokenResponse } from '../types/auth';

const API_BASE_URL = 'http://localhost:3000';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // limpiamos credenciales pero NO redirigimos aquí
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data;
  },

  async checkToken(token: string): Promise<ApiResponse<CheckTokenResponse>> {
    const response = await apiClient.post<ApiResponse<CheckTokenResponse>>('/auth/check', { token });
    return response.data;
  },
};

export const userService = {
  async getAllUsers(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<ApiResponse<any[]>>('/users/getAll');
    return response.data;
  },
  async createTeacher(userData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>('/users/create/teacher', userData);
    return response.data;
  },
  async createStudent(userData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>('/users/create/student', userData);
    return response.data;
  },
  async createAdmin(userData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>('/users/create/admin', userData);
    return response.data;
  },
};

export const classService = {
  async getAllClasses(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<ApiResponse<any[]>>('/classes/getAll');
    return response.data;
  },
  async createClass(classData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>('/classes/create', classData);
    return response.data;
  },
};

export default apiClient;
