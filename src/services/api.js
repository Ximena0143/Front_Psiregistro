/**
 * Archivo de servicios para consumir las APIs del backend
 */

// URL base para todas las peticiones API
const API_BASE_URL = 'https://psiregistroback-hdhbacacaabud9gz.chilecentral-01.azurewebsites.net/api';
// Interceptores para modificar las peticiones y respuestas
const interceptors = {
  request: null,
  response: null
};

// Variable para controlar si ya se mostró el mensaje de sesión expirada
let sessionExpiredMessageShown = false;

// Función para manejar errores de autenticación
const handleAuthError = (error) => {
  // Si el error es 401 (Unauthorized) o 403 (Forbidden) y no hemos mostrado el mensaje aún
  // Y no estamos en una ruta pública (landing page, login, register)
  const isPublicRoute = window.location.pathname === '/' || 
                       window.location.pathname.includes('/login') || 
                       window.location.pathname.includes('/register');
  
  if ((error.status === 401 || error.status === 403) && !sessionExpiredMessageShown && !isPublicRoute) {
    // Importar SweetAlert2 dinámicamente para evitar problemas de dependencia circular
    import('sweetalert2').then((Swal) => {
      Swal.default.fire({
        title: 'Sesión expirada',
        text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        icon: 'warning',
        confirmButtonText: 'Iniciar sesión',
        allowOutsideClick: false
      }).then(() => {
        // Marcar que ya se mostró el mensaje
        sessionExpiredMessageShown = false;
        
        // Limpiar el almacenamiento local
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        
        // Redirigir a la página de login
        window.location.href = '/login';
      });
      
      // Marcar que ya mostramos el mensaje para evitar múltiples alertas
      sessionExpiredMessageShown = true;
    });
  }
  
  // Propagar el error para que pueda ser manejado por la función que hizo la petición
  throw new Error(error.message);
};

/**
 * Realiza una petición GET a la API
 * @param {string} endpoint - El endpoint a consultar (sin la URL base)
 * @param {Object} options - Opciones adicionales para la petición fetch
 * @returns {Promise} - Promesa con la respuesta en formato JSON
 */
export const get = async (endpoint, options = {}) => {
  try {
    // Aplicar interceptor de petición si existe
    let config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include',
      ...options
    };
    
    if (interceptors.request) {
      config = interceptors.request(config);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      // Intentar obtener detalles del error en formato JSON si están disponibles
      const errorData = await response.json().catch(() => ({ message: `Error HTTP: ${response.status}` }));
      
      // Crear un error personalizado con más información
      const error = new Error(errorData.message || `Error HTTP: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      
      // Manejar errores de autenticación
      handleAuthError(error);
      
      throw new Error(error.message);
    }
    
    // Manejar respuestas que podrían ser string o json
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // Podría ser un texto plano (como un token JWT)
      const text = await response.text();
      try {
        // Intentar parsearlo como JSON por si acaso
        return JSON.parse(text);
      } catch {
        // Si no es JSON, devolver el texto tal cual
        return text;
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Realiza una petición POST a la API
 * @param {string} endpoint - El endpoint a consultar (sin la URL base)
 * @param {Object} data - Datos a enviar en el cuerpo de la petición
 * @param {Object} options - Opciones adicionales para la petición fetch
 * @returns {Promise} - Promesa con la respuesta en formato JSON
 */
export const post = async (endpoint, data = {}, options = {}) => {
  try {
    // Configuración básica de la petición
    let config = {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        ...options.headers
      },
      credentials: 'include',
      ...options
    };
    
    // Manejar FormData de manera especial (no establecer Content-Type ni usar JSON.stringify)
    if (data instanceof FormData) {
      config.body = data;
      // Eliminar el Content-Type si existe para permitir que el navegador establezca el boundary correcto
      if (config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    } else {
      // Para datos normales JSON
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(data);
    }
    
    // Aplicar interceptor si existe
    if (interceptors.request) {
      config = interceptors.request(config);
    }
    
    // Realizar la petición
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Si la respuesta no es exitosa
    if (!response.ok) {
      // Intentar leer el cuerpo de la respuesta de error
      let errorText, errorData;
      
      try {
        // Primero intentamos obtener el texto de la respuesta
        errorText = await response.text();
        console.error('Error response text:', errorText);
        
        // Luego intentamos parsearlo como JSON si es posible
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          // Si no es JSON válido, usamos el texto tal cual
          errorData = { message: errorText || `Error HTTP: ${response.status}` };
        }
      } catch (readError) {
        // Si no podemos leer la respuesta, usamos un mensaje genérico
        errorData = { message: `Error HTTP: ${response.status}` };
      }
      
      // Crear un error personalizado con toda la información disponible
      const error = new Error(errorData.message || `Error HTTP: ${response.status}`);
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = errorData;
      error.url = `${API_BASE_URL}${endpoint}`;
      
      // Manejar errores de autenticación
      handleAuthError(error);
      
      throw new Error(error.message);
    }
    
    // Procesar la respuesta exitosa
    let responseData;
    const contentType = response.headers.get('content-type') || '';
    
    // Decidir cómo procesar la respuesta según su Content-Type
    if (contentType.includes('application/json')) {
      // Si es JSON, parsearlo
      responseData = await response.json();
    } else {
      // Si no es JSON (podría ser texto plano como un token JWT)
      const text = await response.text();
      
      // Aún así intentamos parsearlo como JSON por si el Content-Type es incorrecto
      try {
        responseData = JSON.parse(text);
      } catch {
        // Si no es JSON válido, devolvemos el texto tal cual
        responseData = text;
      }
    }
    
    return responseData;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Realiza una petición PUT a la API
 * @param {string} endpoint - El endpoint a consultar (sin la URL base)
 * @param {Object} data - Datos a enviar en el cuerpo de la petición
 * @param {Object} options - Opciones adicionales para la petición fetch
 * @returns {Promise} - Promesa con la respuesta en formato JSON
 */
export const put = async (endpoint, data = {}, options = {}) => {
  try {
    // Aplicar interceptor de petición si existe
    let config = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include',
      body: JSON.stringify(data),
      ...options
    };
    
    if (interceptors.request) {
      config = interceptors.request(config);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      // Intentar obtener detalles del error en formato JSON si están disponibles
      const errorData = await response.json().catch(() => ({ message: `Error HTTP: ${response.status}` }));
      
      // Crear un error personalizado con más información
      const error = new Error(errorData.message || `Error HTTP: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      
      // Manejar errores de autenticación
      handleAuthError(error);
      
      throw new Error(error.message);
    }
    
    // Manejar respuestas que podrían ser string o json
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // Podría ser un texto plano (como un token JWT)
      const text = await response.text();
      try {
        // Intentar parsearlo como JSON por si acaso
        return JSON.parse(text);
      } catch {
        // Si no es JSON, devolver el texto tal cual
        return text;
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Realiza una petición DELETE a la API
 * @param {string} endpoint - El endpoint a consultar (sin la URL base)
 * @param {Object} options - Opciones adicionales para la petición fetch
 * @returns {Promise} - Promesa con la respuesta en formato JSON
 */
export const del = async (endpoint, options = {}) => {
  try {
    let config = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include',
      ...options
    };
    
    if (interceptors.request) {
      config = interceptors.request(config);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      // Intentar obtener detalles del error en formato JSON si están disponibles
      const errorData = await response.json().catch(() => ({ message: `Error HTTP: ${response.status}` }));
      
      // Crear un error personalizado con más información
      const error = new Error(errorData.message || `Error HTTP: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      
      // Manejar errores de autenticación
      handleAuthError(error);
      
      throw new Error(error.message);
    }
    
    // Manejar respuestas que podrían ser string o json
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // Podría ser un texto plano (como un token JWT)
      const text = await response.text();
      try {
        // Intentar parsearlo como JSON por si acaso
        return JSON.parse(text);
      } catch {
        // Si no es JSON, devolver el texto tal cual
        return text;
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Realiza una petición PATCH a la API
 * Realiza una petición PATCH a la API
 * @param {string} endpoint - El endpoint a consultar (sin la URL base)
 * @param {Object} data - Datos a enviar en el cuerpo de la petición
 * @param {Object} options - Opciones adicionales para la petición fetch
 * @returns {Promise} - Promesa con la respuesta en formato JSON
 */
export const patch = async (endpoint, data = {}, options = {}) => {
  try {
    // Configuración básica de la petición
    let config = {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        ...options.headers
      },
      credentials: 'include',
      body: JSON.stringify(data),
      ...options
    };
    
    // Manejar FormData de manera especial (no establecer Content-Type ni usar JSON.stringify)
    if (data instanceof FormData) {
      console.log('Detected FormData in PATCH request, not setting Content-Type header');
      config.body = data;
      // Eliminar el Content-Type si existe para permitir que el navegador establezca el boundary correcto
      if (config.headers['Content-Type']) {
        console.log('Removing Content-Type header for FormData');
        delete config.headers['Content-Type'];
      }
    } else {
      // Para datos normales JSON
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(data);
    }
    
    if (interceptors.request) {
      config = interceptors.request(config);
    }
    
    console.log('Making PATCH request to:', `${API_BASE_URL}${endpoint}`);
    console.log('With config:', { 
      method: config.method,
      headers: config.headers,
      body: data instanceof FormData ? 'FormData object' : config.body
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      // Intentar obtener detalles del error en formato JSON si están disponibles
      const errorData = await response.json().catch(() => ({ message: `Error HTTP: ${response.status}` }));
      
      // Crear un error personalizado con más información
      const error = new Error(errorData.message || `Error HTTP: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      
      // Manejar errores de autenticación
      handleAuthError(error);
      
      throw new Error(error.message);
    }
    
    // Manejar respuestas que podrían ser string o json
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // Podría ser un texto plano (como un token JWT)
      const text = await response.text();
      try {
        // Intentar parsearlo como JSON por si acaso
        return JSON.parse(text);
      } catch {
        // Si no es JSON, devolver el texto tal cual
        return text;
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// Exportamos un objeto con todas las funciones para facilitar su uso
const apiService = {
  get,
  post,
  put,
  patch,
  del,
  BASE_URL: API_BASE_URL,
  // Agregamos la propiedad interceptors para permitir configurarlos desde otros servicios
  set interceptors(interceptorConfig) {
    interceptors.request = interceptorConfig.request || interceptors.request;
    interceptors.response = interceptorConfig.response || interceptors.response;
  },
  get interceptors() {
    return interceptors;
  }
};

// Agregar un interceptor de respuesta para detectar errores de autenticación
interceptors.response = async (response) => {
  if (!response.ok && (response.status === 401 || response.status === 403)) {
    handleAuthError(response);
  }
  return response;
};

export default apiService;
