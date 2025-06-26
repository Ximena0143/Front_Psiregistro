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
    console.log(`Llamando a API: /patient/index?per_page=${perPage}&page=${page}`);
    const response = await api.get(`/patient/index?per_page=${perPage}&page=${page}`);
    console.log('Respuesta completa de API getPatients:', response);
    
    // Verificar la estructura de la respuesta
    if (!response.data) {
      console.warn('La respuesta no contiene datos');
      return [];
    }
    
    // Manejar la nueva estructura de respuesta
    if (response.data.data && Array.isArray(response.data.data)) {
      console.log('Usando nueva estructura de respuesta con datos y paginación');
      return response.data.data;
    } 
    // Mantener compatibilidad con la estructura anterior
    else if (Array.isArray(response.data)) {
      console.log('Usando estructura de respuesta antigua (array directo)');
      return response.data;
    } 
    else if (response.data.data && Array.isArray(response.data.data)) {
      console.log('Usando estructura de respuesta con data anidado');
      return response.data.data;
    } 
    else {
      console.warn('Estructura de respuesta no reconocida:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    throw error;
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
    const response = await api.get(`/patient/deleted?per_page=${perPage}&page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener pacientes eliminados:', error);
    throw error;
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
    throw error;
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
    console.log(`Enviando actualización para paciente ID: ${id}`, patientData);
    const response = await api.put(`/patient/update/${id}`, patientData);
    console.log('Respuesta completa de updatePatient:', response);
    
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
    
    throw {
      message: errorMessage,
      originalError: error
    };
  }
};

/**
 * Elimina un paciente (soft delete)
 * @param {number} id - ID del paciente a eliminar
 * @returns {Promise} - Promesa con el resultado de la operación
 */
export const deletePatient = async (id) => {
  try {
    const response = await api.delete(`/patient/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    throw error;
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
    throw error;
  }
};

/**
 * Elimina permanentemente un paciente
 * @param {number} id - ID del paciente a eliminar permanentemente
 * @returns {Promise} - Promesa con el resultado de la operación
 */
export const forceDeletePatient = async (id) => {
  try {
    const response = await api.delete(`/patient/force-delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar permanentemente el paciente:', error);
    throw error;
  }
};

/**
 * Obtiene la lista de tipos de identificación disponibles
 * @returns {Promise} - Promesa con la lista de tipos de identificación
 */
export const getIdentificationTypes = async () => {
  try {
    const response = await api.get('/identification-types');
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos de identificación:', error);
    // Si no existe el endpoint, devolvemos los tipos de identificación hardcodeados
    return {
      data: [
        { id: 1, name: 'Cedula de ciudadania' },
        { id: 2, name: 'Registro civil' },
        { id: 3, name: 'Tarjeta de identidad' },
        { id: 4, name: 'Cedula extranjera' },
        { id: 5, name: 'NUIP' },
        { id: 6, name: 'Pasaporte' },
        { id: 7, name: 'Adulto sin identificar' },
        { id: 8, name: 'Menor sin identificar' },
        { id: 9, name: 'Permiso especial de permanencia' },
        { id: 10, name: 'Certificado nacido vivo' },
        { id: 11, name: 'Salvo conducto Asilado o Refugiado' },
        { id: 12, name: 'Tarjeta Extranjeria' },
        { id: 13, name: 'Carnet Diplomatico' },
        { id: 14, name: 'Permiso por Protección Temporal' }
      ]
    };
  }
};

/**
 * Obtiene un paciente específico por su ID
 * @param {number} id - ID del paciente a obtener
 * @returns {Promise} - Promesa con los datos del paciente
 */
export const getPatientById = async (id) => {
  try {
    console.log(`Buscando paciente con ID: ${id}`);
    
    // Como no hay un endpoint específico para obtener un paciente por ID,
    // obtenemos todos los pacientes y filtramos por ID
    const response = await api.get('/patient/index');
    console.log('Respuesta de getPatients:', response);
    
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
    
    console.log('Paciente encontrado:', patient);
    
    // Construir el objeto de respuesta con la misma estructura que esperaría
    // si viniera de un endpoint específico
    return {
      patient: patient,
      human: patient.human || null
    };
  } catch (error) {
    console.error('Error al obtener paciente por ID:', error);
    throw error;
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
  getPatientById
};

export default patientService;
