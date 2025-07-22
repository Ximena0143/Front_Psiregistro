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

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                
                // Cargar especializaciones
                await fetchEspecializaciones();
                
                // Obtener el usuario actual usando el endpoint /auth/me
                const meResponse = await api.post('/auth/me');
                
                if (!meResponse || !meResponse.data) {
                    setLoading(false);
                    return;
                }
                
                // Verificar si el usuario es administrador
                setIsUserAdmin(isAdmin());
                
                // Usar los datos del usuario desde meResponse.data
                const basicUserData = meResponse.data;
                
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
                // Recargar los datos originales y salir del modo edición
                const fetchUserData = async () => {
                    try {
                        setLoading(true);
                        
                        // Obtener el usuario actual usando el endpoint /auth/me
                        const meResponse = await api.post('/auth/me');
                        
                        if (!meResponse || !meResponse.data) {
                            setLoading(false);
                            return;
                        }
                        
                        // Usar los datos del usuario desde meResponse.data
                        const basicUserData = meResponse.data;
                        
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
