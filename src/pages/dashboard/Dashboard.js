import React from "react";
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { Edit2, FileText, Trash2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable/DataTable';

const Dashboard = () => {


    const pacientes = [
        { nombre: "Laura Gómez Rodríguez", cedula: "123456789", fechaCreacion: "2023-01-01", correo: "laura.gomez@example.com" },
        { nombre: "Andrés Martínez Ramírez", cedula: "987654321", fechaCreacion: "2023-02-15", correo: "andres.martinez@example.com" },
        { nombre: "Camila Torres Jiménez", cedula: "456789123", fechaCreacion: "2023-03-20", correo: "camila.torres@example.com" },
        { nombre: "Juan Pablo Sánchez", cedula: "789123456", fechaCreacion: "2023-04-10", correo: "juan.sanchez@example.com" },
        { nombre: "Felipe Castro Mendoza", cedula: "123456789", fechaCreacion: "2023-05-25", correo: "felipe.castro@example.com" },
    ];

    const columns = [
        { id: 'nombre', label: 'Nombre', minWidth: 200 },
        { id: 'cedula', label: 'Cédula', minWidth: 120 },
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
                            onClick={() => console.log('Editar paciente', row)}
                        />
                    </div>
                    <div className={styles.iconWrapper} title="Ver historial">
                        <FileText
                            className={styles.actionIcon}
                            onClick={() => console.log('Ver historial', row)}
                        />
                    </div>
                    <div className={styles.iconWrapper} title="Eliminar paciente">
                        <Trash2
                            className={styles.actionIcon}
                            onClick={() => console.log('Eliminar paciente', row)}
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
                        <button className={styles.addButton}>Agregar paciente</button>
                    </div>
                    <div className={styles.tableContainer}>
                        <DataTable 
                            columns={columns} 
                            data={pacientes}
                            searchPlaceholder="Buscar pacientes..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
