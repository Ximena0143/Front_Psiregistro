import React from 'react';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';

const Publicaciones = () => {
    return (
        <div className={styles.dashboard}>
            <Header variant="dashboard" />
            <div className={styles.main}>
                <Sidebar />
                <div className={styles.content}>
                    <div className={styles.contentHeader}>
                        <h3>Publicaciones</h3>
                        <button className={styles.addButton}>
                            Nueva publicación
                        </button>
                    </div>
                    <div className={styles.publicacionesGrid}>
                        {/* Ejemplo de publicación */}
                        <div className={styles.publicacionCard}>
                            <div className={styles.imageContainer}>
                                <img src="/Images/placeholder.jpg" alt="Publicación" />
                            </div>
                            <div className={styles.cardContent}>
                                <h3>Título de la publicación</h3>
                                <p>Descripción breve de la publicación. Este es un texto de ejemplo.</p>
                                <div className={styles.cardFooter}>
                                    <span>12 Abril, 2025</span>
                                    <button className={styles.editButton}>Editar</button>
                                </div>
                            </div>
                        </div>
                        {/* Más publicaciones se agregarán aquí */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Publicaciones;
