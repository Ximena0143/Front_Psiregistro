/**
 * Servicio para gestionar las plantillas de test psicológicos
 */
import api from './api';
import { getToken } from './auth';

/**
 * Obtiene todas las plantillas del usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise} - Lista de plantillas
 */
export const getBlanksByUser = async (userId) => {
  try {
    const response = await api.get(`/blank/gbbui/${userId}`);
    
    // Manejar diferentes estructuras de respuesta posibles
    let blanksData = [];
    
    if (response.data) {
      
      if (Array.isArray(response.data)) {
        blanksData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        blanksData = response.data.data;
      } else {
        // Intentar extraer los datos en otro formato
        const dataKeys = Object.keys(response.data);
        if (dataKeys.length > 0 && Array.isArray(response.data[dataKeys[0]])) {
          blanksData = response.data[dataKeys[0]];
        }
      }
    }
    
    return blanksData;
  } catch (error) {
    console.error('Error fetching blanks:', error);
    throw new Error(error.message);
  }
};

/**
 * Sube una nueva plantilla
 * @param {Object} data - Datos de la plantilla
 * @param {File} file - Archivo de la plantilla
 * @returns {Promise} - Respuesta de la creación
 */
export const uploadBlank = async (data, file) => {
  try {
    // Crear un FormData para enviar el archivo
    const formData = new FormData();
    
    // IMPORTANTE: El backend espera 'file' como nombre del campo para el archivo
    formData.append('file', file);
    
    // Añadir el título del documento
    if (data.name) {
      formData.append('tittle', data.name);
    }
    
    // Hacer la petición sin especificar 'Content-Type' en los headers
    // Permitir que el navegador configure el boundary correcto del multipart/form-data
    const response = await api.post('/blank/upload', formData, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    // Verificar el tipo de respuesta y estructurar adecuadamente
    let processedResponse = {};
    
    // Si hay una propiedad data, la usamos
    if (response.data) {
      processedResponse.data = response.data;
    }
    
    // Si la respuesta en sí misma es el objeto esperado
    if (typeof response === 'object' && !processedResponse.data) {
      processedResponse.data = response;
    }
    
    // Si hay una propiedad dentro de data donde están los datos reales
    if (response.data && response.data.data) {
      processedResponse.data = response.data.data;
    }
    
    // Intentar encontrar los datos relevantes en la respuesta
    if (processedResponse.data) {
      if (!processedResponse.data.id && response.data && response.data.id) {
        processedResponse.data.id = response.data.id;
      }
      
      if (!processedResponse.data.tittle && response.data && response.data.tittle) {
        processedResponse.data.tittle = response.data.tittle;
      }
    }
    
    return processedResponse;
  } catch (error) {
    console.error('Error uploading blank:', error);
    console.error('Error details:', error.message);
    
    // Si hay información en error.response, mostrarla
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    }
    
    throw new Error(error.message);
  }
};

/**
 * Obtiene la URL de descarga de una plantilla
 * @param {number} id - ID de la plantilla
 * @returns {Promise} - URL de descarga
 */
export const downloadBlank = async (id) => {
  try {
    const response = await api.get(`/blank/download/${id}`);
    return response.data?.data?.URL || null;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Elimina una plantilla
 * @param {number} id - ID de la plantilla
 * @returns {Promise} - Respuesta de la eliminación
 */
export const deleteBlank = async (id) => {
  try {
    const response = await api.del(`/blank/delete/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const blankService = {
  getBlanksByUser,
  uploadBlank,
  downloadBlank,
  deleteBlank
};

export default blankService;
