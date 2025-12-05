import React, { useState, useRef, useEffect } from 'react';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { X, Upload, Edit, Trash } from 'lucide-react';
import Swal from 'sweetalert2';
import postService from '../../services/postService';

const Publicaciones = () => {
    const [showNewModal, setShowNewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [publicaciones, setPublicaciones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
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
    const handleSavePublicacion = async () => {
        try {
            // Preparar los archivos para subir
            const files = newPublicacion.imagen ? [newPublicacion.imagen] : [];
            
            // Llamar al servicio para crear la publicación
            await postService.createPost(newPublicacion, files);
            
            // Recargar las publicaciones para mostrar la nueva
            await loadPosts();
            
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
        } catch (error) {
            console.error('Error al guardar la publicación:', error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo guardar la publicación',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
        }
    };

    // Actualizar publicación existente
    const handleUpdatePublicacion = () => {
        // Aquí iría la lógica real para actualizar la publicación en el servidor
        console.log('Actualizando publicación:', newPublicacion);
        
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
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Llamar al servicio para eliminar la publicación
                    await postService.deletePost(publicacion.id);
                    
                    // Eliminamos la publicación de la lista local
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
                } catch (error) {
                    console.error('Error al eliminar la publicación:', error);
                    Swal.fire({
                        title: 'Error',
                        text: error.message || 'No se pudo eliminar la publicación',
                        icon: 'error',
                        confirmButtonColor: '#FB8500'
                    });
                }
            }
        });
    };

    // Función para cargar las publicaciones desde el servidor
    const loadPosts = async () => {
        try {
            setIsLoading(true);
            const postsData = await postService.getPosts();
            
            // Transformar los datos de la API al formato utilizado por el componente
            const formattedPosts = postsData.map(post => ({
                id: post.id,
                titulo: post.tittle,
                descripcion: post.description,
                fecha: new Date(post.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }),
                imagen: post.signed_url || '/Images/placeholder.jpg'
            }));
            
            setPublicaciones(formattedPosts);
        } catch (error) {
            console.error('Error al cargar las publicaciones:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar las publicaciones',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    // Cargar publicaciones al montar el componente
    useEffect(() => {
        loadPosts();
    }, []);
    
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
                    {isLoading ? (
                        <div className={styles.loadingContainer}>
                            <p>Cargando publicaciones...</p>
                        </div>
                    ) : publicaciones.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Aún no tienes publicaciones.</p>
                            <button className={styles.addButton} onClick={handleOpenNewModal}>
                                Crear primera publicación
                            </button>
                        </div>
                    ) : (
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
                    )}
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
