/**
 * Servicio para gestionar los manuales del sistema
 */
import api from './api';

/**
 * Obtiene los manuales disponibles según el rol del usuario
 * Los administradores ven todos los manuales, los demás usuarios solo el manual de usuario
 * 
 * @returns {Promise} - Objeto con los manuales disponibles y sus URLs
 */
export const getManuals = async () => {
  try {
    const response = await api.get('/manual/index');
    
    // La API devuelve una estructura específica
    if (response && response.data && !response.error) {
      return response.data;
    } else {
      throw new Error(response.message || 'Error al obtener los manuales');
    }
  } catch (error) {
    throw error;
  }
};

// Exportamos un objeto con todas las funciones para facilitar su uso
const manualService = {
  getManuals
};

export default manualService;
