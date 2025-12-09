import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { HelpCircle, FileText, Download, BookOpen } from 'lucide-react';
import Swal from 'sweetalert2';
import manualService from '../../services/manualService';

const Manuales = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [manuales, setManuales] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchManuales();
    }, []);

    const fetchManuales = async () => {
        try {
            setIsLoading(true);
            const response = await manualService.getManuals();
            setManuales(response.url || {});
        } catch (error) {
            console.error('Error al cargar los manuales:', error);
            setError('No se pudieron cargar los manuales. Por favor, intente más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = (url, tipo) => {
        // Verificar si la URL está disponible
        if (!url) {
            Swal.fire({
                title: 'Error',
                text: 'El manual no está disponible en este momento',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
            return;
        }

        // Abrir el PDF en una nueva pestaña
        window.open(url, '_blank');
    };

    return (
        <div className={styles.dashboard}>
            <Header variant="dashboard" />
            <div className={styles.main}>
                <Sidebar />
                <div className={styles.content}>
                    <div className={styles.contentHeader}>
                        <h3>Manuales de Ayuda</h3>
                    </div>

                    <div className={styles.description}>
                        <div className={styles.descriptionIcon}>
                            <HelpCircle size={40} color="#219EBC" />
                        </div>
                        <p>
                            Esta sección contiene los manuales que le ayudarán a navegar y utilizar 
                            todas las funcionalidades del sistema. Puede descargar los manuales 
                            haciendo clic en el botón correspondiente.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className={styles.loadingContainer}>
                            <p>Cargando manuales...</p>
                        </div>
                    ) : error ? (
                        <div className={styles.errorContainer}>
                            <p>{error}</p>
                        </div>
                    ) : Object.keys(manuales).length === 0 ? (
                        <div className={styles.emptyState}>
                            <FileText size={48} color="#ccc" />
                            <p>No hay manuales disponibles en este momento.</p>
                        </div>
                    ) : (
                        <div className={styles.manualesContainer}>
                            {manuales.usuario && (
                                <div className={styles.manualCard}>
                                    <div className={styles.manualIcon}>
                                        <BookOpen size={40} color="#219EBC" />
                                    </div>
                                    <div className={styles.manualInfo}>
                                        <h4>Manual de Usuario</h4>
                                        <p>Guía completa sobre cómo utilizar todas las funcionalidades del sistema.</p>
                                    </div>
                                    <button 
                                        className={styles.downloadButton}
                                        onClick={() => handleDownload(manuales.usuario, 'usuario')}
                                    >
                                        <Download size={20} />
                                        Ver PDF
                                    </button>
                                </div>
                            )}

                            {manuales.tecnico && (
                                <div className={styles.manualCard}>
                                    <div className={styles.manualIcon}>
                                        <FileText size={40} color="#FB8500" />
                                    </div>
                                    <div className={styles.manualInfo}>
                                        <h4>Manual Técnico</h4>
                                        <p>Documentación técnica sobre la arquitectura y configuración del sistema.</p>
                                    </div>
                                    <button 
                                        className={styles.downloadButton}
                                        onClick={() => handleDownload(manuales.tecnico, 'tecnico')}
                                    >
                                        <Download size={20} />
                                        Ver PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Manuales;
