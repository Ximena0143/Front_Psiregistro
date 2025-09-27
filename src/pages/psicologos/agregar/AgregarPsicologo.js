import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layout/Header/Header';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import styles from './styles.module.css';
import userService from '../../../services/user';
import api from '../../../services/api';

const AgregarPsicologo = () => {
    const navigate = useNavigate();
    
    // Estados para validación de campos
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [specializaciones, setEspecializaciones] = useState([]);
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        second_last_name: '',
        specialization_id: '',
        email: '',
        password: '',
        password_confirmation: '',
        profile_description: '',
        profile_photo_path: '/default-profile.jpg', // Valor por defecto para la foto de perfil
        role_id: '2' // Por defecto, rol de doctor (2)
    });
    
    // Estados para mostrar/ocultar contraseñas
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Cargar las especializaciones al montar el componente
    useEffect(() => {
        fetchEspecializaciones();
    }, []);

    // Función para obtener las especializaciones del backend
    const fetchEspecializaciones = async () => {
        try {
            // Usar el servicio API que ya incluye el token de autenticación
            const response = await api.get('/specialization/index');
            
            if (response && response.data && Array.isArray(response.data)) {
                console.log('Especializaciones cargadas del backend:', response.data);
                
                // Asignar IDs a las especializaciones que no los tienen
                const especializacionesConId = response.data.map((esp, index) => {
                    if (esp && !esp.id) {
                        return { ...esp, id: index + 1 }; // Asignar un ID numérico basado en el índice
                    }
                    return esp;
                });
                
                console.log('Especializaciones con IDs asignados:', especializacionesConId);
                setEspecializaciones(especializacionesConId);
            } else {
                console.warn('No se recibieron datos de especializaciones válidos');
                // Datos de ejemplo en caso de error
                setEspecializaciones([
                    { id: 1, name: 'Psicología Clínica' },
                    { id: 2, name: 'Psicología Educativa' },
                    { id: 3, name: 'Psicología Organizacional' }
                ]);
            }
        } catch (error) {
            console.error('Error al cargar especializaciones:', error);
            // Datos de ejemplo en caso de error
            setEspecializaciones([
                { id: 1, name: 'Psicología Clínica' },
                { id: 2, name: 'Psicología Educativa' },
                { id: 3, name: 'Psicología Organizacional' }
            ]);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    // Funciones de validación
    const validateEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const validateNombre = (nombre) => {
        return /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]{2,30}$/.test(nombre);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    // Función para manejar cambios en los campos del formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Para el campo specialization_id, asegurarse de que se guarde el ID
        if (name === 'specialization_id') {
            // Buscar la especialización seleccionada por su ID
            const especializacion = specializaciones.find(esp => esp.id === parseInt(value) || esp.id === value);
            
            if (especializacion) {
                console.log('Especialización seleccionada:', especializacion);
                setFormData({
                    ...formData,
                    [name]: especializacion.id
                });
            } else {
                setFormData({
                    ...formData,
                    [name]: value
                });
            }
        } else {
            // Para otros campos, actualizar normalmente
            setFormData({
                ...formData,
                [name]: value
            });
        }
        
        // Limpiar errores al cambiar un campo
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const handleLimpiarForm = () => {
        setFormData({
            first_name: '',
            middle_name: '',
            last_name: '',
            second_last_name: '',
            specialization_id: '',
            email: '',
            password: '',
            password_confirmation: '',
            profile_description: '',
            profile_photo_path: '/default-profile.jpg',
            role_id: '2'
        });
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // Validar campos obligatorios
        if (!formData.first_name) {
            newErrors.first_name = 'El primer nombre es obligatorio';
            isValid = false;
        } else if (!validateNombre(formData.first_name)) {
            newErrors.first_name = 'Ingrese un nombre válido';
            isValid = false;
        }

        if (formData.middle_name && !validateNombre(formData.middle_name)) {
            newErrors.middle_name = 'Ingrese un nombre válido';
            isValid = false;
        }

        if (!formData.last_name) {
            newErrors.last_name = 'El primer apellido es obligatorio';
            isValid = false;
        } else if (!validateNombre(formData.last_name)) {
            newErrors.last_name = 'Ingrese un apellido válido';
            isValid = false;
        }

        if (formData.second_last_name && !validateNombre(formData.second_last_name)) {
            newErrors.second_last_name = 'Ingrese un apellido válido';
            isValid = false;
        }

        if (!formData.specialization_id) {
            newErrors.specialization_id = 'La especialización es obligatoria';
            isValid = false;
        }

        if (!formData.email) {
            newErrors.email = 'El correo electrónico es obligatorio';
            isValid = false;
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Ingrese un correo electrónico válido';
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es obligatoria';
            isValid = false;
        } else if (!validatePassword(formData.password)) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
            isValid = false;
        }

        if (!formData.password_confirmation) {
            newErrors.password_confirmation = 'Confirme la contraseña';
            isValid = false;
        } else if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Las contraseñas no coinciden';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleGuardar = async () => {
        if (validateForm()) {
            try {
                setLoading(true);
                
                // Crear una copia del formData para modificarlo
                const userData = { ...formData };
                
                // Transformar el role_id en un array de roles para el backend
                userData.roles = [parseInt(userData.role_id)];
                
                // Depurar el valor de specialization_id
                console.log('Valor de specialization_id antes de convertir:', {
                    valor: userData.specialization_id,
                    tipo: typeof userData.specialization_id,
                    esVacio: userData.specialization_id === '',
                    esUndefined: userData.specialization_id === undefined,
                    esNulo: userData.specialization_id === null,
                    convertidoANumero: Number(userData.specialization_id),
                    esNaN: isNaN(Number(userData.specialization_id)),
                    especialización_seleccionada: specializaciones.find(esp => esp.id === userData.specialization_id)
                });
                
                // Convertir specialization_id a entero solo si existe un valor
                if (userData.specialization_id) {
                    // Asegurarse de que sea un número válido
                    const specId = Number(userData.specialization_id);
                    if (isNaN(specId)) {
                        throw new Error("La especialización seleccionada no es válida");
                    }
                    userData.specialization_id = specId;
                } else {
                    // Si no hay valor, asegurarse de que el error sea claro
                    throw new Error("Debe seleccionar una especialización");
                }
                
                // Eliminar role_id ya que no es parte del modelo esperado por el backend
                delete userData.role_id;
                
                // Log detallado para depuración
                console.log("Datos a enviar (detallado):", {
                    ...userData,
                    specialization_id_type: typeof userData.specialization_id,
                    specialization_id_value: userData.specialization_id,
                    specialization_id_raw: formData.specialization_id,
                    specialization_id_parsed: parseInt(formData.specialization_id),
                    has_specialization_id: 'specialization_id' in userData,
                    especialización_seleccionada: specializaciones.find(esp => esp.id === formData.specialization_id)
                });
                
                console.log("Datos a enviar:", userData);
                
                await userService.registerUser(userData);
                
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Psicólogo guardado correctamente',
                    icon: 'success',
                    confirmButtonColor: '#FB8500',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/psicologos');
                });
            } catch (error) {
                console.error('Error al registrar psicólogo:', error);
                
                // Mostrar mensaje de error
                let errorMessage = 'Ocurrió un error al guardar el psicólogo';
                
                // Si hay errores específicos del backend, mostrarlos
                if (error.data && error.data.errors) {
                    const backendErrors = error.data.errors;
                    const errorMessages = Object.values(backendErrors).flat();
                    if (errorMessages.length > 0) {
                        errorMessage = errorMessages.join('\n');
                    }
                }
                
                Swal.fire({
                    title: 'Error',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#FB8500'
                });
            } finally {
                setLoading(false);
            }
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Por favor complete correctamente todos los campos obligatorios',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#FB8500'
            });
        }
    };

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
                            <h3>Agregar Psicólogo</h3>
                        </div>
                    </div>
                    <div className={styles.formContainer}>
                        <div className={styles.formCard}>
                            <div className={styles.formGroup}>
                                {/* Datos personales */}
                                <div className={styles.formRow}>
                                    <div className={styles.formField}>
                                        <label htmlFor="first_name">Primer nombre *</label>
                                        <input
                                            type="text"
                                            id="first_name"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            placeholder="Primer nombre"
                                            className={errors.first_name ? styles.inputError : ''}
                                        />
                                        {errors.first_name && <span className={styles.errorMessage}>{errors.first_name}</span>}
                                    </div>
                                    <div className={styles.formField}>
                                        <label htmlFor="middle_name">Segundo nombre</label>
                                        <input
                                            type="text"
                                            id="middle_name"
                                            name="middle_name"
                                            value={formData.middle_name}
                                            onChange={handleInputChange}
                                            placeholder="Segundo nombre"
                                            className={errors.middle_name ? styles.inputError : ''}
                                        />
                                        {errors.middle_name && <span className={styles.errorMessage}>{errors.middle_name}</span>}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formField}>
                                        <label htmlFor="last_name">Primer apellido *</label>
                                        <input
                                            type="text"
                                            id="last_name"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            placeholder="Primer apellido"
                                            className={errors.last_name ? styles.inputError : ''}
                                        />
                                        {errors.last_name && <span className={styles.errorMessage}>{errors.last_name}</span>}
                                    </div>
                                    <div className={styles.formField}>
                                        <label htmlFor="second_last_name">Segundo apellido</label>
                                        <input
                                            type="text"
                                            id="second_last_name"
                                            name="second_last_name"
                                            value={formData.second_last_name}
                                            onChange={handleInputChange}
                                            placeholder="Segundo apellido"
                                            className={errors.second_last_name ? styles.inputError : ''}
                                        />
                                        {errors.second_last_name && <span className={styles.errorMessage}>{errors.second_last_name}</span>}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formField}>
                                        <label htmlFor="specialization_id">Especialización *</label>
                                        <select
                                            id="specialization_id"
                                            name="specialization_id"
                                            value={formData.specialization_id}
                                            onChange={handleInputChange}
                                            className={errors.specialization_id ? styles.inputError : ''}
                                        >
                                            <option value="">Seleccione una especialización</option>
                                            {specializaciones.map(esp => (
                                                <option key={esp.id} value={esp.id.toString()}>
                                                    {esp.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.specialization_id && <span className={styles.errorMessage}>{errors.specialization_id}</span>}
                                    </div>
                                    <div className={styles.formField}>
                                        <label htmlFor="email">Correo electrónico *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Correo electrónico"
                                            className={errors.email ? styles.inputError : ''}
                                        />
                                        {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formField}>
                                        <label htmlFor="profile_description">Descripción del perfil</label>
                                        <textarea
                                            id="profile_description"
                                            name="profile_description"
                                            value={formData.profile_description}
                                            onChange={handleInputChange}
                                            placeholder="Descripción profesional"
                                            rows={4}
                                            className={errors.profile_description ? styles.inputError : ''}
                                        />
                                        {errors.profile_description && <span className={styles.errorMessage}>{errors.profile_description}</span>}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formField}>
                                        <label htmlFor="password">Contraseña *</label>
                                        <div className={styles.passwordInputContainer}>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Contraseña"
                                                className={errors.password ? styles.inputError : ''}
                                            />
                                            <button 
                                                type="button" 
                                                className={styles.passwordToggle}
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
                                    </div>
                                    <div className={styles.formField}>
                                        <label htmlFor="password_confirmation">Confirmar contraseña *</label>
                                        <div className={styles.passwordInputContainer}>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                value={formData.password_confirmation}
                                                onChange={handleInputChange}
                                                placeholder="Confirmar contraseña"
                                                className={errors.password_confirmation ? styles.inputError : ''}
                                            />
                                            <button 
                                                type="button" 
                                                className={styles.passwordToggle}
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {errors.password_confirmation && <span className={styles.errorMessage}>{errors.password_confirmation}</span>}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formField}>
                                        <label htmlFor="role_id">Rol *</label>
                                        <select
                                            id="role_id"
                                            name="role_id"
                                            value={formData.role_id}
                                            onChange={handleInputChange}
                                            className={errors.role_id ? styles.inputError : ''}
                                        >
                                            <option value="">Seleccione un rol</option>
                                            <option value="1">Administrador</option>
                                            <option value="2">Doctor</option>
                                        </select>
                                        {errors.role_id && <span className={styles.errorMessage}>{errors.role_id}</span>}
                                    </div>
                                </div>

                                <div className={styles.buttonContainer}>
                                    <button 
                                        className={styles.clearButton}
                                        onClick={handleLimpiarForm}
                                        type="button"
                                        disabled={loading}
                                    >
                                        Limpiar
                                    </button>
                                    <button 
                                        className={styles.saveButton}
                                        onClick={handleGuardar}
                                        type="button"
                                        disabled={loading}
                                    >
                                        {loading ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgregarPsicologo;
