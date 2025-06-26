import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/layout/Header/Header';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import { ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import styles from './styles.module.css';
import patientService from '../../../services/patient';

const EditarPaciente = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Obtiene el ID del paciente de la URL
    
    // Estados para validación de campos
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        numeroIdentificacion: '',
        correo: ''
    });

    // Cargar los datos del paciente desde el backend
    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                // Validar que el ID sea válido antes de hacer la petición
                if (!id || id === 'N/A' || id === 'undefined' || id === 'null') {
                    Swal.fire({
                        title: 'Error',
                        text: 'ID de paciente no válido',
                        icon: 'error',
                        confirmButtonColor: '#FB8500'
                    }).then(() => {
                        navigate('/dashboard');
                    });
                    return;
                }
                
                setLoading(true);
                
                // Obtener los datos del paciente por ID
                console.log('Obteniendo datos del paciente con ID:', id);
                const response = await patientService.getPatientById(id);
                console.log('Respuesta del paciente:', response);
                
                // Verificar que la respuesta contenga datos
                if (!response) {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo obtener información del paciente',
                        icon: 'error',
                        confirmButtonColor: '#FB8500'
                    }).then(() => {
                        navigate('/dashboard');
                    });
                    return;
                }
                
                // Extraer datos del paciente y human de la respuesta
                const patient = response.patient;
                const human = response.human;
                
                console.log('Datos del paciente:', patient);
                console.log('Datos de human:', human);
                
                if (patient && human) {
                    // Transformar los datos al formato del formulario
                    setFormData({
                        primerNombre: human.first_name || '',
                        segundoNombre: human.middle_name || '',
                        primerApellido: human.last_name || '',
                        segundoApellido: human.second_last_name || '',
                        numeroIdentificacion: human.document_number || patient.identification_number || '',
                        correo: patient.email || ''
                    });
                } else {
                    // Si no se encuentra el paciente o los datos de human, mostrar error
                    Swal.fire({
                        title: 'Error',
                        text: 'No se encontró el paciente solicitado o los datos están incompletos',
                        icon: 'error',
                        confirmButtonColor: '#FB8500'
                    }).then(() => {
                        navigate('/dashboard');
                    });
                }
            } catch (error) {
                console.error('Error al cargar datos del paciente:', error);
                
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudieron cargar los datos del paciente',
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
    }, [id, navigate]);

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

        if (!formData.numeroIdentificacion) {
            newErrors.numeroIdentificacion = 'El número de identificación es obligatorio';
            isValid = false;
        } else if (!validateIdentificacion(formData.numeroIdentificacion)) {
            newErrors.numeroIdentificacion = 'Ingrese un número de identificación válido (6-11 dígitos)';
            isValid = false;
        }

        if (formData.correo && !validateEmail(formData.correo)) {
            newErrors.correo = 'Ingrese un correo electrónico válido';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleActualizar = async () => {
        if (validateForm()) {
            try {
                setSubmitting(true);
                
                // Preparar los datos para enviar al backend en el formato esperado
                // El backend espera los campos de nombre en la raíz, no dentro de un objeto human
                const patientData = {
                    // Datos de human en la raíz
                    first_name: formData.primerNombre,
                    middle_name: formData.segundoNombre || '',
                    last_name: formData.primerApellido,
                    second_last_name: formData.segundoApellido || '',
                    // Datos de patient
                    email: formData.correo || null,
                    identification_number: formData.numeroIdentificacion
                };
                
                console.log('Enviando datos de actualización:', patientData);
                console.log('ID del paciente a actualizar:', id);
                
                // Llamar al servicio para actualizar el paciente
                const response = await patientService.updatePatient(id, patientData);
                console.log('Respuesta de actualización:', response);
                
                // Mostrar alerta de confirmación
                Swal.fire({
                    title: 'Paciente actualizado',
                    text: 'Los datos del paciente han sido actualizados correctamente',
                    icon: 'success',
                    confirmButtonColor: '#FB8500',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    // Redirigir de vuelta al listado de pacientes
                    navigate('/dashboard');
                });
            } catch (error) {
                console.error('Error al actualizar paciente:', error);
                
                // Mostrar mensaje de error específico si viene del backend
                let errorMessage = 'No se pudieron actualizar los datos del paciente';
                
                if (error && error.message) {
                    errorMessage = error.message;
                }
                
                Swal.fire({
                    title: 'Error',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#FB8500'
                });
            } finally {
                setSubmitting(false);
            }
        } else {
            // Si hay errores, mostrar alerta
            Swal.fire({
                title: 'Error',
                text: 'Por favor, corrija los errores en el formulario',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#FB8500'
            });
        }
    };

    // Mostrar un indicador de carga mientras se obtienen los datos
    if (loading) {
        return (
            <div className={styles.dashboard}>
                <Header variant="dashboard" />
                <div className={styles.main}>
                    <Sidebar />
                    <div className={styles.content}>
                        <div className={styles.loadingContainer}>
                            <p>Cargando datos del paciente...</p>
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
                            <h3>Editar paciente</h3>
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
                                            disabled={submitting}
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
                                            placeholder="Segundo nombre"
                                            className={errors.segundoNombre ? styles.inputError : ''}
                                            disabled={submitting}
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
                                            disabled={submitting}
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
                                            placeholder="Segundo apellido"
                                            className={errors.segundoApellido ? styles.inputError : ''}
                                            disabled={submitting}
                                        />
                                        {errors.segundoApellido && <span className={styles.errorMessage}>{errors.segundoApellido}</span>}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
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
                                            disabled={submitting}
                                        />
                                        {errors.numeroIdentificacion && <span className={styles.errorMessage}>{errors.numeroIdentificacion}</span>}
                                    </div>
                                    <div className={styles.formField}>
                                        <label htmlFor="correo">Correo electrónico</label>
                                        <input
                                            type="email"
                                            id="correo"
                                            name="correo"
                                            value={formData.correo}
                                            onChange={handleInputChange}
                                            placeholder="Correo electrónico"
                                            className={errors.correo ? styles.inputError : ''}
                                            disabled={submitting}
                                        />
                                        {errors.correo && <span className={styles.errorMessage}>{errors.correo}</span>}
                                    </div>
                                </div>

                                <div className={styles.buttonContainer}>
                                    <button 
                                        className={styles.saveButton}
                                        onClick={handleActualizar}
                                        type="button"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Actualizando...' : 'Actualizar'}
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

export default EditarPaciente;
