import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { Eye, Trash2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable/DataTable';
import Swal from 'sweetalert2';

const Psicologos = () => {
    const navigate = useNavigate();
    
    const [psicologos, setPsicologos] = useState([
        { nombre: "María Fernanda Ruiz", cedula: "1122334455", especializacion: "Psicología Clínica", fechaCreacion: "2022-11-05", correo: "maria.ruiz@psicologos.com" },
        { nombre: "Carlos Andrés Pérez", cedula: "2233445566", especializacion: "Neuropsicología", fechaCreacion: "2023-01-17", correo: "carlos.perez@psicologos.com" },
        { nombre: "Ana Sofía Gómez", cedula: "3344556677", especializacion: "Psicología Infantil", fechaCreacion: "2023-02-21", correo: "ana.gomez@psicologos.com" },
        { nombre: "Jorge Luis Torres", cedula: "4455667788", especializacion: "Psicología Organizacional", fechaCreacion: "2023-03-12", correo: "jorge.torres@psicologos.com" },
        { nombre: "Valentina López", cedula: "5566778899", especializacion: "Psicología Familiar", fechaCreacion: "2023-04-03", correo: "valentina.lopez@psicologos.com" },
    ]);

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
        }).then((result) => {
            if (result.isConfirmed) {
                // Filtrar el psicólogo del array local
                const newPsicologos = psicologos.filter(p => p.correo !== psicologo.correo);
                setPsicologos(newPsicologos);
                
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'El psicólogo ha sido eliminado correctamente.',
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
                            className={styles.actionIcon}
                            onClick={() => handleViewProfile(row)}
                        />
                    </div>
                    <div className={styles.iconWrapper} title="Eliminar psicólogo">
                        <Trash2
                            className={styles.actionIcon}
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
                        <DataTable
                            columns={columns}
                            data={psicologos}
                            searchPlaceholder="Buscar psicólogos..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Psicologos;
