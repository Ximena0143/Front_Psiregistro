import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Download, Upload, FileText, Trash2, ArrowLeft, Plus, Edit2 } from 'react-feather';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import Header from '../../../components/layout/Header/Header';
import Swal from 'sweetalert2';
import styles from './styles.module.css';
import patientService from '../../../services/patient';
import ListaRecordatorios from '../recordatorios/ListaRecordatorios';
import FormularioRecordatorio from '../recordatorios/FormularioRecordatorio';

// Función auxiliar para detectar si un documento es PDF
const isPdfDocument = (documento) => {
    if (!documento) return false;
    
    // Verificar por la URL
    if (documento.signed_url) {
        // Check if URL contains .pdf
        if (documento.signed_url.toLowerCase().includes('.pdf')) {
            return true;
        }
        
        // Check if URL contains specific AWS S3 parameters for PDFs
        if (documento.signed_url.includes('X-Amz-') && 
            (documento.signed_url.includes('/pdf') || documento.signed_url.includes('Content-Type=application%2Fpdf'))) {
            return true;
        }
    }
    
    // Verificar por el nombre original del archivo
    if (documento.tituloOriginal && documento.tituloOriginal.toLowerCase().endsWith('.pdf')) {
        return true;
    }
    
    // Verificar por el tipo MIME o content type si está disponible
    if (documento.contentType && documento.contentType.toLowerCase().includes('pdf')) {
        return true;
    }
    
    // Verificar por el título
    if (documento.titulo && documento.titulo.toLowerCase().includes('pdf')) {
        return true;
    }
    
    return false;
};

// Función para obtener información del estado del documento con color
const getDocumentStatus = (statusId) => {
    switch (parseInt(statusId)) {
        case 1:
            return { text: 'Finalizado', color: '#059669', bgColor: '#ECFDF5' }; // Verde
        case 2:
            return { text: 'En revisión', color: '#9333EA', bgColor: '#F5F3FF' }; // Morado
        case 3:
            return { text: 'Pendiente', color: '#F59E0B', bgColor: '#FFFBEB' }; // Amarillo
        case 4:
            return { text: 'Archivado', color: '#6B7280', bgColor: '#F9FAFB' }; // Gris
        default:
            return { text: 'Desconocido', color: '#6B7280', bgColor: '#F9FAFB' }; // Gris
    }
};

// Función para obtener el icono según la extensión del archivo
const getFileIcon = (documento) => {
    // Si no hay documento o URL, devolver icono por defecto
    if (!documento || !documento.signed_url) return <FileText size={24} color="#0891B2" />;
    
    const url = documento.signed_url.toLowerCase();
    const tituloOriginal = (documento.tituloOriginal || '').toLowerCase();
    
    // Verificar por extensiones en la URL o en el título original
    if (url.includes('.pdf') || tituloOriginal.endsWith('.pdf')) {
        return <FileText size={24} color="#E11D48" />; // Rojo para PDF
    } else if (url.includes('.doc') || url.includes('.docx') || 
               tituloOriginal.endsWith('.doc') || tituloOriginal.endsWith('.docx')) {
        return <FileText size={24} color="#2563EB" />; // Azul para Word
    } else if (url.includes('.xls') || url.includes('.xlsx') || 
               tituloOriginal.endsWith('.xls') || tituloOriginal.endsWith('.xlsx')) {
        return <FileText size={24} color="#059669" />; // Verde para Excel
    } else if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') ||
               tituloOriginal.endsWith('.jpg') || tituloOriginal.endsWith('.jpeg') || 
               tituloOriginal.endsWith('.png')) {
        return <FileText size={24} color="#7C3AED" />; // Morado para imágenes
    } else {
        // Determinar por tipo de documento si está disponible
        if (documento.tipo === 'medical_history') {
            return <FileText size={24} color="#E11D48" />; // Rojo para historia médica
        } else if (documento.tipo === 'authorization') {
            return <FileText size={24} color="#2563EB" />; // Azul para autorizaciones
        } else if (documento.tipo === 'test') {
            return <FileText size={24} color="#059669" />; // Verde para pruebas
        } else {
            return <FileText size={24} color="#0891B2" />; // Color por defecto
        }
    }
};

const HistorialPaciente = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [paciente, setPaciente] = useState(null);
    const [documentos, setDocumentos] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    
    // Estados para recordatorios
    const [showReminderForm, setShowReminderForm] = useState(false);
    const [reminderToEdit, setReminderToEdit] = useState(null);
    
    // Ya no necesitamos los estados para el visor PDF avanzado
    const [newDocument, setNewDocument] = useState({
        titulo: '',
        archivo: null,
        document_type: 'medical_history', // Valor por defecto: medical_history
        status_id: 1 // Valor por defecto: 1 (finalized)
    });
    
    // Opciones para tipos de documento
    const documentTypes = [
        { value: 'authorization', label: 'Autorización' },
        { value: 'test', label: 'Test' },
        { value: 'medical_history', label: 'Historia Médica' }
    ];
    
    // Opciones para estados de documento
    const documentStatuses = [
        { value: 1, label: 'Finalizado' },
        { value: 2, label: 'En revisión' },
        { value: 3, label: 'Pendiente' },
        { value: 4, label: 'Archivado' }
    ];
    const [selectedFileName, setSelectedFileName] = useState('');
    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);
    const [error, setError] = useState(null);
    const [tiposIdentificacion, setTiposIdentificacion] = useState([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    
    // Estados para la funcionalidad de edición
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);
    const [editDocumentData, setEditDocumentData] = useState({
        titulo: '',
        document_type: '',
        status_id: '',
        archivo: null
    });
    const [editSelectedFileName, setEditSelectedFileName] = useState('');

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
                const response = await patientService.getPatientById(id);
                
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
                } else {
                    // Si no está directamente, intentar con el ID y la lista de tipos
                    const tipoIdentificacionId = human.document_type_id || patient.document_type_id;
                    
                    if (tipoIdentificacionId && tiposIdentificacion.length > 0) {
                        const tipoEncontrado = tiposIdentificacion.find(tipo => tipo.id === tipoIdentificacionId);
                        if (tipoEncontrado) {
                            tipoIdentificacionNombre = tipoEncontrado.name;
                        }
                    } else if (human.document_type) {
                        // Si ya tenemos el nombre del tipo directamente en human
                        tipoIdentificacionNombre = human.document_type;
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
                
                // Cargar los documentos del paciente
                fetchPatientDocuments(patient.id);
                
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

    // Función para cargar los documentos del paciente
    const fetchPatientDocuments = async (patientId) => {
        try {
            setLoadingDocuments(true);
            const documentosData = await patientService.getPatientDocuments(patientId);
            
            // Transformar los documentos al formato que espera el componente
            const documentosFormateados = documentosData.map(doc => {
                // Extraer un título más amigable del nombre del archivo
                let tituloAmigable = doc.tittle || '';
                
                // Eliminar prefijos como 'Auth-', 'Test-', 'Medical-history-'
                tituloAmigable = tituloAmigable
                    .replace(/^Auth-/i, '')
                    .replace(/^Test-/i, '')
                    .replace(/^Medical-history-/i, '');
                
                // Convertir guiones en espacios
                tituloAmigable = tituloAmigable.replace(/-/g, ' ');
                
                // Eliminar extensión de archivo manteniendo el resto del contenido
                tituloAmigable = tituloAmigable.replace(/\.\w+$/, '');
                
                // Capitalizar palabras
                tituloAmigable = tituloAmigable
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                
                // Mapear el estado textual a su correspondiente ID si no viene del backend
                let statusId = doc.status_id;
                if (!statusId && doc.estado) {
                    // Mapear el estado textual a un ID
                    switch (doc.estado.toLowerCase()) {
                        case 'completado':
                        case 'finalizado':
                            statusId = 1;
                            break;
                        case 'en revisión':
                        case 'en revision':
                            statusId = 2;
                            break;
                        case 'pendiente':
                        case 'en proceso':
                            statusId = 3;
                            break;
                        case 'archivado':
                            statusId = 4;
                            break;
                        default:
                            statusId = 3; // Default a 'Pendiente' si no se reconoce
                    }
                }
                
                return {
                    id: doc.id,
                    titulo: tituloAmigable, // Título amigable extraído del nombre del archivo
                    tituloOriginal: doc.tittle, // Guardamos el título original por si se necesita
                    tipo: doc.document_type || 'Documento',
                    fechaCreacion: new Date().toISOString().split('T')[0], // Usamos fecha actual ya que no viene en la respuesta
                    fechaActualizacion: new Date().toISOString().split('T')[0],
                    estado: doc.estado || (statusId === 1 ? 'Completado' : 'En proceso'),
                    icono: 'FileText',
                    signed_url: doc.document_url || doc.document_path, // Usar document_url para descargas, con fallback a document_path
                    document_path: doc.document_path, // Mantener document_path para otros propósitos
                    expires_in: doc.expires_in,
                    status_id: statusId // Usamos el status_id asignado
                };
            });
            
            setDocumentos(documentosFormateados);
        } catch (error) {
            console.error('Error al cargar documentos del paciente:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los documentos del paciente',
                icon: 'error',
                confirmButtonColor: '#FB8500',
                timer: 3000
            });
            // Si hay un error, dejamos la lista de documentos vacía
            setDocumentos([]);
        } finally {
            setLoadingDocuments(false);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleViewDocument = (documento) => {
        setPreviewDocument(documento);
        setShowPreview(true);
    };
    
    const handleDownloadDocument = (documento) => {
        // Verificar que documento y signed_url existan
        if (documento && documento.signed_url) {
            // Crear un elemento a invisible para forzar la descarga
            const link = document.createElement('a');
            link.target = '_blank';
            link.download = documento.tituloOriginal || documento.titulo || 'documento';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.error('Error en descarga - URL no disponible:', documento);
            Swal.fire({
                title: 'Error',
                text: 'No se puede descargar el documento. URL no disponible.',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
        }
    };
    
    const handleDeleteDocument = async (documentId) => {
        try {
            // Mostrar confirmación antes de eliminar
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: 'El documento será eliminado permanentemente',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });
            
            if (result.isConfirmed) {
                // Mostrar loading mientras se elimina
                Swal.fire({
                    title: 'Eliminando documento...',
                    text: 'Por favor espera',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                // Llamar al servicio para eliminar el documento
                await patientService.deletePatientDocument(documentId);
                
                // Actualizar la lista de documentos
                fetchPatientDocuments(paciente.id);
                
                // Mostrar mensaje de éxito
                Swal.fire(
                    'Eliminado',
                    'El documento ha sido eliminado correctamente',
                    'success'
                );
            }
        } catch (error) {
            console.error('Error al eliminar documento:', error);
            Swal.fire(
                'Error',
                'No se pudo eliminar el documento. Inténtalo de nuevo.',
                'error'
            );
        }
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setPreviewDocument(null);
    };

    const handleOpenUploadModal = () => {
        setShowUploadModal(true);
    };

    const handleCloseUploadModal = () => {
        // Cerrar el modal
        setShowUploadModal(false);
        
        // Limpiar el formulario
        setNewDocument({
            titulo: '',
            archivo: null,
            document_type: 'medical_history',
            status_id: 1
        });
        setSelectedFileName('');
    };
    
    // Handler para abrir el modal de edición de documento
    const handleEditDocument = (documento) => {
        setEditingDocument(documento);
        setEditDocumentData({
            titulo: documento.titulo,
            document_type: documento.tipo,
            status_id: documento.status_id || 1,
            archivo: null
        });
        setEditSelectedFileName('');
        setShowEditModal(true);
    };
    
    // Handler para cerrar el modal de edición
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingDocument(null);
        setEditDocumentData({
            titulo: '',
            document_type: '',
            status_id: '',
            archivo: null
        });
        setEditSelectedFileName('');
    };
    
    // Handler para cambios en los campos del formulario de edición
    const handleEditDocumentInputChange = (e) => {
        const { name, value } = e.target;
        setEditDocumentData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };
    
    // Handler para seleccionar un archivo en el formulario de edición
    const handleEditFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditDocumentData(prevData => ({
                ...prevData,
                archivo: file
            }));
            setEditSelectedFileName(file.name);
        }
    };
    
    // Handler para hacer clic en el área de upload en edición
    const handleEditUploadAreaClick = () => {
        editFileInputRef.current.click();
    };
    
    // Handler para guardar los cambios de un documento editado
    const handleUpdateDocument = async () => {
        if (!editingDocument || !editDocumentData.titulo) {
            Swal.fire({
                title: 'Error',
                text: 'Por favor completa todos los campos obligatorios',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return;
        }
        
        try {
            Swal.fire({
                title: 'Actualizando...',
                text: 'Guardando cambios en el documento',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            // Llamada a la API para actualizar el documento
            await patientService.updatePatientDocument(
                editingDocument.id,
                id, // paciente ID desde useParams
                editDocumentData.titulo,
                editDocumentData.document_type,
                editDocumentData.status_id,
                editDocumentData.archivo // podría ser null si no hay archivo nuevo
            );
            
            // Actualizar la lista de documentos
            await fetchPatientDocuments(id);
            
            // Cerrar el modal y limpiar el formulario
            handleCloseEditModal();
            
            Swal.fire({
                title: '¡Éxito!',
                text: 'Documento actualizado correctamente',
                icon: 'success',
                confirmButtonText: 'Continuar'
            });
            
        } catch (error) {
            console.error('Error al actualizar el documento:', error);
            let errorMessage = 'Error al actualizar el documento';
            if (error.response && error.response.data) {
                errorMessage = error.response.data.message || errorMessage;
            }
            
            Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
    };

    const handleDocumentInputChange = (e) => {
        const { name, value } = e.target;
        setNewDocument(prev => ({
            ...prev,
            [name]: name === 'status_id' ? parseInt(value, 10) : value
        }));
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewDocument(prev => ({
                ...prev,
                archivo: file
            }));
            setSelectedFileName(file.name);
        }
    };

    const handleUploadAreaClick = () => {
        fileInputRef.current.click();
    };

    const handleUploadDocument = async () => {
        try {
            // Verificar que tenemos todos los datos necesarios
            if (!newDocument.titulo || !newDocument.archivo || !paciente?.id) {
                throw new Error('Faltan datos requeridos para subir el documento');
            }
            
            // Mostrar indicador de carga
            Swal.fire({
                title: 'Subiendo documento...',
                text: 'Por favor espere',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            // Convertir status_id a número si es string
            const statusId = typeof newDocument.status_id === 'string' 
                ? parseInt(newDocument.status_id, 10) 
                : newDocument.status_id;
                
            // Llamar al servicio para subir el documento
            await patientService.uploadPatientDocument(
                paciente.id,
                newDocument.archivo,
                newDocument.titulo,
                newDocument.document_type,
                statusId
            );
            
            
            // Cerrar el indicador de carga
            Swal.close();
            
            // Mostrar alerta de éxito
            Swal.fire({
                title: 'Documento subido',
                text: 'El documento se ha subido correctamente',
                icon: 'success',
                confirmButtonColor: '#FB8500',
                timer: 2000,
                showConfirmButton: false
            });
            
            // Actualizar la lista de documentos
            fetchPatientDocuments(paciente.id);
            
            // Cerrar el modal
            handleCloseUploadModal();
            
        } catch (error) {
            console.error('Error al subir documento:', error);
            
            Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo subir el documento',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
        }
    };

    // Manejadores para recordatorios
    const handleAddReminder = () => {
        setReminderToEdit(null);
        setShowReminderForm(true);
    };
    
    const handleEditReminder = (reminder) => {
        setReminderToEdit(reminder);
        setShowReminderForm(true);
    };
    
    const handleCloseReminderForm = () => {
        setShowReminderForm(false);
        setReminderToEdit(null);
    };
    
    const handleReminderSuccess = () => {
        // Después de guardar un recordatorio correctamente
        setShowReminderForm(false);
        setReminderToEdit(null);
        
        // Mostrar notificación de éxito
        Swal.fire({
            icon: 'success',
            title: 'Operación completada',
            text: 'El recordatorio ha sido guardado correctamente',
            timer: 2000,
            showConfirmButton: false
        });
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
                        
                        {loadingDocuments ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner}></div>
                                <p>Cargando documentos...</p>
                            </div>
                        ) : documentos.length > 0 ? (
                            <div className={styles.documentosContainer}>
                                {/* Agrupar documentos por tipo */}
                                {(() => {
                                    // Agrupar documentos por tipo
                                    const documentosPorTipo = {
                                        authorization: documentos.filter(doc => doc.tipo === 'authorization'),
                                        test: documentos.filter(doc => doc.tipo === 'test'),
                                        medical_history: documentos.filter(doc => doc.tipo === 'medical_history')
                                    };
                                    
                                    // Mapeo de tipos a nombres en español
                                    const tiposNombres = {
                                        authorization: 'Autorizaciones',
                                        test: 'Tests',
                                        medical_history: 'Historia Médica'
                                    };
                                    
                                    // Renderizar cada grupo
                                    return Object.entries(documentosPorTipo).map(([tipo, docs]) => {
                                        if (docs.length === 0) return null;
                                        
                                        return (
                                            <div key={tipo} className={styles.documentGroup}>
                                                <h4 className={styles.groupTitle}>{tiposNombres[tipo]} ({docs.length})</h4>
                                                <div className={styles.documentosGrid}>
                                                    {docs.map(documento => (
                                                        <div className={styles.documentCard} key={documento.id}>
                                                            <div className={styles.documentHeader}>
                                                                <div className={styles.documentIcon}>
                                                                    {getFileIcon(documento)}
                                                                </div>
                                                                <div className={styles.documentTitle}>
                                                                    <h5 title={documento.titulo}>{documento.titulo}</h5>
                                                                    <div className={styles.documentMeta}>
                                                                        <span className={styles.documentType}>
                                                                            {documento.tipo === 'medical_history' ? 'Historia Médica' :
                                                                             documento.tipo === 'authorization' ? 'Autorización' :
                                                                             documento.tipo === 'test' ? 'Test' : documento.tipo}
                                                                        </span>
                                                                        <div 
                                                                            className={styles.documentStatus}
                                                                            style={{
                                                                                backgroundColor: getDocumentStatus(documento.status_id).bgColor,
                                                                                color: getDocumentStatus(documento.status_id).color,
                                                                                border: `1px solid ${getDocumentStatus(documento.status_id).color}`
                                                                            }}
                                                                        >
                                                                            {getDocumentStatus(documento.status_id).text}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className={styles.documentInfo}>
                                                                <p><strong>Creado:</strong> {documento.fechaCreacion}</p>
                                                                <p><strong>Actualizado:</strong> {documento.fechaActualizacion}</p>
                                                                {documento.expires_in && (
                                                                    <p><strong>Expira en:</strong> {documento.expires_in}</p>
                                                                )}
                                                            </div>
                                                            <div className={styles.documentActions}>
                                                                {/* Botón Ver solo para documentos que NO son PDF */}
                                                                {!isPdfDocument(documento) && (
                                                                    <button 
                                                                        className={styles.actionButton}
                                                                        title="Ver documento"
                                                                        onClick={() => handleViewDocument(documento)}
                                                                    >
                                                                        <Eye size={18} color="#0891B2" />
                                                                        <span>Ver</span>
                                                                    </button>
                                                                )}
                                                                
                                                                {/* Botón de descarga/ver para todos los documentos */}
                                                                <button 
                                                                    className={styles.actionButton}
                                                                    title={isPdfDocument(documento) ? "Ver documento" : "Descargar documento"}
                                                                    onClick={() => handleDownloadDocument(documento)}
                                                                >
                                                                    {isPdfDocument(documento) ? 
                                                                        <Eye size={18} color="#7C3AED" /> : 
                                                                        <Download size={18} color="#7C3AED" />}
                                                                    <span>{isPdfDocument(documento) ? "Ver" : "Descargar"}</span>
                                                                </button>
                                                                
                                                                <button 
                                                                    className={styles.actionButton}
                                                                    title="Editar documento"
                                                                    onClick={() => handleEditDocument(documento)}
                                                                >
                                                                    <Edit2 size={18} color="#0891B2" />
                                                                    <span>Editar</span>
                                                                </button>
                                                                
                                                                <button 
                                                                    className={styles.actionButton}
                                                                    title="Eliminar documento"
                                                                    onClick={() => handleDeleteDocument(documento.id)}
                                                                >
                                                                    <Trash2 size={18} color="#E11D48" />
                                                                    <span>Eliminar</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()} 
                            </div>
                        ) : (
                            <div className={styles.noDocuments}>
                                <p>No hay documentos disponibles para este paciente.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Sección de recordatorios */}
                    <section className={styles.section}>
                        {showReminderForm ? (
                            <FormularioRecordatorio
                                patientId={id}
                                reminderToEdit={reminderToEdit}
                                onClose={handleCloseReminderForm}
                                onSuccess={handleReminderSuccess}
                            />
                        ) : (
                            <ListaRecordatorios 
                                patientId={id} 
                                onAddNew={handleAddReminder} 
                                onEditReminder={handleEditReminder} 
                            />
                        )}
                    </section>
                </div>
            </div>

            {/* Modal de Previsualización */}
            {showPreview && previewDocument && (
                <div className={styles.previewOverlay}>
                    <div className={styles.previewContainer}>
                        <div className={styles.previewHeader}>
                            <h4>{previewDocument.titulo}</h4>
                            <button onClick={handleClosePreview} className={styles.closeButton}>×</button>
                        </div>
                        <div className={styles.previewContent}>
                            {previewDocument.signed_url ? (
                                // Determinar el tipo de archivo para mostrar la vista previa adecuada
                                (() => {
                                    // Verificar si la URL o el título contiene indicación del tipo de archivo
                                    const isPdf = isPdfDocument(previewDocument);
                                    let fileIcon = <FileText size={64} color="#219EBC" />;
                                    let fileTypeText = 'documento';
                                    
                                    // Para PDFs, mostrar mensaje para descargar
                                    if (isPdf) {
                                        return (
                                            <div className={styles.documentPreview}>
                                                <div className={styles.previewPlaceholder}>
                                                    <FileText size={64} color="#E11D48" />
                                                    <p>Documento PDF: <strong>{previewDocument.titulo}</strong></p>
                                                    <p className={styles.previewNote}>
                                                        No se puede mostrar una vista previa para este documento PDF.
                                                    </p>
                                                    <p className={styles.previewTip}>
                                                        Utiliza el botón "Descargar" para guardar y abrir el archivo en tu dispositivo.
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                    // Para documentos de Word, mostrar icono de Word
                                    if (previewDocument.signed_url.toLowerCase().includes('.doc') || 
                                        previewDocument.signed_url.toLowerCase().includes('.docx') ||
                                        (previewDocument.tituloOriginal && 
                                         (previewDocument.tituloOriginal.toLowerCase().endsWith('.doc') || 
                                          previewDocument.tituloOriginal.toLowerCase().endsWith('.docx')))) {
                                        fileIcon = <FileText size={64} color="#2563EB" />;
                                        fileTypeText = 'documento Word';
                                    }
                                    
                                    // Para hojas de cálculo Excel
                                    else if (previewDocument.signed_url.toLowerCase().includes('.xls') || 
                                             previewDocument.signed_url.toLowerCase().includes('.xlsx') ||
                                             (previewDocument.tituloOriginal && 
                                              (previewDocument.tituloOriginal.toLowerCase().endsWith('.xls') || 
                                               previewDocument.tituloOriginal.toLowerCase().endsWith('.xlsx')))) {
                                        fileIcon = <FileText size={64} color="#059669" />;
                                        fileTypeText = 'hoja de Excel';
                                    }
                                    
                                    // Para imágenes
                                    else if (previewDocument.signed_url.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ||
                                             (previewDocument.tituloOriginal && 
                                              previewDocument.tituloOriginal.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i))) {
                                        return (
                                            <div className={styles.documentPreview}>
                                                <img 
                                                    src={previewDocument.signed_url} 
                                                    alt={previewDocument.titulo || 'Vista previa'} 
                                                    className={styles.previewImage}
                                                />
                                            </div>
                                        );
                                    }
                                    
                                    // Para otros formatos, mostrar placeholder
                                    return (
                                        <div className={styles.documentPreview}>
                                            <div className={styles.previewPlaceholder}>
                                                {fileIcon}
                                                <p>Vista previa del {fileTypeText}: <strong>{previewDocument.titulo}</strong></p>
                                                <p className={styles.previewNote}>
                                                    No se puede mostrar una vista previa para este tipo de archivo.
                                                </p>
                                                <p className={styles.previewTip}>
                                                    Utiliza el botón "Descargar" para guardar y abrir el archivo en tu dispositivo.
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className={styles.documentPreview}>
                                    <div className={styles.previewPlaceholder}>
                                        <FileText size={64} color="#219EBC" />
                                        <p>Vista previa del documento: {previewDocument.titulo}</p>
                                        <p className={styles.previewNote}>
                                            (No se puede mostrar la vista previa del documento)
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.previewActions}>
                            <button 
                                className={styles.closePreviewButton}
                                onClick={handleClosePreview}
                            >
                                Cerrar
                            </button>
                            
                            {/* Botón de descarga para todos los documentos */}
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

        {/* Modal de Previsualización */}
        {showPreview && previewDocument && (
            <div className={styles.previewOverlay}>
                <div className={styles.previewContainer}>
                    <div className={styles.previewHeader}>
                        <h4>{previewDocument.titulo}</h4>
                        <button onClick={handleClosePreview} className={styles.closeButton}>×</button>
                    </div>
                    <div className={styles.previewContent}>
                        {previewDocument.signed_url ? (
                            // Determinar el tipo de archivo para mostrar la vista previa adecuada
                            (() => {
                                // Verificar si la URL o el título contiene indicación del tipo de archivo
                                const isPdf = isPdfDocument(previewDocument);
                                let fileType = 'desconocido';
                                let fileIcon = <FileText size={64} color="#219EBC" />;
                                let fileTypeText = 'documento';
                                
                                // Para PDFs, mostrar mensaje para descargar
                                if (isPdf) {
                                    // Para PDFs, usar el icono correcto
                                    fileType = 'pdf';
                                    fileIcon = <FileText size={64} color="#E11D48" />;
                                    fileTypeText = 'PDF';
                                    
                                    return (
                                        <div className={styles.documentPreview}>
                                            <div className={styles.previewPlaceholder}>
                                                <FileText size={64} color="#E11D48" />
                                                <p>Documento PDF: <strong>{previewDocument.titulo}</strong></p>
                                                <p className={styles.previewNote}>
                                                    No se puede mostrar una vista previa para este documento PDF.
                                                </p>
                                                <p className={styles.previewTip}>
                                                    Utiliza el botón "Descargar" para guardar y abrir el archivo en tu dispositivo.
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                    
                                    // Para imágenes
                                    else if (previewDocument.signed_url.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ||
                                             (previewDocument.tituloOriginal && 
                                              previewDocument.tituloOriginal.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i))) {
                                        return (
                                            <div className={styles.documentPreview}>
                                                <img 
                                                    src={previewDocument.signed_url} 
                                                    alt={previewDocument.titulo || 'Vista previa'} 
                                                    className={styles.previewImage}
                                                />
                                            </div>
                                        );
                                    }
                                    
                                    // Para otros formatos, mostrar placeholder
                                    return (
                                        <div className={styles.documentPreview}>
                                            <div className={styles.previewPlaceholder}>
                                                {fileIcon}
                                                <p>Vista previa del {fileTypeText}: <strong>{previewDocument.titulo}</strong></p>
                                                <p className={styles.previewNote}>
                                                    No se puede mostrar una vista previa para este tipo de archivo.
                                                </p>
                                                <p className={styles.previewTip}>
                                                    Utiliza el botón "Descargar" para guardar y abrir el archivo en tu dispositivo.
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className={styles.documentPreview}>
                                    <div className={styles.previewPlaceholder}>
                                        <FileText size={64} color="#219EBC" />
                                        <p>Vista previa del documento: {previewDocument.titulo}</p>
                                        <p className={styles.previewNote}>
                                            (No se puede mostrar la vista previa del documento)
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.previewActions}>
                            <button 
                                className={styles.closePreviewButton}
                                onClick={handleClosePreview}
                            >
                                Cerrar
                            </button>
                            
                            {/* Mostrar botón de descarga solo para documentos que no sean PDF */}
                            {!isPdfDocument(previewDocument) && (
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
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para editar documento */}
            {showEditModal && editingDocument && (
                <div className={styles.uploadModal}>
                    <div className={styles.uploadContainer}>
                        <div className={styles.uploadHeader}>
                            <h4>Editar documento</h4>
                            <button onClick={handleCloseEditModal} className={styles.closeButton}>×</button>
                        </div>
                        <div className={styles.uploadContent}>
                            <div className={styles.formField}>
                                <label htmlFor="titulo">Nombre del documento *</label>
                                <input
                                    type="text"
                                    id="titulo"
                                    name="titulo"
                                    value={editDocumentData.titulo}
                                    onChange={handleEditDocumentInputChange}
                                    placeholder="Nombre del documento"
                                    required
                                />
                            </div>
                            
                            <div className={styles.formField}>
                                <label htmlFor="document_type">Tipo de documento *</label>
                                <select
                                    id="document_type"
                                    name="document_type"
                                    value={editDocumentData.document_type}
                                    onChange={handleEditDocumentInputChange}
                                    required
                                    className={styles.selectField}
                                >
                                    {documentTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className={styles.formField}>
                                <label htmlFor="status_id">Estado del documento *</label>
                                <select
                                    id="status_id"
                                    name="status_id"
                                    value={editDocumentData.status_id}
                                    onChange={handleEditDocumentInputChange}
                                    required
                                    className={styles.selectField}
                                >
                                    {documentStatuses.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formField}>
                                <label>Reemplazar documento (opcional)</label>
                                <div 
                                    className={styles.fileUploadArea}
                                    onClick={handleEditUploadAreaClick}
                                >
                                    <div className={styles.fileUploadIcon}>
                                        <Upload size={30} color="#0891B2" />
                                    </div>
                                    <p className={styles.fileUploadText}>
                                        Haz clic aquí para seleccionar un nuevo archivo o arrástralo y suéltalo
                                    </p>
                                    <input
                                        type="file"
                                        ref={editFileInputRef}
                                        className={styles.fileInput}
                                        onChange={handleEditFileSelect}
                                        accept=".pdf,.doc,.docx"
                                    />
                                </div>
                                {editSelectedFileName && (
                                    <p className={styles.selectedFileName}>{editSelectedFileName}</p>
                                )}
                            </div>
                        </div>
                        <div className={styles.uploadActions}>
                            <button 
                                className={styles.cancelButton}
                                onClick={handleCloseEditModal}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={styles.uploadButton}
                                onClick={handleUpdateDocument}
                                disabled={!editDocumentData.titulo}
                            >
                                <Edit2 size={16} color="#FFFFFF" />
                                Guardar cambios
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
                                <label htmlFor="document_type">Tipo de documento *</label>
                                <select
                                    id="document_type"
                                    name="document_type"
                                    value={newDocument.document_type}
                                    onChange={handleDocumentInputChange}
                                    required
                                    className={styles.selectField}
                                >
                                    {documentTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className={styles.formField}>
                                <label htmlFor="status_id">Estado del documento *</label>
                                <select
                                    id="status_id"
                                    name="status_id"
                                    value={newDocument.status_id}
                                    onChange={handleDocumentInputChange}
                                    required
                                    className={styles.selectField}
                                >
                                    {documentStatuses.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
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
