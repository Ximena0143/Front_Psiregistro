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
            console.log('Respuesta de psicólogos para landing page:', response);
            
            if (response && response.data && response.data.data) {
                // El backend devuelve los datos en response.data.data
                const users = response.data.data;
                
                console.log('Total de usuarios recibidos del backend:', users.length);
                // Para debugging: mostrar todos los IDs de usuarios
                console.log('IDs de todos los usuarios:', users.map(u => u.id));
                
                // Para cada usuario, intentamos obtener una URL firmada para su foto de perfil
                const usersWithPhotos = await Promise.all(users.map(async (user, index) => {
                    // Para debugging: mostrar detalles de cada usuario
                    console.log(`Usuario #${index + 1}:`, {
                        id: user.id,
                        email: user.email,
                        human: user.human ? `${user.human.first_name} ${user.human.last_name}` : 'No hay datos de persona',
                        tiene_foto: Boolean(user.profile_photo_path),
                        ruta_foto: user.profile_photo_path || 'No tiene foto'
                    });
                    
                    // Si el usuario tiene ruta de foto, obtenemos la URL firmada del endpoint público
                    if (user.id && user.profile_photo_path) {
                        try {
                            // Asegurarse de que user.id es un número (no un string)
                            const userId = parseInt(user.id, 10);
                            console.log(`[Usuario ${userId}] Obteniendo URL firmada. Ruta foto: ${user.profile_photo_path}`);
                            
                            // Usar la nueva ruta para obtener la URL firmada
                            const photoResponse = await api.get(`/landing/user/get-profile-photo?user_id=${userId}`);
                            console.log('Respuesta completa para foto del usuario:', userId, photoResponse);
                            
                            if (photoResponse && photoResponse.data && photoResponse.data.URL) {
                                // Si se obtuvo correctamente la URL firmada
                                user.photo_url = photoResponse.data.URL;
                                console.log('URL firmada obtenida para usuario', user.id, user.photo_url);
                            } else {
                                // Si no se pudo obtener la URL, usar ruta directa como fallback
                                const s3BaseUrl = 'https://psiregistro.s3.us-west-1.amazonaws.com/';
                                user.photo_url = s3BaseUrl + user.profile_photo_path;
                                console.log('Usando URL directa como fallback para usuario', user.id, user.photo_url);
                            }
                        } catch (photoError) {
                            console.error('Error al obtener URL firmada para usuario:', user.id, photoError);
                            // Usar foto por defecto en caso de error
                            user.photo_url = '/Images/default-profile.jpg';
                        }
                    } else {
                        // Si no tiene foto personalizada, usar la foto por defecto
                        user.photo_url = '/Images/default-profile.jpg';
                        console.log('Usuario sin foto de perfil, usando imagen por defecto:', user.id);
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
