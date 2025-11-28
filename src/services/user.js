/**
 * Servicio para gestionar las operaciones CRUD de usuarios (psicólogos)
 */
import api from './api';

/**
 * Obtiene la lista de todos los usuarios (psicólogos)
 * @param {number} perPage - Número de elementos por página
 * @param {number} page - Número de página
 * @returns {Promise} - Promesa con la lista de usuarios
 */
export const getUsers = async (perPage = 100, page = 1) => {
  try {
    const response = await api.get(`/user/index?per_page=${perPage}&page=${page}`);
    
    if (!response || !response.data) {
      console.warn('La respuesta no contiene datos');
      return { data: [] };
    }
    
    // Manejar la estructura de respuesta
    if (Array.isArray(response.data)) {
      console.log('Usando estructura de respuesta con array directo');
      return { data: response.data };
    } 
    else if (response.data.data && Array.isArray(response.data.data)) {
      console.log('Usando estructura de respuesta con data anidado');
      return response.data;
    } 
    else {
      console.warn('Estructura de respuesta no reconocida, intentando convertir:', response.data);
      // Intentar convertir un objeto a un array si es necesario
      const dataArray = response.data ? [response.data] : [];
      return { data: dataArray };
    }
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

/**
 * Obtiene la información de un usuario específico por su ID
 * @param {number} id - ID del usuario a obtener
 * @returns {Promise} - Promesa con los datos del usuario
 */
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/user/${id}`);
    
    if (!response || !response.data) {
      console.warn('La respuesta no contiene datos del usuario');
      return null;
    }
    
    // La respuesta puede tener diferentes estructuras, intentamos manejarlas todas
    if (response.data.user) {
      return response.data.user;
    } else if (response.data.data && response.data.data.user) {
      return response.data.data.user;
    } else {
      return response.data;
    }
  } catch (error) {
    console.error(`Error al obtener usuario con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene la lista de usuarios eliminados
 * @param {number} perPage - Número de elementos por página
 * @param {number} page - Número de página
 * @returns {Promise} - Promesa con la lista de usuarios eliminados
 */
export const getDeletedUsers = async (perPage = 10, page = 1) => {
  try {
    const response = await api.get(`/user/deleted-index?per_page=${perPage}&page=${page}`);
    return response;
  } catch (error) {
    console.error('Error al obtener usuarios eliminados:', error);
    throw error;
  }
};

/**
 * Registra un nuevo usuario (psicólogo)
 * @param {Object} userData - Datos del usuario a registrar
 * @returns {Promise} - Promesa con los datos del usuario registrado
 */
export const registerUser = async (userData) => {
  try {
    // Asegurarse de que specialization_id sea un número entero
    const dataToSend = { ...userData };
    
    // Verificar si specialization_id existe y es válido
    if (dataToSend.specialization_id === undefined || dataToSend.specialization_id === '') {
      throw new Error('Debe seleccionar una especialización');
    }
    
    // Convertir explícitamente specialization_id a número
    dataToSend.specialization_id = Number(dataToSend.specialization_id);
    
    // Asegurarse de que sea un número válido
    if (isNaN(dataToSend.specialization_id)) {
      throw new Error('La especialización debe ser un número válido');
    }
    
    console.log('Datos enviados al backend:', dataToSend);
    const response = await api.post('/user/register', dataToSend);
    return response;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
};

/**
 * Actualiza los datos de un usuario
 * @param {number} id - ID del usuario a actualizar
 * @param {Object} userData - Nuevos datos del usuario
 * @returns {Promise} - Promesa con los datos del usuario actualizado
 */
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/user/update/${id}`, userData);
    return response;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

/**
 * Elimina un usuario (soft delete)
 * @param {number} id - ID del usuario a eliminar
 * @returns {Promise} - Promesa con el resultado de la eliminación
 */
export const deleteUser = async (id) => {
  try {
    const response = await api.del(`/user/delete/${id}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

/**
 * Restaura un usuario eliminado
 * @param {number} id - ID del usuario a restaurar
 * @returns {Promise} - Promesa con los datos del usuario restaurado
 */
export const restoreUser = async (id) => {
  try {
    const response = await api.patch(`/user/restore/${id}`);
    return response;
  } catch (error) {
    console.error('Error al restaurar usuario:', error);
    throw error;
  }
};

/**
 * Elimina permanentemente un usuario
 * @param {number} id - ID del usuario a eliminar permanentemente
 * @returns {Promise} - Promesa con el resultado de la eliminación
 */
export const forceDeleteUser = async (id) => {
  try {
    const response = await api.del(`/user/force-delete/${id}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar permanentemente usuario:', error);
    throw error;
  }
};

/**
 * Actualiza la foto de perfil de un usuario
 * @param {File} photoFile - Archivo de imagen para la foto de perfil
 * @returns {Promise} - Promesa con los datos de la foto actualizada
 */
export const updateProfilePhoto = async (photoFile) => {
  try {
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('profile_photo', photoFile);
    formData.append('_method', 'PATCH'); 
    
    // Realizar la petición PATCH al backend
    const response = await api.post('/update-profile-photo', formData);
    return response;
  } catch (error) {
    console.error('Error al actualizar la foto de perfil:', error);
    throw error;
  }
};

const userService = {
  getUsers,
  getDeletedUsers,
  registerUser,
  updateUser,
  deleteUser,
  restoreUser,
  forceDeleteUser,
  getUserById,
  updateProfilePhoto
};

export default userService;
