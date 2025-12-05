import React, { useState, useRef } from 'react';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { X, Upload, Edit, Trash } from 'lucide-react';
import Swal from 'sweetalert2';

const Publicaciones = () => {
    const [showNewModal, setShowNewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [publicaciones, setPublicaciones] = useState([
        {
            id: 1,
            titulo: "¿Cómo manejar la ansiedad en tiempos difíciles?",
            descripcion: "Estrategias efectivas para lidiar con la ansiedad y el estrés en situaciones de crisis.",
            fecha: "15 Abril, 2025",
            imagen: "/Images/placeholder.jpg"
        },
        {
            id: 2,
            titulo: "Importancia de la salud mental en el entorno laboral",
            descripcion: "Cómo las empresas pueden promover un ambiente de trabajo saludable a nivel psicológico.",
            fecha: "10 Abril, 2025",
            imagen: "/Images/placeholder.jpg"
        },
        {
            id: 3,
            titulo: "Técnicas de mindfulness para principiantes",
            descripcion: "Aprende a practicar la atención plena y mejorar tu bienestar emocional con estos ejercicios simples.",
            fecha: "5 Abril, 2025",
            imagen: "/Images/placeholder.jpg"
        }
    ]);
    
    const [newPublicacion, setNewPublicacion] = useState({
        titulo: '',
        descripcion: '',
        imagen: null
    });
    
    const [currentPublicacion, setCurrentPublicacion] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');
    const fileInputRef = useRef(null);
    
    const formatDate = () => {
        const date = new Date();
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
    };
    // Funciones para manejar nueva publicación
    const handleOpenNewModal = () => {
        setShowNewModal(true);
    };

    const handleCloseNewModal = () => {
        setShowNewModal(false);
        setNewPublicacion({
            titulo: '',
            descripcion: '',
            imagen: null
        });
        setSelectedFileName('');
    };

    // Funciones para manejar edición de publicación
    const handleOpenEditModal = (publicacion) => {
        setCurrentPublicacion(publicacion);
        setNewPublicacion({
            titulo: publicacion.titulo,
            descripcion: publicacion.descripcion,
            imagen: null
        });
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setCurrentPublicacion(null);
        setNewPublicacion({
            titulo: '',
            descripcion: '',
            imagen: null
        });
        setSelectedFileName('');
    };

    // Manejar cambios en los campos del formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPublicacion({
            ...newPublicacion,
            [name]: value
        });
    };

    // Manejar selección de archivo de imagen
    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFileName(file.name);
            setNewPublicacion({
                ...newPublicacion,
                imagen: file
            });
        }
    };

    const handleUploadAreaClick = () => {
        fileInputRef.current.click();
    };

    // Guardar nueva publicación
    const handleSavePublicacion = () => {
        // Aquí iría la lógica real para guardar la publicación en el servidor
        
        // Añadimos la publicación nueva a la lista (simulación)
        const nuevaPublicacion = {
            id: publicaciones.length + 1,
            titulo: newPublicacion.titulo,
            descripcion: newPublicacion.descripcion,
            fecha: formatDate(),
            imagen: newPublicacion.imagen ? URL.createObjectURL(newPublicacion.imagen) : "/Images/placeholder.jpg"
        };
        
        setPublicaciones([nuevaPublicacion, ...publicaciones]);
        
        // Mostrar alerta de éxito
        Swal.fire({
            title: '¡Éxito!',
            text: 'La publicación se ha guardado correctamente',
            icon: 'success',
            confirmButtonColor: '#FB8500',
            timer: 2000,
            showConfirmButton: false
        });
        
        // Cerrar el modal
        handleCloseNewModal();
    };

    // Actualizar publicación existente
    const handleUpdatePublicacion = () => {
        // Aquí iría la lógica real para actualizar la publicación en el servidor
        
        // Actualizamos la publicación en la lista (simulación)
        const publicacionesActualizadas = publicaciones.map(pub => {
            if (pub.id === currentPublicacion.id) {
                return {
                    ...pub,
                    titulo: newPublicacion.titulo,
                    descripcion: newPublicacion.descripcion,
                    imagen: newPublicacion.imagen ? URL.createObjectURL(newPublicacion.imagen) : pub.imagen
                };
            }
            return pub;
        });
        
        setPublicaciones(publicacionesActualizadas);
        
        // Mostrar alerta de éxito
        Swal.fire({
            title: '¡Éxito!',
            text: 'La publicación se ha actualizado correctamente',
            icon: 'success',
            confirmButtonColor: '#FB8500',
            timer: 2000,
            showConfirmButton: false
        });
        
        // Cerrar el modal
        handleCloseEditModal();
    };

    // Eliminar publicación
    const handleDeletePublicacion = (publicacion) => {
        // Mostrar confirmación antes de eliminar
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás recuperar esta publicación una vez eliminada",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FB8500',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Aquí iría la lógica real para eliminar la publicación del servidor
                
                // Eliminamos la publicación de la lista (simulación)
                const publicacionesFiltradas = publicaciones.filter(pub => pub.id !== publicacion.id);
                setPublicaciones(publicacionesFiltradas);
                
                // Mostrar alerta de éxito
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'La publicación se ha eliminado correctamente',
                    icon: 'success',
                    confirmButtonColor: '#FB8500',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    };

    return (
        <div className={styles.dashboard}>
            <Header variant="dashboard" />
            <div className={styles.main}>
                <Sidebar />
                <div className={styles.content}>
                    <div className={styles.contentHeader}>
                        <h3>Mis Publicaciones</h3>
                        <button className={styles.addButton} onClick={handleOpenNewModal}>
                            Nueva publicación
                        </button>
                    </div>
                    <div className={styles.publicacionesGrid}>
                        {publicaciones.map((publicacion) => (
                            <div key={publicacion.id} className={styles.publicacionCard}>
                                <div className={styles.imageContainer}>
                                    <img src={publicacion.imagen} alt={publicacion.titulo} />
                                </div>
                                <div className={styles.cardContent}>
                                    <h3>{publicacion.titulo}</h3>
                                    <p>{publicacion.descripcion}</p>
                                    <div className={styles.cardFooter}>
                                        <span>{publicacion.fecha}</span>
                                        <div className={styles.actionButtons}>
                                            <button className={styles.editButton} onClick={() => handleOpenEditModal(publicacion)}>
                                                <Edit size={14} />
                                                Editar
                                            </button>
                                            <button className={styles.deleteButton} onClick={() => handleDeletePublicacion(publicacion)}>
                                                <Trash size={14} />
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal para nueva publicación */}
            {showNewModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContainer}>
                        <div className={styles.modalHeader}>
                            <h4>Nueva publicación</h4>
                            <button className={styles.closeButton} onClick={handleCloseNewModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.formField}>
                                <label htmlFor="titulo">Título de la publicación *</label>
                                <input
                                    id="titulo"
                                    name="titulo"
                                    type="text"
                                    value={newPublicacion.titulo}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={styles.formField}>
                                <label htmlFor="descripcion">Descripción *</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={newPublicacion.descripcion}
                                    onChange={handleInputChange}
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>Imagen de portada *</label>
                                <div 
                                    className={styles.fileUploadArea}
                                    onClick={handleUploadAreaClick}
                                >
                                    <div className={styles.fileUploadIcon}>
                                        <Upload size={30} color="#219EBC" />
                                    </div>
                                    <p className={styles.fileUploadText}>
                                        Haz clic aquí para seleccionar una imagen o arrástrala y suéltala
                                    </p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className={styles.fileInput}
                                        onChange={handleFileSelect}
                                        accept=".jpg,.jpeg,.png,.gif"
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
                                onClick={handleCloseNewModal}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={styles.saveButton}
                                onClick={handleSavePublicacion}
                                disabled={!newPublicacion.titulo || !newPublicacion.descripcion}
                            >
                                Guardar publicación
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para editar publicación */}
            {showEditModal && currentPublicacion && (
                <div className={styles.modal}>
                    <div className={styles.modalContainer}>
                        <div className={styles.modalHeader}>
                            <h4>Editar publicación</h4>
                            <button className={styles.closeButton} onClick={handleCloseEditModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.formField}>
                                <label htmlFor="titulo">Título de la publicación *</label>
                                <input
                                    id="titulo"
                                    name="titulo"
                                    type="text"
                                    value={newPublicacion.titulo}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={styles.formField}>
                                <label htmlFor="descripcion">Descripción *</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={newPublicacion.descripcion}
                                    onChange={handleInputChange}
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>Imagen de portada</label>
                                <div className={styles.currentImagePreview}>
                                    <p>Imagen actual:</p>
                                    <img src={currentPublicacion.imagen} alt="Imagen actual" className={styles.previewImage} />
                                </div>
                                <div 
                                    className={styles.fileUploadArea}
                                    onClick={handleUploadAreaClick}
                                >
                                    <div className={styles.fileUploadIcon}>
                                        <Upload size={30} color="#219EBC" />
                                    </div>
                                    <p className={styles.fileUploadText}>
                                        Haz clic aquí para cambiar la imagen o arrástrala y suéltala
                                    </p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className={styles.fileInput}
                                        onChange={handleFileSelect}
                                        accept=".jpg,.jpeg,.png,.gif"
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
                                onClick={handleCloseEditModal}
                            >
                                Cancelar
                            </button>
                            <button 
                                className={styles.saveButton}
                                onClick={handleUpdatePublicacion}
                                disabled={!newPublicacion.titulo || !newPublicacion.descripcion}
                            >
                                Actualizar publicación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Publicaciones;
