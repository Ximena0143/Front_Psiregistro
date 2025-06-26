import React from 'react';
import { NavLink } from "react-router-dom";
import styles from './styles.module.css';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

const SidebarItem = ({ title, path, icon: Icon, hasSubItems, isExpanded, onClick, isSubItem }) => {
    return (
        <li className={isSubItem ? styles.subItem : ''}>
            <NavLink 
                to={path} 
                className={({ isActive }) => isActive ? styles.active : ""}
            >
                <Icon className={styles.icon_menu} />
                <p>{title}</p>
            </NavLink>
            {hasSubItems && (
                <span 
                    className={styles.expandIcon}
                    onClick={onClick}
                >
                    {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                </span>
            )}
        </li>
    );
};

export default SidebarItem;
