import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { HiUserCircle } from "react-icons/hi2";
import { FaRegUser } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { FiMenu, FiX } from "react-icons/fi"; 
import Swal from 'sweetalert2';
import styles from './styles.module.css';
import authService from '../../../services/auth'; 

const Header = ({ variant = 'landing' }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [userName, setUserName] = useState('Usuario');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); 
    const navigate = useNavigate();
    
    // Cargar información del usuario al montar el componente
    useEffect(() => {
        // Función para obtener datos del usuario
        const fetchUserData = async () => {
            try {
                // Intentar obtener datos actualizados del backend
                console.log('Intentando obtener datos actualizados del usuario desde el backend...');
                const userData = await authService.me();
                
                if (userData) {
                    console.log('Datos obtenidos correctamente del backend:', userData);
                    let displayName = 'Usuario';
                    
                    // Intentar obtener nombre y apellido
                    if (userData.first_name && userData.last_name) {
                        displayName = `${userData.first_name} ${userData.last_name}`;
                        console.log('Usando first_name y last_name del backend:', displayName);
                    } else if (userData.first_name) {
                        displayName = userData.first_name;
                        console.log('Usando solo first_name del backend:', displayName);
                    } else if (userData.name) {
                        displayName = userData.name;
                        console.log('Usando name del backend:', displayName);
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
                            console.log('Usando email del backend:', displayName);
                        }
                    }
                    
                    setUserName(displayName);
                    return; // Salir temprano si ya procesamos los datos del backend
                }
            } catch (error) {
                console.error('Error al obtener datos del usuario desde el backend:', error);
                console.log('Usando datos del localStorage como fallback...');
            }
            
            // Fallback: Obtener datos del localStorage
            const userStr = localStorage.getItem('auth_user');
            console.log('Usuario en localStorage (raw):', userStr);
            
            // Intentar parsear el JSON
            try {
                if (userStr) {
                    const userFromStorage = JSON.parse(userStr);
                    console.log('Usuario parseado desde localStorage:', userFromStorage);
                    
                    // Depurar todos los campos disponibles
                    console.log('Campos disponibles:', {
                        first_name: userFromStorage.first_name,
                        last_name: userFromStorage.last_name,
                        name: userFromStorage.name,
                        email: userFromStorage.email,
                        id: userFromStorage.id,
                        roles: userFromStorage.roles
                    });
                    
                    // Usar directamente los datos del localStorage
                    if (userFromStorage) {
                        let displayName = 'Usuario';
                        
                        // Intentar obtener nombre y apellido
                        if (userFromStorage.first_name && userFromStorage.last_name) {
                            displayName = `${userFromStorage.first_name} ${userFromStorage.last_name}`;
                            console.log('Usando first_name y last_name desde localStorage:', displayName);
                        } else if (userFromStorage.first_name) {
                            displayName = userFromStorage.first_name;
                            console.log('Usando first_name desde localStorage:', displayName);
                        } else if (userFromStorage.name) {
                            displayName = userFromStorage.name;
                            console.log('Usando name desde localStorage:', displayName);
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
                                console.log('Usando email desde localStorage:', displayName);
                            }
                        }
                        
                        setUserName(displayName);
                    }
                }
            } catch (error) {
                console.error('Error al parsear usuario desde localStorage:', error);
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
                    
                    console.log('Sesión cerrada correctamente');
                    
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
                    console.error('Error al cerrar sesión:', error);
                    
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
                    <nav className={styles.nav_header}>
                        <p className={styles.welcome_text}>Bienvenid@</p>
                        <div className={styles.user} onClick={toggleMenu}>
                            <p className={styles.name_user}>{userName}</p>
                            <HiUserCircle className={styles.icon_user} size={35}/>
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
