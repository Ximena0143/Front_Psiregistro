/**
 * Servicio para gestionar la autenticación de usuarios
 */
import api from './api';

// Nombre de la clave para almacenar el token en localStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Realiza el inicio de sesión del usuario
 * @param {Object} credentials - Credenciales del usuario (email, password)
 * @returns {Promise} - Datos del usuario autenticado y token
 */
export const login = async (credentials) => {
  try {
    // Imprimir para depuración lo que estamos enviando al backend
    console.log('Enviando credenciales al backend:', {
      endpoint: '/auth/login',
      credentials: { ...credentials, password: '****' } // No mostrar la contraseña real
    });
    
    // Hacer la petición al backend
    const response = await api.post('/auth/login', credentials);
    
    // Registrar la respuesta para depuración
    console.log('Respuesta del backend:', response);
    
    // Extraer el token JWT de la respuesta dependiendo de su formato
    let token = null;
    let userData = { email: credentials.email };
    
    // Caso 1: La respuesta es directamente el token como string
    if (typeof response === 'string') {
      token = response;
    }
    // Caso 2: La respuesta es un objeto que contiene el token
    else if (response) {
      if (response.token) {
        token = response.token;
      } else if (response.access_token) {
        token = response.access_token;
      } else if (response.data) {
        // Podría estar anidado en data
        if (typeof response.data === 'string') {
          token = response.data;
        } else if (response.data.token) {
          token = response.data.token;
        } else if (response.data.access_token) {
          token = response.data.access_token;
        }
      }
      
      // Extraer información del usuario si está disponible
      if (response.user) {
        userData = { ...userData, id: response.user.id };
      } else if (response.data && response.data.user) {
        userData = { ...userData, id: response.data.user.id };
      }
    }
    
    // Si tenemos un token, lo guardamos y creamos la información básica del usuario
    if (token) {
      console.log('Token obtenido correctamente');
      
      // Guardar el token en localStorage
      localStorage.setItem(TOKEN_KEY, token);
      
      // Guardar información del usuario
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      // Devolver un objeto con la estructura que espera el frontend
      return { 
        token: token,
        user: userData 
      };
    }
    
    // Si no encontramos un token, lanzamos un error
    throw new Error('No se pudo extraer el token de la respuesta del servidor');
  } catch (error) {
    // Mejorar el log de errores para depuración
    console.error('Error detallado en el inicio de sesión:', {
      message: error.message,
      statusCode: error.status || 'Desconocido',
      stack: error.stack,
      data: error.data
    });
    
    // Propagar el error para que el componente Login pueda manejarlo
    throw error;
  }
};

/**
 * Cierra la sesión del usuario
 * @returns {Promise} - Resultado del cierre de sesión
 */
export const logout = async () => {
  try {
    // Si existe un token, intentamos hacer logout en el servidor
    if (getToken()) {
      await api.post('/auth/logout');
    }
  } catch (error) {
    console.error('Error al cerrar sesión en el servidor:', error);
  } finally {
    // Siempre limpiamos el almacenamiento local
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Obtiene la información del usuario actual
 * @returns {Object|null} - Datos del usuario o null si no hay sesión
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Obtiene el token de autenticación
 * @returns {string|null} - Token o null si no hay sesión
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} - true si está autenticado, false en caso contrario
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Actualiza el token cuando se refresca
 * @returns {Promise} - Nuevo token
 */
export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh');
    
    if (response && response.data && response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al refrescar el token:', error);
    // Si hay un error al refrescar, cerramos la sesión
    logout();
    throw error;
  }
};

// Configuramos interceptor para añadir el token a las peticiones
api.interceptors = {
  request: (config) => {
    const token = getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    return config;
  }
};

const authService = {
  login,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated,
  refreshToken
};

export default authService;
