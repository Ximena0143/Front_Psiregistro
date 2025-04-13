import React from 'react';
import styles from './styles.module.css';
import { sidebarItems } from './sidebarConfig';
import SidebarItem from './SidebarItem';

const Sidebar = () => {
    return (
        <div className={styles.sidebar}>
            <ul>
                {sidebarItems.map((item, index) => (
                    <SidebarItem
                        key={index}
                        title={item.title}
                        path={item.path}
                        icon={item.icon}
                    />
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
