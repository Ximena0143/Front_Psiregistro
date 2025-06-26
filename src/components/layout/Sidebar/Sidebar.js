import React, { useState } from 'react';
import styles from './styles.module.css';
import { sidebarItems } from './sidebarConfig';
import SidebarItem from './SidebarItem';

const Sidebar = () => {
    const [expandedItems, setExpandedItems] = useState({});

    const toggleExpand = (index) => {
        setExpandedItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    return (
        <div className={styles.sidebar}>
            <ul>
                {sidebarItems.map((item, index) => (
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
