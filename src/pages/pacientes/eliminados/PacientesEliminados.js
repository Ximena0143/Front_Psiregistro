import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layout/Header/Header';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import styles from './styles.module.css';
import { getDeletedPatients, restorePatient, forceDeletePatient } from '../../../services/patient';
import DataTable from '../../../components/common/DataTable/DataTable';

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
            const response = await getDeletedPatients();
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
                    // Asegurarse de que todos los campos necesarios estén presentes
                    return {
                        id: patient.id,
                        nombre: formatFullName(patient),
                        identificacion: `${patient.identification_number || 'N/A'} (${patient.identification_type || 'N/A'})`,
                        numeroIdentificacion: patient.identification_number || 'N/A',
                        tipoIdentificacion: patient.identification_type || 'N/A',
                        email: patient.email || 'N/A',
                        fechaEliminacion: patient.fechaEliminacion || patient.deleted_at || 'N/A',
                        // Mantener el objeto original para acceder a todos sus datos si es necesario
                        originalData: patient
                    };
                });
                
                setPatients(formattedData);
            } else {
                setPatients([]);
            }
        } catch (err) {
            console.error('Error al cargar pacientes eliminados:', err);
            setError('No se pudieron cargar los pacientes eliminados. Por favor, intente de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    const formatFullName = (patient) => {
        // Función para formatear el nombre completo del paciente
        const human = patient.human || patient;
        
        const firstName = human.first_name || human.firstName || '';
        const middleName = human.middle_name || human.middleName || '';
        const lastName = human.last_name || human.lastName || '';
        const secondLastName = human.second_last_name || human.secondLastName || '';
        
        return [firstName, middleName, lastName, secondLastName].filter(Boolean).join(' ');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleRestore = async (id) => {
        try {
            setActionInProgress(true);
            
            // Confirmación antes de restaurar
            const result = await Swal.fire({
                title: '¿Restaurar paciente?',
                text: 'El paciente será restaurado y volverá a estar activo',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#34C759',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, restaurar',
                cancelButtonText: 'Cancelar'
            });
            
            if (result.isConfirmed) {
                await restorePatient(id);
                
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
            console.error('Error al restaurar:', error);
            
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
                await forceDeletePatient(id);
                
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

    // Definición de columnas para DataTable
    const columns = [
        { id: 'nombre', label: 'Nombre', minWidth: 200 },
        { id: 'numeroIdentificacion', label: 'Identificación', minWidth: 150 },
        { id: 'email', label: 'Correo', minWidth: 200 },
        { id: 'fechaEliminacion', label: 'Fecha de eliminación', minWidth: 150 },
        {
            id: 'acciones',
            label: '',
            minWidth: 120,
            align: 'right',
            render: (value, row) => (
                <div className={styles.actionIcons}>
                    <div className={styles.iconWrapper} title="Restaurar paciente">
                        <RefreshCw
                            className={`${styles.actionIcon} ${styles.restoreIcon}`}
                            onClick={() => handleRestore(row.id)}
                        />
                    </div>
                    <div className={styles.iconWrapper} title="Eliminar permanentemente">
                        <Trash2
                            className={`${styles.actionIcon} ${styles.deleteIcon}`}
                            onClick={() => handleForceDelete(row.id)}
                        />
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className={styles.dashboard}>
            <Header variant="dashboard" />
            <div className={styles.main}>
                <Sidebar />
                <div className={styles.content}>
                    <div className={styles.contentHeader}>
                        <div className={styles.titleContainer}>
                            <ArrowLeft 
                                size={20} 
                                color="#4F46E5" 
                                className={styles.backIcon} 
                                onClick={handleGoBack}
                            />
                            <h3 className={styles.title}>Pacientes eliminados</h3>
                        </div>
                    </div>
                    
                    <div className={styles.tableContainer}>
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
                            <DataTable
                                columns={columns}
                                data={patients}
                                searchPlaceholder="Buscar pacientes eliminados..."
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PacientesEliminados;
