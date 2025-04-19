import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/layout/Header/Header';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import { ArrowLeft, Eye, Download, FileText, FileCheck, FileX, Upload, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import styles from './styles.module.css';

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
        tipo: 'Evaluación Psicológica',
        estado: 'Pendiente',
        archivo: null
    });
    const [selectedFileName, setSelectedFileName] = useState('');
    const fileInputRef = useRef(null);

    // Simular carga de datos del paciente
    useEffect(() => {
        // Simulamos la carga de datos (en una app real, esto sería una llamada a API)
        setTimeout(() => {
            // Datos de ejemplo del paciente
            const pacienteData = {
                id: id,
                primerNombre: 'Juan',
                segundoNombre: 'Carlos',
                primerApellido: 'Pérez',
                segundoApellido: 'Gómez',
                tipoIdentificacion: 'C.C',
                numeroIdentificacion: '1023456789',
                telefono: '3102345678',
                correo: 'juan.perez@ejemplo.com'
            };
            
            // Lista de documentos de ejemplo
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
            
            setPaciente(pacienteData);
            setDocumentos(documentosData);
            setLoading(false);
        }, 800);
    }, [id]);

    const handleGoBack = () => {
        navigate(-1);
    };

    const getStatusColor = (estado) => {
        switch(estado) {
            case 'Completado':
                return '#4caf50'; // verde
            case 'En revisión':
                return '#2196f3'; // azul
            case 'Pendiente':
                return '#ff9800'; // naranja
            default:
                return '#757575'; // gris
        }
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
            tipo: 'Evaluación Psicológica',
            estado: 'Pendiente',
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
            tipo: newDocument.tipo,
            fechaCreacion: fechaActual,
            fechaActualizacion: fechaActual,
            estado: newDocument.estado,
            icono: newDocument.estado === 'Completado' ? 'FileCheck' : 
                  newDocument.estado === 'Pendiente' ? 'FileX' : 'FileText'
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

    const renderDocumentIcon = (iconName) => {
        switch(iconName) {
            case 'FileCheck':
                return <FileCheck size={24} color="#4caf50" />;
            case 'FileX':
                return <FileX size={24} color="#ff9800" />;
            case 'FileText':
            default:
                return <FileText size={24} color="#2196f3" />;
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

    return (
        <div className={styles.dashboard}>
            <Header variant="dashboard" />
            <div className={styles.main}>
                <Sidebar />
                <div className={styles.content}>
                    <div className={styles.contentHeader}>
                        <div className={styles.headerLeft}>
                            <button className={styles.backButton} onClick={handleGoBack}>
                                <ArrowLeft size={20} />
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
                            <span><strong>Identificación:</strong> {paciente.tipoIdentificacion} {paciente.numeroIdentificacion}</span>
                            <span><strong>Teléfono:</strong> {paciente.telefono}</span>
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
                                <Plus size={16} />
                                Subir documento
                            </button>
                        </div>
                        
                        <div className={styles.documentosGrid}>
                            {documentos.map(documento => (
                                <div className={styles.documentCard} key={documento.id}>
                                    <div className={styles.documentHeader}>
                                        <div className={styles.documentIcon}>
                                            {renderDocumentIcon(documento.icono)}
                                        </div>
                                        <div className={styles.documentTitle}>
                                            <h5>{documento.titulo}</h5>
                                            <span className={styles.documentType}>{documento.tipo}</span>
                                        </div>
                                    </div>
                                    <div className={styles.documentInfo}>
                                        <div className={styles.documentDate}>
                                            <span>Fecha actualización: {documento.fechaActualizacion}</span>
                                        </div>
                                        <div className={styles.statusBadge} style={{backgroundColor: getStatusColor(documento.estado)}}>
                                            {documento.estado}
                                        </div>
                                    </div>
                                    <div className={styles.documentActions}>
                                        <button 
                                            className={styles.actionButton}
                                            title="Ver documento"
                                            onClick={() => handleViewDocument(documento)}
                                        >
                                            <Eye size={18} />
                                            <span>Ver</span>
                                        </button>
                                        <button 
                                            className={styles.actionButton}
                                            title="Descargar documento"
                                            onClick={() => handleDownloadDocument(documento)}
                                        >
                                            <Download size={18} />
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
                                <Download size={16} />
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
                                <label htmlFor="tipo">Tipo de documento *</label>
                                <select
                                    id="tipo"
                                    name="tipo"
                                    value={newDocument.tipo}
                                    onChange={handleDocumentInputChange}
                                    required
                                >
                                    <option value="Evaluación Psicológica">Evaluación Psicológica</option>
                                    <option value="Evaluación Neuropsicológica">Evaluación Neuropsicológica</option>
                                    <option value="Documento Clínico">Documento Clínico</option>
                                    <option value="Informe de Terapia">Informe de Terapia</option>
                                    <option value="Plan de Intervención">Plan de Intervención</option>
                                </select>
                            </div>
                            <div className={styles.formField}>
                                <label htmlFor="estado">Estado del documento *</label>
                                <select
                                    id="estado"
                                    name="estado"
                                    value={newDocument.estado}
                                    onChange={handleDocumentInputChange}
                                    required
                                >
                                    <option value="Completado">Completado</option>
                                    <option value="En revisión">En revisión</option>
                                    <option value="Pendiente">Pendiente</option>
                                </select>
                            </div>
                            <div className={styles.formField}>
                                <label>Documento *</label>
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
