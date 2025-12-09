import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import authService from '../../services/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (!validateEmail(value)) {
      setEmailError("Correo inválido");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailError && email) {
      try {
        setLoading(true);
        
        try {
          // Llamar al servicio de recuperación de contraseña
          await authService.forgotPassword({ email });
        } catch (error) {
          // Solo registrar el error en la consola para depuración, pero no mostrarlo al usuario
          console.error('Error al solicitar recuperación de contraseña:', {
            mensaje: error.message,
            estado: error.status,
            url: error.url,
            datos: error.data
          });
          
          // No hacer nada con el error - continuamos con el flujo normal
          // independientemente de si el correo existe o no en la base de datos
        }
        
        // SIEMPRE mostrar mensaje de éxito, independientemente de si el correo existe o no
        // Esto es una práctica de seguridad para evitar la enumeración de usuarios
        Swal.fire({
          title: '¡Éxito!',
          text: `Si el correo ${email} está registrado en nuestro sistema, recibirás un mensaje con instrucciones para restablecer tu contraseña.`,
          icon: 'success',
          confirmButtonColor: '#FB8500',
          customClass: {
            confirmButton: 'font-dm-sans',
            title: 'font-dm-sans',
            popup: 'font-dm-sans swal-modal-login',
            container: 'swal-overlay-login'
          },
          timer: 3000,
          timerProgressBar: true,
          backdrop: true,
          heightAuto: false,
          position: 'center'
        });
        
        // Redirigir al login después de un breve retraso
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        
      } finally {
        setLoading(false);
      }
    } else {
      // Determinar qué campo falta o tiene error
      let mensaje = 'Por favor, introduce un correo electrónico válido';
      if (!email) {
        mensaje = 'Por favor, ingresa tu correo electrónico';
      } else if (emailError) {
        mensaje = 'El formato del correo electrónico no es válido';
      }
      
      Swal.fire({
        title: 'Formulario incompleto',
        text: mensaje,
        icon: 'warning',
        confirmButtonColor: '#FB8500',
        customClass: {
          confirmButton: 'font-dm-sans',
          title: 'font-dm-sans',
          popup: 'font-dm-sans swal-modal-login',
          container: 'swal-overlay-login'
        },
        backdrop: true,
        heightAuto: false,
        position: 'center'
      });
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className={styles.container_login}>
      <div className={styles.fondo_login}>
        <div className={styles.color_login}>
          <p className={styles.titulo}>Righteous</p>
          <p className={styles.bienvenido}>Recuperar Contraseña</p>
        </div>
        <div className={styles.container_image_login}>
          <img className={styles.image_login} src="/Images/Imagen1N.jpg" alt="Imagen de fondo" />
        </div>
      </div>
      <div className={styles.card}>
        <p className={styles.titulo_inicio}>Recuperar Contraseña</p>
        <p className={styles.subtitulo_recuperar}>Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña</p>
        <form onSubmit={handleSubmit} className={styles.form_inicio}>
          <div className={styles.container_input}>
            <input
              id="email"
              className={styles.input_field}
              type="email"
              placeholder="Correo"
              value={email}
              onChange={handleEmailChange}
            />
            <label htmlFor="email" className={styles.input_label}>Correo</label>
            <span className={styles.input_highlight}></span>
            {emailError && <p className={styles.error_text}>{emailError}</p>}
          </div>
          <div className={styles.botones}>
            <button 
              className={styles.boton_inicio} 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Enviar Instrucciones'}
            </button>
            <button 
              className={styles.boton_volver} 
              type="button" 
              onClick={handleBackToLogin}
            >
              Volver al Inicio de Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
