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
        userData = { 
          ...userData, 
          id: response.user.id,
          roles: response.user.roles || [] // Guardar los roles del usuario
        };
      } else if (response.data && response.data.user) {
        userData = { 
          ...userData, 
          id: response.data.user.id,
          roles: response.data.user.roles || [] // Guardar los roles del usuario
        };
      }
    }
    
    // Si tenemos un token, lo guardamos y creamos la información básica del usuario
    if (token) {
      console.log('Token obtenido correctamente');
      
      // Guardar el token en localStorage
      localStorage.setItem(TOKEN_KEY, token);
      
      // Intentar extraer información de roles del token JWT (si es posible)
      try {
        // Decodificar el payload del JWT (la parte central del token)
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('Payload del token JWT:', payload);
          
          // Si hay información de roles en el payload, la usamos
          if (payload && payload.role) {
            userData.roles = payload.role;
            console.log('Roles extraídos del token JWT:', userData.roles);
          }
        }
      } catch (e) {
        console.warn('No se pudieron extraer roles del token JWT:', e);
      }
      
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
 * Verifica si el usuario actual tiene un rol específico
 * @param {string} roleName - Nombre del rol a verificar
 * @returns {boolean} - true si el usuario tiene el rol, false en caso contrario
 */
export const hasRole = (roleName) => {
  const user = getCurrentUser();
  if (!user || !user.roles) return false;
  
  console.log('Verificando rol:', roleName, 'en roles del usuario:', user.roles);
  
  // Verificar si el usuario tiene el rol especificado
  return user.roles.some(role => 
    typeof role === 'string' 
      ? role.toLowerCase() === roleName.toLowerCase() 
      : ((role.role && role.role.toLowerCase() === roleName.toLowerCase()) || 
         (role.name && role.name.toLowerCase() === roleName.toLowerCase()))
  );
};

/**
 * Verifica si el usuario actual es administrador
 * @returns {boolean} - true si el usuario es admin, false en caso contrario
 */
export const isAdmin = () => {
  const result = hasRole('admin');
  console.log('¿Es administrador?', result);
  return result;
};

/**
 * Verifica si el usuario actual es doctor
 * @returns {boolean} - true si el usuario es doctor, false en caso contrario
 */
export const isDoctor = () => {
  const result = hasRole('doctor');
  console.log('¿Es doctor?', result);
  return result;
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
  refreshToken,
  hasRole,
  isAdmin,
  isDoctor
};

export default authService;
