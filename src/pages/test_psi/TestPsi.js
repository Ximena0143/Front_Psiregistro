import React, { useState, useRef } from 'react';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { X, Upload, Download, Eye, UserRound, Send } from 'lucide-react';
import Swal from 'sweetalert2';

const TestPsi = () => {
    const [tests, setTests] = useState([
        {
            id: 1,
            nombre: "Test de Ansiedad",
            archivo: "/files/test_ansiedad.pdf",
            fechaCreacion: "10 Abril, 2025",
            formato: "PDF"
        },
        {
            id: 2,
            nombre: "Test de Depresión",
            archivo: "/files/test_depresion.pdf",
            fechaCreacion: "5 Abril, 2025",
            formato: "PDF"
        },
        {
            id: 3,
            nombre: "Test de Personalidad",
            archivo: "/files/test_personalidad.pdf",
            fechaCreacion: "1 Abril, 2025",
            formato: "PDF"
        }
    ]);
    
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [currentTest, setCurrentTest] = useState(null);
    
    const [newTest, setNewTest] = useState({
        nombre: '',
        archivo: null
    });
    
    const [assignData, setAssignData] = useState({
        pacienteEmail: '',
        mensaje: ''
    });
    
    const [selectedFileName, setSelectedFileName] = useState('');
    const fileInputRef = useRef(null);
    // Funciones para manejar el modal de subir test
    const handleOpenUploadModal = () => {
        setShowUploadModal(true);
    };

    const handleCloseUploadModal = () => {
        setShowUploadModal(false);
        setNewTest({
            nombre: '',
            archivo: null
        });
        setSelectedFileName('');
    };

    // Funciones para manejar el modal de detalles del test
    const handleOpenDetailsModal = (test) => {
        setCurrentTest(test);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setCurrentTest(null);
    };

    // Funciones para manejar el modal de asignar test
    const handleOpenAssignModal = (test) => {
        setCurrentTest(test);
        setShowAssignModal(true);
    };

    const handleCloseAssignModal = () => {
        setShowAssignModal(false);
        setCurrentTest(null);
        setAssignData({
            pacienteEmail: '',
            mensaje: ''
        });
    };

    // Manejar cambios en los campos del formulario de test
    const handleTestInputChange = (e) => {
        const { name, value } = e.target;
        setNewTest({
            ...newTest,
            [name]: value
        });
    };

    // Manejar cambios en los campos del formulario de asignación
    const handleAssignInputChange = (e) => {
        const { name, value } = e.target;
        setAssignData({
            ...assignData,
            [name]: value
        });
    };

    // Manejar selección de archivo
    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFileName(file.name);
            setNewTest({
                ...newTest,
                archivo: file
            });
        }
    };

    const handleUploadAreaClick = () => {
        fileInputRef.current.click();
    };

    // Guardar nuevo test
    const handleSaveTest = () => {
        // Añadimos el test nuevo a la lista (simulación)
        const fechaActual = new Date();
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const fechaFormateada = `${fechaActual.getDate()} ${months[fechaActual.getMonth()]}, ${fechaActual.getFullYear()}`;
        
        const nuevoTest = {
            id: tests.length + 1,
            nombre: newTest.nombre,
            fechaCreacion: fechaFormateada,
            formato: selectedFileName ? selectedFileName.split('.').pop().toUpperCase() : 'PDF',
            archivo: selectedFileName ? URL.createObjectURL(newTest.archivo) : "/files/test_example.pdf"
        };
        
        setTests([nuevoTest, ...tests]);
        
        // Mostrar alerta de éxito
        Swal.fire({
            title: '¡Éxito!',
            text: 'El test se ha guardado correctamente',
            icon: 'success',
            confirmButtonColor: '#FB8500',
            timer: 2000,
            showConfirmButton: false
        });
        
        // Cerrar el modal
        handleCloseUploadModal();
    };

    // Asignar test a paciente
    const handleAssignTest = () => {
        // Mostrar alerta de éxito
        Swal.fire({
            title: '¡Éxito!',
            text: `El test "${currentTest.nombre}" ha sido asignado a ${assignData.pacienteEmail} correctamente`,
            icon: 'success',
            confirmButtonColor: '#FB8500',
            timer: 2000,
            showConfirmButton: false
        });
        
        // Cerrar el modal
        handleCloseAssignModal();
    };

    // Descargar test (simulación)
    const handleDownloadTest = (test) => {
        // Mostrar alerta de éxito
        Swal.fire({
            title: '¡Éxito!',
            text: `El archivo del test "${test.nombre}" se ha descargado correctamente`,
            icon: 'success',
            confirmButtonColor: '#FB8500',
            timer: 2000,
            showConfirmButton: false
        });
    };

    return (
        <div className={styles.dashboard}>
            <Header variant="dashboard" />
            <div className={styles.main}>
                <Sidebar />
                <div className={styles.content}>
                    <div className={styles.contentHeader}>
                        <h3>Documentos plantilla</h3>
                        <div className={styles.actions}>
                            <button className={styles.addButton} onClick={handleOpenUploadModal}>
                                Subir documento
                            </button>
                        </div>
                    </div>
                    <div className={styles.testGrid}>
                        {tests.map((test) => (
                            <div key={test.id} className={styles.testCard}>
                                <h3>{test.nombre}</h3>
                                <div className={styles.testMeta}>
                                    <span className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Formato:</span> {test.formato}
                                    </span>
                                </div>
                                <div className={styles.cardActions}>
                                    <button className={styles.viewButton} onClick={() => handleOpenDetailsModal(test)}>
                                        <Eye size={16} />
                                        Ver detalles
                                    </button>
                                    <button className={styles.assignButton} onClick={() => handleOpenAssignModal(test)}>
                                        <Send size={16} />
                                        Asignar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal para subir test */}
            {showUploadModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContainer}>
                        <div className={styles.modalHeader}>
                            <h4>Subir nuevo test</h4>
                            <button className={styles.closeButton} onClick={handleCloseUploadModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.formField}>
                                <label htmlFor="nombre">Nombre del test *</label>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    type="text"
                                    value={newTest.nombre}
                                    onChange={handleTestInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.formField}>
                                <label>Archivo del test *</label>
                                <div 
                                    className={styles.fileUploadArea}
                                    onClick={handleUploadAreaClick}
                                >
                                    <div className={styles.fileUploadIcon}>
                                        <Upload size={30} color="#219EBC" />
                                    </div>
                                    <p className={styles.fileUploadText}>
                                        Haz clic aquí para seleccionar un archivo o arrástralo y suéltalo
                                    </p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className={styles.fileInput}
                                        onChange={handleFileSelect}
                                        accept=".pdf,.doc,.docx"
                                    />
                                </div>
                                {selectedFileName && (
                                    <p className={styles.selectedFileName}>{selectedFileName}</p>
                                )}
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button 
                                className={styles.cancelButton}
                                onClick={handleCloseUploadModal}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={styles.saveButton}
                                onClick={handleSaveTest}
                                disabled={!newTest.nombre || !selectedFileName}
                            >
                                Guardar test
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para ver detalles del test */}
            {showDetailsModal && currentTest && (
                <div className={styles.modal}>
                    <div className={styles.modalContainer}>
                        <div className={styles.modalHeader}>
                            <h4>Detalles del test</h4>
                            <button className={styles.closeButton} onClick={handleCloseDetailsModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.testDetails}>
                                <h3 className={styles.testDetailTitle}>{currentTest.nombre}</h3>

                                <div className={styles.testDetailInfo}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Formato:</span>
                                        <span>{currentTest.formato}</span>
                                    </div>

                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>Fecha de creación:</span>
                                        <span>{currentTest.fechaCreacion}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button 
                                className={styles.cancelButton}
                                onClick={handleCloseDetailsModal}
                            >
                                Cerrar
                            </button>
                            <button 
                                className={styles.downloadButton}
                                onClick={() => {
                                    handleDownloadTest(currentTest);
                                    handleCloseDetailsModal();
                                }}
                            >
                                <Download size={16} />
                                Descargar test
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para asignar test */}
            {showAssignModal && currentTest && (
                <div className={styles.modal}>
                    <div className={styles.modalContainer}>
                        <div className={styles.modalHeader}>
                            <h4>Asignar test a paciente</h4>
                            <button className={styles.closeButton} onClick={handleCloseAssignModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.assignHeader}>
                                <h3>Test: {currentTest.nombre}</h3>
                            </div>
                            <div className={styles.formField}>
                                <label htmlFor="pacienteEmail">Correo electrónico del paciente *</label>
                                <div className={styles.emailInputContainer}>
                                    <UserRound size={18} className={styles.emailIcon} />
                                    <input
                                        id="pacienteEmail"
                                        name="pacienteEmail"
                                        type="email"
                                        value={assignData.pacienteEmail}
                                        onChange={handleAssignInputChange}
                                        className={styles.emailInput}
                                        placeholder="correo@ejemplo.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.formField}>
                                <label htmlFor="mensaje">Mensaje para el paciente (opcional)</label>
                                <textarea
                                    id="mensaje"
                                    name="mensaje"
                                    value={assignData.mensaje}
                                    onChange={handleAssignInputChange}
                                    rows={4}
                                    placeholder="Introduzca un mensaje personalizado que recibirá el paciente junto con el test..."
                                />
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button 
                                className={styles.cancelButton}
                                onClick={handleCloseAssignModal}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={styles.assignModalButton}
                                onClick={handleAssignTest}
                                disabled={!assignData.pacienteEmail}
                            >
                                <Send size={16} />
                                Asignar test
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestPsi;
