import React from 'react';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';

const TestPsi = () => {
    return (
        <div className={styles.dashboard}>
            <Header variant="dashboard" />
            <div className={styles.main}>
                <Sidebar />
                <div className={styles.content}>
                    <div className={styles.contentHeader}>
                        <h3>Test Psicológicos</h3>
                        <div className={styles.actions}>
                            <button className={styles.addButton}>
                                Subir test
                            </button>
                        </div>
                    </div>
                    <div className={styles.testGrid}>
                        <div className={styles.testCard}>
                            <h3>Test de Ansiedad</h3>
                            <p>Evaluación del nivel de ansiedad y sus manifestaciones.</p>
                            <div className={styles.cardActions}>
                                <button className={styles.viewButton}>Ver detalles</button>
                                <button className={styles.assignButton}>Asignar</button>
                            </div>
                        </div>
                        <div className={styles.testCard}>
                            <h3>Test de Depresión</h3>
                            <p>Evaluación de síntomas depresivos y su intensidad.</p>
                            <div className={styles.cardActions}>
                                <button className={styles.viewButton}>Ver detalles</button>
                                <button className={styles.assignButton}>Asignar</button>
                            </div>
                        </div>
                        <div className={styles.testCard}>
                            <h3>Test de Personalidad</h3>
                            <p>Evaluación de rasgos de personalidad y comportamiento.</p>
                            <div className={styles.cardActions}>
                                <button className={styles.viewButton}>Ver detalles</button>
                                <button className={styles.assignButton}>Asignar</button>
                            </div>
                        </div>
                        {/* Más tests se agregarán aquí */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestPsi;
