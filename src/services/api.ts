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

// Quiz types based on backend DTOs
export interface QuizSmallResponse {
  id: number;
  totalQuestions: number;
  date: string;
}

export interface QuizQuestion {
  id: number;
  questionNumber: number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export interface QuizFullResponse {
  id: number;
  totalQuestions: number;
  date: string;
  questions: QuizQuestion[];
}

export interface QuizAnswerSmallResponse {
  quizId: number;
  studentId: number;
  classId: number;
  score: number;
  total: number;
}

export interface QuizAnswerFullResponse {
  quizId: number;
  studentId: number;
  classId: number;
  correctAnswers: number[]; // Array of numbers (0, 1, 2, 3)
  answers: number[]; // Array of numbers (0, 1, 2, 3)
  score: number;
  total: number;
}

export interface AnswerDailyQuizRequest {
  answers: number[]; // Array of numbers (0, 1, 2, 3) where A=0, B=1, C=2, D=3
}

export interface AnswerDailyQuizResponse {
  correctAnswers: number[]; // Array of numbers (0, 1, 2, 3)
  correct: boolean[]; // Array of booleans indicating if each answer was correct
  score: number;
  total: number;
}

export const quizService = {
  // GET /quizzes/classes/:classId - GetAllQuizzesbyId
  async getQuizzesFromClass(classId: string | number): Promise<QuizSmallResponse[]> {
    const id = encodeURIComponent(String(classId));
    console.log(`[QuizService] GET /quizzes/classes/${id}`);
    const response = await apiClient.get<any>(`/quizzes/classes/${id}`);
    console.log(`[QuizService] Response:`, response.data);
    // Backend puede devolver directamente un array o envuelto en { body: [...] }
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    // Si viene envuelto en un objeto con 'body'
    if (data?.body && Array.isArray(data.body)) {
      return data.body;
    }
    // Si viene envuelto en otro formato
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    console.warn('[QuizService] Formato de respuesta inesperado:', data);
    return [];
  },

  // GET /quizzes/:quizId - GetQuizInfoByID
  async getQuizInfoById(quizId: number): Promise<QuizFullResponse> {
    console.log(`[QuizService] GET /quizzes/${quizId}`);
    const response = await apiClient.get<any>(`/quizzes/${quizId}`);
    console.log(`[QuizService] Response:`, response.data);
    const data = response.data;
    // Manejar respuesta directa o envuelta
    return data?.body || data?.data || data;
  },

  // GET /quizzes/classes/:classId/daily - GetDailyQuiz
  async getDailyQuiz(classId: string | number): Promise<QuizFullResponse> {
    const id = encodeURIComponent(String(classId));
    console.log(`[QuizService] GET /quizzes/classes/${id}/daily`);
    const response = await apiClient.get<any>(`/quizzes/classes/${id}/daily`);
    console.log(`[QuizService] Response:`, response.data);
    const data = response.data;
    // Manejar respuesta directa o envuelta
    return data?.body || data?.data || data;
  },

  // GET /quizzes/classes/:classId/answers - GetAllOwnAnswers
  async getAllOwnAnswers(classId: string | number): Promise<QuizAnswerSmallResponse[]> {
    const id = encodeURIComponent(String(classId));
    console.log(`[QuizService] GET /quizzes/classes/${id}/answers`);
    const response = await apiClient.get<any>(`/quizzes/classes/${id}/answers`);
    console.log(`[QuizService] Response:`, response.data);
    const data = response.data;
    // Backend puede devolver directamente un array o envuelto en { body: [...] }
    if (Array.isArray(data)) {
      return data;
    }
    // Si viene envuelto en un objeto con 'body'
    if (data?.body && Array.isArray(data.body)) {
      return data.body;
    }
    // Si viene envuelto en otro formato
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    console.warn('[QuizService] Formato de respuesta inesperado:', data);
    return [];
  },

  // GET /quizzes/:quizId/answer - GetOwnANswer
  async getOwnAnswer(quizId: number): Promise<QuizAnswerFullResponse> {
    console.log(`[QuizService] GET /quizzes/${quizId}/answer`);
    const response = await apiClient.get<any>(`/quizzes/${quizId}/answer`);
    console.log(`[QuizService] Response:`, response.data);
    const data = response.data;
    // Manejar respuesta directa o envuelta
    return data?.body || data?.data || data;
  },

  // POST /quizzes/classes/:classId/daily/answer - AnswerDailyQuiz
  async answerDailyQuiz(classId: string | number, answers: AnswerDailyQuizRequest): Promise<AnswerDailyQuizResponse> {
    const id = encodeURIComponent(String(classId));
    console.log(`[QuizService] POST /quizzes/classes/${id}/daily/answer`, answers);
    const response = await apiClient.post<any>(
      `/quizzes/classes/${id}/daily/answer`,
      answers
    );
    console.log(`[QuizService] Response:`, response.data);
    const data = response.data;
    // Manejar respuesta directa o envuelta
    return data?.body || data?.data || data;
  },
};

export default apiClient;
