import React from 'react';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { Download, FileText, Trash2 } from 'lucide-react';
import DataTable from '../../components/common/DataTable/DataTable';

const Documentos = () => {
    const documentos = [
        { nombre: "Historia Clínica - Laura Gómez", tipo: "PDF", fechaCreacion: "2023-01-01", tamaño: "2.5 MB" },
        { nombre: "Evaluación Psicológica - Andrés Martínez", tipo: "DOC", fechaCreacion: "2023-02-15", tamaño: "1.8 MB" },
        { nombre: "Informe Terapéutico - Carlos Ruiz", tipo: "PDF", fechaCreacion: "2023-03-10", tamaño: "3.2 MB" },
        { nombre: "Notas de Sesión - María López", tipo: "DOC", fechaCreacion: "2023-04-05", tamaño: "1.1 MB" }
    ];

    const columns = [
        { id: 'nombre', label: 'Nombre del documento', minWidth: 250 },
        { id: 'tipo', label: 'Tipo', minWidth: 100 },
        { id: 'fechaCreacion', label: 'Fecha ult. actualización', minWidth: 170 },
        { id: 'tamaño', label: 'Tamaño', minWidth: 100 },
        {
            id: 'acciones',
            label: '',
            minWidth: 170,
            align: 'right',
            render: (value, row) => (
                <div className={styles.actionIcons}>
                    <div className={styles.iconWrapper} title="Descargar documento">
                        <Download
                            className={styles.actionIcon}
                            onClick={() => console.log('Descargar documento', row)}
                        />
                    </div>
                    <div className={styles.iconWrapper} title="Ver documento">
                        <FileText
                            className={styles.actionIcon}
                            onClick={() => console.log('Ver documento', row)}
                        />
                    </div>
                    <div className={styles.iconWrapper} title="Eliminar documento">
                        <Trash2
                            className={styles.actionIcon}
                            onClick={() => console.log('Eliminar documento', row)}
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
                        <h3>Lista de documentos</h3>
                        <div className={styles.actions}>
                            <button className={styles.addButton}>
                                Subir documento
                            </button>
                        </div>
                    </div>
                    <div className={styles.tableContainer}>
                        <DataTable 
                            columns={columns} 
                            data={documentos}
                            searchPlaceholder="Buscar documentos..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Documentos;
