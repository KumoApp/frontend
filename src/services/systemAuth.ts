import { authService, shopService, CreateShopItemRequest } from "./api";

// Credenciales del sistema desde variables de entorno o constantes
export const SYSTEM_CREDENTIALS = {
  email: "system@kumoapp.com",
  username: "system",
  password: "shupa",
};

/**
 * Autentica con el usuario del sistema y retorna el token
 */
export async function getSystemToken(): Promise<string> {
  try {
    console.log("[SystemAuth] Autenticando con usuario del sistema...");

    // Intentar con email
    let response = await authService.login({
      email: SYSTEM_CREDENTIALS.email,
      password: SYSTEM_CREDENTIALS.password,
    });

    if (response?.body?.token) {
      console.log("[SystemAuth] Autenticación exitosa con email");
      return response.body.token;
    }

    // Si no funciona con email, intentar con username
    response = await authService.login({
      email: SYSTEM_CREDENTIALS.username, // El backend podría aceptar username en el campo email
      password: SYSTEM_CREDENTIALS.password,
    });

    if (response?.body?.token) {
      console.log("[SystemAuth] Autenticación exitosa con username");
      return response.body.token;
    }

    throw new Error("No se pudo obtener el token del sistema");
  } catch (error: any) {
    console.error("[SystemAuth] Error al autenticar con sistema:", error);
    throw new Error(
      "Error al autenticar con el usuario del sistema: " +
        (error.message || "Error desconocido"),
    );
  }
}

/**
 * Crea un item en la tienda usando autenticación del sistema
 */
export async function createShopItemAsSystem(
  itemData: CreateShopItemRequest,
): Promise<any> {
  try {
    console.log("[SystemAuth] Creando item de tienda como sistema:", itemData);

    // Obtener token del sistema
    const systemToken = await getSystemToken();

    // Crear el item
    const response = await shopService.createShopItem(itemData, systemToken);

    console.log("[SystemAuth] Item creado exitosamente:", response);
    return response;
  } catch (error: any) {
    console.error("[SystemAuth] Error al crear item:", error);
    throw error;
  }
}

/**
 * Ejecuta una función con autenticación del sistema y luego restaura el token del usuario
 */
export async function withSystemAuth<T>(
  callback: (systemToken: string) => Promise<T>,
): Promise<T> {
  // Guardar el token actual del usuario
  const userToken = localStorage.getItem("auth_token");

  try {
    // Obtener token del sistema
    const systemToken = await getSystemToken();

    // Ejecutar la función callback
    const result = await callback(systemToken);

    return result;
  } finally {
    // Restaurar el token del usuario
    if (userToken) {
      localStorage.setItem("auth_token", userToken);
    }
  }
}
