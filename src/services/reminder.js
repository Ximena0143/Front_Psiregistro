/**
 * Servicio para gestionar las operaciones CRUD de recordatorios de pacientes
 */
import api from './api';

/**
 * Obtiene los recordatorios de un paciente específico
 * @param {number} patientId - ID del paciente
 * @returns {Promise} - Promesa con la lista de recordatorios
 */
export const getPatientReminders = async (patientId) => {
  try {
    const response = await api.get(`/reminder/patient/${patientId}`);
    console.log('Respuesta de recordatorios del paciente:', response);
    
    // Verificar estructura de respuesta y retornar datos
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('Estructura de respuesta no reconocida:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error al obtener recordatorios del paciente:', error);
    throw error;
  }
};

/**
 * Obtiene un recordatorio específico
 * @param {number} id - ID del recordatorio
 * @returns {Promise} - Promesa con el recordatorio
 */
export const getReminder = async (id) => {
  try {
    const response = await api.get(`/reminder/get/${id}`);
    
    if (response.data && response.data.data) {
      return response.data.data;
    } else {
      return response.data;
    }
  } catch (error) {
    console.error('Error al obtener recordatorio:', error);
    throw error;
  }
};

/**
 * Crea un nuevo recordatorio
 * @param {Object} reminderData - Datos del recordatorio a crear
 * @returns {Promise} - Promesa con el recordatorio creado
 */
export const createReminder = async (reminderData) => {
  try {
    const response = await api.post('/reminder/create', reminderData);
    return response.data;
  } catch (error) {
    console.error('Error al crear recordatorio:', error);
    // Extraer mensaje de error para mostrar al usuario
    let errorMessage = 'Error al crear recordatorio';
    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || errorMessage;
    }
    
    throw {
      message: errorMessage,
      originalError: error
    };
  }
};

/**
 * Actualiza un recordatorio existente
 * @param {number} id - ID del recordatorio a actualizar
 * @param {Object} reminderData - Nuevos datos del recordatorio
 * @returns {Promise} - Promesa con el recordatorio actualizado
 */
export const updateReminder = async (id, reminderData) => {
  try {
    const response = await api.put(`/reminder/update/${id}`, reminderData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar recordatorio:', error);
    // Extraer mensaje de error para mostrar al usuario
    let errorMessage = 'Error al actualizar recordatorio';
    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || errorMessage;
    }
    
    throw {
      message: errorMessage,
      originalError: error
    };
  }
};

/**
 * Elimina un recordatorio
 * @param {number} id - ID del recordatorio a eliminar
 * @returns {Promise} - Promesa con el resultado de la operación
 */
export const deleteReminder = async (id) => {
  try {
    const response = await api.del(`/reminder/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar recordatorio:', error);
    throw error;
  }
};

export default {
  getPatientReminders,
  getReminder,
  createReminder,
  updateReminder,
  deleteReminder
};
