import React from 'react';
import { NavLink } from "react-router-dom";
import styles from './styles.module.css';

const SidebarItem = ({ title, path, icon: Icon }) => {
    return (
        <li>
            <NavLink 
                to={path} 
                className={({ isActive }) => isActive ? styles.active : ""}
            >
                <Icon className={styles.icon_menu} />
                <p>{title}</p>
            </NavLink>
        </li>
    );
};

export default SidebarItem;
