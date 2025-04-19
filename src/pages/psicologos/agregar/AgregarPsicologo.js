import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layout/Header/Header';
import Sidebar from '../../../components/layout/Sidebar/Sidebar';
import { ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import styles from './styles.module.css';

const AgregarPsicologo = () => {
    const navigate = useNavigate();
    
    // Estados para validación de campos
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        especializacion: '',
        telefono: '',
        correo: ''
    });

    const handleGoBack = () => {
        navigate(-1);
    };

    // Funciones de validación
    const validateEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
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

    const handleLimpiarForm = () => {
        setFormData({
            primerNombre: '',
            segundoNombre: '',
            primerApellido: '',
            segundoApellido: '',
            especializacion: '',
            telefono: '',
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

        if (!formData.especializacion) {
            newErrors.especializacion = 'La especialización es obligatoria';
            isValid = false;
        }

        if (!formData.correo) {
            newErrors.correo = 'El correo electrónico es obligatorio';
            isValid = false;
        } else if (!validateEmail(formData.correo)) {
            newErrors.correo = 'Ingrese un correo electrónico válido';
            isValid = false;
        }

        if (formData.telefono && !validateTelefono(formData.telefono)) {
            newErrors.telefono = 'Ingrese un número de teléfono válido (10 dígitos)';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleGuardar = () => {
        if (validateForm()) {
            // Aquí iría la lógica para guardar el psicólogo en la base de datos
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
                                        <label htmlFor="especializacion">Especialización *</label>
                                        <input
                                            type="text"
                                            id="especializacion"
                                            name="especializacion"
                                            value={formData.especializacion}
                                            onChange={handleInputChange}
                                            placeholder="Ejemplo: Psicología Clínica"
                                            className={errors.especializacion ? styles.inputError : ''}
                                        />
                                        {errors.especializacion && <span className={styles.errorMessage}>{errors.especializacion}</span>}
                                    </div>
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
                                        />
                                        {errors.correo && <span className={styles.errorMessage}>{errors.correo}</span>}
                                    </div>
                                </div>

                                <div className={styles.buttonContainer}>
                                    <button 
                                        className={styles.clearButton}
                                        onClick={handleLimpiarForm}
                                        type="button"
                                    >
                                        Limpiar
                                    </button>
                                    <button 
                                        className={styles.saveButton}
                                        onClick={handleGuardar}
                                        type="button"
                                    >
                                        Guardar
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
