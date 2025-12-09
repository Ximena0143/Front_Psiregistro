import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { HiUserCircle } from "react-icons/hi2";
import { FaRegUser } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { FiMenu, FiX } from "react-icons/fi"; 
import { FiClock, FiCalendar } from "react-icons/fi";
import api from '../../../services/api';
import Swal from 'sweetalert2';
import styles from './styles.module.css';
import authService from '../../../services/auth'; 

const Header = ({ variant = 'landing' }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [userName, setUserName] = useState('Usuario');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); 
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
    const navigate = useNavigate();
    
    // Función para obtener la URL firmada de la foto de perfil
    const getProfilePhotoUrl = async () => {
        try {
            const response = await api.get('/landing/user/get-profile-photo');
            
            if (response && response.data && response.data.URL) {
                setProfilePhotoUrl(response.data.URL);
                return response.data.URL;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    };
    
    // Actualizar fecha y hora cada segundo
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        
        return () => {
            clearInterval(timer);
        };
    }, []);
    
    // Cargar información del usuario al montar el componente
    useEffect(() => {
        // Función para obtener datos del usuario
        const fetchUserData = async () => {
            try {
                // Obtener la URL firmada de la foto de perfil
                await getProfilePhotoUrl();
                
                // Intentar obtener datos actualizados del backend
                const userData = await authService.me();
                
                if (userData) {
                    let displayName = 'Usuario';
                    
                    // Intentar obtener nombre y apellido
                    if (userData.first_name && userData.last_name) {
                        displayName = `${userData.first_name} ${userData.last_name}`;
                    } else if (userData.first_name) {
                        displayName = userData.first_name;
                    } else if (userData.name) {
                        displayName = userData.name;
                    } else if (userData.email) {
                        // Extraer nombre del email (parte antes del @)
                        const emailParts = userData.email.split('@');
                        if (emailParts.length > 0) {
                            // Verificar si el email tiene formato nombre.apellido
                            const nameParts = emailParts[0].split('.');
                            if (nameParts.length > 1) {
                                // Formato nombre.apellido@dominio
                                const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
                                const lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1);
                                displayName = `${firstName} ${lastName}`;
                            } else {
                                // Convertir primera letra a mayúscula y reemplazar puntos por espacios
                                const emailName = emailParts[0]
                                    .replace(/\./g, ' ')
                                    .split(' ')
                                    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                                    .join(' ');
                                    
                                // Añadir un apellido basado en el dominio si es posible
                                if (emailParts.length > 1) {
                                    const domain = emailParts[1].split('.')[0];
                                    const domainName = domain.charAt(0).toUpperCase() + domain.slice(1);
                                    displayName = `${emailName} ${domainName !== 'Example' ? domainName : ''}`;
                                } else {
                                    displayName = emailName;
                                }
                            }
                        }
                    }
                    
                    setUserName(displayName);
                    return; // Salir temprano si ya procesamos los datos del backend
                }
            } catch (error) {
                // Silenciar error y usar fallback
            }
            
            // Fallback: Obtener datos del localStorage
            const userStr = localStorage.getItem('auth_user');
            
            // Intentar parsear el JSON
            try {
                if (userStr) {
                    const userFromStorage = JSON.parse(userStr);
                    
                    // Usar directamente los datos del localStorage
                    if (userFromStorage) {
                        let displayName = 'Usuario';
                        
                        // Intentar obtener nombre y apellido
                        if (userFromStorage.first_name && userFromStorage.last_name) {
                            displayName = `${userFromStorage.first_name} ${userFromStorage.last_name}`;
                        } else if (userFromStorage.first_name) {
                            displayName = userFromStorage.first_name;
                        } else if (userFromStorage.name) {
                            displayName = userFromStorage.name;
                        } else if (userFromStorage.email) {
                            // Extraer nombre del email (parte antes del @)
                            const emailParts = userFromStorage.email.split('@');
                            if (emailParts.length > 0) {
                                // Verificar si el email tiene formato nombre.apellido
                                const nameParts = emailParts[0].split('.');
                                if (nameParts.length > 1) {
                                    // Formato nombre.apellido@dominio
                                    const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
                                    const lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1);
                                    displayName = `${firstName} ${lastName}`;
                                } else {
                                    // Convertir primera letra a mayúscula y reemplazar puntos por espacios
                                    const emailName = emailParts[0]
                                        .replace(/\./g, ' ')
                                        .split(' ')
                                        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                                        .join(' ');
                                        
                                    // Añadir un apellido basado en el dominio si es posible
                                    if (emailParts.length > 1) {
                                        const domain = emailParts[1].split('.')[0];
                                        const domainName = domain.charAt(0).toUpperCase() + domain.slice(1);
                                        displayName = `${emailName} ${domainName !== 'Example' ? domainName : ''}`;
                                    } else {
                                        displayName = emailName;
                                    }
                                }
                            }
                        }
                        
                        setUserName(displayName);
                    }
                }
            } catch (error) {
                // Silenciar error
            }
        };
        
        // Ejecutar la función asíncrona
        fetchUserData();
    }, []);
    
    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };
    
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
        // Prevenir scroll cuando el menú está abierto
        if (!mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    };
    
    // Cerrar el menú móvil cuando se hace clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event) => {
            const navHeader = document.querySelector(`.${styles.nav_header}`);
            const menuToggle = document.querySelector(`.${styles.menu_toggle}`);
            
            if (mobileMenuOpen && navHeader && !navHeader.contains(event.target) && 
                menuToggle && !menuToggle.contains(event.target)) {
                setMobileMenuOpen(false);
                document.body.style.overflow = 'auto';
            }
        };

        if (mobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mobileMenuOpen]);
    
    // Función para formatear la fecha (ej: Viernes, 15 de Noviembre de 2025)
    const formatDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-ES', options).replace(/^\w/, (c) => c.toUpperCase());
    };
    
    // Función para formatear la hora (ej: 06:23 PM)
    const formatTime = (date) => {
        const options = { hour: '2-digit', minute: '2-digit', hour12: true };
        return date.toLocaleTimeString('es-ES', options);
    };
    
    const handleLogout = async () => {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro que deseas cerrar la sesión?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#FB8500',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Llamar a la función de logout del servicio de autenticación
                    await authService.logout();
                    
                    // Mostrar mensaje de éxito
                    Swal.fire({
                        title: 'Sesión cerrada',
                        text: 'Has cerrado sesión correctamente',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        // Redirigir al login y prevenir navegación hacia atrás a páginas protegidas
                        navigate('/login', { replace: true });
                    });
                } catch (error) {
                    // Aún con error, limpiamos el almacenamiento local y redirigimos
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                    
                    // Informar al usuario
                    Swal.fire({
                        title: 'Sesión cerrada',
                        text: 'La sesión ha sido cerrada, pero hubo un problema al comunicarse con el servidor.',
                        icon: 'warning',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        navigate('/login', { replace: true });
                    });
                }
            }
        });
        
        // Cerrar el menú desplegable después de hacer clic
        setShowMenu(false);
    };

    if (variant === 'dashboard') {
        return (
            <header className={styles.header} data-variant="dashboard">
                <div className={styles.container_header}>
                    <div className={styles.logo}>
                        <img src="/Images/Logo2.png" alt="Logo" />
                        <p>Righteous</p>
                    </div>
                    
                    <div className={styles.dateTimeContainer}>
                        <div className={styles.dateContainer}>
                            <FiCalendar size={16} className={styles.dateTimeIcon} />
                            <span className={styles.dateText}>{formatDate(currentDateTime)}</span>
                        </div>
                        <div className={styles.timeContainer}>
                            <FiClock size={16} className={styles.dateTimeIcon} />
                            <span className={styles.timeText}>{formatTime(currentDateTime)}</span>
                        </div>
                    </div>
                    
                    <nav className={styles.nav_header}>
                        <p className={styles.welcome_text}>Bienvenid@</p>
                        <div className={styles.user} onClick={toggleMenu}>
                            <p className={styles.name_user}>{userName}</p>
                            {profilePhotoUrl ? (
                                <div className={styles.profile_photo_container}>
                                    <img 
                                        src={profilePhotoUrl} 
                                        alt="Foto de perfil" 
                                        className={styles.profile_photo} 
                                    />
                                </div>
                            ) : (
                                <HiUserCircle className={styles.icon_user} size={35} />
                            )}
                            {showMenu && (
                                <div className={styles.dropdown}>
                                    <Link to="/perfil">
                                        <p>
                                            <FaRegUser style={{ marginRight: '8px' }} size={14} />
                                            Ver perfil
                                        </p>
                                    </Link>
                                    <p onClick={handleLogout}>
                                        <IoLogOutOutline style={{ marginRight: '8px' }} size={16} />
                                        Cerrar sesión
                                    </p>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </header>
        );
    }

    return (
        <header className={styles.header} data-variant="landing">
            <div className={styles.container_header}>
                <div className={styles.logo}>
                    <img src="/Images/Logo.jpeg" alt="Logo" />
                    <p>Righteous</p>
                </div>
                
                {/* Botón de menú hamburguesa para móvil */}
                <div className={styles.menu_toggle} onClick={toggleMobileMenu}>
                    {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </div>
                
                {/* Overlay para cuando el menú está abierto */}
                {mobileMenuOpen && <div className={styles.menu_overlay} onClick={toggleMobileMenu}></div>}
                
                <nav className={`${styles.nav_header} ${mobileMenuOpen ? styles.show : ''}`}>
                    <ul className={styles.nav_links}>
                        <li><a href="#Inicio" onClick={mobileMenuOpen ? toggleMobileMenu : undefined}><button className={styles.boton_header}>Inicio</button></a></li>
                        <li><a href="#Nosotros" onClick={mobileMenuOpen ? toggleMobileMenu : undefined}><button className={styles.boton_header}>Nosotros</button></a></li>
                        <li><a href="#Servicios" onClick={mobileMenuOpen ? toggleMobileMenu : undefined}><button className={styles.boton_header}>Servicios</button></a></li>
                        <li><a href="#Contacto" onClick={mobileMenuOpen ? toggleMobileMenu : undefined}><button className={styles.boton_header}>Contacto</button></a></li>
                        <li><Link to="/login" onClick={mobileMenuOpen ? toggleMobileMenu : undefined}><button className={styles.boton_header_sesion}>Iniciar Sesión</button></Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
