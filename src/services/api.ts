import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  CheckTokenResponse,
} from "../types/auth";

const API_BASE_URL = "http://ena.ddns.net:62483";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  // No establecer Content-Type por defecto para permitir FormData
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");

    // Configurar headers
    config.headers = config.headers ?? {};

    // Agregar token si existe
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    // Solo agregar Content-Type: application/json si NO es FormData
    if (config.data && !(config.data instanceof FormData)) {
      (config.headers as any)["Content-Type"] = "application/json";
    } else if (config.data instanceof FormData) {
      // Eliminar Content-Type para que el navegador lo configure con el boundary
      delete (config.headers as any)["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // limpiamos credenciales pero NO redirigimos aquí
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
    }
    return Promise.reject(error);
  },
);

export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      credentials,
    );
    return response.data;
  },

  async checkToken(token: string): Promise<ApiResponse<CheckTokenResponse>> {
    const response = await apiClient.post<ApiResponse<CheckTokenResponse>>(
      "/auth/check",
      { token },
    );
    return response.data;
  },
};

// User data in class response
export interface UserInClassData {
  id: number;
  email: string;
  name: string;
  lastname: string;
  username: string;
  level: number;
  coins: number;
  streak: number;
}

export const userService = {
  async getAllUsers(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<ApiResponse<any[]>>("/users/getAll");
    return response.data;
  },
  async getAllStudents(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<ApiResponse<any[]>>("/users/students");
    return response.data;
  },
  async createTeacher(userData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      "/users/teachers",
      userData,
    );
    return response.data;
  },
  async createStudent(userData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      "/users/students",
      userData,
    );
    return response.data;
  },
  async createAdmin(userData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      "/users/create/admin",
      userData,
    );
    return response.data;
  },
  // GET /users/me/classes/:classId - Get user data in specific class
  async getMyDataInClass(
    classId: string | number,
  ): Promise<ApiResponse<UserInClassData>> {
    const id = encodeURIComponent(String(classId));
    console.log(`[UserService] GET /users/me/classes/${id}`);
    const response = await apiClient.get<ApiResponse<UserInClassData>>(
      `/users/me/classes/${id}`,
    );
    console.log(`[UserService] Response:`, response.data);
    return response.data;
  },
};

export const classService = {
  async getMyClasses(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<ApiResponse<any[]>>("/classes/me");
    return response.data;
  },
  async getAllClasses(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<ApiResponse<any[]>>("/classes/");
    return response.data;
  },
  async createClass(classData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      "/classes/",
      classData,
    );
    return response.data;
  },
  // GET /classes/:classId - GetClass
  async getClass(classId: string | number): Promise<any> {
    const id = encodeURIComponent(String(classId));
    console.log(`[ClassService] GET /classes/${id}`);
    const response = await apiClient.get<any>(`/classes/${id}`);
    console.log(`[ClassService] Response:`, response.data);
    return response.data;
  },
  // POST /classes/:classId/students - Add student to class
  async addStudentToClass(
    classId: string | number,
    studentId: number,
  ): Promise<any> {
    const id = encodeURIComponent(String(classId));
    const requestBody = { studentId, classId: Number(classId) };
    console.log(`[ClassService] ========== ADD STUDENT TO CLASS ==========`);
    console.log(`[ClassService] POST /classes/${id}/students`);
    console.log(`[ClassService] classId (original):`, classId);
    console.log(`[ClassService] classId (encoded):`, id);
    console.log(`[ClassService] studentId:`, studentId);
    console.log(`[ClassService] Request Body:`, requestBody);
    console.log(
      `[ClassService] Full URL:`,
      `${API_BASE_URL}/classes/${id}/students`,
    );

    try {
      const response = await apiClient.post<any>(
        `/classes/${id}/students`,
        requestBody,
      );
      console.log(`[ClassService] ========== SUCCESS ==========`);
      console.log(`[ClassService] Status:`, response.status);
      console.log(`[ClassService] Response:`, response.data);
      console.log(`[ClassService] ================================`);
      return response.data;
    } catch (error: any) {
      console.error(`[ClassService] ========== ERROR ==========`);
      console.error(`[ClassService] Error:`, error);
      console.error(`[ClassService] Error message:`, error?.message);
      console.error(`[ClassService] Response status:`, error?.response?.status);
      console.error(`[ClassService] Response data:`, error?.response?.data);
      console.error(`[ClassService] ==============================`);
      throw error;
    }
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
  coinsEarned: number; // Monedas ganadas por completar el quiz
}

export const quizService = {
  // GET /quizzes/classes/:classId - GetAllQuizzesbyId
  async getQuizzesFromClass(
    classId: string | number,
  ): Promise<QuizSmallResponse[]> {
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
    console.warn("[QuizService] Formato de respuesta inesperado:", data);
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
  async getAllOwnAnswers(
    classId: string | number,
  ): Promise<QuizAnswerSmallResponse[]> {
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
    console.warn("[QuizService] Formato de respuesta inesperado:", data);
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
  async answerDailyQuiz(
    classId: string | number,
    answers: AnswerDailyQuizRequest,
  ): Promise<AnswerDailyQuizResponse> {
    const id = encodeURIComponent(String(classId));
    console.log(
      `[QuizService] POST /quizzes/classes/${id}/daily/answer`,
      answers,
    );
    const response = await apiClient.post<any>(
      `/quizzes/classes/${id}/daily/answer`,
      answers,
    );
    console.log(`[QuizService] Response:`, response.data);
    const data = response.data;
    // Manejar respuesta directa o envuelta
    return data?.body || data?.data || data;
  },

  // PATCH /quizzes/classes/:classId/daily/enable - EnableAutomaticDailyQuiz
  async enableAutomaticDailyQuiz(classId: string | number): Promise<any> {
    const id = encodeURIComponent(String(classId));
    console.log(`[QuizService] PATCH /quizzes/classes/${id}/daily/enable`);
    const response = await apiClient.patch<any>(
      `/quizzes/classes/${id}/daily/enable`,
    );
    console.log(`[QuizService] Response:`, response.data);
    return response.data;
  },

  // PATCH /quizzes/classes/:classId/daily/disable - DisableAutomaticDailyQuiz
  async disableAutomaticDailyQuiz(classId: string | number): Promise<any> {
    const id = encodeURIComponent(String(classId));
    console.log(`[QuizService] PATCH /quizzes/classes/${id}/daily/disable`);
    const response = await apiClient.patch<any>(
      `/quizzes/classes/${id}/daily/disable`,
    );
    console.log(`[QuizService] Response:`, response.data);
    return response.data;
  },

  // POST /quizzes/classes/:classId - CreateDailyQuiz
  async createDailyQuiz(classId: string | number): Promise<any> {
    const id = encodeURIComponent(String(classId));
    console.log(`[QuizService] POST /quizzes/classes/${id}`);
    const response = await apiClient.post<any>(`/quizzes/classes/${id}/daily`);
    console.log(`[QuizService] Response:`, response.data);
    return response.data;
  },
};

// Material Service
export const materialService = {
  // GET /material/classes/:classId - GetMaterialInfoFromClass
  async getMaterialInfoFromClass(classId: string | number): Promise<any> {
    const id = encodeURIComponent(String(classId));
    console.log(`[MaterialService] GET /material/classes/${id}`);
    const response = await apiClient.get<any>(`/material/classes/${id}`);
    console.log(`[MaterialService] Response:`, response.data);
    return response.data;
  },

  // GET /material/:materialId - GetMaterial
  async getMaterial(materialId: string | number): Promise<any> {
    const id = encodeURIComponent(String(materialId));
    console.log(`[MaterialService] GET /material/${id}`);
    const response = await apiClient.get<any>(`/material/${id}`);
    console.log(`[MaterialService] Response:`, response.data);
    return response.data;
  },

  // POST /material/classes/:classId - UploadMaterialToClass
  async uploadMaterialToClass(
    classId: string | number,
    file: File,
  ): Promise<any> {
    const id = encodeURIComponent(String(classId));
    const formData = new FormData();
    formData.append("file", file);

    console.log(`[MaterialService] POST /material/classes/${id}`);
    console.log(`[MaterialService] File name:`, file.name);
    console.log(`[MaterialService] File type:`, file.type);
    console.log(`[MaterialService] File size:`, file.size);
    console.log(
      `[MaterialService] FormData keys:`,
      Array.from(formData.keys()),
    );

    const response = await apiClient.post<any>(
      `/material/classes/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    console.log(`[MaterialService] Response:`, response.data);
    return response.data;
  },
};

// Shop Service
export interface PurchaseShopItemRequest {
  itemId: number;
}

export interface CreateShopItemRequest {
  name: string;
  description?: string;
  price: number;
  type: string; // Obligatorio: "FOOD", "BACKGROUND", "ACCESSORY"
}

export const shopService = {
  // GET /shop/ - GetShopItems
  async getShopItems(): Promise<any> {
    console.log(`[ShopService] GET /shop/`);
    const response = await apiClient.get<any>("/shop/");
    console.log(`[ShopService] Response:`, response.data);
    return response.data;
  },

  // GET /shop/items/:itemId - GetShopItem
  async getShopItem(itemId: string | number): Promise<any> {
    const id = encodeURIComponent(String(itemId));
    console.log(`[ShopService] GET /shop/items/${id}`);
    const response = await apiClient.get<any>(`/shop/items/${id}`);
    console.log(`[ShopService] Response:`, response.data);
    return response.data;
  },

  // POST /shop/classes/:classId/purchase - PurchaseShopItem
  async purchaseShopItem(
    classId: string | number,
    itemId: number,
  ): Promise<any> {
    const id = encodeURIComponent(String(classId));
    const requestBody: PurchaseShopItemRequest = { itemId };

    console.log(`[ShopService] ========== PURCHASE REQUEST ==========`);
    console.log(`[ShopService] URL: POST /shop/classes/${id}/purchase`);
    console.log(`[ShopService] classId (original):`, classId);
    console.log(`[ShopService] classId (encoded):`, id);
    console.log(`[ShopService] itemId:`, itemId);
    console.log(`[ShopService] Request Body:`, requestBody);
    console.log(
      `[ShopService] Full URL:`,
      `${API_BASE_URL}/shop/classes/${id}/purchase`,
    );

    try {
      const response = await apiClient.post<any>(
        `/shop/classes/${id}/purchase`,
        requestBody,
      );
      console.log(`[ShopService] ========== PURCHASE RESPONSE ==========`);
      console.log(`[ShopService] Status:`, response.status);
      console.log(`[ShopService] Status Text:`, response.statusText);
      console.log(`[ShopService] Headers:`, response.headers);
      console.log(`[ShopService] Data:`, response.data);
      console.log(`[ShopService] Data type:`, typeof response.data);
      console.log(`[ShopService] Data keys:`, Object.keys(response.data || {}));
      console.log(`[ShopService] ========================================`);
      return response.data;
    } catch (error: any) {
      console.error(`[ShopService] ========== PURCHASE ERROR ==========`);
      console.error(`[ShopService] Error:`, error);
      console.error(`[ShopService] Error message:`, error?.message);
      console.error(`[ShopService] Response status:`, error?.response?.status);
      console.error(`[ShopService] Response data:`, error?.response?.data);
      console.error(
        `[ShopService] Response headers:`,
        error?.response?.headers,
      );
      console.error(`[ShopService] ======================================`);
      throw error;
    }
  },

  // POST /shop/items - CreateShopItem (requires system authentication)
  async createShopItem(
    itemData: CreateShopItemRequest,
    imageFile: File,
    systemToken: string,
  ): Promise<any> {
    console.log(`[ShopService] ========== CREATE SHOP ITEM ==========`);
    console.log(`[ShopService] POST /shop/items`);
    console.log(`[ShopService] itemData:`, itemData);
    console.log(`[ShopService] imageFile:`, imageFile);
    console.log(`[ShopService] imageFile type:`, imageFile?.type);
    console.log(`[ShopService] imageFile size:`, imageFile?.size);

    // Crear FormData para enviar imagen + datos
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("name", itemData.name);
    formData.append("price", itemData.price.toString());
    formData.append("type", itemData.type.toUpperCase()); // Asegurar mayúsculas

    // Campos opcionales
    if (itemData.description && itemData.description.trim()) {
      formData.append("description", itemData.description);
    }

    console.log(
      `[ShopService] FormData created, type:`,
      formData.constructor.name,
    );
    console.log(
      `[ShopService] FormData instanceof FormData:`,
      formData instanceof FormData,
    );
    console.log(`[ShopService] FormData entries:`);
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(
          `  ${pair[0]}: [File] ${pair[1].name} (${pair[1].type}, ${pair[1].size} bytes)`,
        );
      } else {
        console.log(`  ${pair[0]}: "${pair[1]}" (type: ${typeof pair[1]})`);
      }
    }
    console.log(`[ShopService] About to send request...`);

    console.log(
      `[ShopService] systemToken (first 30 chars):`,
      systemToken?.substring(0, 30),
    );

    try {
      // No especificar Content-Type para que el navegador lo configure automáticamente
      // con el boundary correcto para multipart/form-data
      const response = await apiClient.post<any>("/shop/items", formData, {
        headers: {
          Authorization: `Bearer ${systemToken}`,
        },
      });
      console.log(`[ShopService] ========== RESPONSE RECEIVED ==========`);
      console.log(`[ShopService] Status:`, response.status);
      console.log(`[ShopService] Response data:`, response.data);
      console.log(`[ShopService] ======================================`);
      return response.data;
    } catch (error: any) {
      console.error(`[ShopService] ========== ERROR ==========`);
      console.error(`[ShopService] Error message:`, error?.message);
      console.error(`[ShopService] Response status:`, error?.response?.status);
      console.error(`[ShopService] Response data:`, error?.response?.data);
      console.error(
        `[ShopService] Response headers:`,
        error?.response?.headers,
      );
      console.error(`[ShopService] Request headers:`, error?.config?.headers);
      console.error(`[ShopService] ======================================`);
      throw error;
    }
  },
};

// Items Service
export const itemsService = {
  // GET /shop/classes/:classId/purchase - GetItem
  async getItem(classId: string | number): Promise<any> {
    const id = encodeURIComponent(String(classId));
    console.log(`[ItemsService] GET /shop/classes/${id}/purchase`);
    const response = await apiClient.get<any>(`/shop/classes/${id}/purchase`);
    console.log(`[ItemsService] Response:`, response.data);
    return response.data;
  },
};

// Inventory Service
export const inventoryService = {
  // GET /inventory/classes/:classId - GetOwnItemsInClass
  async getOwnItemsInClass(classId: string | number): Promise<any> {
    const id = encodeURIComponent(String(classId));
    console.log(`[InventoryService] GET /inventory/classes/${id}`);
    const response = await apiClient.get<any>(`/inventory/classes/${id}`);
    console.log(`[InventoryService] Response:`, response.data);
    return response.data;
  },
};

// Pets Service
export interface CreatePetRequest {
  name: string;
  type: string; // e.g., "DOG"
}

export const petsService = {
  // GET /pets/classes/:classId - GetAllPetsFromClass
  async getAllPetsFromClass(classId: string | number): Promise<any> {
    const id = encodeURIComponent(String(classId));
    console.log(`[PetsService] GET /pets/classes/${id}`);
    const response = await apiClient.get<any>(`/pets/classes/${id}`);
    console.log(`[PetsService] Response:`, response.data);
    return response.data;
  },

  // GET /pets/:petId - GetPet
  async getPet(petId: string | number): Promise<any> {
    const id = encodeURIComponent(String(petId));
    console.log(`[PetsService] GET /pets/${id}`);
    const response = await apiClient.get<any>(`/pets/${id}`);
    console.log(`[PetsService] Response:`, response.data);
    return response.data;
  },

  // GET /pets/classes/:classId/me - GetOwnPet
  async getOwnPet(classId: string | number): Promise<any> {
    const id = encodeURIComponent(String(classId));
    console.log(`[PetsService] GET /pets/classes/${id}/me`);
    const response = await apiClient.get<any>(`/pets/classes/${id}/me`);
    console.log(`[PetsService] Response:`, response.data);
    return response.data;
  },

  // GET /pets/me - GetOwnPets
  async getOwnPets(): Promise<any> {
    console.log(`[PetsService] GET /pets/me`);
    const response = await apiClient.get<any>("/pets/me");
    console.log(`[PetsService] Response:`, response.data);
    return response.data;
  },

  // POST /pets/classes/:classId - CreatePet
  async createPet(
    classId: string | number,
    petData: CreatePetRequest,
  ): Promise<any> {
    const id = encodeURIComponent(String(classId));
    console.log(`[PetsService] POST /pets/classes/${id}`, petData);
    const response = await apiClient.post<any>(`/pets/classes/${id}`, petData);
    console.log(`[PetsService] Response:`, response.data);
    return response.data;
  },

  // PATCH /pets/:petId/equip - EquipItem
  async equipItem(petId: string | number, itemData?: any): Promise<any> {
    const id = encodeURIComponent(String(petId));
    console.log(`[PetsService] PATCH /pets/${id}/equip`, itemData);
    const response = await apiClient.patch<any>(
      `/pets/${id}/equip`,
      itemData || {},
    );
    console.log(`[PetsService] Response:`, response.data);
    return response.data;
  },

  // PATCH /pets/:petId/feed - FeedPet
  async feedPet(petId: string | number, itemId: number): Promise<any> {
    const id = encodeURIComponent(String(petId));
    const requestBody = { itemId };
    console.log(`[PetsService] PATCH /pets/${id}/feed`, requestBody);
    const response = await apiClient.patch<any>(
      `/pets/${id}/feed`,
      requestBody,
    );
    console.log(`[PetsService] Response:`, response.data);
    return response.data;
  },

  // PATCH /pets/:petId/unequip - UnequipItem
  async unequipItem(petId: string | number, slotType: string): Promise<any> {
    const id = encodeURIComponent(String(petId));
    const requestBody = { slotType };
    console.log(`[PetsService] PATCH /pets/${id}/unequip`, requestBody);
    const response = await apiClient.patch<any>(
      `/pets/${id}/unequip`,
      requestBody,
    );
    console.log(`[PetsService] Response:`, response.data);
    return response.data;
  },
};

export default apiClient;
