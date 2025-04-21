import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { Edit2, FileText, Trash2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable/DataTable';
import Swal from 'sweetalert2';

const Dashboard = () => {
    const navigate = useNavigate();
    const [listaPacientes, setListaPacientes] = useState([
        { id: 1, nombre: "Laura Gómez Rodríguez", numeroIdentificacion: "123456789", fechaCreacion: "2023-01-01", correo: "laura.gomez@example.com" },
        { id: 2, nombre: "Andrés Martínez Ramírez", numeroIdentificacion: "987654321", fechaCreacion: "2023-02-15", correo: "andres.martinez@example.com" },
        { id: 3, nombre: "Camila Torres Jiménez", numeroIdentificacion: "456789123", fechaCreacion: "2023-03-20", correo: "camila.torres@example.com" },
        { id: 4, nombre: "Juan Pablo Sánchez", numeroIdentificacion: "789123456", fechaCreacion: "2023-04-10", correo: "juan.sanchez@example.com" },
        { id: 5, nombre: "Felipe Castro Mendoza", numeroIdentificacion: "123456789", fechaCreacion: "2023-05-25", correo: "felipe.castro@example.com" },
    ]);

    const handleAgregarPaciente = () => {
        navigate('/pacientes/agregar');
    };

    const handleEditarPaciente = (id) => {
        navigate(`/pacientes/editar/${id}`);
    };

    const handleVerHistorial = (id) => {
        navigate(`/pacientes/historial/${id}`);
    };

    const handleEliminarPaciente = (paciente) => {
        Swal.fire({
            title: '¿Eliminar paciente?',
            html: `¿Estás seguro de que deseas eliminar al paciente <strong>${paciente.nombre}</strong>?<br>Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FB8500',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Aquí iría la lógica para eliminar el paciente de la base de datos
                // Por ahora, simplemente lo eliminamos del estado local
                setListaPacientes(listaPacientes.filter(p => p.id !== paciente.id));
                
                // Mostrar mensaje de éxito
                Swal.fire({
                    title: 'Paciente eliminado',
                    text: `El paciente ${paciente.nombre} ha sido eliminado correctamente`,
                    icon: 'success',
                    confirmButtonColor: '#FB8500',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    };

    const columns = [
        { id: 'nombre', label: 'Nombre', minWidth: 200 },
        { id: 'numeroIdentificacion', label: 'Número de identificación', minWidth: 120 },
        { id: 'fechaCreacion', label: 'Fecha de Creación', minWidth: 150 },
        { id: 'correo', label: 'Correo', minWidth: 200 },
        {
            id: 'acciones',
            label: '',
            minWidth: 170,
            align: 'right',
            render: (value, row) => (
                <div className={styles.actionIcons}>
                    <div className={styles.iconWrapper} title="Editar paciente">
                        <Edit2
                            className={styles.actionIcon}
                            onClick={() => handleEditarPaciente(row.id)}
                        />
                    </div>
                    <div className={styles.iconWrapper} title="Ver historial">
                        <FileText
                            className={styles.actionIcon}
                            onClick={() => handleVerHistorial(row.id)}
                        />
                    </div>
                    <div className={styles.iconWrapper} title="Eliminar paciente">
                        <Trash2
                            className={styles.actionIcon}
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
                    <div className={styles.tableContainer}>
                        <DataTable 
                            columns={columns} 
                            data={listaPacientes}
                            searchPlaceholder="Buscar pacientes..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
