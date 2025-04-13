import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { HiUserCircle } from "react-icons/hi2";
import { FaRegBell } from "react-icons/fa6";
import styles from './styles.module.css';

const Header = ({ variant = 'landing' }) => {
    const [showMenu, setShowMenu] = useState(false);

    const toggleMenu = () => {
        setShowMenu(!showMenu);
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
                            <p className={styles.name_user}>Miranda</p>
                            <HiUserCircle className={styles.icon_user} size={35}/>
                            {showMenu && (
                                <div className={styles.dropdown}>
                                    <p>Ver perfil</p>
                                    <p>Cerrar sesión</p>
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
