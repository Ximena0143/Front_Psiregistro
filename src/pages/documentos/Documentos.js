import React, { useState, useRef } from 'react';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { Download, FileText, Trash2, Upload, X, Eye } from 'lucide-react';
import DataTable from '../../components/common/DataTable/DataTable';
import Swal from 'sweetalert2';

const Documentos = () => {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newDocument, setNewDocument] = useState({
        titulo: '',
        archivo: null
    });
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');
    const fileInputRef = useRef(null);
    
    const [documentos, setDocumentos] = useState([
        { nombre: "Historia Clínica - Laura Gómez", tipo: "PDF", fechaCreacion: "2023-01-01", tamaño: "2.5 MB" },
        { nombre: "Evaluación Psicológica - Andrés Martínez", tipo: "DOC", fechaCreacion: "2023-02-15", tamaño: "1.8 MB" },
        { nombre: "Informe Terapéutico - Carlos Ruiz", tipo: "PDF", fechaCreacion: "2023-03-10", tamaño: "3.2 MB" },
        { nombre: "Notas de Sesión - María López", tipo: "DOC", fechaCreacion: "2023-04-05", tamaño: "1.1 MB" }
    ]);

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
                            className={`${styles.actionIcon} ${styles.downloadIcon}`}
                            onClick={() => handleDownloadDocument(row)}
                        />
                    </div>
                    <div className={styles.iconWrapper} title="Ver documento">
                        <Eye
                            className={`${styles.actionIcon} ${styles.viewIcon}`}
                            onClick={() => handlePreviewDocument(row)}
                        />
                    </div>
                    <div className={styles.iconWrapper} title="Eliminar documento">
                        <Trash2
                            className={`${styles.actionIcon} ${styles.deleteIcon}`}
                            onClick={() => handleDeleteDocument(row)}
                        />
                    </div>
                </div>
            )
        }
    ];

    // Funciones para manejar el modal de subir documento
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
    
    const handlePreviewDocument = (documento) => {
        setPreviewDocument(documento);
        setShowPreviewModal(true);
    };
    
    const handleClosePreviewModal = () => {
        setShowPreviewModal(false);
        setPreviewDocument(null);
    };
    
    const handleDownloadDocument = (documento) => {
        // Aquí iría la lógica real para descargar el documento
        
        // Mostrar alerta de éxito
        Swal.fire({
            title: '¡Éxito!',
            text: 'El documento se ha descargado correctamente',
            icon: 'success',
            confirmButtonColor: '#FB8500',
            timer: 2000,
            showConfirmButton: false
        });
    };


    const handleDocumentInputChange = (e) => {
        const { name, value } = e.target;
        setNewDocument({
            ...newDocument,
            [name]: value
        });
    };

    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFileName(file.name);
            setNewDocument({
                ...newDocument,
                archivo: file
            });
        }
    };

    const handleUploadAreaClick = () => {
        fileInputRef.current.click();
    };

    const handleUploadDocument = () => {
        // Aquí iría la lógica real para subir el documento al servidor
        
        // Añadimos el documento nuevo a la lista (simulación)
        const fechaActual = new Date().toISOString().split('T')[0];
        const nuevoDocumento = {
            nombre: newDocument.titulo,
            tipo: selectedFileName ? getFileExtension(selectedFileName).toUpperCase() : 'PDF',
            fechaCreacion: fechaActual,
            tamaño: "1.0 MB", // Simulación de tamaño
            contenido: "Este es un ejemplo de contenido de documento para la vista previa."
        };
        
        setDocumentos([nuevoDocumento, ...documentos]);
        
        // Mostrar alerta de éxito
        Swal.fire({
            title: '¡Éxito!',
            text: 'El documento se ha subido correctamente',
            icon: 'success',
            confirmButtonColor: '#FB8500',
            timer: 2000,
            showConfirmButton: false
        });
        
        // Cerrar el modal
        handleCloseUploadModal();
    };
    

    
    const handleDeleteDocument = (documento) => {
        // Mostrar confirmación antes de eliminar
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás recuperar este documento una vez eliminado",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FB8500',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Aquí iría la lógica real para eliminar el documento del servidor
                
                // Eliminamos el documento de la lista (simulación)
                const documentosFiltrados = documentos.filter(doc => doc !== documento);
                setDocumentos(documentosFiltrados);
                
                // Mostrar alerta de éxito
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'El documento se ha eliminado correctamente',
                    icon: 'success',
                    confirmButtonColor: '#FB8500',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    };

    // Función para obtener la extensión del archivo
    const getFileExtension = (filename) => {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    };

    return (
        <div className={styles.dashboard}>
            <Header variant="dashboard" />
            <div className={styles.main}>
                <Sidebar />
                <div className={styles.content}>
                    <div className={styles.contentHeader}>
                        <h3>Lista de documentos</h3>
                        <div className={styles.actions}>
                            <button 
                                className={styles.addButton}
                                onClick={handleOpenUploadModal}
                            >
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

            {/* Modal para subir documento */}
            {showUploadModal && (
                <div className={styles.uploadModal}>
                    <div className={styles.uploadContainer}>
                        <div className={styles.uploadHeader}>
                            <h4>Subir documento</h4>
                            <button className={styles.closeButton} onClick={handleCloseUploadModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.uploadContent}>
                            <div className={styles.formField}>
                                <label htmlFor="titulo">Título del documento *</label>
                                <input
                                    id="titulo"
                                    name="titulo"
                                    type="text"
                                    value={newDocument.titulo}
                                    onChange={handleDocumentInputChange}
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



            {/* Modal para la vista previa del documento */}
            {showPreviewModal && previewDocument && (
                <div className={styles.uploadModal}>
                    <div className={styles.uploadContainer} style={{ maxWidth: '700px' }}>
                        <div className={styles.uploadHeader}>
                            <h4>Vista previa: {previewDocument.nombre}</h4>
                            <button className={styles.closeButton} onClick={handleClosePreviewModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.previewContent}>
                            <div className={styles.documentPreview}>
                                {previewDocument.tipo === 'PDF' ? (
                                    <div className={styles.previewPlaceholder}>
                                        <FileText size={60} color="#FB8500" />
                                        <p>Vista previa del documento PDF</p>
                                        <p>Tipo: {previewDocument.tipo}</p>
                                        <p>Fecha: {previewDocument.fechaCreacion}</p>
                                        <p>Tamaño: {previewDocument.tamaño}</p>
                                        <div className={styles.previewText}>
                                            {previewDocument.contenido || "No hay contenido disponible para mostrar."}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.previewPlaceholder}>
                                        <FileText size={60} color="#219EBC" />
                                        <p>Vista previa del documento {previewDocument.tipo}</p>
                                        <p>Fecha: {previewDocument.fechaCreacion}</p>
                                        <p>Tamaño: {previewDocument.tamaño}</p>
                                        <div className={styles.previewText}>
                                            {previewDocument.contenido || "No hay contenido disponible para mostrar."}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.uploadActions}>
                            <button 
                                className={styles.cancelButton}
                                onClick={handleClosePreviewModal}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documentos;
