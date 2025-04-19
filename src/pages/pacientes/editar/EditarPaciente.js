import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/layout/Header/Header';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import { ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import styles from './styles.module.css';

const EditarPaciente = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Obtiene el ID del paciente de la URL
    
    // Estados para validación de campos
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        tipoIdentificacion: 'C.C',
        numeroIdentificacion: '',
        telefono: '',
        correo: ''
    });

    // Simulación de carga de datos del servidor basado en el ID
    useEffect(() => {
        // En una aplicación real, aquí cargarías los datos del paciente desde la API
        // usando el ID recibido por parámetro
        
        // Simulamos la carga de datos (esto sería reemplazado por una llamada a API)
        setTimeout(() => {
            // Datos de ejemplo para mostrar en el formulario
            const pacienteData = {
                primerNombre: 'Juan',
                segundoNombre: 'Carlos',
                primerApellido: 'Pérez',
                segundoApellido: 'Gómez',
                tipoIdentificacion: 'C.C',
                numeroIdentificacion: '1023456789',
                telefono: '3102345678',
                correo: 'juan.perez@ejemplo.com'
            };
            
            setFormData(pacienteData);
            setLoading(false);
        }, 800); // Simulamos un pequeño tiempo de carga
    }, [id]);

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

    const validateTelefono = (telefono) => {
        return /^\d{10}$/.test(telefono);
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

        if (formData.telefono && !validateTelefono(formData.telefono)) {
            newErrors.telefono = 'Ingrese un número de teléfono válido (10 dígitos)';
            isValid = false;
        }

        if (formData.correo && !validateEmail(formData.correo)) {
            newErrors.correo = 'Ingrese un correo electrónico válido';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleActualizar = () => {
        if (validateForm()) {
            // Aquí iría la lógica para enviar los datos a la API/Backend
            console.log('Actualizando paciente:', formData);
            
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
        } else {
            // Si hay errores, mostrar alerta
            Swal.fire({
                title: 'Validación fallida',
                text: 'Por favor corrige los errores en el formulario',
                icon: 'warning',
                confirmButtonColor: '#FB8500'
            });
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
                            <p>Cargando información del paciente...</p>
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
                                        >
                                            <option value="C.C">C.C</option>
                                            <option value="T.I">T.I</option>
                                            <option value="C.E">C.E</option>
                                            <option value="Pasaporte">Pasaporte</option>
                                        </select>
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
                                        />
                                        {errors.numeroIdentificacion && <span className={styles.errorMessage}>{errors.numeroIdentificacion}</span>}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formField}>
                                        <label htmlFor="telefono">Teléfono</label>
                                        <input
                                            type="tel"
                                            id="telefono"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            placeholder="Teléfono (10 dígitos)"
                                            className={errors.telefono ? styles.inputError : ''}
                                        />
                                        {errors.telefono && <span className={styles.errorMessage}>{errors.telefono}</span>}
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
                                        />
                                        {errors.correo && <span className={styles.errorMessage}>{errors.correo}</span>}
                                    </div>
                                </div>

                                <div className={styles.buttonContainer}>
                                    <button 
                                        className={styles.cancelButton}
                                        onClick={handleGoBack}
                                        type="button"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        className={styles.saveButton}
                                        onClick={handleActualizar}
                                        type="button"
                                    >
                                        Actualizar
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
