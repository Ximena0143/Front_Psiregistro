/**
 * Servicio para gestionar las operaciones CRUD de pacientes
 */
import api from './api';

/**
 * Obtiene la lista de todos los pacientes
 * @param {number} perPage - Número de elementos por página
 * @param {number} page - Número de página
 * @returns {Promise} - Promesa con la lista de pacientes
 */
export const getPatients = async (perPage = 10, page = 1) => {
  try {
    const response = await api.get(`/patient/index?per_page=${perPage}&page=${page}`);
    
    // Verificar la estructura de la respuesta
    if (!response.data) {
      console.warn('La respuesta no contiene datos');
      return [];
    }
    
    // Manejar la nueva estructura de respuesta
    if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } 
    // Mantener compatibilidad con la estructura anterior
    else if (Array.isArray(response.data)) {
      return response.data;
    } 
    else if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } 
    else {
      console.warn('Estructura de respuesta no reconocida:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    throw new Error(error.message);
  }
};

/**
 * Obtiene la lista de pacientes eliminados (soft deleted)
 * @param {number} perPage - Número de elementos por página
 * @param {number} page - Número de página
 * @returns {Promise} - Promesa con la lista de pacientes eliminados
 */
export const getDeletedPatients = async (perPage = 10, page = 1) => {
  try {
    const response = await api.get(`/patient/deleted-index?per_page=${perPage}&page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener pacientes eliminados:', error);
    throw new Error(error.message);
  }
};

/**
 * Registra un nuevo paciente
 * @param {Object} patientData - Datos del paciente a registrar
 * @returns {Promise} - Promesa con los datos del paciente registrado
 */
export const registerPatient = async (patientData) => {
  try {
    const response = await api.post('/patient/register', patientData);
    return response.data;
  } catch (error) {
    console.error('Error al registrar paciente:', error);
    throw new Error(error.message);
  }
};

/**
 * Actualiza los datos de un paciente existente
 * @param {number} id - ID del paciente a actualizar
 * @param {Object} patientData - Nuevos datos del paciente
 * @returns {Promise} - Promesa con los datos del paciente actualizado
 */
export const updatePatient = async (id, patientData) => {
  try {
    const response = await api.put(`/patient/update/${id}`, patientData);
    
    if (!response.data) {
      throw new Error('La respuesta no contiene datos');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    
    // Extraer mensaje de error para mostrar al usuario
    let errorMessage = 'Error al actualizar paciente';
    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || errorMessage;
      console.error('Mensaje de error del servidor:', errorMessage);
    }
    
    const err = new Error(errorMessage);
    err.originalError = error;
    throw err;
  }
};

/**
 * Elimina un paciente (soft delete)
 * @param {number} id - ID del paciente a eliminar
 * @returns {Promise} - Promesa con el resultado de la operación
 */
export const deletePatient = async (id) => {
  try {
    const response = await api.del(`/patient/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    throw new Error(error.message);
  }
};

/**
 * Restaura un paciente eliminado
 * @param {number} id - ID del paciente a restaurar
 * @returns {Promise} - Promesa con los datos del paciente restaurado
 */
export const restorePatient = async (id) => {
  try {
    const response = await api.patch(`/patient/restore/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al restaurar paciente:', error);
    throw new Error(error.message);
  }
};

/**
 * Elimina permanentemente un paciente
 * @param {number} id - ID del paciente a eliminar permanentemente
 * @returns {Promise} - Promesa con el resultado de la operación
 */
export const forceDeletePatient = async (id) => {
  try {
    const response = await api.del(`/patient/force-delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar permanentemente el paciente:', error);
    throw new Error(error.message);
  }
};

/**
 * Obtiene la lista de tipos de identificación disponibles
 * @returns {Promise} - Promesa con la lista de tipos de identificación
 */
export const getIdentificationTypes = async () => {
  try {
    const response = await api.get('/identification-type/index');
    console.log('Respuesta de tipos de identificación:', response);
    
    // Manejar diferentes estructuras de respuesta posibles
    if (response && response.data && Array.isArray(response.data)) {
      // Si la respuesta ya es un array
      return response.data;
    } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
      // Si la respuesta tiene el formato { message, error, data: [...] }
      return response.data.data;
    } else if (response && Array.isArray(response)) {
      // Si la respuesta es directamente un array
      return response;
    } else {
      console.warn('Estructura de respuesta no reconocida para tipos de identificación:', response);
      return [];
    }
  } catch (error) {
    console.error('Error al obtener tipos de identificación:', error);
    throw new Error(error.message);
  }
};

/**
 * Obtiene un paciente específico por su ID
 * @param {number} id - ID del paciente a obtener
 * @returns {Promise} - Promesa con los datos del paciente
 */
export const getPatientById = async (id) => {
  try {
    // Como no hay un endpoint específico para obtener un paciente por ID,
    // obtenemos todos los pacientes y filtramos por ID
    const response = await api.get('/patient/index');
    
    if (!response.data) {
      throw new Error('No se recibieron datos de la API');
    }
    
    // Extraer la lista de pacientes de la respuesta
    let patients = [];
    if (response.data.data) {
      // Si la respuesta tiene formato de paginación
      patients = response.data.data;
    } else if (Array.isArray(response.data)) {
      // Si la respuesta es un array directo
      patients = response.data;
    } else {
      throw new Error('Formato de respuesta no reconocido');
    }
    
    // Buscar el paciente con el ID especificado
    const patient = patients.find(p => String(p.id) === String(id));
    
    if (!patient) {
      throw new Error(`No se encontró ningún paciente con ID ${id}`);
    }
    
    
    // Construir el objeto de respuesta con la misma estructura que esperaría
    // si viniera de un endpoint específico
    return {
      patient: patient,
      human: patient.human || null
    };
  } catch (error) {
    console.error('Error al obtener paciente por ID:', error);
    throw new Error(error.message);
  }
};

/**
 * Obtiene los documentos de un paciente específico
 * @param {number} patientId - ID del paciente
 * @returns {Promise} - Promesa con los documentos del paciente
 */
export const getPatientDocuments = async (patientId) => {
  try {
    // Usar la ruta correcta del backend (sin duplicar /api/ ya que está en la URL base)
    const response = await api.get(`/document/gdbpi/${patientId}`);
    
    // Verificar la estructura de la respuesta
    if (!response || !response.data) {
      console.warn('La respuesta no contiene datos');
      return [];
    }
    
    // La respuesta tiene la estructura { message, error, data: [...documentos] }
    if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      // Si data es un objeto con los documentos dentro
      return response.data && response.data.data ? response.data.data : [];
    }
  } catch (error) {
    console.error('Error al obtener documentos del paciente:', error);
    // Si es un error 404 (documentos no encontrados), devolver array vacío
    const is404 = (error.status === 404) || (error.response && error.response.status === 404);
    const isNotFoundMsg = error.message && error.message.toLowerCase().includes('documents not found');
    if (is404 || isNotFoundMsg) {
      console.warn('No se encontraron documentos para el paciente con ID:', patientId);
      return [];
    }
    throw new Error(error.message);
  }
};

/**
 * Sube un documento para un paciente específico
 * @param {number} patientId - ID del paciente
 * @param {File} document - Archivo a subir
 * @param {string} title - Título del documento
 * @param {string} documentType - Tipo de documento (authorization, test, medical_history)
 * @param {number} statusId - Estado del documento (1: finalized, 2: under review, 3: pending, 4: archived)
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const uploadPatientDocument = async (patientId, document, title, documentType, statusId) => {
  try {
    // Crear un objeto FormData para enviar el archivo y los datos
    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('tittle', title); // Nota: el backend usa 'tittle' en lugar de 'title'
    formData.append('document_type', documentType);
    formData.append('status_id', statusId);
    formData.append('document', document);
    
    // No es necesario especificar Content-Type para FormData
    const options = {};
    
    // Realizar la petición POST
    const response = await api.post('/document/upload', formData, options);
    
    return response.data;
  } catch (error) {
    console.error('Error al subir documento del paciente:', error);
    throw new Error(error.message);
  }
};

/**
 * Elimina un documento por su ID
 * @param {number} documentId - ID del documento a eliminar
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const deletePatientDocument = async (documentId) => {
  try {
    const response = await api.del(`/document/delete/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    throw new Error(error.message);
  }
};

/**
 * Actualiza un documento existente de un paciente
 * @param {number} documentId - ID del documento a actualizar
 * @param {number} patientId - ID del paciente
 * @param {string} title - Título actualizado del documento
 * @param {string} documentType - Tipo de documento (authorization, test, medical_history)
 * @param {number} statusId - Estado del documento (1: finalized, 2: under review, 3: pending, 4: archived)
 * @param {File} document - Archivo nuevo (opcional)
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const updatePatientDocument = async (documentId, patientId, title, documentType, statusId, document = null) => {
  try {
    // Crear un objeto FormData para enviar el archivo y los datos
    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('tittle', title); // Nota: el backend usa 'tittle' en lugar de 'title'
    formData.append('document_type', documentType);
    formData.append('status_id', statusId);
    
    // Solo agregar el archivo si se proporciona uno nuevo
    if (document) {
      formData.append('document', document);
    }
    
    // Realizar la petición PUT
    const response = await api.put(`/document/update/${documentId}`, formData, {
      headers: {
        // No es necesario establecer Content-Type para FormData, el navegador lo configura automáticamente
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al actualizar documento del paciente:', error);
    throw new Error(error.message);
  }
};

// Exportar todas las funciones como un objeto para facilitar su importación
const patientService = {
  getPatients,
  getDeletedPatients,
  registerPatient,
  updatePatient,
  deletePatient,
  restorePatient,
  forceDeletePatient,
  getIdentificationTypes,
  getPatientById,
  getPatientDocuments,
  uploadPatientDocument,
  deletePatientDocument,
  updatePatientDocument
};

export default patientService;
