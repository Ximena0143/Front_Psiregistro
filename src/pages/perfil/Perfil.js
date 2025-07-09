import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { ArrowLeft, Edit } from 'lucide-react';
import styles from './styles.module.css';
import userService from '../../services/user';
import api from '../../services/api';
import Swal from 'sweetalert2';

const Perfil = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        correo: '',
        especializacion: '',
        descripcionPerfil: '',
        rol: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                
                // Primero, intentamos obtener el usuario actual usando el endpoint /auth/me
                const meResponse = await api.post('/auth/me');
                console.log('Respuesta completa de /auth/me:', meResponse);
                
                if (!meResponse || !meResponse.data || !meResponse.data.email) {
                    console.warn('No se pudo obtener el email del usuario desde /auth/me');
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo obtener la información del usuario',
                        icon: 'error',
                        confirmButtonColor: '#FB8500'
                    });
                    setLoading(false);
                    return;
                }
                
                // Obtenemos el email del usuario
                const userEmail = meResponse.data.email;
                
                // Obtenemos todos los usuarios y buscamos el que coincide con el email
                const usersResponse = await userService.getUsers();
                
                if (!usersResponse || !usersResponse.data || !Array.isArray(usersResponse.data)) {
                    console.warn('No se pudieron obtener los usuarios');
                    setLoading(false);
                    return;
                }
                
                // Buscamos el usuario con el email correspondiente
                const userData = usersResponse.data.find(user => user.email === userEmail);
                
                if (!userData) {
                    console.warn('No se encontró el usuario con el email:', userEmail);
                    setLoading(false);
                    return;
                }
                
                console.log('Usuario encontrado:', userData);
                
                if (userData && userData.human) {
                    // Mapear los datos del backend al formato del formulario
                    setFormData({
                        primerNombre: userData.human.first_name || '',
                        segundoNombre: userData.human.middle_name || '',
                        primerApellido: userData.human.last_name || '',
                        segundoApellido: userData.human.second_last_name || '',
                        correo: userData.email || '',
                        especializacion: userData.specialization?.name || '',
                        descripcionPerfil: userData.profile_description || '',
                        rol: userData.roles && userData.roles.length > 0 ? userData.roles[0]?.role || '' : ''
                    });
                    
                    // Si hay una foto de perfil, la establecemos
                    if (userData.profile_photo_path) {
                        setProfileImage(userData.profile_photo_path);
                    }
                }
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
            
            // Primero, obtenemos el email del usuario actual
            const meResponse = await api.post('/auth/me');
            
            if (!meResponse || !meResponse.data || !meResponse.data.email) {
                throw new Error('No se pudo obtener el email del usuario');
            }
            
            const userEmail = meResponse.data.email;
            
            // Obtenemos todos los usuarios y buscamos el ID del que coincide con el email
            const usersResponse = await userService.getUsers();
            
            if (!usersResponse || !usersResponse.data || !Array.isArray(usersResponse.data)) {
                throw new Error('No se pudieron obtener los usuarios');
            }
            
            // Buscamos el usuario con el email correspondiente
            const user = usersResponse.data.find(user => user.email === userEmail);
            
            if (!user || !user.id) {
                throw new Error('No se encontró el usuario con el email: ' + userEmail);
            }
            
            const userId = user.id;
            
            // Preparar los datos para la actualización
            const updateData = {
                // Datos del human
                first_name: formData.primerNombre,
                middle_name: formData.segundoNombre || null, // Asegurarnos de que no sea undefined
                last_name: formData.primerApellido,
                second_last_name: formData.segundoApellido || null, // Asegurarnos de que no sea undefined
                
                // Datos del user
                email: formData.correo,
                password: user.password || 'password123', // Siempre enviar una contraseña
                specialization_id: user.specialization?.id || 1,
                profile_description: formData.descripcionPerfil || '',
                profile_photo_path: user.profile_photo_path || 'default.jpg',
                
                // Roles (siempre debe ser un array con al menos un elemento)
                // Como la API no devuelve IDs de roles, usamos un valor por defecto
                roles: [1] // ID por defecto para el rol
            };
            
            console.log('Datos que se enviarán para actualizar:', updateData);
            console.log('URL que se usará:', `/user/update/${userId}`);
            
            try {
                // Llamar al servicio para actualizar el usuario
                const updateResponse = await userService.updateUser(userId, updateData);
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
                        <button 
                            className={styles.addButton} 
                            onClick={isEditing ? handleSave : handleEditToggle}
                            disabled={loading}
                        >
                            {isEditing ? 'Guardar' : 'Editar'}
                        </button>
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
                                            <input
                                                type="text"
                                                id="especializacion"
                                                name="especializacion"
                                                value={formData.especializacion}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Especialización"
                                            />
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
                                            <input
                                                type="text"
                                                id="rol"
                                                name="rol"
                                                value={formData.rol}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Rol"
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
