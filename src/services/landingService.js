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
            const response = await api.get('/landing/index?per_page=100');
            console.log('Respuesta de psicólogos para landing page:', response);
            
            if (response && response.data && response.data.data) {
                // El backend devuelve los datos en response.data.data
                const users = response.data.data;
                
                // Para cada usuario, intentamos obtener una URL firmada para su foto de perfil
                const usersWithPhotos = await Promise.all(users.map(async (user) => {
                    // Si el usuario tiene ruta de foto, intentamos obtener la URL firmada
                    if (user.profile_photo_path) {
                        try {
                            // Construir URL para la foto de perfil basada en la ruta
                            // Como no podemos usar la ruta autenticada, usamos un fallback
                            const s3BaseUrl = 'https://psiregistro.s3.us-west-1.amazonaws.com/';
                            user.photo_url = s3BaseUrl + user.profile_photo_path;
                        } catch (photoError) {
                            console.error('Error al procesar foto para usuario:', user.id, photoError);
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
            console.error('Error al obtener psicólogos para landing page:', error);
            return [];
        }
    }
};

export default landingService;
