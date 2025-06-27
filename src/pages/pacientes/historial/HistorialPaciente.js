import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/layout/Header/Header';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import { ArrowLeft, Eye, Download, FileText, Upload, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import styles from './styles.module.css';
import patientService from '../../../services/patient';

const HistorialPaciente = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [paciente, setPaciente] = useState(null);
    const [documentos, setDocumentos] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newDocument, setNewDocument] = useState({
        titulo: '',
        archivo: null
    });
    const [selectedFileName, setSelectedFileName] = useState('');
    const fileInputRef = useRef(null);
    const [error, setError] = useState(null);
    const [tiposIdentificacion, setTiposIdentificacion] = useState([]);

    // Cargar los tipos de identificación
    useEffect(() => {
        const fetchIdentificationTypes = async () => {
            try {
                const response = await patientService.getIdentificationTypes();
                if (response && response.data) {
                    setTiposIdentificacion(response.data);
                }
            } catch (err) {
                console.error('Error al cargar tipos de identificación:', err);
            }
        };
        
        fetchIdentificationTypes();
    }, []);

    // Cargar datos reales del paciente desde el backend
    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Validar que el ID sea válido antes de hacer la petición
                if (!id || id === 'N/A' || id === 'undefined' || id === 'null' || id.startsWith('no-id-')) {
                    throw new Error('ID de paciente no válido');
                }
                
                // Obtener los datos del paciente por ID
                console.log('Obteniendo datos del paciente con ID:', id);
                const response = await patientService.getPatientById(id);
                console.log('Respuesta del paciente:', response);
                
                // Verificar que la respuesta contenga datos
                if (!response || (!response.patient && !response.human)) {
                    throw new Error('No se pudo obtener información del paciente');
                }
                
                // Extraer datos del paciente y human de la respuesta
                const patient = response.patient;
                const human = response.human || patient; // Si no hay human, usar los datos del paciente
                
                // Obtener el nombre del tipo de identificación
                let tipoIdentificacionNombre = 'No especificado';
                
                // Verificar si el tipo de identificación está directamente en el objeto patient
                if (patient.identification_type) {
                    tipoIdentificacionNombre = patient.identification_type;
                    console.log('Tipo de identificación encontrado en patient:', tipoIdentificacionNombre);
                } else {
                    // Si no está directamente, intentar con el ID y la lista de tipos
                    const tipoIdentificacionId = human.document_type_id || patient.document_type_id;
                    
                    if (tipoIdentificacionId && tiposIdentificacion.length > 0) {
                        const tipoEncontrado = tiposIdentificacion.find(tipo => tipo.id === tipoIdentificacionId);
                        if (tipoEncontrado) {
                            tipoIdentificacionNombre = tipoEncontrado.name;
                            console.log('Tipo de identificación encontrado por ID:', tipoIdentificacionNombre);
                        }
                    } else if (human.document_type) {
                        // Si ya tenemos el nombre del tipo directamente en human
                        tipoIdentificacionNombre = human.document_type;
                        console.log('Tipo de identificación encontrado en human:', tipoIdentificacionNombre);
                    }
                }
                
                // Formatear los datos del paciente para mostrarlos
                const pacienteData = {
                    id: patient.id,
                    primerNombre: human.first_name || '',
                    segundoNombre: human.middle_name || '',
                    primerApellido: human.last_name || '',
                    segundoApellido: human.second_last_name || '',
                    tipoIdentificacion: tipoIdentificacionNombre,
                    numeroIdentificacion: human.document_number || patient.identification_number || '',
                    telefono: patient.phone || human.phone || 'No disponible',
                    correo: patient.email || 'No disponible',
                    fechaNacimiento: human.birth_date ? new Date(human.birth_date).toLocaleDateString() : 'No disponible',
                    genero: human.gender || 'No especificado',
                    direccion: human.address || 'No disponible',
                    ciudad: human.city || 'No disponible',
                    fechaCreacion: patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'No disponible',
                    fechaActualizacion: patient.updated_at ? new Date(patient.updated_at).toLocaleDateString() : 'No disponible'
                };
                
                setPaciente(pacienteData);
                
                // Mantenemos los documentos de ejemplo por ahora
                // En una implementación futura, estos vendrían del backend
                const documentosData = [
                    {
                        id: 1,
                        titulo: 'Test de Ansiedad',
                        tipo: 'Evaluación Psicológica',
                        fechaCreacion: '2023-08-15',
                        fechaActualizacion: '2023-08-15',
                        estado: 'Completado',
                        icono: 'FileCheck'
                    },
                    {
                        id: 2,
                        titulo: 'Test de Depresión de Beck',
                        tipo: 'Evaluación Psicológica',
                        fechaCreacion: '2023-09-23',
                        fechaActualizacion: '2023-09-25',
                        estado: 'Completado',
                        icono: 'FileCheck'
                    },
                    {
                        id: 3,
                        titulo: 'Evaluación Cognitiva',
                        tipo: 'Evaluación Neuropsicológica',
                        fechaCreacion: '2023-10-10',
                        fechaActualizacion: '2023-10-15',
                        estado: 'En revisión',
                        icono: 'FileText'
                    },
                    {
                        id: 4,
                        titulo: 'Plan de Intervención',
                        tipo: 'Documento Clínico',
                        fechaCreacion: '2023-11-05',
                        fechaActualizacion: '2023-11-05',
                        estado: 'Pendiente',
                        icono: 'FileX'
                    },
                    {
                        id: 5,
                        titulo: 'Evaluación de Personalidad',
                        tipo: 'Evaluación Psicológica',
                        fechaCreacion: '2024-01-20',
                        fechaActualizacion: '2024-01-25',
                        estado: 'Completado',
                        icono: 'FileCheck'
                    }
                ];
                
                setDocumentos(documentosData);
            } catch (err) {
                console.error('Error al cargar datos del paciente:', err);
                setError(err.message || 'Error al cargar datos del paciente');
                
                // Mostrar alerta de error
                Swal.fire({
                    title: 'Error',
                    text: err.message || 'No se pudieron cargar los datos del paciente',
                    icon: 'error',
                    confirmButtonColor: '#FB8500'
                }).then(() => {
                    navigate('/dashboard');
                });
            } finally {
                setLoading(false);
            }
        };
        
        fetchPatientData();
    }, [id, navigate, tiposIdentificacion]);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleViewDocument = (documento) => {
        setPreviewDocument(documento);
        setShowPreview(true);
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setPreviewDocument(null);
    };

    const handleOpenUploadModal = () => {
        setShowUploadModal(true);
    };

    const handleCloseUploadModal = () => {
        setShowUploadModal(false);
        setNewDocument({
            titulo: '',
            archivo: null
        });
        setSelectedFileName('');
    };

    const handleDocumentInputChange = (e) => {
        const { name, value } = e.target;
        setNewDocument({
            ...newDocument,
            [name]: value
        });
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewDocument({
                ...newDocument,
                archivo: file
            });
            setSelectedFileName(file.name);
        }
    };

    const handleUploadAreaClick = () => {
        fileInputRef.current.click();
    };

    const handleUploadDocument = () => {
        // Aquí iría la lógica real para subir el documento al servidor
        console.log('Subiendo documento:', newDocument);
        
        // Añadimos el documento nuevo a la lista (simulación)
        const fechaActual = new Date().toISOString().split('T')[0];
        const nuevoDocumento = {
            id: documentos.length + 1,
            titulo: newDocument.titulo,
            fechaCreacion: fechaActual,
            fechaActualizacion: fechaActual,
            icono: 'FileText'
        };
        
        setDocumentos([nuevoDocumento, ...documentos]);
        
        // Mostrar alerta de éxito
        Swal.fire({
            title: 'Documento subido',
            text: 'El documento se ha subido correctamente',
            icon: 'success',
            confirmButtonColor: '#FB8500',
            timer: 2000,
            showConfirmButton: false
        });
        
        // Cerrar el modal
        handleCloseUploadModal();
    };

    const handleDownloadDocument = (documento) => {
        // Aquí iría la lógica real para descargar el documento
        console.log('Descargando documento:', documento);
        
        // Simulamos la descarga
        setTimeout(() => {
            Swal.fire({
                title: 'Descarga completada',
                text: `El documento "${documento.titulo}" se ha descargado correctamente`,
                icon: 'success',
                confirmButtonColor: '#FB8500',
                timer: 3000,
                showConfirmButton: false
            });
        }, 1500);
    };

    const renderDocumentIcon = (icono, color) => {
        switch(icono) {
            case 'FileCheck':
                return <FileText size={24} color={color} />;
            case 'FileText':
                return <FileText size={24} color={color} />;
            case 'FileX':
                return <FileText size={24} color={color} />;
            default:
                return <FileText size={24} color={color} />;
        }
    };

    // Renderizado condicional mientras se cargan los datos
    if (loading) {
        return (
            <div className={styles.dashboard}>
                <Header variant="dashboard" />
                <div className={styles.main}>
                    <Sidebar />
                    <div className={styles.content}>
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <p>Cargando historial del paciente...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Si hay un error y no hay datos de paciente, no renderizamos el resto
    if (error && !paciente) {
        return (
            <div className={styles.dashboard}>
                <Header variant="dashboard" />
                <div className={styles.main}>
                    <Sidebar />
                    <div className={styles.content}>
                        <div className={styles.errorContainer}>
                            <p>{error}</p>
                            <button 
                                className={styles.retryButton}
                                onClick={() => navigate('/dashboard')}
                            >
                                Volver al Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <Header variant="dashboard" />
            <div className={styles.main}>
                <Sidebar />
                <div className={styles.content}>
                    <div className={styles.contentHeader}>
                        <div className={styles.headerLeft}>
                            <button className={styles.backButton} onClick={handleGoBack}>
                                <ArrowLeft size={20} color="#4F46E5" />
                            </button>
                            <h3>Historial de Paciente</h3>
                        </div>
                    </div>

                    <div className={styles.pacienteInfo}>
                        <h4>
                            {paciente.primerNombre} {paciente.segundoNombre && paciente.segundoNombre + ' '}
                            {paciente.primerApellido} {paciente.segundoApellido && paciente.segundoApellido}
                        </h4>
                        <div className={styles.pacienteDetails}>
                            <span><strong>Tipo de Identificación:</strong> {paciente.tipoIdentificacion}</span>
                            <span><strong>Número de Identificación:</strong> {paciente.numeroIdentificacion}</span>
                            <span><strong>Correo:</strong> {paciente.correo}</span>
                        </div>
                    </div>

                    <div className={styles.historialesContainer}>
                        <h4 className={styles.sectionTitle}>Documentos y Evaluaciones</h4>
                        <div className={styles.headerActions}>
                            <button 
                                className={styles.addDocumentButton}
                                onClick={handleOpenUploadModal}
                            >
                                <Plus size={20} color="#FB8500" />
                                Subir documento
                            </button>
                        </div>
                        
                        <div className={styles.documentosGrid}>
                            {documentos.map(documento => (
                                <div className={styles.documentCard} key={documento.id}>
                                    <div className={styles.documentHeader}>
                                        <div className={styles.documentIcon}>
                                            {renderDocumentIcon(documento.icono, "#219EBC")}
                                        </div>
                                        <div className={styles.documentTitle}>
                                            <h5>{documento.titulo}</h5>
                                            <span className={styles.documentType}>{documento.tipo}</span>
                                        </div>
                                    </div>
                                    <div className={styles.documentInfo}>
                                        <p><strong>Creado:</strong> {documento.fechaCreacion}</p>
                                        <p><strong>Actualizado:</strong> {documento.fechaActualizacion}</p>
                                    </div>
                                    <div className={styles.documentActions}>
                                        <button 
                                            className={styles.actionButton}
                                            title="Ver documento"
                                            onClick={() => handleViewDocument(documento)}
                                        >
                                            <Eye size={18} color="#059669" />
                                            <span>Ver</span>
                                        </button>
                                        <button 
                                            className={styles.actionButton}
                                            title="Descargar documento"
                                            onClick={() => handleDownloadDocument(documento)}
                                        >
                                            <Download size={18} color="#7C3AED" />
                                            <span>Descargar</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de vista previa */}
            {showPreview && previewDocument && (
                <div className={styles.previewOverlay}>
                    <div className={styles.previewContainer}>
                        <div className={styles.previewHeader}>
                            <h4>{previewDocument.titulo}</h4>
                            <button onClick={handleClosePreview} className={styles.closeButton}>×</button>
                        </div>
                        <div className={styles.previewContent}>
                            <div className={styles.documentPreview}>
                                <div className={styles.previewPlaceholder}>
                                    <FileText size={64} color="#219EBC" />
                                    <p>Vista previa del documento: {previewDocument.titulo}</p>
                                    <p className={styles.previewNote}>
                                        (Esta es una simulación de vista previa, en una aplicación real aquí se mostraría el contenido del documento)
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.previewActions}>
                            <button
                                className={styles.closePreviewButton}
                                onClick={handleClosePreview}
                            >
                                Cerrar
                            </button>
                            <button
                                className={styles.downloadPreviewButton}
                                onClick={() => {
                                    handleDownloadDocument(previewDocument);
                                    handleClosePreview();
                                }}
                            >
                                <Download size={16} color="#7C3AED" />
                                Descargar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para subir documento */}
            {showUploadModal && (
                <div className={styles.uploadModal}>
                    <div className={styles.uploadContainer}>
                        <div className={styles.uploadHeader}>
                            <h4>Subir documento</h4>
                            <button onClick={handleCloseUploadModal} className={styles.closeButton}>×</button>
                        </div>
                        <div className={styles.uploadContent}>
                            <div className={styles.formField}>
                                <label htmlFor="titulo">Nombre del documento *</label>
                                <input
                                    type="text"
                                    id="titulo"
                                    name="titulo"
                                    value={newDocument.titulo}
                                    onChange={handleDocumentInputChange}
                                    placeholder="Nombre del documento"
                                    required
                                />
                            </div>

                            <div className={styles.formField}>
                                <label>Documento *</label>
                                <div 
                                    className={styles.fileUploadArea}
                                    onClick={handleUploadAreaClick}
                                >
                                    <div className={styles.fileUploadIcon}>
                                        <Upload size={30} color="#0891B2" />
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
                        <div className={styles.uploadActions}>
                            <button 
                                className={styles.cancelButton}
                                onClick={handleCloseUploadModal}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={styles.uploadButton}
                                onClick={handleUploadDocument}
                                disabled={!newDocument.titulo || !selectedFileName}
                            >
                                <Upload size={16} color="#0891B2" />
                                Subir documento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialPaciente;
