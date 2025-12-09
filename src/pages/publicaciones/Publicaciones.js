import React, { useState, useRef, useEffect } from 'react';
import styles from './styles.module.css';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { X, Upload, Trash } from 'lucide-react';
import Swal from 'sweetalert2';
import postService from '../../services/postService';

const Publicaciones = () => {
    const [showNewModal, setShowNewModal] = useState(false);
    const [publicaciones, setPublicaciones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [newPublicacion, setNewPublicacion] = useState({
        titulo: '',
        descripcion: '',
        imagen: null
    });
    const [selectedFileName, setSelectedFileName] = useState('');
    const fileInputRef = useRef(null);

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

    // Se eliminaron las funciones de edición ya que no están soportadas por el backend

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
        // Validar que tengamos los campos requeridos
        if (!newPublicacion.titulo || !newPublicacion.imagen) {
            Swal.fire({
                title: 'Error',
                text: 'El título y la imagen son obligatorios',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
            return;
        }
        
        try {
            // Mostrar indicador de carga
            Swal.fire({
                title: 'Guardando publicación',
                text: 'Por favor espere...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            
            // Recargar las publicaciones para mostrar la recién creada
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
            
            
            // Mostrar mensaje de error
            Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo guardar la publicación',
                icon: 'error',
                confirmButtonColor: '#FB8500'
            });
        }
    };

    // Se eliminó la función de actualización ya que no está soportada por el backend

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
                    // Mostrar indicador de carga
                    Swal.fire({
                        title: 'Eliminando publicación',
                        text: 'Por favor espere...',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });
                    
                    // Llamar al servicio para eliminar la publicación
                    await postService.deletePost(publicacion.id);
                    
                    // Recargar la lista de publicaciones
                    await loadPosts();
                    
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
                    
                    // Mostrar mensaje de error
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
            const formattedPosts = postsData.map(post => {
                // Formatear el título para hacerlo más legible
                // 1. Eliminar la extensión del archivo
                // 2. Reemplazar guiones por espacios
                // 3. Capitalizar la primera letra de cada palabra
                let formattedTitle = post.tittle;
                
                // Eliminar la extensión del archivo (.jpg, .png, etc.)
                formattedTitle = formattedTitle.replace(/\.[^.]+$/, '');
                
                // Reemplazar guiones por espacios
                formattedTitle = formattedTitle.replace(/-/g, ' ');
                
                // Capitalizar la primera letra de cada palabra
                formattedTitle = formattedTitle
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                
                return {
                    id: post.id,
                    titulo: formattedTitle,
                    descripcion: post.description,
                    fecha: new Date(post.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }),
                    imagen: post.signed_url || '/Images/placeholder.jpg'
                };
            });
            
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

            {/* Se eliminó el modal de edición ya que no está soportado por el backend */}
        </div>
    );
};

export default Publicaciones;
