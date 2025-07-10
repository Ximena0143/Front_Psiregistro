import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { sidebarItems } from './sidebarConfig';
import SidebarItem from './SidebarItem';
import authService from '../../../services/auth';

const Sidebar = () => {
    const [expandedItems, setExpandedItems] = useState({});
    const [filteredItems, setFilteredItems] = useState([]);
    
    useEffect(() => {
        // Obtener información del usuario actual
        const currentUser = authService.getCurrentUser();
        console.log('Usuario actual en Sidebar:', currentUser);
        
        // Verificar si el usuario es admin
        const isAdmin = authService.isAdmin();
        console.log('¿El usuario es administrador?', isAdmin);
        
        // Si es admin, mostrar todos los elementos
        // Si es doctor, filtrar la sección de psicólogos
        const items = sidebarItems.filter(item => {
            if (item.title === 'Psicologos' && !isAdmin) {
                console.log('Ocultando sección de psicólogos porque el usuario no es admin');
                return false; // Ocultar psicólogos para no-admin
            }
            return true;
        });
        
        console.log('Elementos del sidebar después de filtrar:', items);
        setFilteredItems(items);
    }, []);

    const toggleExpand = (index) => {
        setExpandedItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Si aún no se han filtrado los elementos, mostrar los originales
    const itemsToRender = filteredItems.length > 0 ? filteredItems : sidebarItems;

    return (
        <div className={styles.sidebar}>
            <ul>
                {itemsToRender.map((item, index) => (
                    <React.Fragment key={index}>
                        <SidebarItem
                            title={item.title}
                            path={item.path}
                            icon={item.icon}
                            hasSubItems={item.subItems && item.subItems.length > 0}
                            isExpanded={expandedItems[index]}
                            onClick={() => item.subItems && toggleExpand(index)}
                        />
                        {item.subItems && expandedItems[index] && (
                            <ul className={styles.subMenu}>
                                {item.subItems.map((subItem, subIndex) => (
                                    <SidebarItem
                                        key={`${index}-${subIndex}`}
                                        title={subItem.title}
                                        path={subItem.path}
                                        icon={subItem.icon}
                                        isSubItem={true}
                                    />
                                ))}
                            </ul>
                        )}
                    </React.Fragment>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
