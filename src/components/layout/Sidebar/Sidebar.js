import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { sidebarItems } from './sidebarConfig';
import SidebarItem from './SidebarItem';
import authService from '../../../services/auth';
import { Menu } from 'lucide-react';

const Sidebar = () => {
    const [expandedItems, setExpandedItems] = useState({});
    const [filteredItems, setFilteredItems] = useState([]);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    
    useEffect(() => {
        // Verificar si el usuario es admin
        const isAdmin = authService.isAdmin();
        
        // Si es admin, mostrar todos los elementos
        // Si es doctor, filtrar la sección de psicólogos
        const items = sidebarItems.filter(item => {
            if (item.title === 'Psicologos' && !isAdmin) {
                return false; // Ocultar psicólogos para no-admin
            }
            return true;
        });
        
        setFilteredItems(items);
        
        // Añadir event listener para cerrar el sidebar cuando se hace clic fuera de él en móviles
        const handleClickOutside = (event) => {
            const sidebar = document.getElementById('mobile-sidebar');
            const toggleButton = document.getElementById('sidebar-toggle');
            
            if (sidebar && !sidebar.contains(event.target) && 
                toggleButton && !toggleButton.contains(event.target)) {
                setIsMobileOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        
        // Detectar cambios de tamaño de pantalla
        const handleResize = () => {
            if (window.innerWidth > 576) {
                setIsMobileOpen(false);
            }
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const toggleExpand = (index) => {
        setExpandedItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };
    
    const toggleMobileSidebar = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    // Si aún no se han filtrado los elementos, mostrar los originales
    const itemsToRender = filteredItems.length > 0 ? filteredItems : sidebarItems;

    return (
        <>
            {/* Botón para mostrar/ocultar sidebar en móviles */}
            <button 
                id="sidebar-toggle"
                className={styles.toggleButton} 
                onClick={toggleMobileSidebar}
                aria-label="Toggle sidebar"
            >
                <Menu size={24} />
            </button>
            
            <div 
                id="mobile-sidebar"
                className={`${styles.sidebar} ${isMobileOpen ? styles.open : ''}`}
            >
                <ul>
                    {itemsToRender.map((item, index) => (
                        <React.Fragment key={index}>
                            <SidebarItem
                                title={item.title}
                                path={item.path}
                                icon={item.icon}
                                hasSubItems={item.subItems && item.subItems.length > 0}
                                isExpanded={expandedItems[index]}
                                onClick={() => {
                                    if (item.subItems) {
                                        toggleExpand(index);
                                    } else if (window.innerWidth <= 576) {
                                        // Cerrar sidebar en móviles al hacer clic en un elemento sin submenú
                                        setIsMobileOpen(false);
                                    }
                                }}
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
                                            onClick={() => {
                                                if (window.innerWidth <= 576) {
                                                    // Cerrar sidebar en móviles al hacer clic en un subitem
                                                    setIsMobileOpen(false);
                                                }
                                            }}
                                        />
                                    ))}
                                </ul>
                            )}
                        </React.Fragment>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default Sidebar;
