import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
import DataTable from '../../components/common/DataTable/DataTable';
import Swal from 'sweetalert2';
import specializationService from '../../services/specialization';
import authService from '../../services/auth';

const Especializaciones = () => {
    const navigate = useNavigate();
    const [especializaciones, setEspecializaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentEspecializacion, setCurrentEspecializacion] = useState(null);
    const [formData, setFormData] = useState({
        name: ''
    });

    // Verificar si el usuario es administrador
    useEffect(() => {
        const admin = authService.isAdmin();
        setIsAdmin(admin);
    }, []);

    // Cargar la lista de especializaciones al montar el componente
    useEffect(() => {
        fetchEspecializaciones();
    }, []);

    // Función para obtener las especializaciones del backend
    const fetchEspecializaciones = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await specializationService.getSpecializations();
            
            if (response && response.data && Array.isArray(response.data)) {
                setEspecializaciones(response.data);
            } else {
                setEspecializaciones([]);
                console.warn('No se recibieron datos de especializaciones del servidor');
            }
        } catch (err) {
            console.error('Error al cargar especializaciones:', err);
            setError('No se pudieron cargar las especializaciones. Por favor, intente de nuevo más tarde.');
            
            // Mostrar mensaje de error
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar las especializaciones. Por favor, intente de nuevo más tarde.',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        navigate('/psicologos');
    };

    const handleOpenAddModal = () => {
        setFormData({ name: '' });
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
    };

    const handleOpenEditModal = (especializacion) => {
        setCurrentEspecializacion(especializacion);
        setFormData({ name: especializacion.name });
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setCurrentEspecializacion(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddEspecializacion = async () => {
        if (!formData.name.trim()) {
            Swal.fire({
                title: 'Error',
                text: 'El nombre de la especialización es requerido',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
            return;
        }

        try {
            await specializationService.createSpecialization(formData);
            
            // Mostrar mensaje de éxito
            Swal.fire({
                title: '¡Éxito!',
                text: 'La especialización ha sido creada correctamente.',
                icon: 'success',
                confirmButtonColor: '#FB8500',
                timer: 2000,
                showConfirmButton: false
            });
            
            // Cerrar modal y actualizar lista
            handleCloseAddModal();
            fetchEspecializaciones();
        } catch (error) {
            console.error('Error al crear especialización:', error);
            
            Swal.fire({
                title: 'Error',
                text: 'No se pudo crear la especialización. Por favor, intente de nuevo.',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
        }
    };

    const handleEditEspecializacion = async () => {
        if (!formData.name.trim()) {
            Swal.fire({
                title: 'Error',
                text: 'El nombre de la especialización es requerido',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
            return;
        }

        try {
            await specializationService.updateSpecialization(currentEspecializacion.id, formData);
            
            // Mostrar mensaje de éxito
            Swal.fire({
                title: '¡Éxito!',
                text: 'La especialización ha sido actualizada correctamente.',
                icon: 'success',
                confirmButtonColor: '#FB8500',
                timer: 2000,
                showConfirmButton: false
            });
            
            // Cerrar modal y actualizar lista
            handleCloseEditModal();
            fetchEspecializaciones();
        } catch (error) {
            console.error('Error al actualizar especialización:', error);
            
            Swal.fire({
                title: 'Error',
                text: 'No se pudo actualizar la especialización. Por favor, intente de nuevo.',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
        }
    };

    const handleDelete = (especializacion) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar la especialización ${especializacion.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FB8500',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await specializationService.deleteSpecialization(especializacion.id);
                    
                    // Mostrar mensaje de éxito
                    Swal.fire({
                        title: '¡Eliminada!',
                        text: 'La especialización ha sido eliminada correctamente.',
                        icon: 'success',
                        confirmButtonColor: '#FB8500',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    
                    // Actualizar la lista de especializaciones
                    fetchEspecializaciones();
                } catch (error) {
                    console.error('Error al eliminar especialización:', error);
                    
                    let errorMessage = 'No se pudo eliminar la especialización.';
                    if (error.response && error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message;
                    }
                    
                    Swal.fire({
                        title: 'Error',
                        text: errorMessage,
                        icon: 'error',
                        confirmButtonColor: '#FB8500'
                    });
                }
            }
        });
    };

    const columns = [
        { id: 'id', label: 'ID', minWidth: 50 },
        { id: 'name', label: 'Nombre', minWidth: 200 },
        {
            id: 'acciones',
            label: '',
            minWidth: 120,
            align: 'right',
            render: (value, row) => (
                isAdmin && (
                    <div className={styles.actionIcons}>
                        <div className={styles.iconWrapper} title="Editar especialización">
                            <Edit
                                className={`${styles.actionIcon} ${styles.editIcon}`}
                                onClick={() => handleOpenEditModal(row)}
                            />
                        </div>
                        <div className={styles.iconWrapper} title="Eliminar especialización">
                            <Trash2
                                className={`${styles.actionIcon} ${styles.deleteIcon}`}
                                onClick={() => handleDelete(row)}
                            />
                        </div>
                    </div>
                )
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
                            <h3 className={styles.title}>Especializaciones</h3>
                        </div>
                        {isAdmin && (
                            <div className={styles.actions}>
                                <button 
                                    className={styles.addButton}
                                    onClick={handleOpenAddModal}
                                >
                                    Agregar especialización
                                </button>
                            </div>
                        )}
                    </div>
                    <div className={styles.tableContainer}>
                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <p>Cargando especializaciones...</p>
                            </div>
                        ) : error ? (
                            <div className={styles.errorContainer}>
                                <p>{error}</p>
                                <button 
                                    className={styles.retryButton}
                                    onClick={fetchEspecializaciones}
                                >
                                    Intentar de nuevo
                                </button>
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={especializaciones}
                                searchPlaceholder="Buscar especializaciones..."
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para agregar especialización */}
            {showAddModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h4>Agregar Especialización</h4>
                            <button className={styles.closeButton} onClick={handleCloseAddModal}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Nombre:</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={styles.formControl}
                                    placeholder="Ingrese el nombre de la especialización"
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelButton} onClick={handleCloseAddModal}>
                                Cancelar
                            </button>
                            <button className={styles.saveButton} onClick={handleAddEspecializacion}>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para editar especialización */}
            {showEditModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h4>Editar Especialización</h4>
                            <button className={styles.closeButton} onClick={handleCloseEditModal}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label htmlFor="edit-name">Nombre:</label>
                                <input
                                    type="text"
                                    id="edit-name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={styles.formControl}
                                    placeholder="Ingrese el nombre de la especialización"
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelButton} onClick={handleCloseEditModal}>
                                Cancelar
                            </button>
                            <button className={styles.saveButton} onClick={handleEditEspecializacion}>
                                Actualizar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Especializaciones;
