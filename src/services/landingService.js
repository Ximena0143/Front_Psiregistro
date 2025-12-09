import api from './api';

/**
 * Servicio para obtener información para la landing page
 */
const landingService = {
    /**
     * Obtiene la lista de psicólogos para mostrar en la landing page
     * @returns {Promise<Array>} - Lista de psicólogos con información básica
     */
    getPsychologists: async () => {
        try {
            // Solicitar hasta 100 usuarios por página para asegurar mostrar todos
            const response = await api.get('/landing/user/index?per_page=100');
            
            if (response && response.data && response.data.data) {
                // El backend devuelve los datos en response.data.data
                const users = response.data.data;
                       
                // Para cada usuario, intentamos obtener una URL firmada para su foto de perfil
                const usersWithPhotos = await Promise.all(users.map(async (user, index) => {
                    // Para debugging: mostrar detalles de cada usuario
                    
                    // Si el usuario tiene ruta de foto, obtenemos la URL firmada del endpoint público
                    if (user.id && user.profile_photo_path) {
                        try {
                            // Asegurarse de que user.id es un número (no un string)
                            const userId = parseInt(user.id, 10);
                            
                            // Usar la nueva ruta para obtener la URL firmada
                            const photoResponse = await api.get(`/landing/user/get-profile-photo?user_id=${userId}`);
                            
                            if (photoResponse && photoResponse.data && photoResponse.data.URL) {
                                // Si se obtuvo correctamente la URL firmada
                                user.photo_url = photoResponse.data.URL;
                            } else {
                                // Si no se pudo obtener la URL, usar ruta directa como fallback
                                const s3BaseUrl = 'https://psiregistro.s3.us-west-1.amazonaws.com/';
                                user.photo_url = s3BaseUrl + user.profile_photo_path;
                            }
                        } catch (photoError) {
                            // Usar foto por defecto en caso de error
                            user.photo_url = '/Images/default-profile.jpg';
                        }
                    } else {
                        // Si no tiene foto personalizada, usar la foto por defecto
                        user.photo_url = '/Images/default-profile.jpg';
                    }
                    
                    return user;
                }));
                
                return usersWithPhotos;
            }
            return [];
        } catch (error) {
            return [];
        }
    }
};

export default landingService;
