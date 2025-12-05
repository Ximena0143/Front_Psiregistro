import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { ArrowLeft, Edit } from 'lucide-react';
import styles from './styles.module.css';
import userService from '../../services/user';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { isAdmin } from '../../services/auth';

const Perfil = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [especializaciones, setEspecializaciones] = useState([]);
    const [roles] = useState([
        { id: 1, name: 'Administrador' },
        { id: 2, name: 'Doctor' }
    ]);
    const [isUserAdmin, setIsUserAdmin] = useState(false);
    const [formData, setFormData] = useState({
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        correo: '',
        especializacion: '',
        especializacion_id: '',
        descripcionPerfil: '',
        rol: '',
        rol_id: ''
    });

    // Función para actualizar el estado del componente con los datos del usuario
    const updateUserDataState = (userData) => {
        if (!userData) return;
        
        // Actualizar el estado del formulario con los datos más recientes
        setFormData({
            primerNombre: userData.human?.first_name || '',
            segundoNombre: userData.human?.middle_name || '',
            primerApellido: userData.human?.last_name || '',
            segundoApellido: userData.human?.second_last_name || '',
            correo: userData.email || '',
            especializacion: userData.specialization?.name || '',
            especializacion_id: userData.specialization?.id || '',
            descripcionPerfil: userData.profile_description || '',
            rol: Array.isArray(userData.roles) && userData.roles.length > 0 ? 
                 userData.roles[0]?.name || userData.roles[0]?.role || '' : '',
            rol_id: Array.isArray(userData.roles) && userData.roles.length > 0 ? 
                   userData.roles[0]?.id || '' : ''
        });
        
        // Actualizar la imagen de perfil si existe
        if (userData.profile_photo_path) {
            setProfileImage(userData.profile_photo_path);
        }
    };

    // Función para obtener y actualizar datos del usuario
    // Esta función debe estar definida antes de ser usada en useEffect o handleCancel
    const fetchUserData = async () => {
        try {
            setLoading(true);
            
            // Cargar especializaciones si es necesario
            if (especializaciones.length === 0) {
                await fetchEspecializaciones();
            }
            
            // Obtener el usuario actual usando el endpoint /auth/me
            const meResponse = await api.post('/auth/me');
            console.log('Respuesta de /auth/me:', meResponse); // Para depuración
            
            if (!meResponse || !meResponse.data) {
                setLoading(false);
                return;
            }
            
            // Verificar si el usuario es administrador
            setIsUserAdmin(isAdmin());
            
            // Usar los datos del usuario desde meResponse.data
            const basicUserData = meResponse.data;
            console.log('Datos del usuario obtenidos:', basicUserData); // Para depuración
            
            // Utilizar la función reutilizable para actualizar los datos de usuario
            updateUserDataState(basicUserData);
            
            setLoading(false);
            return basicUserData; // Retorna los datos por si son necesarios
        } catch (error) {
            console.error('Error al cargar datos del perfil:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cargar la información del perfil',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
        } finally {
            setLoading(false);
        }
    };

    // Método para obtener la URL firmada de la foto de perfil directamente del backend
    const getProfilePhotoUrl = async () => {
        try {
            console.log('Intentando obtener la URL firmada de la foto de perfil');
            const response = await api.get('/user/get-profile-photo');
            console.log('Respuesta completa del endpoint get-profile-photo:', response);
            
            // Verificamos si tenemos la estructura esperada en la respuesta
            if (response && response.data && response.data.URL) {
                console.log('URL firmada de la foto obtenida:', response.data.URL);
                // Actualizar el estado con la URL firmada
                setProfileImage(response.data.URL);
                return response.data.URL;
            } else {
                console.error('Respuesta inválida al obtener URL de foto');
                return null;
            }
        } catch (error) {
            console.error('Error al obtener URL de foto de perfil:', error);
            return null;
        }
    };
    
    useEffect(() => {
        // Intentar cargar la URL firmada de la foto de perfil directamente
        getProfilePhotoUrl();
        
        // También cargar los datos completos del usuario
        fetchUserData();
    }, []);

    // Función para obtener las especializaciones del backend
    const fetchEspecializaciones = async () => {
        try {
            // Usar el servicio API que ya incluye el token de autenticación
            const response = await api.get('/specialization/index');
            
            if (response && response.data && Array.isArray(response.data)) {
                // Asignar IDs a las especializaciones que no los tienen
                const especializacionesConId = response.data.map((esp, index) => {
                    if (esp && !esp.id) {
                        return { ...esp, id: index + 1 }; // Asignar un ID numérico basado en el índice
                    }
                    return esp;
                });
                
                setEspecializaciones(especializacionesConId);
            } else {
                // Datos de ejemplo en caso de error
                setEspecializaciones([
                    { id: 1, name: 'Psicología Clínica' },
                    { id: 2, name: 'Psicología Educativa' },
                    { id: 3, name: 'Psicología Organizacional' }
                ]);
            }
        } catch (error) {
            // Datos de ejemplo en caso de error
            setEspecializaciones([
                { id: 1, name: 'Psicología Clínica' },
                { id: 2, name: 'Psicología Educativa' },
                { id: 3, name: 'Psicología Organizacional' }
            ]);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            
            // Obtener el usuario actual usando el endpoint /auth/me
            const meResponse = await api.post('/auth/me');
            
            if (!meResponse || !meResponse.data) {
                throw new Error('No se pudo obtener la información del usuario desde /auth/me');
            }
            
            const userData = meResponse.data;
            
            // Preparar los datos para la actualización
            const updateData = {
                // Datos del human
                first_name: formData.primerNombre,
                middle_name: formData.segundoNombre || null, // Asegurarnos de que no sea undefined
                last_name: formData.primerApellido,
                second_last_name: formData.segundoApellido || null, // Asegurarnos de que no sea undefined
                
                // Datos del user
                email: formData.correo,
                password: userData.password || 'password123', // Siempre enviar una contraseña
                specialization_id: formData.especializacion_id ? Number(formData.especializacion_id) : null,
                profile_description: formData.descripcionPerfil || '',
                profile_photo_path: userData.profile_photo_path || 'default.jpg',
                
                // Roles (siempre debe ser un array con al menos un elemento)
                roles: formData.rol_id ? [Number(formData.rol_id)] : [2] // Por defecto, rol de doctor (2)
            };
            
            try {
                // Llamar al servicio para actualizar el usuario
                const updateResponse = await userService.updateUser(userData.id, updateData);
                console.log('Respuesta de actualización del perfil:', updateResponse);
                
                // Verificar si la respuesta contiene la información del usuario actualizado
                if (updateResponse && updateResponse.data) {
                    // Actualizar el estado con los datos más recientes
                    const updatedUserData = updateResponse.data;
                    
                    // Si se actualizaron los datos con éxito, obtener la URL firmada de la foto
                    if (updatedUserData.profile_photo_path && 
                        updatedUserData.profile_photo_path !== 'default.jpg') {
                        
                        console.log('Foto actualizada, obteniendo nueva URL firmada');
                        
                        // Intentar obtener la URL firmada directamente desde el backend
                        try {
                            // Obtener la URL firmada actualizada
                            await getProfilePhotoUrl();
                        } catch (photoError) {
                            console.error('Error al obtener URL firmada de foto actualizada:', photoError);
                        }
                    }
                    // Ya no necesitamos actualizar la URL de la imagen aquí, ya que getProfilePhotoUrl lo hace
                }
                
                Swal.fire({
                    title: 'Éxito',
                    text: 'Perfil actualizado correctamente',
                    icon: 'success',
                    confirmButtonColor: '#FB8500'
                });
                
                setIsEditing(false);
            } catch (updateError) {
                // Mensaje de error más descriptivo
                Swal.fire({
                    title: 'Error',
                    text: `No se pudieron guardar los cambios: ${updateError.message || 'Error desconocido'}`,
                    icon: 'error',
                    confirmButtonColor: '#FB8500'
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron guardar los cambios',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Mostrar confirmación antes de cancelar la edición
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Quieres salir sin guardar los cambios?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FB8500',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'No, continuar editando'
        }).then((result) => {
            if (result.isConfirmed) {
                // Usar la función centralizada para recargar los datos
                fetchUserData()
                    .then(() => {
                        // Desactivar el modo edición cuando termine de cargar los datos
                        setIsEditing(false);
                    })
                    .catch((error) => {
                        console.error('Error al recargar datos:', error);
                        setIsEditing(false);
                    });
            }
        });
    };

    const updateProfilePhoto = async (file) => {
        try {
            setLoading(true);
            
            // Usar el servicio para actualizar la foto de perfil
            // Crear un FormData para enviar el archivo
            const formData = new FormData();
            
            // Verificar y mostrar detalles del archivo
            console.log('Archivo a subir:', file);
            console.log('Nombre del archivo:', file.name);
            console.log('Tipo del archivo:', file.type);
            console.log('Tamaño del archivo:', file.size, 'bytes');
            
            // IMPORTANTE: asegurarse de que el nombre del campo sea exactamente 'profile_photo'
            console.log('Agregando archivo al FormData:', file.name, file.type, file.size);
            formData.append('profile_photo', file);
            
            // Simular PATCH con el parámetro _method
            formData.append('_method', 'PATCH');
            
            // Para depuración: verificar el contenido del FormData
            console.log('Contenido del FormData:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
            }
            
            // Logging del FormData (no muestra contenido pero confirma que existe)
            console.log('FormData creado:', formData);
            
            // Configurar headers para envío de archivos
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                }
            };
            console.log('Configuración de la solicitud:', config);
            
            // Enviar la imagen al backend usando POST pero simulando PATCH
            console.log('Enviando solicitud al endpoint: /user/update-profile-photo como POST con _method=PATCH');
            // FormData ya contiene _method=PATCH, así que usamos POST que maneja mejor la subida de archivos
            const response = await api.post('/user/update-profile-photo', formData, config);
            console.log('Content-Type de la solicitud:', config.headers['Content-Type']);
            console.log('Respuesta completa del servidor:', response);
            console.log('Datos de respuesta:', response.data);
            
            if (response && !response.error) {
                Swal.fire({
                    title: 'Éxito',
                    text: 'Foto de perfil actualizada correctamente',
                    icon: 'success',
                    confirmButtonColor: '#FB8500'
                });
                
                console.log('Procesando respuesta del servidor:', response.data);
                
                // Obtener la ruta de la foto de la respuesta del servidor
                let photoPath = null;
                
                // Verificar primero en response.data.path (estructura devuelta por el backend actual)
                if (response.data && response.data.path) {
                    photoPath = response.data.path;
                    console.log('Encontrada ruta de foto en response.data.path:', photoPath);
                }
                // Verificar estructura alternativa por compatibilidad
                else if (response.data && response.data.user && response.data.user.profile_photo_path) {
                    photoPath = response.data.user.profile_photo_path;
                    console.log('Encontrada ruta de foto en response.data.user.profile_photo_path:', photoPath);
                }
                
                if (photoPath) {
                    // IMPORTANTE: Guardar la ruta en localStorage para persistencia
                    localStorage.setItem('user_photo_path', photoPath);
                    console.log('Ruta de foto guardada en localStorage:', photoPath);
                    
                    // Después de subir la imagen, obtener la URL firmada directamente del backend
                    console.log('Obteniendo URL firmada de la nueva foto subida');
                    try {
                        // Obtener la URL firmada del backend
                        await getProfilePhotoUrl();
                    } catch (photoError) {
                        console.error('Error al obtener URL firmada de la nueva foto:', photoError);
                        
                        // Como respaldo, construir una URL directa (puede no funcionar si el bucket es privado)
                        const s3BaseUrl = 'https://psiregistro.s3.us-west-1.amazonaws.com/';
                        const fullImageUrl = s3BaseUrl + photoPath;
                        console.log('URL de respaldo para la imagen:', fullImageUrl);
                        setProfileImage(fullImageUrl);
                    }
                }
                
                // IMPORTANTE: Refrescar los datos completos del usuario para asegurar consistencia
                await fetchUserData();
            }
        } catch (error) {
            console.error('Error al actualizar la foto de perfil:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo actualizar la foto de perfil',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
        } finally {
            setLoading(false);
        }
    };
    
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onloadend = () => {
                setProfileImage(reader.result);
                
                // Enviar la imagen al backend cuando se selecciona
                updateProfilePhoto(file);
            };
            
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={styles.dashboard}>
            <Header variant="dashboard" />
            <div className={styles.main}>
                <Sidebar />
                <div className={styles.content}>
                    <div className={styles.contentHeader}>
                        <div className={styles.headerLeft}>
                            <button className={styles.backButton} onClick={handleGoBack}>
                                <ArrowLeft size={20} />
                            </button>
                            <h3>Perfil personal</h3>
                        </div>
                        {isEditing ? (
                            <div className={styles.buttonGroup}>
                                <button 
                                    className={`${styles.cancelButton}`} 
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    className={styles.addButton} 
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    Guardar
                                </button>
                            </div>
                        ) : (
                            <button 
                                className={styles.addButton} 
                                onClick={handleEditToggle}
                                disabled={loading}
                            >
                                Editar
                            </button>
                        )}
                    </div>

                    <div className={styles.profileContainer}>
                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <p>Cargando información del perfil...</p>
                            </div>
                        ) : (
                            <div className={styles.profileCard}>
                                <div className={styles.profileImageSection}>
                                    <div className={styles.profileImageContainer}>
                                        {profileImage ? (
                                            <img src={profileImage} alt="Foto de perfil" className={styles.profileImage} />
                                        ) : (
                                            <div className={styles.profileImagePlaceholder}>
                                                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="50" cy="30" r="20" stroke="#219EBC" strokeWidth="4" fill="none"/>
                                                    <path d="M90 90C90 68.9543 72.0457 50 50 50C27.9543 50 10 68.9543 10 90" stroke="#219EBC" strokeWidth="4" fill="none"/>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <div className={styles.editProfileImage}>
                                            <label htmlFor="profileImageInput" className={styles.editImageLabel}>
                                                <Edit size={16} />
                                                <span>Editar foto de perfil</span>
                                            </label>
                                            <input 
                                                id="profileImageInput" 
                                                type="file" 
                                                accept="image/*" 
                                                className={styles.imageInput} 
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.profileInfo}>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="primerNombre">Primer nombre</label>
                                            <input 
                                                id="primerNombre"
                                                name="primerNombre"
                                                type="text" 
                                                value={formData.primerNombre} 
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className={!isEditing ? styles.disabledInput : ''}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="segundoNombre">Segundo nombre</label>
                                            <input 
                                                id="segundoNombre"
                                                name="segundoNombre"
                                                type="text" 
                                                value={formData.segundoNombre} 
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className={!isEditing ? styles.disabledInput : ''}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="primerApellido">Primer apellido</label>
                                            <input 
                                                id="primerApellido"
                                                name="primerApellido"
                                                type="text" 
                                                value={formData.primerApellido} 
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className={!isEditing ? styles.disabledInput : ''}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="segundoApellido">Segundo apellido</label>
                                            <input 
                                                id="segundoApellido"
                                                name="segundoApellido"
                                                type="text" 
                                                value={formData.segundoApellido} 
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className={!isEditing ? styles.disabledInput : ''}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="correo">Correo electrónico</label>
                                            <input 
                                                id="correo"
                                                name="correo"
                                                type="email" 
                                                value={formData.correo} 
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className={!isEditing ? styles.disabledInput : ''}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="rol">Rol</label>
                                            <select 
                                                id="rol_id"
                                                name="rol_id"
                                                value={formData.rol_id} 
                                                onChange={handleInputChange}
                                                disabled={!isEditing || !isUserAdmin}
                                                className={!isEditing ? styles.disabledInput : ''}
                                            >
                                                <option value="">Seleccionar rol</option>
                                                {roles.map(rol => (
                                                    <option key={rol.id} value={rol.id}>{rol.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="especializacion_id">Especialización</label>
                                            <select 
                                                id="especializacion_id"
                                                name="especializacion_id"
                                                value={formData.especializacion_id} 
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className={!isEditing ? styles.disabledInput : ''}
                                            >
                                                <option value="">Seleccionar especialización</option>
                                                {especializaciones.map(esp => (
                                                    <option key={esp.id} value={esp.id}>{esp.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup + ' ' + styles.fullWidth}>
                                            <label htmlFor="descripcionPerfil">Descripción del perfil</label>
                                            <textarea 
                                                id="descripcionPerfil"
                                                name="descripcionPerfil"
                                                value={formData.descripcionPerfil} 
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className={!isEditing ? styles.disabledInput : ''}
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Perfil;
