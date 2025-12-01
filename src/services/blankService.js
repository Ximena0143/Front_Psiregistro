/**
 * Servicio para gestionar las plantillas de test psicológicos
 */
import api from './api';
import authService, { getToken } from './auth';

/**
 * Obtiene todas las plantillas del usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise} - Lista de plantillas
 */
export const getBlanksByUser = async (userId) => {
  try {
    console.log('Fetching blanks for user:', userId);
    const response = await api.get(`/blank/gbbui/${userId}`);
    console.log('Blanks response raw:', response);
    
    // Manejar diferentes estructuras de respuesta posibles
    let blanksData = [];
    
    if (response.data) {
      console.log('Response has data object');
      
      if (Array.isArray(response.data)) {
        console.log('Response.data is an array directly');
        blanksData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        console.log('Response.data.data is an array');
        blanksData = response.data.data;
      } else {
        // Intentar extraer los datos en otro formato
        const dataKeys = Object.keys(response.data);
        if (dataKeys.length > 0 && Array.isArray(response.data[dataKeys[0]])) {
          console.log(`Found array in response.data.${dataKeys[0]}`);
          blanksData = response.data[dataKeys[0]];
        }
      }
    }
    
    console.log('Processed blanks data:', blanksData);
    return blanksData;
  } catch (error) {
    console.error('Error fetching blanks:', error);
    throw error;
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
      console.log('Adding tittle to form data:', data.name);
    }
    
    // Depurar el FormData para verificar el contenido
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[0] === 'file' ? 'File object' : pair[1]));
    }
    
    // Hacer la petición sin especificar 'Content-Type' en los headers
    // Permitir que el navegador configure el boundary correcto del multipart/form-data
    console.log('Enviando solicitud al backend para crear plantilla');
    const response = await api.post('/blank/upload', formData, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    // Depuración detallada de la respuesta
    console.log('Upload response status:', response.status);
    console.log('Upload response headers:', response.headers);
    console.log('Upload response full:', response);
    
    // Verificar el tipo de respuesta y estructurar adecuadamente
    let processedResponse = {};
    
    // Si hay una propiedad data, la usamos
    if (response.data) {
      processedResponse.data = response.data;
      console.log('Found response.data:', response.data);
    }
    
    // Si la respuesta en sí misma es el objeto esperado
    if (typeof response === 'object' && !processedResponse.data) {
      processedResponse.data = response;
      console.log('Using response as data:', response);
    }
    
    // Si hay una propiedad dentro de data donde están los datos reales
    if (response.data && response.data.data) {
      processedResponse.data = response.data.data;
      console.log('Found nested data in response.data.data:', response.data.data);
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
    
    console.log('Processed response:', processedResponse);
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
    
    throw error;
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
    throw error;
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
    throw error;
  }
};

/**
 * Envía una plantilla a los correos electrónicos especificados
 * @param {number} blankId - ID de la plantilla
 * @param {Array<string>} emails - Lista de correos electrónicos
 * @param {string} message - Mensaje para incluir en el correo (opcional)
 * @returns {Promise} - Respuesta del envío
 */
export const sendBlank = async (blankId, emails, message = '') => {
  try {
    console.log('Sending blank to emails:', emails);
    
    const requestData = {
      blank_id: blankId,
      emails: emails
    };
    
    // Si hay un mensaje, lo incluimos en la solicitud
    if (message && message.trim() !== '') {
      requestData.message = message;
    }
    
    const response = await api.post('/blank/send-blank', requestData, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    console.log('Send blank response:', response);
    return response;
  } catch (error) {
    console.error('Error sending blank:', error);
    throw error;
  }
};

const blankService = {
  getBlanksByUser,
  uploadBlank,
  downloadBlank,
  deleteBlank,
  sendBlank
};

export default blankService;
