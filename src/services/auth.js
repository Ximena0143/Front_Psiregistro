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
    // Hacer la petición al backend
    const response = await api.post('/auth/login', credentials);
    
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
          first_name: response.user.first_name || response.user.firstName || response.user.nombre || 
                     (response.user.human && response.user.human.first_name),
          last_name: response.user.last_name || response.user.lastName || response.user.apellido || 
                    (response.user.human && response.user.human.last_name),
          name: response.user.name || response.user.nombre_completo || response.user.nombreCompleto,
          roles: response.user.roles || [] // Guardar los roles del usuario
        };
      } else if (response.data && response.data.user) {
        userData = { 
          ...userData, 
          id: response.data.user.id,
          first_name: response.data.user.first_name || response.data.user.firstName || response.data.user.nombre || 
                     (response.data.user.human && response.data.user.human.first_name),
          last_name: response.data.user.last_name || response.data.user.lastName || response.data.user.apellido || 
                    (response.data.user.human && response.data.user.human.last_name),
          name: response.data.user.name || response.data.user.nombre_completo || response.data.user.nombreCompleto,
          roles: response.data.user.roles || [] // Guardar los roles del usuario
        };
      } else if (response.data && response.data.data) {
        // Estructura específica donde los datos están en response.data.data
        const userDataSource = response.data.data;
        userData = { 
          ...userData, 
          id: userDataSource.id,
          first_name: userDataSource.first_name || userDataSource.firstName || userDataSource.nombre || 
                     (userDataSource.human && userDataSource.human.first_name),
          last_name: userDataSource.last_name || userDataSource.lastName || userDataSource.apellido || 
                    (userDataSource.human && userDataSource.human.last_name),
          name: userDataSource.name || userDataSource.nombre_completo || userDataSource.nombreCompleto,
          email: userDataSource.email,
          roles: userDataSource.roles || [] 
        };
      } else if ((response.userData) || (response.data && response.data.userData)) {
        // Algunos backends pueden devolver los datos del usuario en un campo userData
        const userDataSource = (response.userData) || (response.data && response.data.userData);
        userData = { 
          ...userData, 
          id: userDataSource.id,
          first_name: userDataSource.first_name || userDataSource.firstName || userDataSource.nombre || 
                     (userDataSource.human && userDataSource.human.first_name),
          last_name: userDataSource.last_name || userDataSource.lastName || userDataSource.apellido || 
                    (userDataSource.human && userDataSource.human.last_name),
          name: userDataSource.name || userDataSource.nombre_completo || userDataSource.nombreCompleto,
          roles: userDataSource.roles || [] 
        };
      }
    }
    
    // Si tenemos un token, lo guardamos y creamos la información básica del usuario
    if (token) {
      // Guardar el token en localStorage
      localStorage.setItem(TOKEN_KEY, token);
      
      // Intentar extraer información de roles del token JWT (si es posible)
      try {
        // Decodificar el payload del JWT (la parte central del token)
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          
          // Si hay información de roles en el payload, la usamos
          if (payload && payload.role) {
            userData.roles = payload.role;
          }
        }
      } catch (e) {
        // Error al decodificar el token, continuamos sin extraer roles
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
    // Propagar el error para que el componente Login pueda manejarlo
    throw new Error(error.message);
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
    // Error al cerrar sesión en el servidor, continuamos con la limpieza local
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
  return hasRole('admin');
};

/**
 * Verifica si el usuario actual es doctor
 * @returns {boolean} - true si el usuario es doctor, false en caso contrario
 */
export const isDoctor = () => {
  return hasRole('doctor');
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
    // Si hay un error al refrescar, cerramos la sesión
    logout();
    throw new Error(error.message);
  }
};

/**
 * Obtiene los datos actualizados del usuario desde el backend
 * @returns {Promise} - Datos actualizados del usuario
 */
export const me = async () => {
  try {
    // Usar POST en lugar de GET para la ruta /auth/me
    const response = await api.post('/auth/me');
    
    let userData = null;
    
    // Manejar la estructura anidada donde los datos están en response.data.data
    if (response && response.data && response.data.data) {
      const userDataSource = response.data.data;
      
      // Extraer datos básicos
      userData = {
        id: userDataSource.id,
        email: userDataSource.email,
        profile_description: userDataSource.profile_description,
        profile_photo_path: userDataSource.profile_photo_path
      };
      
      // Extraer first_name y last_name del objeto human si existe
      if (userDataSource.human) {
        userData.first_name = userDataSource.human.first_name;
        userData.last_name = userDataSource.human.last_name;
      }
      
      // Extraer roles si existen
      if (userDataSource.roles && Array.isArray(userDataSource.roles)) {
        userData.roles = userDataSource.roles.map(role => role.role || role);
      }
      
      // Actualizar los datos en localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      return userData;
    } else if (response && response.data) {
      // Intentar extraer datos directamente de response.data si no hay estructura anidada
      const userDataSource = response.data;
      
      userData = {
        ...userDataSource
      };
      
      // Extraer first_name y last_name del objeto human si existe
      if (userData.human) {
        userData.first_name = userData.human.first_name;
        userData.last_name = userData.human.last_name;
      }
      
      // Actualizar los datos en localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      return userData;
    } else {
      throw new Error('Formato de respuesta inesperado en /auth/me');
    }
  } catch (error) {
    throw new Error(error.message);
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

/**
 * Envía solicitud para recuperar contraseña
 * @param {Object} data - Contiene el email del usuario
 * @returns {Promise} - Resultado de la solicitud
 */
export const forgotPassword = async (data) => {
  try {
    const response = await api.post('/password/forget', data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Resetea la contraseña del usuario usando el token
 * @param {Object} data - Contiene email, token, password y password_confirmation
 * @returns {Promise} - Resultado de la solicitud
 */
export const resetPassword = async (data) => {
  try {
    const response = await api.post('/password/reset', data);
    return response;
  } catch (error) {
    throw error;
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
  isDoctor,
  me,
  forgotPassword,
  resetPassword
};

export default authService;
