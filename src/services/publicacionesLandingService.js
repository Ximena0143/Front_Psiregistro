import api from './api';

/**
 * Servicio para obtener información de publicaciones para la landing page
 */
const publicacionesLandingService = {
    /**
     * Obtiene la lista de publicaciones para mostrar en la landing page
     * @returns {Promise<Array>} - Lista de publicaciones con información básica
     */
    getPublicaciones: async () => {
        try {
            // Intentar con primera opción de ruta
            try {
                console.log('Intentando petición con primera ruta: /landing/post/index');
                const response = await api.get('/landing/post/index');
                console.log('Respuesta de publicaciones para landing page:', response);
                console.log('Estructura de la respuesta:', {
                    tieneData: !!response.data,
                    tipoData: typeof response.data,
                    tieneDataData: !!(response.data && response.data.data),
                    estructuraCompleta: JSON.stringify(response)
                });
                
                // Añadir comprobación para diferentes estructuras posibles
                if (response && response.data) {
                    let publicaciones;
                    
                    // Caso 1: La estructura es { data: { data: [...] } }
                    if (response.data.data) {
                        publicaciones = response.data.data;
                        console.log('Estructura anidada detectada, usando response.data.data');
                    }
                    // Caso 2: La estructura es { data: [...] }
                    else if (Array.isArray(response.data)) {
                        publicaciones = response.data;
                        console.log('Array directo detectado, usando response.data');
                    }
                    // Caso 3: La estructura tiene los posts en otra propiedad
                    else if (response.data.posts) {
                        publicaciones = response.data.posts;
                        console.log('Estructura alternativa detectada, usando response.data.posts');
                    }
                    // Caso 4: La respuesta misma es un array
                    else if (Array.isArray(response)) {
                        publicaciones = response;
                        console.log('La respuesta completa es un array, usando response');
                    }
                    
                    if (publicaciones && publicaciones.length > 0) {
                        console.log('Total de publicaciones recibidas:', publicaciones.length);
                        console.log('Datos de la primera publicación:', JSON.stringify(publicaciones[0]));
                        
                        // Procesar cada publicación para asegurar que tiene la estructura correcta
                        const publicacionesFormateadas = publicaciones.map(publicacion => {
                            return {
                                id: publicacion.id || '',
                                titulo: publicacion.tittle || publicacion.title || 'Sin título', // Probar ambos campos
                                descripcion: publicacion.description || publicacion.descripcion || 'Sin descripción',
                                tipo: publicacion.post_type || publicacion.tipo || 'image',
                                url: publicacion.signed_url || publicacion.url || '',
                                fecha: publicacion.created_at ? new Date(publicacion.created_at).toLocaleDateString() : ''
                            };
                        });
                        
                        return publicacionesFormateadas;
                    }
                }
            } catch (routeError) {
                console.error('Error al intentar la ruta principal:', routeError);
            }
            
            // Si no encontramos datos en la primera ruta, intentar con alternativas
            console.log('No se encontraron datos en la primera ruta, intentando con alternativa');
            try {
                // Intentar directamente con la URL completa para evitar problemas de routing
                const directResponse = await fetch('http://localhost:8000/api/landing/post/index', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                
                const directData = await directResponse.json();
                console.log('Respuesta directa sin api service:', directData);
                
                if (directData && directData.data && Array.isArray(directData.data) && directData.data.length > 0) {
                    // Procesar la respuesta alternativa
                    const publicaciones = directData.data;
                    
                    const publicacionesFormateadas = publicaciones.map(publicacion => ({
                        id: publicacion.id || '',
                        titulo: publicacion.tittle || publicacion.title || 'Sin título',
                        descripcion: publicacion.description || publicacion.descripcion || 'Sin descripción',
                        tipo: publicacion.post_type || publicacion.tipo || 'image',
                        url: publicacion.signed_url || publicacion.url || '',
                        fecha: publicacion.created_at ? new Date(publicacion.created_at).toLocaleDateString() : ''
                    }));
                    
                    return publicacionesFormateadas;
                }
            } catch (directError) {
                console.error('Error en el intento alternativo:', directError);
            }
            
            return [];
        } catch (error) {
            console.error('Error al obtener publicaciones para landing page:', error);
            return [];
        }
    }
};

export default publicacionesLandingService;
