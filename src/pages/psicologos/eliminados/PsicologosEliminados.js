import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layout/Header/Header';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import userService from '../../../services/user';
import styles from './styles.module.css';

/**
 * Componente para mostrar y gestionar psicólogos eliminados
 */
const PsicologosEliminados = () => {
    const navigate = useNavigate();
    const [psychologists, setPsychologists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionInProgress, setActionInProgress] = useState(false);

    useEffect(() => {
        fetchDeletedPsychologists();
    }, []);

    const fetchDeletedPsychologists = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Llamar al servicio para obtener psicólogos eliminados
            const response = await userService.getDeletedUsers();
            console.log('Respuesta de psicólogos eliminados (completa):', response);
            
            let deletedPsychologistsData = [];
            
            // Determinar la estructura de la respuesta
            if (response) {
                if (Array.isArray(response)) {
                    deletedPsychologistsData = response;
                } else if (response.data && Array.isArray(response.data)) {
                    deletedPsychologistsData = response.data;
                } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    deletedPsychologistsData = response.data.data;
                }
            }
            
            console.log('Datos de psicólogos eliminados procesados:', deletedPsychologistsData);
            
            // Inspeccionar el primer psicólogo para ver su estructura exacta
            if (deletedPsychologistsData && deletedPsychologistsData.length > 0) {
                console.log('Ejemplo de estructura de un psicólogo eliminado:', JSON.stringify(deletedPsychologistsData[0], null, 2));
                
                // Transformar los datos al formato que espera el componente
                const formattedData = deletedPsychologistsData.map(psychologist => {
                    // Crear un objeto con valores predeterminados
                    const formattedPsychologist = {
                        id: psychologist.id || 'unknown-id',
                        nombre: 'Sin nombre',
                        numeroIdentificacion: 'N/A',
                        fechaEliminacion: 'N/A',
                        email: psychologist.email || 'N/A',
                        human: psychologist.human || null
                    };
                    
                    // Formatear el nombre completo
                    if (psychologist.first_name || psychologist.last_name) {
                        formattedPsychologist.nombre = `${psychologist.first_name || ''} ${psychologist.middle_name || ''} ${psychologist.last_name || ''} ${psychologist.second_last_name || ''}`.trim();
                    } else if (psychologist.human) {
                        const human = psychologist.human;
                        formattedPsychologist.nombre = `${human.first_name || ''} ${human.middle_name || ''} ${human.last_name || ''} ${human.second_last_name || ''}`.trim();
                    }
                    
                    // Obtener el número de documento
                    if (psychologist.identification_number) {
                        formattedPsychologist.numeroIdentificacion = psychologist.identification_number;
                    } else if (psychologist.human && psychologist.human.document_number) {
                        formattedPsychologist.numeroIdentificacion = psychologist.human.document_number;
                    }
                    
                    // Formatear la fecha de eliminación
                    if (psychologist.deleted_at) {
                        try {
                            formattedPsychologist.fechaEliminacion = new Date(psychologist.deleted_at).toLocaleDateString();
                        } catch (e) {
                            console.error('Error al formatear la fecha de eliminación:', e);
                        }
                    }
                    
                    return formattedPsychologist;
                });
                
                console.log('Datos formateados de psicólogos eliminados para mostrar:', formattedData);
                setPsychologists(formattedData);
            } else {
                setPsychologists([]);
                console.warn('No se recibieron datos de psicólogos eliminados del servidor');
            }
        } catch (error) {
            console.error('Error al obtener psicólogos eliminados:', error);
            setError('No se pudieron cargar los psicólogos eliminados');
            setPsychologists([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        navigate('/psicologos');
    };

    const handleRestore = async (id) => {
        try {
            setActionInProgress(true);
            
            // Confirmación antes de restaurar
            const result = await Swal.fire({
                title: '¿Restaurar psicólogo?',
                text: '¿Estás seguro de que deseas restaurar este psicólogo?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#FB8500',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, restaurar',
                cancelButtonText: 'Cancelar'
            });
            
            if (result.isConfirmed) {
                await userService.restoreUser(id);
                
                // Actualizar la lista después de restaurar
                await fetchDeletedPsychologists();
                
                Swal.fire({
                    title: '¡Restaurado!',
                    text: 'El psicólogo ha sido restaurado correctamente',
                    icon: 'success',
                    confirmButtonColor: '#FB8500',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Error al restaurar psicólogo:', error);
            
            let errorMessage = 'No se pudo restaurar el psicólogo';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            
            Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#FB8500'
            });
        } finally {
            setActionInProgress(false);
        }
    };

    const handleForceDelete = async (id) => {
        try {
            setActionInProgress(true);
            
            // Confirmación antes de eliminar permanentemente
            const result = await Swal.fire({
                title: '¿Eliminar permanentemente?',
                text: 'Esta acción no se puede deshacer. ¿Estás seguro?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#FF3737',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar permanentemente',
                cancelButtonText: 'Cancelar'
            });
            
            if (result.isConfirmed) {
                await userService.forceDeleteUser(id);
                
                // Actualizar la lista después de eliminar
                await fetchDeletedPsychologists();
                
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El psicólogo ha sido eliminado permanentemente',
                    icon: 'success',
                    confirmButtonColor: '#FB8500',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Error al eliminar permanentemente:', error);
            
            let errorMessage = 'No se pudo eliminar el psicólogo permanentemente';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            
            Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#FB8500'
            });
        } finally {
            setActionInProgress(false);
        }
    };

    // Función para formatear el nombre completo
    const formatFullName = (psychologist) => {
        if (!psychologist) return 'N/A';
        
        if (psychologist.nombre && psychologist.nombre !== 'Sin nombre') {
            return psychologist.nombre;
        }
        
        return 'N/A';
    };

    return (
        <div className={styles.dashboard}>
            <Header variant="dashboard" />
            <div className={styles.main}>
                <Sidebar />
                <div className={styles.content}>
                    <div className={styles.contentHeader}>
                        <div className={styles.headerLeft}>
                            <button 
                                className={styles.backButton}
                                onClick={handleGoBack}
                            >
                                <ArrowLeft size={20} color="#4F46E5" />
                            </button>
                            <h3>Psicólogos Eliminados</h3>
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <p>Cargando psicólogos eliminados...</p>
                        </div>
                    ) : error ? (
                        <div className={styles.errorContainer}>
                            <p>{error}</p>
                            <button 
                                className={styles.retryButton}
                                onClick={fetchDeletedPsychologists}
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : psychologists.length === 0 ? (
                        <div className={styles.emptyContainer}>
                            <p>No hay psicólogos eliminados</p>
                        </div>
                    ) : (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Fecha de eliminación</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {psychologists.map((psychologist) => (
                                        <tr key={psychologist.id}>
                                            <td>{formatFullName(psychologist)}</td>
                                            <td>{psychologist.email || 'N/A'}</td>
                                            <td>{psychologist.fechaEliminacion || 'N/A'}</td>
                                            <td className={styles.actionsCell}>
                                                <button 
                                                    className={styles.restoreButton}
                                                    onClick={() => handleRestore(psychologist.id)}
                                                    disabled={actionInProgress}
                                                    title="Restaurar psicólogo"
                                                >
                                                    <RefreshCw size={16} color="#34C759" />
                                                </button>
                                                <button 
                                                    className={styles.deleteButton}
                                                    onClick={() => handleForceDelete(psychologist.id)}
                                                    disabled={actionInProgress}
                                                    title="Eliminar permanentemente"
                                                >
                                                    <Trash2 size={16} color="#FF3737" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PsicologosEliminados;
