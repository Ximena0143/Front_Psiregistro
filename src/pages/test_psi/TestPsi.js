import React, { useState, useRef, useEffect } from 'react';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { X, Upload, Download, Eye, UserRound, Send } from 'lucide-react';
import Swal from 'sweetalert2';
import blankService from '../../services/blankService';
import authService from '../../services/auth';

const TestPsi = () => {
    const [tests, setTests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
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
    
    // Efecto para cargar los tests al iniciar el componente
    useEffect(() => {
        const fetchTests = async () => {
            setIsLoading(true);
            try {
                // Depurar obtención del usuario
                console.log('Obteniendo el usuario actual');
                const currentUser = authService.getCurrentUser();
                console.log('Usuario actual:', currentUser);
                
                if (currentUser && currentUser.id) {
                    console.log('ID de usuario:', currentUser.id);
                    
                    try {
                        const blanksData = await blankService.getBlanksByUser(currentUser.id);
                        console.log('Datos recibidos de blanksData:', blanksData);
                        
                        if (Array.isArray(blanksData)) {
                            // Transformar los datos al formato que espera el componente
                            const formattedTests = blanksData.map(blank => ({
                                id: blank.id,
                                nombre: blank.tittle || 'Test sin nombre',
                                archivo: blank.path || '',
                                fechaCreacion: formatDate(blank.created_at) || 'Fecha desconocida',
                                formato: getFormatFromUrl(blank.path) || 'PDF'
                            }));
                            
                            console.log('Datos formateados:', formattedTests);
                            setTests(formattedTests);
                        } else {
                            console.error('blanksData no es un array:', blanksData);
                            setTests([]);
                        }
                    } catch (apiError) {
                        console.error('Error en la llamada a la API:', apiError);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error de conexión',
                            text: `No se pudo conectar con el servidor: ${apiError.message}`,
                            confirmButtonColor: '#FB8500'
                        });
                    }
                } else {
                    console.warn('No se encontró el ID del usuario o datos de usuario');
                    // Si no hay ID pero sí hay usuario, usamos el correo electrónico para identificar
                    if (currentUser && currentUser.email) {
                        console.log('Intentando usar el correo electrónico para obtener el ID');
                        // Aquí podrías implementar una lógica para obtener el ID por email si fuera necesario
                    }
                    
                    Swal.fire({
                        icon: 'warning',
                        title: 'Sesión no encontrada',
                        text: 'No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.',
                        confirmButtonColor: '#FB8500'
                    });
                }
            } catch (error) {
                console.error('Error general al cargar los tests:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los documentos plantilla. Por favor, intenta de nuevo más tarde.',
                    confirmButtonColor: '#FB8500'
                });
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchTests();
    }, []);
    
    // Función para formatear la fecha desde el backend
    const formatDate = (dateString) => {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
    };
    
    // Función para obtener el formato del archivo a partir de la URL
    const getFormatFromUrl = (url) => {
        if (!url) return 'PDF';
        
        const extension = url.split('.').pop().toUpperCase();
        return extension || 'PDF';
    };

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
    const handleSaveTest = async () => {
        if (!newTest.nombre || !newTest.archivo) {
            Swal.fire({
                icon: 'warning',
                title: 'Datos incompletos',
                text: 'Por favor, completa todos los campos obligatorios.',
                confirmButtonColor: '#FB8500'
            });
            return;
        }
        
        setIsLoading(true);
        
        try {
            console.log('Archivo seleccionado:', newTest.archivo);
            console.log('Nombre del test:', newTest.nombre);
            
            // Preparar los datos para el backend
            const formData = {
                name: newTest.nombre
            };
            
            // Enviar el archivo al backend
            const response = await blankService.uploadBlank(formData, newTest.archivo);
            console.log('Respuesta completa del servidor:', response);
            
            // Extraer los datos de la respuesta, manejo flexible de diferentes estructuras
            let responseData = null;
            
            if (response) {
                // Caso 1: Si tenemos response.data directo
                if (response.data) {
                    console.log('Usando response.data');
                    responseData = response.data;
                } 
                // Caso 2: Si la respuesta misma es el objeto de datos
                else if (typeof response === 'object' && Object.keys(response).includes('id')) {
                    console.log('Usando response directo');
                    responseData = response;
                }
                // Caso 3: Si tenemos datos anidados en response.data.data
                else if (response.data && response.data.data) {
                    console.log('Usando response.data.data');
                    responseData = response.data.data;
                }
                // Caso 4: Si response tiene 'message' y 'data' (formato común en Laravel)
                else if (response.message && response.data) {
                    console.log('Usando response.data desde formato Laravel');
                    responseData = response.data;
                }
            }
            
            console.log('Datos extraídos de la respuesta:', responseData);
            
            if (responseData) {
                // Obtener la información del test recién creado
                const nuevoTest = {
                    id: responseData.id || Math.floor(Math.random() * 10000), // ID temporal si no hay ID
                    nombre: responseData.tittle || newTest.nombre,
                    fechaCreacion: formatDate(responseData.created_at) || formatDate(new Date()),
                    formato: getFormatFromUrl(responseData.path) || selectedFileName.split('.').pop().toUpperCase(),
                    archivo: responseData.path || ''
                };
                
                console.log('Nuevo test formateado:', nuevoTest);
                
                // Actualizar el estado con el nuevo test
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
            } else {
                console.error('No se pudieron extraer datos de la respuesta:', response);
                throw new Error('La respuesta del servidor no tiene el formato esperado');
            }
        } catch (error) {
            console.error('Error al guardar el test:', error);
            let errorMessage = 'No se pudo guardar el test. Por favor, intenta de nuevo más tarde.';
            
            // Intentar obtener un mensaje de error más específico si está disponible
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonColor: '#FB8500'
            });
        } finally {
            setIsLoading(false);
        }
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

    // Descargar plantilla
    const handleDownloadTest = async (test) => {
        setIsLoading(true);
        
        try {
            // Obtener la URL de descarga del backend
            const downloadUrl = await blankService.downloadBlank(test.id);
            
            if (downloadUrl) {
                // Crear un enlace temporal para descargar el archivo
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', test.nombre || 'test');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Mostrar alerta de éxito
                Swal.fire({
                    title: '¡Éxito!',
                    text: `El archivo del test "${test.nombre}" se ha descargado correctamente`,
                    icon: 'success',
                    confirmButtonColor: '#FB8500',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                throw new Error('No se pudo obtener la URL de descarga');
            }
        } catch (error) {
            console.error('Error al descargar el test:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo descargar el archivo. Por favor, intenta de nuevo más tarde.',
                confirmButtonColor: '#FB8500'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Función para ver el documento directamente
    const handleViewDocument = (documentUrl) => {
        if (!documentUrl) {
            Swal.fire({
                icon: 'warning',
                title: 'URL no disponible',
                text: 'No se puede acceder a este documento. La URL no está disponible.',
                confirmButtonColor: '#FB8500'
            });
            return;
        }
        
        // Mostrar notificación de que se está abriendo el documento
        const toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
        
        toast.fire({
            icon: 'info',
            title: 'Abriendo documento...'
        });
        
        // Abrir el documento en una nueva pestaña
        window.open(documentUrl, '_blank');
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
                                Subir plantilla
                            </button>
                        </div>
                    </div>
                    <div className={styles.testGrid}>
                        {isLoading ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner}></div>
                                <p>Cargando plantillas...</p>
                            </div>
                        ) : tests.length > 0 ? (
                            tests.map((test) => (
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
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <p>No hay documentos plantilla disponibles</p>
                                <button className={styles.addButton} onClick={handleOpenUploadModal}>
                                    Subir una plantilla
                                </button>
                            </div>
                        )}
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
                                disabled={!newTest.nombre || !selectedFileName || isLoading}
                            >
                                {isLoading ? 'Guardando...' : 'Guardar test'}
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
                                    {/* Vista previa del documento */}
                                    {currentTest.archivo && (
                                    <div className={styles.documentPreviewContainer}>
                                        <button 
                                            className={styles.viewDocumentButton}
                                            onClick={() => handleViewDocument(currentTest.archivo)}
                                        >
                                            <Eye size={20} />
                                            Ver documento
                                        </button>
                                    </div>
                                    )}
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
                                disabled={isLoading}
                            >
                                {isLoading ? 'Descargando...' : (
                                    <>
                                        <Download size={16} />
                                        Descargar test
                                    </>
                                )}
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
                                disabled={!assignData.pacienteEmail || isLoading}
                            >
                                {isLoading ? 'Procesando...' : (
                                    <>
                                        <Send size={16} />
                                        Asignar test
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestPsi;
