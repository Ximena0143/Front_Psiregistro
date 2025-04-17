import React from 'react';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { Eye, Trash2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable/DataTable';

const Psicologos = () => {
    const psicologos = [
        { nombre: "María Fernanda Ruiz", cedula: "1122334455", fechaCreacion: "2022-11-05", correo: "maria.ruiz@psicologos.com" },
        { nombre: "Carlos Andrés Pérez", cedula: "2233445566", fechaCreacion: "2023-01-17", correo: "carlos.perez@psicologos.com" },
        { nombre: "Ana Sofía Gómez", cedula: "3344556677", fechaCreacion: "2023-02-21", correo: "ana.gomez@psicologos.com" },
        { nombre: "Jorge Luis Torres", cedula: "4455667788", fechaCreacion: "2023-03-12", correo: "jorge.torres@psicologos.com" },
        { nombre: "Valentina López", cedula: "5566778899", fechaCreacion: "2023-04-03", correo: "valentina.lopez@psicologos.com" },
    ];

    const columns = [
        { id: 'nombre', label: 'Nombre', minWidth: 200 },
        { id: 'cedula', label: 'Cédula', minWidth: 120 },
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
                            onClick={() => console.log('Ver perfil', row)}
                        />
                    </div>
                    <div className={styles.iconWrapper} title="Eliminar psicólogo">
                        <Trash2
                            className={styles.actionIcon}
                            onClick={() => console.log('Eliminar psicólogo', row)}
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
                            <button className={styles.addButton}>
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
