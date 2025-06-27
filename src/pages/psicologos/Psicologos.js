import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { Eye, Trash2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable/DataTable';
import Swal from 'sweetalert2';
import userService from '../../services/user';

const Psicologos = () => {
    const navigate = useNavigate();
    
    const [psicologos, setPsicologos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar la lista de psicólogos al montar el componente
    useEffect(() => {
        fetchPsicologos();
    }, []);

    // Función para obtener los psicólogos del backend
    const fetchPsicologos = async () => {
        try {
            setLoading(true);
            const response = await userService.getUsers();
            
            if (response && response.data) {
                // Transformar los datos al formato que espera el componente
                const formattedData = response.data.map(user => {
                    const fullName = `${user.human.first_name} ${user.human.second_name || ''} ${user.human.last_name} ${user.human.second_last_name || ''}`.trim();
                    
                    return {
                        id: user.id,
                        nombre: fullName,
                        cedula: user.human.document_number || 'N/A',
                        especializacion: user.specialization || 'No especificada',
                        fechaCreacion: new Date(user.created_at).toLocaleDateString(),
                        correo: user.email
                    };
                });
                
                setPsicologos(formattedData);
            } else {
                setPsicologos([]);
                console.warn('No se recibieron datos de usuarios del servidor');
            }
        } catch (err) {
            console.error('Error al cargar psicólogos:', err);
            setError('No se pudieron cargar los psicólogos. Por favor, intente de nuevo más tarde.');
            
            // Mostrar mensaje de error
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los psicólogos. Por favor, intente de nuevo más tarde.',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleNavigateToAdd = () => {
        navigate('/psicologos/agregar');
    };

    const handleViewProfile = (psicologo) => {
        Swal.fire({
            title: 'Perfil del Psicólogo',
            html: `
                <div style="text-align: left; margin: 20px 0; font-family: 'DM Sans', sans-serif;">
                    <p><strong>Nombre:</strong> ${psicologo.nombre}</p>
                    <p><strong>Especialización:</strong> ${psicologo.especializacion}</p>
                    <p><strong>Correo:</strong> ${psicologo.correo}</p>
                    <p><strong>Fecha de Creación:</strong> ${psicologo.fechaCreacion}</p>
                </div>
            `,
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#FB8500',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        });
    };

    const handleDelete = (psicologo) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar al psicólogo ${psicologo.nombre}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FB8500',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await userService.deleteUser(psicologo.id);
                    
                    // Actualizar la lista de psicólogos
                    setPsicologos(psicologos.filter(p => p.id !== psicologo.id));
                    
                    Swal.fire({
                        title: '¡Éxito!',
                        text: 'El psicólogo ha sido eliminado correctamente.',
                        icon: 'success',
                        confirmButtonColor: '#FB8500',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } catch (error) {
                    console.error('Error al eliminar psicólogo:', error);
                    
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo eliminar el psicólogo. Por favor, intente de nuevo.',
                        icon: 'error',
                        confirmButtonColor: '#FB8500'
                    });
                }
            }
        });
    };

    const columns = [
        { id: 'nombre', label: 'Nombre', minWidth: 200 },
        { id: 'especializacion', label: 'Especialización', minWidth: 150 },
        { id: 'fechaCreacion', label: 'Fecha de Creación', minWidth: 150 },
        { id: 'correo', label: 'Correo', minWidth: 200 },
        {
            id: 'acciones',
            label: '',
            minWidth: 120,
            align: 'right',
            render: (value, row) => (
                <div className={styles.actionIcons}>
                    <div className={styles.iconWrapper} title="Ver perfil">
                        <Eye
                            className={`${styles.actionIcon} ${styles.viewIcon}`}
                            onClick={() => handleViewProfile(row)}
                        />
                    </div>
                    <div className={styles.iconWrapper} title="Eliminar psicólogo">
                        <Trash2
                            className={`${styles.actionIcon} ${styles.deleteIcon}`}
                            onClick={() => handleDelete(row)}
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
                        <h3 className={styles.title}>Lista de psicólogos</h3>
                        <div className={styles.actions}>
                            <button 
                                className={styles.addButton}
                                onClick={handleNavigateToAdd}
                            >
                                Agregar psicólogo
                            </button>
                        </div>
                    </div>
                    <div className={styles.tableContainer}>
                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <p>Cargando psicólogos...</p>
                            </div>
                        ) : error ? (
                            <div className={styles.errorContainer}>
                                <p>{error}</p>
                                <button 
                                    className={styles.retryButton}
                                    onClick={fetchPsicologos}
                                >
                                    Intentar de nuevo
                                </button>
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={psicologos}
                                searchPlaceholder="Buscar psicólogos..."
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Psicologos;
