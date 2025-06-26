import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layout/Header/Header';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import styles from './styles.module.css';
import patientService from '../../../services/patient';

const PacientesEliminados = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionInProgress, setActionInProgress] = useState(false);

    useEffect(() => {
        fetchDeletedPatients();
    }, []);

    const fetchDeletedPatients = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Llamar al servicio para obtener pacientes eliminados
            const response = await patientService.getDeletedPatients();
            console.log('Respuesta de pacientes eliminados (completa):', response);
            
            let deletedPatientsData = [];
            
            // Determinar la estructura de la respuesta
            if (response) {
                if (Array.isArray(response)) {
                    deletedPatientsData = response;
                } else if (response.data && Array.isArray(response.data)) {
                    deletedPatientsData = response.data;
                } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    deletedPatientsData = response.data.data;
                }
            }
            
            console.log('Datos de pacientes eliminados procesados:', deletedPatientsData);
            
            // Inspeccionar el primer paciente para ver su estructura exacta
            if (deletedPatientsData && deletedPatientsData.length > 0) {
                console.log('Ejemplo de estructura de un paciente eliminado:', JSON.stringify(deletedPatientsData[0], null, 2));
                
                // Transformar los datos al formato que espera el componente
                const formattedData = deletedPatientsData.map(patient => {
                    // Asegurarse de que patient.human existe
                    if (!patient.human) {
                        console.warn('Paciente eliminado sin datos de human:', patient);
                        return {
                            id: patient.id,
                            nombre: 'Datos incompletos',
                            numeroIdentificacion: 'N/A',
                            fechaEliminacion: patient.deleted_at ? new Date(patient.deleted_at).toLocaleDateString() : 'N/A'
                        };
                    }
                    
                    // Verificar la estructura de document_number y deleted_at
                    console.log(`Paciente eliminado ID ${patient.id} - document_number:`, patient.human.document_number);
                    console.log(`Paciente eliminado ID ${patient.id} - deleted_at:`, patient.deleted_at);
                    
                    // Acceder a document_number de manera segura
                    // En algunos casos, document_number podría estar en patient.human.document_number
                    // En otros casos, podría estar directamente en patient.document_number
                    let documentNumber = 'N/A';
                    if (patient.human && patient.human.document_number) {
                        documentNumber = patient.human.document_number;
                    } else if (patient.document_number) {
                        documentNumber = patient.document_number;
                    } else if (patient.human && patient.human.identification_number) {
                        documentNumber = patient.human.identification_number;
                    } else if (patient.identification_number) {
                        documentNumber = patient.identification_number;
                    }
                    
                    // Formatear el nombre completo
                    const fullName = `${patient.human.first_name || ''} ${patient.human.middle_name || ''} ${patient.human.last_name || ''} ${patient.human.second_last_name || ''}`.trim();
                    
                    // Formatear la fecha de eliminación
                    let deletedAt = 'N/A';
                    if (patient.deleted_at) {
                        try {
                            deletedAt = new Date(patient.deleted_at).toLocaleDateString();
                        } catch (e) {
                            console.error('Error al formatear la fecha de eliminación:', e);
                        }
                    }
                    
                    return {
                        id: patient.id,
                        nombre: fullName || 'Sin nombre',
                        numeroIdentificacion: documentNumber,
                        fechaEliminacion: deletedAt
                    };
                });
                
                console.log('Datos formateados de pacientes eliminados para mostrar:', formattedData);
                setPatients(formattedData);
            } else {
                setPatients([]);
                console.warn('No se recibieron datos de pacientes eliminados del servidor');
            }
        } catch (error) {
            console.error('Error al obtener pacientes eliminados:', error);
            setError('No se pudieron cargar los pacientes eliminados');
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        navigate('/dashboard');
    };

    const handleRestore = async (id) => {
        try {
            setActionInProgress(true);
            
            // Confirmación antes de restaurar
            const result = await Swal.fire({
                title: '¿Restaurar paciente?',
                text: '¿Estás seguro de que deseas restaurar este paciente?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#FB8500',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, restaurar',
                cancelButtonText: 'Cancelar'
            });
            
            if (result.isConfirmed) {
                await patientService.restorePatient(id);
                
                // Actualizar la lista después de restaurar
                await fetchDeletedPatients();
                
                Swal.fire({
                    title: '¡Restaurado!',
                    text: 'El paciente ha sido restaurado correctamente',
                    icon: 'success',
                    confirmButtonColor: '#FB8500',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Error al restaurar paciente:', error);
            
            let errorMessage = 'No se pudo restaurar el paciente';
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
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar permanentemente',
                cancelButtonText: 'Cancelar'
            });
            
            if (result.isConfirmed) {
                await patientService.forceDeletePatient(id);
                
                // Actualizar la lista después de eliminar
                await fetchDeletedPatients();
                
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El paciente ha sido eliminado permanentemente',
                    icon: 'success',
                    confirmButtonColor: '#FB8500',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Error al eliminar permanentemente:', error);
            
            let errorMessage = 'No se pudo eliminar el paciente permanentemente';
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
    const formatFullName = (patient) => {
        if (!patient || !patient.human) return 'N/A';
        
        const { first_name, middle_name, last_name, second_last_name } = patient.human;
        const names = [first_name, middle_name].filter(Boolean).join(' ');
        const surnames = [last_name, second_last_name].filter(Boolean).join(' ');
        
        return `${names} ${surnames}`.trim();
    };

    return (
        <div className={styles.dashboard}>
            <Header variant="dashboard" />
            <div className={styles.main}>
                <Sidebar />
                <div className={styles.content}>
                    <div className={styles.contentHeader}>
                        <div className={styles.headerLeft}>
                            <button className={styles.backButton} onClick={handleGoBack}>
                                <ArrowLeft size={20} />
                            </button>
                            <h3>Pacientes Eliminados</h3>
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <p>Cargando pacientes eliminados...</p>
                        </div>
                    ) : error ? (
                        <div className={styles.errorContainer}>
                            <p>{error}</p>
                            <button 
                                className={styles.retryButton}
                                onClick={fetchDeletedPatients}
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : patients.length === 0 ? (
                        <div className={styles.emptyContainer}>
                            <p>No hay pacientes eliminados</p>
                        </div>
                    ) : (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Identificación</th>
                                        <th>Correo</th>
                                        <th>Fecha de eliminación</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map((patient) => (
                                        <tr key={patient.id}>
                                            <td>{formatFullName(patient)}</td>
                                            <td>{patient.human?.document_number || 'N/A'}</td>
                                            <td>{patient.email || 'N/A'}</td>
                                            <td>{new Date(patient.deleted_at).toLocaleDateString()}</td>
                                            <td className={styles.actionsCell}>
                                                <button 
                                                    className={styles.restoreButton}
                                                    onClick={() => handleRestore(patient.id)}
                                                    disabled={actionInProgress}
                                                    title="Restaurar paciente"
                                                >
                                                    <RefreshCw size={16} />
                                                </button>
                                                <button 
                                                    className={styles.deleteButton}
                                                    onClick={() => handleForceDelete(patient.id)}
                                                    disabled={actionInProgress}
                                                    title="Eliminar permanentemente"
                                                >
                                                    <Trash2 size={16} />
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

export default PacientesEliminados;
