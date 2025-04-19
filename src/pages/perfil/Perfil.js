import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { ArrowLeft, Edit, Eye, EyeOff } from 'lucide-react';
import styles from './styles.module.css';

const Perfil = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        primerNombre: 'Miranda',
        segundoNombre: '',
        primerApellido: 'Rodríguez',
        segundoApellido: 'Gómez',
        correo: 'miranda.rodriguez@righteous.com',
        password: 'Hola123'
    });

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

    const handleSave = () => {
        // Aquí iría la lógica para guardar los cambios al perfil
        console.log('Guardando datos:', formData);
        setIsEditing(false);
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
                        >
                            {isEditing ? 'Guardar' : 'Editar'}
                        </button>
                    </div>

                    <div className={styles.profileContainer}>

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
                                    <div className={styles.formField}>
                                        <label htmlFor="password">Contraseña</label>
                                        <div className={styles.passwordField}>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="Contraseña"
                                            />
                                            {isEditing && (
                                                <div 
                                                    className={styles.eyeIcon} 
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? 
                                                        <Eye size={18} color="#FB8500" /> : 
                                                        <EyeOff size={18} color="#FB8500" />
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Perfil;
