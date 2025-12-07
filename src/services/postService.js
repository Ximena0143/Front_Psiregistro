/**
 * Servicio para gestionar las publicaciones (posts)
 */
import api from './api';

/**
 * Obtiene todas las publicaciones del usuario autenticado
 * @returns {Promise} - Lista de publicaciones
 */
export const getPosts = async () => {
  try {
    const response = await api.get('/post/index');
    
    // La API devuelve una estructura específica
    if (response && response.data && !response.error) {
      return response.data;
    } else {
      throw new Error(response.message || 'Error al obtener las publicaciones');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Crea una nueva publicación
 * @param {Object} data - Datos de la publicación (tittle, description, post_type)
 * @param {Array} files - Array de archivos a subir
 * @returns {Promise} - Publicación creada
 */
export const createPost = async (data, files) => {
  try {
    // Crear FormData para enviar archivos
    const formData = new FormData();
    
    // Añadir archivos - El backend espera un array llamado 'files'
    // La sintaxis correcta para FormData cuando se espera un array en Laravel es con '[]'
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        formData.append('files[]', files[i]);
      }
    }
    
    // Añadir datos del formulario con los nombres que espera el backend
    formData.append('tittle', data.titulo); // El backend espera 'tittle' (con doble 't')
    formData.append('description', data.descripcion || '');
    
    // Determinar el tipo de archivo basado en su extensión
    let postType = 'image'; // Valor por defecto
    
    if (files && files.length > 0) {
      const file = files[0];
      const extension = file.name.split('.').pop().toLowerCase();
      
      // Asignar el tipo correcto según la extensión
      if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        postType = 'image';
      } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
        postType = 'video';
      } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
        postType = 'audio';
      } else {
        postType = 'archive';
      }
    }
    
    // Añadir el tipo de post determinado
    formData.append('post_type', postType);
    
    // Agregar logs para depuración
    console.log('Enviando datos a la API:', {
      titulo: data.titulo,
      descripcion: data.descripcion,
      post_type: postType,
      archivos: files ? files.length : 0
    });
    
    const response = await api.post('/post/create', formData);
    
    if (response && !response.error) {
      return response.data;
    } else {
      throw new Error(response.message || 'Error al crear la publicación');
    }
  } catch (error) {
    console.error('Error al crear post:', error);
    throw error;
  }
};

/**
 * Elimina una publicación
 * @param {string} uuid - ID de la publicación a eliminar
 * @returns {Promise} - Resultado de la eliminación
 */
export const deletePost = async (uuid) => {
  try {
    const response = await api.del(`/post/delete/${uuid}`);
    
    if (response && !response.error) {
      return true;
    } else {
      throw new Error(response.message || 'Error al eliminar la publicación');
    }
  } catch (error) {
    throw error;
  }
};

// Exportamos un objeto con todas las funciones para facilitar su uso
const postService = {
  getPosts,
  createPost,
  deletePost
};

export default postService;
