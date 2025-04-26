/**
 * Archivo de servicios para consumir las APIs del backend
 */

// URL base para todas las peticiones API
const API_BASE_URL = 'http://localhost:8000/api';

// Interceptores para modificar las peticiones y respuestas
const interceptors = {
  request: null,
  response: null
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
      throw error;
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
    console.error('Error en petición GET:', error);
    throw error;
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
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        ...options.headers
      },
      body: JSON.stringify(data),
      ...options
    };
    
    // Debug de la petición que estamos a punto de hacer
    console.log(`Iniciando petición POST a ${API_BASE_URL}${endpoint}`, {
      headers: config.headers,
      data: data
    });
    
    // Aplicar interceptor si existe
    if (interceptors.request) {
      config = interceptors.request(config);
    }

    // Realizar la petición
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Debug de la respuesta recibida
    console.log(`Respuesta recibida de ${endpoint}:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers]),
      ok: response.ok
    });
    
    // Si la respuesta no es exitosa
    if (!response.ok) {
      // Intentar leer el cuerpo de la respuesta de error
      let errorText, errorData;
      
      try {
        // Primero intentamos obtener el texto de la respuesta
        errorText = await response.text();
        console.log('Texto de error:', errorText);
        
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
        console.error('Error al leer la respuesta de error:', readError);
      }
      
      // Crear un error personalizado con toda la información disponible
      const error = new Error(errorData.message || `Error HTTP: ${response.status}`);
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = errorData;
      error.url = `${API_BASE_URL}${endpoint}`;
      throw error;
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
    
    console.log('Datos de respuesta procesados:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error en petición POST:', error);
    throw error;
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
      throw error;
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
    console.error('Error en petición PUT:', error);
    throw error;
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
    // Aplicar interceptor de petición si existe
    let config = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
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
      throw error;
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
    console.error('Error en petición DELETE:', error);
    throw error;
  }
};

// Exportamos un objeto con todas las funciones para facilitar su uso
const apiService = {
  get,
  post,
  put,
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

export default apiService;
