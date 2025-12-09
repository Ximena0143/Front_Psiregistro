import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layout/Header/Header';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import styles from './styles.module.css';
import userService from '../../../services/user';
import DataTable from '../../../components/common/DataTable/DataTable';

const PsicologosEliminados = () => {
    const navigate = useNavigate();
    const [psychologists, setPsychologists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDeletedPsychologists = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await userService.getDeletedUsers();
            
            let deletedPsychologistsData = [];
            
            if (response) {
                if (Array.isArray(response)) {
                    deletedPsychologistsData = response;
                } else if (response.data && Array.isArray(response.data)) {
                    deletedPsychologistsData = response.data;
                } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    deletedPsychologistsData = response.data.data;
                }
            }
            
            if (deletedPsychologistsData && deletedPsychologistsData.length > 0) {
                const formattedData = deletedPsychologistsData.map(psychologist => {
                    return {
                        id: psychologist.id,
                        nombre: formatFullName(psychologist),
                        email: psychologist.email || 'N/A',
                        fechaEliminacion: psychologist.fechaEliminacion || psychologist.deleted_at || 'N/A',
                        originalData: psychologist
                    };
                });
                
                setPsychologists(formattedData);
            } else {
                setPsychologists([]);
            }
        } catch (err) {
            console.error('Error al cargar psicólogos eliminados:', err);
            setError('No se pudieron cargar los psicólogos eliminados. Por favor, intente de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDeletedPsychologists();
    }, [fetchDeletedPsychologists]);

    const formatFullName = (psychologist) => {
        const human = psychologist.human || psychologist;
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
            const result = await Swal.fire({
                title: '¿Restaurar psicólogo?',
                text: 'El psicólogo será restaurado y volverá a estar activo',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#34C759',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, restaurar',
                cancelButtonText: 'Cancelar'
            });
            
            if (result.isConfirmed) {
                await userService.restoreUser(id);
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
        }
    };

    const handleForceDelete = async (id) => {
        try {
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
                await userService.forceDeleteUser(id);
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
        }
    };

    const columns = [
        { id: 'nombre', label: 'Nombre', minWidth: 200 },
        { id: 'email', label: 'Correo', minWidth: 200 },
        { id: 'fechaEliminacion', label: 'Fecha de eliminación', minWidth: 150 },
        {
            id: 'acciones',
            label: '',
            minWidth: 120,
            align: 'right',
            render: (value, row) => (
                <div className={styles.actionIcons}>
                    <div className={styles.iconWrapper} title="Restaurar psicólogo">
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
                            <h3 className={styles.title}>Psicólogos eliminados</h3>
                        </div>
                    </div>
                    
                    <div className={styles.tableContainer}>
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
                            <DataTable
                                columns={columns}
                                data={psychologists}
                                searchPlaceholder="Buscar psicólogos eliminados..."
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PsicologosEliminados;
