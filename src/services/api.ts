import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, LoginRequest, LoginResponse, CheckTokenRequest, CheckTokenResponse } from '../types/auth';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Crear instancia de axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token a las requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Si el token es inválido, limpiar el localStorage
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      // Opcional: redirigir al login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data;
  },

  // Verificar token
  async checkToken(token: string): Promise<ApiResponse<CheckTokenResponse>> {
    const response = await apiClient.post<ApiResponse<CheckTokenResponse>>('/auth/check', { token });
    return response.data;
  },
};

// Servicios de usuarios
export const userService = {
  // Obtener todos los usuarios
  async getAllUsers(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<ApiResponse<any[]>>('/users/getAll');
    return response.data;
  },

  // Crear profesor
  async createTeacher(userData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>('/users/create/teacher', userData);
    return response.data;
  },

  // Crear estudiante
  async createStudent(userData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>('/users/create/student', userData);
    return response.data;
  },

  // Crear administrador
  async createAdmin(userData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>('/users/create/admin', userData);
    return response.data;
  },
};

// Servicios de clases
export const classService = {
  // Obtener todas las clases
  async getAllClasses(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<ApiResponse<any[]>>('/classes/getAll');
    return response.data;
  },

  // Crear clase
  async createClass(classData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>('/classes/create', classData);
    return response.data;
  },
};

export default apiClient;
