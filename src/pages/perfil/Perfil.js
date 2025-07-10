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
    const [roles, setRoles] = useState([
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

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                
                // Cargar especializaciones
                await fetchEspecializaciones();
                
                // Obtener el usuario actual usando el endpoint /auth/me
                const meResponse = await api.post('/auth/me');
                console.log('Respuesta completa de /auth/me:', meResponse);
                
                if (!meResponse || !meResponse.data) {
                    console.warn('No se pudo obtener la información del usuario desde /auth/me');
                    setLoading(false);
                    return;
                }
                
                // Verificar si el usuario es administrador
                setIsUserAdmin(isAdmin());
                console.log('¿El usuario es administrador?', isAdmin());
                
                // Usar los datos del usuario desde meResponse.data
                const basicUserData = meResponse.data;
                
                // Log detallado para ver la estructura exacta de los datos
                console.log('Estructura completa de la respuesta:', JSON.stringify(basicUserData, null, 2));
                console.log('Estructura detallada de userData:', {
                    email: basicUserData.email,
                    profile_description: basicUserData.profile_description,
                    profile_photo_path: basicUserData.profile_photo_path,
                    human: basicUserData.human,
                    roles: basicUserData.roles,
                    specialization: basicUserData.specialization
                });
                
                // Mapear los datos del usuario a formData con verificaciones robustas
                setFormData({
                    primerNombre: basicUserData.human?.first_name || '',
                    segundoNombre: basicUserData.human?.middle_name || '',
                    primerApellido: basicUserData.human?.last_name || '',
                    segundoApellido: basicUserData.human?.second_last_name || '',
                    correo: basicUserData.email || '',
                    especializacion: basicUserData.specialization?.name || '',
                    especializacion_id: basicUserData.specialization?.id || '',
                    descripcionPerfil: basicUserData.profile_description || '',
                    rol: Array.isArray(basicUserData.roles) && basicUserData.roles.length > 0 ? 
                         basicUserData.roles[0]?.name || basicUserData.roles[0]?.role || '' : '',
                    rol_id: Array.isArray(basicUserData.roles) && basicUserData.roles.length > 0 ? 
                           basicUserData.roles[0]?.id || '' : ''
                });
                
                // Establecer la imagen de perfil si existe
                if (basicUserData.profile_photo_path) {
                    setProfileImage(basicUserData.profile_photo_path);
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Error al obtener datos del usuario:', error);
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
        
        fetchUserData();
    }, []);

    // Función para obtener las especializaciones del backend
    const fetchEspecializaciones = async () => {
        try {
            // Usar el servicio API que ya incluye el token de autenticación
            const response = await api.get('/specialization/index');
            
            if (response && response.data && Array.isArray(response.data)) {
                console.log('Especializaciones cargadas del backend:', response.data);
                
                // Asignar IDs a las especializaciones que no los tienen
                const especializacionesConId = response.data.map((esp, index) => {
                    if (esp && !esp.id) {
                        return { ...esp, id: index + 1 }; // Asignar un ID numérico basado en el índice
                    }
                    return esp;
                });
                
                console.log('Especializaciones con IDs asignados:', especializacionesConId);
                setEspecializaciones(especializacionesConId);
            } else {
                console.warn('No se recibieron datos de especializaciones válidos');
                // Datos de ejemplo en caso de error
                setEspecializaciones([
                    { id: 1, name: 'Psicología Clínica' },
                    { id: 2, name: 'Psicología Educativa' },
                    { id: 3, name: 'Psicología Organizacional' }
                ]);
            }
        } catch (error) {
            console.error('Error al cargar especializaciones:', error);
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
            
            console.log('Datos que se enviarán para actualizar:', updateData);
            console.log('URL que se usará:', `/user/update/${userData.id}`);
            
            try {
                // Llamar al servicio para actualizar el usuario
                const updateResponse = await userService.updateUser(userData.id, updateData);
                console.log('Respuesta de actualización:', updateResponse);
                
                Swal.fire({
                    title: 'Éxito',
                    text: 'Perfil actualizado correctamente',
                    icon: 'success',
                    confirmButtonColor: '#FB8500'
                });
                
                setIsEditing(false);
            } catch (updateError) {
                console.error('Error detallado al actualizar:', updateError);
                
                // Mensaje de error más descriptivo
                Swal.fire({
                    title: 'Error',
                    text: `No se pudieron guardar los cambios: ${updateError.message || 'Error desconocido'}`,
                    icon: 'error',
                    confirmButtonColor: '#FB8500'
                });
            }
        } catch (error) {
            console.error('Error al guardar los cambios:', error);
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
                // Recargar los datos originales y salir del modo edición
                const fetchUserData = async () => {
                    try {
                        setLoading(true);
                        
                        // Obtener el usuario actual usando el endpoint /auth/me
                        const meResponse = await api.post('/auth/me');
                        
                        if (!meResponse || !meResponse.data) {
                            console.warn('No se pudo obtener la información del usuario desde /auth/me');
                            setLoading(false);
                            return;
                        }
                        
                        // Usar los datos del usuario desde meResponse.data
                        const basicUserData = meResponse.data;
                        
                        // Log detallado para ver la estructura exacta de los datos
                        console.log('Estructura completa de la respuesta:', JSON.stringify(basicUserData, null, 2));
                        console.log('Estructura detallada de userData:', {
                            email: basicUserData.email,
                            profile_description: basicUserData.profile_description,
                            profile_photo_path: basicUserData.profile_photo_path,
                            human: basicUserData.human,
                            roles: basicUserData.roles,
                            specialization: basicUserData.specialization
                        });
                        
                        // Mapear los datos del usuario a formData con verificaciones robustas
                        setFormData({
                            primerNombre: basicUserData.human?.first_name || '',
                            segundoNombre: basicUserData.human?.middle_name || '',
                            primerApellido: basicUserData.human?.last_name || '',
                            segundoApellido: basicUserData.human?.second_last_name || '',
                            correo: basicUserData.email || '',
                            especializacion: basicUserData.specialization?.name || '',
                            especializacion_id: basicUserData.specialization?.id || '',
                            descripcionPerfil: basicUserData.profile_description || '',
                            rol: Array.isArray(basicUserData.roles) && basicUserData.roles.length > 0 ? 
                                 basicUserData.roles[0]?.name || basicUserData.roles[0]?.role || '' : '',
                            rol_id: Array.isArray(basicUserData.roles) && basicUserData.roles.length > 0 ? 
                                   basicUserData.roles[0]?.id || '' : ''
                        });
                        
                        // Establecer la imagen de perfil si existe
                        if (basicUserData.profile_photo_path) {
                            setProfileImage(basicUserData.profile_photo_path);
                        }
                        
                        setLoading(false);
                        setIsEditing(false);
                    } catch (error) {
                        console.error('Error al obtener datos del usuario:', error);
                    } finally {
                        setLoading(false);
                        setIsEditing(false);
                    }
                };
                
                fetchUserData();
            }
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onloadend = () => {
                setProfileImage(reader.result);
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

                                <div className={styles.formGroup}>
                                    <div className={styles.formRow}>
                                        <div className={styles.formField}>
                                            <label htmlFor="primerNombre">Primer nombre</label>
                                            <input
                                                type="text"
                                                id="primerNombre"
                                                name="primerNombre"
                                                value={formData.primerNombre}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Primer nombre"
                                            />
                                        </div>
                                        <div className={styles.formField}>
                                            <label htmlFor="segundoNombre">Segundo nombre</label>
                                            <input
                                                type="text"
                                                id="segundoNombre"
                                                name="segundoNombre"
                                                value={formData.segundoNombre}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Segundo nombre"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formField}>
                                            <label htmlFor="primerApellido">Primer apellido</label>
                                            <input
                                                type="text"
                                                id="primerApellido"
                                                name="primerApellido"
                                                value={formData.primerApellido}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Primer apellido"
                                            />
                                        </div>
                                        <div className={styles.formField}>
                                            <label htmlFor="segundoApellido">Segundo apellido</label>
                                            <input
                                                type="text"
                                                id="segundoApellido"
                                                name="segundoApellido"
                                                value={formData.segundoApellido}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Segundo apellido"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formField}>
                                            <label htmlFor="correo">Correo electrónico</label>
                                            <input
                                                type="email"
                                                id="correo"
                                                name="correo"
                                                value={formData.correo}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Correo electrónico"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formField}>
                                            <label htmlFor="especializacion">Especialización</label>
                                            {isEditing ? (
                                                <select
                                                    id="especializacion_id"
                                                    name="especializacion_id"
                                                    value={formData.especializacion_id}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Seleccione una especialización</option>
                                                    {especializaciones.map(esp => (
                                                        <option key={esp.id} value={esp.id.toString()}>
                                                            {esp.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    id="especializacion"
                                                    name="especializacion"
                                                    value={formData.especializacion}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    placeholder="Especialización"
                                                />
                                            )}
                                        </div>
                                        <div className={styles.formField}>
                                            <label htmlFor="descripcionPerfil">Descripción del perfil</label>
                                            <input
                                                type="text"
                                                id="descripcionPerfil"
                                                name="descripcionPerfil"
                                                value={formData.descripcionPerfil}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Descripción del perfil"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formField}>
                                            <label htmlFor="rol">Rol</label>
                                            {isEditing ? (
                                                isUserAdmin ? (
                                                    <select
                                                        id="rol_id"
                                                        name="rol_id"
                                                        value={formData.rol_id}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Seleccione un rol</option>
                                                        {roles.map(rol => (
                                                            <option key={rol.id} value={rol.id.toString()}>
                                                                {rol.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        id="rol"
                                                        name="rol"
                                                        value={formData.rol}
                                                        onChange={handleInputChange}
                                                        disabled={true}
                                                        placeholder="Rol"
                                                        className={styles.disabledInput}
                                                    />
                                                )
                                            ) : (
                                                <input
                                                    type="text"
                                                    id="rol"
                                                    name="rol"
                                                    value={formData.rol}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    placeholder="Rol"
                                                />
                                            )}
                                            {isEditing && !isUserAdmin && (
                                                <p className={styles.roleRestrictionMessage}>
                                                    Solo los administradores pueden cambiar el rol
                                                </p>
                                            )}
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
