import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { HiUserCircle } from "react-icons/hi2";
import { FaRegBell } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import Swal from 'sweetalert2';
import styles from './styles.module.css';
import authService from '../../../services/auth'; // Importar el servicio de autenticación

const Header = ({ variant = 'landing' }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [userName, setUserName] = useState('Usuario');
    const navigate = useNavigate();
    
    // Cargar información del usuario al montar el componente
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            // Si hay usuario, mostrar su nombre o email
            setUserName(currentUser.name || currentUser.email || 'Usuario');
        }
    }, []);

    const toggleMenu = () => {
        setShowMenu(!showMenu);
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
                        <FaRegBell className={styles.icon} size={29} />
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
                <nav className={styles.nav_header}>
                    <ul className={styles.nav_links}>
                        <li><a href="#Inicio"><button className={styles.boton_header}>Inicio</button></a></li>
                        <li><a href="#Nosotros"><button className={styles.boton_header}>Nosotros</button></a></li>
                        <li><a href="#Servicios"><button className={styles.boton_header}>Servicios</button></a></li>
                        <li><a href="#Contacto"><button className={styles.boton_header}>Contacto</button></a></li>
                        <li><Link to="/login"><button className={styles.boton_header_sesion}>Iniciar Sesión</button></Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
