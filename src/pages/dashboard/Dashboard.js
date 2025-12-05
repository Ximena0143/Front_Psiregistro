import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { Edit2, FileText, Trash2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable/DataTable';
import Swal from 'sweetalert2';
import patientService from '../../services/patient';

const Dashboard = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar la lista de pacientes al montar el componente
    useEffect(() => {
        fetchPacientes();
    }, []);

    // Función para obtener los pacientes activos del backend
    const fetchPacientes = async () => {
        try {
            setLoading(true);
            setError(null);
            const patientsData = await patientService.getPatients();
            
            // Inspeccionar el primer paciente para ver su estructura exacta
            if (patientsData && patientsData.length > 0) {
                
                // Transformar los datos al formato que espera el componente
                const formattedData = patientsData.map((patient, index) => {
                    // Asegurarse de que el ID sea válido
                    const id = patient.id || '';
                    const isValidId = Boolean(id && id !== '' && id !== 'null' && id !== 'undefined');
                    
                    
                    // Formatear el nombre completo
                    let fullName = 'Sin nombre';
                    
                    // En la nueva estructura, los datos de human pueden no estar disponibles
                    // Intentar construir el nombre a partir de los datos disponibles
                    if (patient.first_name || patient.last_name) {
                        fullName = `${patient.first_name || ''} ${patient.middle_name || ''} ${patient.last_name || ''} ${patient.second_last_name || ''}`.trim();
                    } else if (patient.human) {
                        // Mantener compatibilidad con la estructura anterior
                        const human = patient.human;
                        fullName = `${human.first_name || ''} ${human.middle_name || ''} ${human.last_name || ''} ${human.second_last_name || ''}`.trim();
                    }
                    
                    // Formatear la fecha de creación
                    let createdAt = 'N/A';
                    if (patient.created_at) {
                        const date = new Date(patient.created_at);
                        createdAt = date.toLocaleDateString();
                    }
                    
                    // Obtener el número de documento
                    let documentNumber = 'N/A';
                    if (patient.identification_number) {
                        documentNumber = patient.identification_number;
                    } else if (patient.human && patient.human.document_number) {
                        documentNumber = patient.human.document_number;
                    }
                    
                    // Crear el objeto formateado
                    const formattedPatient = {
                        id: isValidId ? id : `no-id-${index}`,
                        nombre: fullName,
                        numeroIdentificacion: documentNumber,
                        fechaCreacion: createdAt,
                        correo: patient.email || 'N/A',
                        editable: isValidId // Explícitamente establecer editable basado en isValidId
                    };
                    
                    return formattedPatient;
                });
                
                setPatients(formattedData);
            } else {
                setPatients([]);
                console.warn('No se recibieron datos de pacientes del servidor');
            }
        } catch (err) {
            console.error('Error al cargar pacientes:', err);
            setError('No se pudieron cargar los pacientes. Por favor, intente de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleAgregarPaciente = () => {
        navigate('/pacientes/agregar');
    };

    const handleEditarPaciente = (id) => {
        
        // Convertir el ID a string para asegurar que podamos usar métodos de string
        const idStr = String(id);
        
        // Solo navegar si el ID es válido
        if (id && idStr !== '' && !idStr.startsWith('no-id-')) {
            navigate(`/pacientes/editar/${id}`);
        } else {
            console.warn('Intento de editar paciente con ID inválido:', id);
            Swal.fire({
                title: 'Error',
                text: 'No se puede editar este paciente porque no tiene un ID válido en el sistema',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
        }
    };

    const handleVerHistorial = (id) => {
        navigate(`/pacientes/historial/${id}`);
    };

    const handleEliminarPaciente = (paciente) => {
        // Verificar que el ID sea válido antes de intentar eliminar
        if (!paciente.id || String(paciente.id).startsWith('no-id-')) {
            Swal.fire({
                title: 'Error',
                text: 'No se puede eliminar este paciente porque no tiene un ID válido en el sistema',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
            return;
        }

        Swal.fire({
            title: '¿Eliminar paciente?',
            html: `¿Estás seguro de que deseas eliminar al paciente <strong>${paciente.nombre}</strong>?<br>Esta acción realizará un <em>soft delete</em> y el paciente podrá ser restaurado posteriormente.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FB8500',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    setLoading(true);
                    
                    // Llamar al servicio para eliminar el paciente (soft delete)
                    const response = await patientService.deletePatient(paciente.id);
                    
                    // Actualizar la lista de pacientes en el estado
                    setPatients(patients.filter(p => p.id !== paciente.id));
                    
                    // Mostrar mensaje de éxito
                    Swal.fire({
                        title: 'Paciente eliminado',
                        text: `El paciente ${paciente.nombre} ha sido eliminado correctamente (soft delete)`,
                        icon: 'success',
                        confirmButtonColor: '#FB8500',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } catch (error) {
                    console.error('Error al eliminar paciente:', error);
                    
                    // Mostrar mensaje de error con detalles si están disponibles
                    Swal.fire({
                        title: 'Error',
                        text: error.message || 'No se pudo eliminar el paciente. Por favor, intente de nuevo más tarde.',
                        icon: 'error',
                        confirmButtonColor: '#FB8500'
                    });
                } finally {
                    setLoading(false);
                    // Recargar la lista de pacientes para asegurar que está actualizada
                    fetchPacientes();
                }
            }
        });
    };

    const columns = [
        { id: 'nombre', label: 'Nombre', width: '25%' },
        { id: 'numeroIdentificacion', label: 'Número de identificación', width: '20%' },
        { id: 'fechaCreacion', label: 'Fecha de Creación', width: '15%' },
        { id: 'correo', label: 'Correo', width: '25%' },
        {
            id: 'acciones',
            label: '',
            width: '15%',
            align: 'right',
            render: (value, row) => (
                <div className={styles.actionIcons}>
                    <div className={styles.iconWrapper} title={row.editable ? "Editar paciente" : "No se puede editar este paciente"}>
                        <Edit2
                            className={`${styles.actionIcon} ${styles.editIcon} ${!row.editable ? styles.disabledIcon : ''}`}
                            onClick={() => {
                                
                                if (row.editable === true) {
                                    handleEditarPaciente(row.id);
                                } else {
                                    Swal.fire({
                                        title: 'Error',
                                        text: 'No se puede editar este paciente porque no tiene un ID válido en el sistema',
                                        icon: 'error',
                                        confirmButtonColor: '#FB8500'
                                    });
                                }
                            }}
                            style={{ 
                                cursor: row.editable === true ? 'pointer' : 'not-allowed',
                                opacity: row.editable === true ? 1 : 0.5
                            }}
                        />
                    </div>
                    <div className={styles.iconWrapper} title="Ver historial">
                        <FileText
                            className={`${styles.actionIcon} ${styles.viewIcon}`}
                            onClick={() => handleVerHistorial(row.id)}
                        />
                    </div>
                    <div className={styles.iconWrapper} title="Eliminar paciente">
                        <Trash2
                            className={`${styles.actionIcon} ${styles.deleteIcon}`}
                            onClick={() => handleEliminarPaciente(row)}
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
                        <h3>Lista de pacientes</h3>
                        <button 
                            className={styles.addButton}
                            onClick={handleAgregarPaciente}
                        >
                            Agregar paciente
                        </button>
                    </div>
                    
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}
                    
                    <div className={styles.tableContainer}>
                        {loading ? (
                            <div className={styles.loadingContainer}>
                                <p>Cargando pacientes...</p>
                            </div>
                        ) : (
                            <DataTable 
                                columns={columns} 
                                data={patients}
                                searchPlaceholder="Buscar pacientes..."
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
