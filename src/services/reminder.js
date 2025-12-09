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
    
    // Verificar estructura de respuesta y retornar datos
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    throw new Error(error.message);
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
    throw new Error(error.message);
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
    let errorMessage = 'Error al crear recordatorio';
    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || errorMessage;
    }
    
    const err = new Error(errorMessage);
    err.originalError = error;
    throw err;
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
    let errorMessage = 'Error al actualizar recordatorio';
    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || errorMessage;
    }
    
    const err = new Error(errorMessage);
    err.originalError = error;
    throw err;
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
    throw new Error(error.message);
  }
};

const reminderService = {
  getPatientReminders,
  getReminder,
  createReminder,
  updateReminder,
  deleteReminder
};

export default reminderService;
