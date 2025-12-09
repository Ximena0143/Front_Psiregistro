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
                const response = await api.get('/landing/post/index');
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
                    }
                    // Caso 2: La estructura es { data: [...] }
                    else if (Array.isArray(response.data)) {
                        publicaciones = response.data;
                    }
                    // Caso 3: La estructura tiene los posts en otra propiedad
                    else if (response.data.posts) {
                        publicaciones = response.data.posts;
                    }
                    // Caso 4: La respuesta misma es un array
                    else if (Array.isArray(response)) {
                        publicaciones = response;
                    }
                    
                    if (publicaciones && publicaciones.length > 0) {
                        
                        // Procesar cada publicación para asegurar que tiene la estructura correcta
                        const publicacionesFormateadas = publicaciones.map(publicacion => {
                            // Formatear el título para que se vea mejor
                            let titulo = publicacion.tittle || publicacion.title || 'Sin título';
                            
                            // Si el título parece ser un nombre de archivo (tiene extensión)
                            if (titulo.endsWith('.jpg') || titulo.endsWith('.png') || titulo.endsWith('.jpeg') || 
                                titulo.endsWith('.gif') || titulo.endsWith('.mp4')) {
                                // Quitar la extensión
                                titulo = titulo.substring(0, titulo.lastIndexOf('.'));
                            }
                            
                            // Reemplazar guiones por espacios y capitalizar palabras
                            titulo = titulo.replace(/[-_]/g, ' ')
                                         .split(' ')
                                         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                         .join(' ');
                            
                            return {
                                id: publicacion.id || '',
                                titulo: titulo,
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
            }
            
            try {
                const directResponse = await fetch('http://localhost:8000/api/landing/post/index', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                
                const directData = await directResponse.json();
                
                if (directData && directData.data && Array.isArray(directData.data) && directData.data.length > 0) {
                    // Procesar la respuesta alternativa
                    const publicaciones = directData.data;
                    
                    const publicacionesFormateadas = publicaciones.map(publicacion => {
                        // Formatear el título para que se vea mejor
                        let titulo = publicacion.tittle || publicacion.title || 'Sin título';
                        
                        // Si el título parece ser un nombre de archivo (tiene extensión)
                        if (titulo.endsWith('.jpg') || titulo.endsWith('.png') || titulo.endsWith('.jpeg') || 
                            titulo.endsWith('.gif') || titulo.endsWith('.mp4')) {
                            // Quitar la extensión
                            titulo = titulo.substring(0, titulo.lastIndexOf('.'));
                        }
                        
                        // Reemplazar guiones por espacios y capitalizar palabras
                        titulo = titulo.replace(/[-_]/g, ' ')
                                     .split(' ')
                                     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                     .join(' ');
                        
                        return {
                            id: publicacion.id || '',
                            titulo: titulo,
                            descripcion: publicacion.description || publicacion.descripcion || 'Sin descripción',
                            tipo: publicacion.post_type || publicacion.tipo || 'image',
                            url: publicacion.signed_url || publicacion.url || '',
                            fecha: publicacion.created_at ? new Date(publicacion.created_at).toLocaleDateString() : ''
                        };
                    });
                    
                    return publicacionesFormateadas;
                }
            } catch (directError) {
            }
            
            return [];
        } catch (error) {    
            return [];
        }
    }
};

export default publicacionesLandingService;
