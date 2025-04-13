import React from 'react';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';

const Documentos = () => {
    return (
        <div className={styles.dashboard}>
            <Header variant="dashboard" />
            <div className={styles.main}>
                <Sidebar />
                <div className={styles.content}>
                    <h2>Documentos</h2>
                    <div className={styles.documentosContainer}>
                        <div className={styles.uploadSection}>
                            <h3>Subir nuevo documento</h3>
                            <button className={styles.uploadButton}>
                                Subir documento
                            </button>
                        </div>
                        <div className={styles.documentsList}>
                            <h3>Documentos recientes</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Aquí irán los documentos */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Documentos;
