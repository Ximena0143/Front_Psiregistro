import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layout/Header/Header';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import { ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import styles from './styles.module.css';
import patientService from '../../../services/patient';

const AgregarPaciente = () => {
    const navigate = useNavigate();
    
    // Estados para validación de campos
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [identificationTypes, setIdentificationTypes] = useState([]);
    const [formData, setFormData] = useState({
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        tipoIdentificacion: '',
        numeroIdentificacion: '',
        correo: ''
    });

    // Cargar tipos de identificación al montar el componente
    useEffect(() => {
        const fetchIdentificationTypes = async () => {
            try {
                const response = await patientService.getIdentificationTypes();
                
                // Manejar diferentes estructuras de respuesta posibles
                if (response && response.data) {
                    setIdentificationTypes(response.data);
                } else if (response && response.message && response.data) {
                    // Nueva estructura con Res::info
                    setIdentificationTypes(response.data);
                } else if (Array.isArray(response)) {
                    // Si la respuesta es un array directamente
                    setIdentificationTypes(response);
                } else {
                    console.warn('Estructura de respuesta no reconocida:', response);
                }
            } catch (error) {
                console.error('Error al cargar tipos de identificación:', error);
            }
        };

        fetchIdentificationTypes();
    }, []);

    const handleGoBack = () => {
        navigate(-1);
    };

    // Funciones de validación
    const validateEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const validateIdentificacion = (numero) => {
        return /^\d{6,11}$/.test(numero);
    };

    const validateNombre = (nombre) => {
        return /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]{2,30}$/.test(nombre);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Limpiamos el error del campo que se está editando
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const handleLimpiarForm = () => {
        setFormData({
            primerNombre: '',
            segundoNombre: '',
            primerApellido: '',
            segundoApellido: '',
            tipoIdentificacion: '',
            numeroIdentificacion: '',
            correo: ''
        });
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // Validar campos obligatorios
        if (!formData.primerNombre) {
            newErrors.primerNombre = 'El primer nombre es obligatorio';
            isValid = false;
        } else if (!validateNombre(formData.primerNombre)) {
            newErrors.primerNombre = 'Ingrese un nombre válido';
            isValid = false;
        }

        if (formData.segundoNombre && !validateNombre(formData.segundoNombre)) {
            newErrors.segundoNombre = 'Ingrese un nombre válido';
            isValid = false;
        }

        if (!formData.primerApellido) {
            newErrors.primerApellido = 'El primer apellido es obligatorio';
            isValid = false;
        } else if (!validateNombre(formData.primerApellido)) {
            newErrors.primerApellido = 'Ingrese un apellido válido';
            isValid = false;
        }

        if (formData.segundoApellido && !validateNombre(formData.segundoApellido)) {
            newErrors.segundoApellido = 'Ingrese un apellido válido';
            isValid = false;
        }

        if (!formData.tipoIdentificacion) {
            newErrors.tipoIdentificacion = 'El tipo de identificación es obligatorio';
            isValid = false;
        }

        if (!formData.numeroIdentificacion) {
            newErrors.numeroIdentificacion = 'El número de identificación es obligatorio';
            isValid = false;
        } else if (!validateIdentificacion(formData.numeroIdentificacion)) {
            newErrors.numeroIdentificacion = 'Ingrese un número de identificación válido (6-11 dígitos)';
            isValid = false;
        }

        if (!formData.correo) {
            newErrors.correo = 'El correo electrónico es obligatorio';
            isValid = false;
        } else if (!validateEmail(formData.correo)) {
            newErrors.correo = 'Ingrese un correo electrónico válido';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleGuardar = async () => {
        if (validateForm()) {
            try {
                setLoading(true);
                
                // Preparar los datos para enviar al backend en el formato esperado
                const patientData = {
                    first_name: formData.primerNombre,
                    middle_name: formData.segundoNombre || null,
                    last_name: formData.primerApellido,
                    second_last_name: formData.segundoApellido || null,
                    email: formData.correo,
                    identification_type_id: parseInt(formData.tipoIdentificacion),
                    identification_number: formData.numeroIdentificacion
                };
                
                // Llamar al servicio para registrar el paciente
                const response = await patientService.registerPatient(patientData);
                
                // Mostrar alerta de confirmación
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'El paciente ha sido agregado correctamente',
                    icon: 'success',
                    confirmButtonColor: '#FB8500',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    // Redirigir de vuelta al listado de pacientes
                    navigate('/dashboard');
                });
            } catch (error) {
                console.error('Error al registrar paciente:', error);
                
                // Mostrar mensaje de error específico si viene del backend
                let errorMessage = 'No se pudo registrar el paciente';
                
                if (error.response && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                // Si hay errores de validación específicos del backend
                if (error.response && error.response.data && error.response.data.errors) {
                    const backendErrors = error.response.data.errors;
                    const newErrors = { ...errors };
                    
                    // Mapear errores del backend a los campos del formulario
                    if (backendErrors.first_name) {
                        newErrors.primerNombre = backendErrors.first_name[0];
                    }
                    if (backendErrors.last_name) {
                        newErrors.primerApellido = backendErrors.last_name[0];
                    }
                    if (backendErrors.identification_number) {
                        newErrors.numeroIdentificacion = backendErrors.identification_number[0];
                    }
                    if (backendErrors.email) {
                        newErrors.correo = backendErrors.email[0];
                    }
                    if (backendErrors.identification_type_id) {
                        newErrors.tipoIdentificacion = backendErrors.identification_type_id[0];
                    }
                    
                    setErrors(newErrors);
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
            // Si hay errores, mostrar alerta
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
                            <h3>Agregar paciente</h3>
                        </div>
                    </div>

                    <div className={styles.formContainer}>
                        <div className={styles.formCard}>
                            <div className={styles.formGroup}>
                                <div className={styles.formRow}>
                                    <div className={styles.formField}>
                                        <label htmlFor="primerNombre">Primer nombre *</label>
                                        <input
                                            type="text"
                                            id="primerNombre"
                                            name="primerNombre"
                                            value={formData.primerNombre}
                                            onChange={handleInputChange}
                                            placeholder="Primer nombre"
                                            className={errors.primerNombre ? styles.inputError : ''}
                                            disabled={loading}
                                        />
                                        {errors.primerNombre && <span className={styles.errorMessage}>{errors.primerNombre}</span>}
                                    </div>
                                    <div className={styles.formField}>
                                        <label htmlFor="segundoNombre">Segundo nombre</label>
                                        <input
                                            type="text"
                                            id="segundoNombre"
                                            name="segundoNombre"
                                            value={formData.segundoNombre}
                                            onChange={handleInputChange}
                                            placeholder="Segundo nombre (opcional)"
                                            className={errors.segundoNombre ? styles.inputError : ''}
                                            disabled={loading}
                                        />
                                        {errors.segundoNombre && <span className={styles.errorMessage}>{errors.segundoNombre}</span>}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formField}>
                                        <label htmlFor="primerApellido">Primer apellido *</label>
                                        <input
                                            type="text"
                                            id="primerApellido"
                                            name="primerApellido"
                                            value={formData.primerApellido}
                                            onChange={handleInputChange}
                                            placeholder="Primer apellido"
                                            className={errors.primerApellido ? styles.inputError : ''}
                                            disabled={loading}
                                        />
                                        {errors.primerApellido && <span className={styles.errorMessage}>{errors.primerApellido}</span>}
                                    </div>
                                    <div className={styles.formField}>
                                        <label htmlFor="segundoApellido">Segundo apellido</label>
                                        <input
                                            type="text"
                                            id="segundoApellido"
                                            name="segundoApellido"
                                            value={formData.segundoApellido}
                                            onChange={handleInputChange}
                                            placeholder="Segundo apellido (opcional)"
                                            className={errors.segundoApellido ? styles.inputError : ''}
                                            disabled={loading}
                                        />
                                        {errors.segundoApellido && <span className={styles.errorMessage}>{errors.segundoApellido}</span>}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formField}>
                                        <label htmlFor="tipoIdentificacion">Tipo de identificación *</label>
                                        <select
                                            id="tipoIdentificacion"
                                            name="tipoIdentificacion"
                                            value={formData.tipoIdentificacion}
                                            onChange={handleInputChange}
                                            className={errors.tipoIdentificacion ? styles.inputError : ''}
                                            disabled={loading}
                                        >
                                            <option value="">Seleccione un tipo</option>
                                            {identificationTypes.map(type => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.tipoIdentificacion && <span className={styles.errorMessage}>{errors.tipoIdentificacion}</span>}
                                    </div>
                                    <div className={styles.formField}>
                                        <label htmlFor="numeroIdentificacion">Número de identificación *</label>
                                        <input
                                            type="text"
                                            id="numeroIdentificacion"
                                            name="numeroIdentificacion"
                                            value={formData.numeroIdentificacion}
                                            onChange={handleInputChange}
                                            placeholder="Número de identificación"
                                            className={errors.numeroIdentificacion ? styles.inputError : ''}
                                            disabled={loading}
                                        />
                                        {errors.numeroIdentificacion && <span className={styles.errorMessage}>{errors.numeroIdentificacion}</span>}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formField}>
                                        <label htmlFor="correo">Correo electrónico *</label>
                                        <input
                                            type="email"
                                            id="correo"
                                            name="correo"
                                            value={formData.correo}
                                            onChange={handleInputChange}
                                            placeholder="Correo electrónico"
                                            className={errors.correo ? styles.inputError : ''}
                                            disabled={loading}
                                        />
                                        {errors.correo && <span className={styles.errorMessage}>{errors.correo}</span>}
                                    </div>
                                    <div className={styles.buttonsField}>
                                        <label>&nbsp;</label> {/* Espacio vacío para alinear con el campo de correo */}
                                        <div className={styles.inlineButtonContainer}>
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
            </div>
        </div>
    );
};

export default AgregarPaciente;
