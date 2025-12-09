/**
 * Servicio para gestionar las operaciones CRUD de especializaciones
 */
import api from './api';

/**
 * Obtiene la lista de todas las especializaciones
 * @returns {Promise} - Promesa con la lista de especializaciones
 */
export const getSpecializations = async () => {
  try {
    const response = await api.get('/specialization/index');
    
    if (!response || !response.data) {
      return { data: [] };
    }
    
    // Manejar la estructura de respuesta
    let specializations = [];
    
    if (Array.isArray(response.data)) {
      specializations = response.data;
    } 
    else if (response.data.data && Array.isArray(response.data.data)) {
      specializations = response.data.data;
    } 
    else {
      specializations = response.data ? [response.data] : [];
    }
    
    const processedSpecializations = specializations.map((spec, index) => {
      // Si la especialización ya tiene un id, lo usamos, de lo contrario asignamos un índice
      return {
        ...spec,
        id: spec.id || index + 1
      };
    });
    
    return { data: processedSpecializations };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Crea una nueva especialización
 * @param {Object} specializationData - Datos de la especialización a crear
 * @returns {Promise} - Promesa con los datos de la especialización creada
 */
export const createSpecialization = async (specializationData) => {
  try {
    const response = await api.post('/specialization/create', specializationData);
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Actualiza los datos de una especialización
 * @param {number} id - ID de la especialización a actualizar
 * @param {Object} specializationData - Nuevos datos de la especialización
 * @returns {Promise} - Promesa con los datos de la especialización actualizada
 */
export const updateSpecialization = async (id, specializationData) => {
  try {
    const response = await api.put(`/specialization/update/${id}`, specializationData);
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Elimina una especialización
 * @param {number} id - ID de la especialización a eliminar
 * @returns {Promise} - Promesa con el resultado de la eliminación
 */
export const deleteSpecialization = async (id) => {
  try {
    const response = await api.del(`/specialization/delete/${id}`);
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

const specializationService = {
  getSpecializations,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization
};

export default specializationService;
