import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';

const Dashboard = () => {
    const [showOptions, setShowOptions] = useState(null);

    const pacientes = [
        { nombre: "Laura Gómez Rodríguez", correo: "laura.gomez@example.com" },
        { nombre: "Andrés Martínez Ramírez", correo: "andres.martinez@example.com" },
        { nombre: "Camila Torres Jiménez", correo: "camila.torres@example.com" },
        { nombre: "Juan Pablo Sánchez", correo: "juan.sanchez@example.com" },
        { nombre: "Felipe Castro Mendoza", correo: "felipe.castro@example.com" },
    ];

    const toggleOptions = (index) => {
        setShowOptions(showOptions === index ? null : index);
    };

    return (
        <div className={styles.dashboard}>
            <Header variant="dashboard" />
            <div className={styles.main}>
                <Sidebar />
                <div className={styles.content}>
                    <div className={styles.contentHeader}>
                        <h2>Lista de pacientes</h2>
                        <button className={styles.addButton}>Agregar paciente</button>
                    </div>
                    <div className={styles.tableContainer}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pacientes.map((paciente, index) => (
                                    <tr key={index}>
                                        <td>{paciente.nombre}</td>
                                        <td>{paciente.correo}</td>
                                        <td className={styles.actions}>
                                            <button className={styles.viewButton}>Ver historial</button>
                                            <div className={styles.optionsContainer}>
                                                <MoreVertical 
                                                    className={styles.moreIcon} 
                                                    onClick={() => toggleOptions(index)} 
                                                />
                                                {showOptions === index && (
                                                    <div className={styles.options}>
                                                        <p>Editar paciente</p>
                                                        <p>Eliminar paciente</p>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
