import React, { useState, useRef, useEffect } from 'react';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { X, Upload, Eye, UserRound, Send, Trash2 } from 'lucide-react';
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
        pacienteEmail: ''
    });
    
    const [selectedFileName, setSelectedFileName] = useState('');
    const fileInputRef = useRef(null);
    
    // Efecto para cargar los tests al iniciar el componente
    useEffect(() => {
        const fetchTests = async () => {
            setIsLoading(true);
            try {
                // Depurar obtención del usuario
                const currentUser = authService.getCurrentUser();
                
                if (currentUser && currentUser.id) {
                    try {
                        const blanksData = await blankService.getBlanksByUser(currentUser.id);
                        if (Array.isArray(blanksData)) {
                            // Transformar los datos al formato que espera el componente
                            const formattedTests = blanksData.map(blank => {
                                return {
                                    id: blank.id,
                                    nombre: cleanPlantillaName(blank.tittle) || 'Sin nombre',
                                    archivo: blank.path || '',
                                    formato: getFormatFromUrl(blank.path) || 'PDF'
                                };
                            });
                            
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
    
    // La función formatDate ha sido eliminada ya que no se necesita
    
    // Función para obtener el formato desde una URL
    const getFormatFromUrl = (url) => {
        if (!url) return '';
        const extension = url.split('.').pop().split('?')[0].toUpperCase();
        return extension || 'PDF';
    };
    
    // Función para limpiar el nombre de la plantilla (quitar timestamps)
    const cleanPlantillaName = (nombre) => {
        if (!nombre) return 'Sin nombre';
        // Si el nombre tiene el formato "nombre_timestamp", extraer solo el nombre
        const match = nombre.match(/^(.+?)_\d+$/);
        if (match && match[1]) {
            return match[1]; // Devolver solo el nombre sin el timestamp
        }
        return nombre; // Si no tiene timestamp, devolver el nombre original
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
            pacienteEmail: ''
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

    // Guardar nueva plantilla
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
            // Preparar los datos para el backend
            const formData = {
                name: newTest.nombre
            };
            
            // Enviar el archivo al backend
            const response = await blankService.uploadBlank(formData, newTest.archivo);
            
            // Extraer los datos de la respuesta, manejo flexible de diferentes estructuras
            let responseData = null;
            
            if (response) {
                // Caso 1: Si tenemos response.data directo
                if (response.data) {
                    responseData = response.data;
                } 
                // Caso 2: Si la respuesta misma es el objeto de datos
                else if (typeof response === 'object' && Object.keys(response).includes('id')) {
                    responseData = response;
                }
                // Caso 3: Si tenemos datos anidados en response.data.data
                else if (response.data && response.data.data) {
                    responseData = response.data.data;
                }
                // Caso 4: Si response tiene 'message' y 'data' (formato común en Laravel)
                else if (response.message && response.data) {
                    responseData = response.data;
                }
            }

            if (responseData) {
                // Obtener la información del test recién creado
                const nuevoTest = {
                    id: responseData.id || Math.floor(Math.random() * 10000), // ID temporal si no hay ID
                    nombre: cleanPlantillaName(responseData.tittle) || newTest.nombre,
                    formato: getFormatFromUrl(responseData.path) || selectedFileName.split('.').pop().toUpperCase(),
                    archivo: responseData.path || ''
                };
                
                
                // Actualizar el estado con el nuevo test
                setTests([nuevoTest, ...tests]);
                
                // Mostrar alerta de éxito
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'La plantilla se ha guardado correctamente',
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
            console.error('Error al guardar la plantilla:', error);
            let errorMessage = 'No se pudo guardar la plantilla. Por favor, intenta de nuevo más tarde.';
            
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

    // Eliminar test
    const handleDeleteTest = (test) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Quieres eliminar la plantilla "${cleanPlantillaName(test.nombre)}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FB8500',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                setIsLoading(true);
                try {
                    await blankService.deleteBlank(test.id);
                    
                    // Actualizar la lista de tests
                    setTests(tests.filter(t => t.id !== test.id));
                    
                    Swal.fire({
                        title: '¡Eliminado!',
                        text: 'La plantilla ha sido eliminada correctamente',
                        icon: 'success',
                        confirmButtonColor: '#FB8500',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } catch (error) {
                    console.error('Error al eliminar la plantilla:', error);
                    
                    let errorMessage = 'No se pudo eliminar la plantilla. Por favor, intenta de nuevo más tarde.';
                    
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
            }
        });
    };
    
    // Asignar test a paciente
    const handleAssignTest = async () => {
        setIsLoading(true);
        
        try {
            // Preparar los datos para enviar el test
            const emails = [assignData.pacienteEmail];
            
            // Llamar al servicio para enviar el test
            const response = await blankService.sendBlank(currentTest.id, emails);
            console.log('Send blank response:', response);
            
            // Mostrar alerta de éxito
            Swal.fire({
                title: '¡Éxito!',
                text: `La plantilla "${cleanPlantillaName(currentTest.nombre)}" ha sido enviada a ${assignData.pacienteEmail} correctamente`,
                icon: 'success',
                confirmButtonColor: '#FB8500',
                timer: 2000,
                showConfirmButton: false
            });
            
            // Cerrar el modal
            handleCloseAssignModal();
        } catch (error) {
            console.error('Error al enviar el test:', error);
            
            let errorMessage = 'No se pudo enviar la plantilla. Por favor, intenta de nuevo más tarde.';
            
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
        
        // Notificar al usuario que se está abriendo el documento
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
                                    <h3>{cleanPlantillaName(test.nombre)}</h3>
                                    <div className={styles.testMeta}>
                                        <div className={styles.metaItem} style={{ margin: '0 auto' }}>
                                            <span className={styles.metaLabel}>Formato:</span> 
                                            <span className={styles.metaValue}>{test.formato}</span>
                                        </div>
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button className={styles.assignButton} onClick={() => handleOpenAssignModal(test)}>
                                            <Send size={16} />
                                            Asignar
                                        </button>
                                        <button className={styles.deleteButton} onClick={() => handleDeleteTest(test)}>
                                            <Trash2 size={16} />
                                            Eliminar
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

            {/* Modal para subir plantilla */}
            {showUploadModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContainer}>
                        <div className={styles.modalHeader}>
                            <h4>Subir nueva plantilla</h4>
                            <button className={styles.closeButton} onClick={handleCloseUploadModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.formField}>
                                <label htmlFor="nombre">Nombre de la plantilla *</label>
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
                                <label>Archivo de la plantilla *</label>
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
                                {isLoading ? 'Guardando...' : 'Guardar plantilla'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para ver detalles de la plantilla */}
            {showDetailsModal && currentTest && (
                <div className={styles.modal}>
                    <div className={styles.modalContainer}>
                        <div className={styles.modalHeader}>
                            <h4>Detalles de la plantilla</h4>
                            <button className={styles.closeButton} onClick={handleCloseDetailsModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.testDetails}>
                                <h3 className={styles.testDetailTitle}>{cleanPlantillaName(currentTest.nombre)}</h3>

                                <div className={styles.testDetailInfo}>
                                    <div className={styles.metaItem} style={{ margin: '0 auto', minWidth: '200px' }}>
                                        <span className={styles.metaLabel}>Formato:</span>
                                        <span className={styles.metaValue}>{currentTest.formato}</span>
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
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para asignar test */}
            {showAssignModal && currentTest && (
                <div className={styles.modal}>
                    <div className={styles.modalContainer}>
                        <div className={styles.modalHeader}>
                            <h4>Asignar plantilla a paciente</h4>
                            <button className={styles.closeButton} onClick={handleCloseAssignModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.assignHeader}>
                                <h3>Plantilla: {cleanPlantillaName(currentTest.nombre)}</h3>
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
                                        Asignar plantilla
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
