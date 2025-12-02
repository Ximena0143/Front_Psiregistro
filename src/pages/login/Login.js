import styles from "./styles.module.css";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import authService from '../../services/auth';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Swal.fire({
      title: 'Alerta',
      text: 'Este inicio de sesión es solo para usuarios autorizados.',
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#FB8500',
      backdrop: true,
      allowOutsideClick: false,
      customClass: {
        container: 'swal-overlay-login',
        popup: 'swal-modal-login',
        confirmButton: 'font-dm-sans'
      },
      heightAuto: false, // Evita que SweetAlert modifique la altura del documento
      position: 'center' // Posición centrada
    });
  }, []);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Validación de contraseña temporalmente desactivada mientras se realizan cambios en el backend
  const validatePassword = (password) => {
    // return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
    return true; // Siempre devuelve true para permitir cualquier contraseña temporalmente
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

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    // Validación de contraseña temporalmente desactivada
    // if (!validatePassword(value)) {
    //   setPasswordError("Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número");
    // } else {
    //   setPasswordError("");
    // }
    
    // Temporalmente no hay validación de contraseña
    setPasswordError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailError && !passwordError && email && password) {
      try {
        setLoading(true);
        console.log('Iniciando proceso de login');
        
        // Verificar si ya hay un token guardado de alguna sesión anterior
        const existingToken = localStorage.getItem('auth_token');
        if (existingToken) {
          console.log('Ya existe un token en localStorage, limpiando...');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
        
        // Llamar al servicio de autenticación con un manejo de errores más robusto
        let response;
        let loginSuccess = false;
        
        try {
          // Intentar login normal
          response = await authService.login({ email, password });
          loginSuccess = true;
        } catch (loginError) {
          console.error('Error en la primera llamada de login:', loginError);
          
          // Verificamos si a pesar del error se guardó un token (puede pasar si el servidor
          // responde con un token pero luego hay un error en el procesamiento)
          const tokenAfterError = localStorage.getItem('auth_token');
          
          if (tokenAfterError) {
            console.log('Se encontró un token a pesar del error, procediendo como login exitoso');
            loginSuccess = true;
            response = {
              token: tokenAfterError,
              user: { email: email }
            };
          } else {
            // Si realmente no hay token, propagamos el error original
            throw loginError;
          }
        }
        
        // Si llegamos aquí, o bien el login fue exitoso o tenemos un token válido
        if (loginSuccess) {
          // Extraer información del usuario para mostrar un mensaje personalizado
          const userName = response?.user ? (response.user.name || response.user.email) : email;
          
          console.log('Login exitoso:', { 
            usuario: userName,
            tokenObtenido: !!response?.token || !!localStorage.getItem('auth_token')
          });
          
          // Mostrar mensaje de éxito
          Swal.fire({
            title: '¡Bienvenido!',
            text: `Has iniciado sesión correctamente ${userName}`,
            icon: 'success',
            confirmButtonColor: '#FB8500',
            customClass: {
              confirmButton: 'font-dm-sans',
              title: 'font-dm-sans',
              popup: 'font-dm-sans swal-modal-login',
              container: 'swal-overlay-login'
            },
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            backdrop: true,
            heightAuto: false, // Evita que SweetAlert modifique la altura del documento
            position: 'center' // Posición centrada
          });
          
          // Redirigir al dashboard después de un breve retraso para permitir que se vea el mensaje
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
      } catch (error) {
        console.error('Error de autenticación completo:', {
          mensaje: error.message,
          estado: error.status,
          url: error.url,
          datos: error.data
        });
        
        // ¿Hay un token a pesar del error? Si es así, permitimos continuar
        const tokenDespuesDeError = localStorage.getItem('auth_token');
        if (tokenDespuesDeError) {
          console.log('Se encontró un token a pesar del error general, intentando proceder');
          
          Swal.fire({
            title: 'Advertencia',
            text: 'Se ha detectado un problema, pero puedes continuar. Algunas funciones podrían no estar disponibles.',
            icon: 'warning',
            confirmButtonColor: '#FB8500',
            customClass: {
              confirmButton: 'font-dm-sans',
              title: 'font-dm-sans',
              popup: 'font-dm-sans swal-modal-login',
              container: 'swal-overlay-login'
            },
            confirmButtonText: 'Continuar de todos modos',
            backdrop: true,
            heightAuto: false, // Evita que SweetAlert modifique la altura del documento
            position: 'center' // Posición centrada
          }).then((result) => {
            if (result.isConfirmed) {
              navigate('/dashboard');
            }
          });
          
          return; // Salimos para evitar mostrar el mensaje de error
        }
        
        // Si no hay token, mostramos el mensaje de error normal
        let errorTitle = 'Error de autenticación';
        let errorMsg = error.message || 'Ha ocurrido un error al intentar iniciar sesión';
        
        // Personalizar mensaje según el código de error
        if (error.status) {
          switch (error.status) {
            case 401:
              errorTitle = 'Credenciales incorrectas';
              errorMsg = 'El correo o la contraseña son incorrectos. Por favor, verifica tus datos.';
              break;
            case 403:
              errorTitle = 'Acceso denegado';
              errorMsg = 'No tienes permisos para acceder al sistema.';
              break;
            case 404:
              errorTitle = 'Servicio no disponible';
              errorMsg = 'El servicio de autenticación no está disponible en este momento.';
              break;
            case 500:
              errorTitle = 'Error del servidor';
              errorMsg = 'Hay un problema en el servidor. Por favor, intenta nuevamente o contacta al administrador.';
              break;
            default:
              // Mantener los mensajes por defecto
          }
        } else if (errorMsg.includes('token')) {
          errorTitle = 'Error de autenticación';
          errorMsg = 'No se pudo completar la autenticación. Contacta al administrador del sistema.';
        }
        
        // Mostrar mensaje de error
        Swal.fire({
          title: errorTitle,
          text: errorMsg,
          icon: 'error',
          confirmButtonColor: '#FB8500',
          customClass: {
            confirmButton: 'font-dm-sans',
            title: 'font-dm-sans',
            popup: 'font-dm-sans swal-modal-login',
            container: 'swal-overlay-login'
          },
          backdrop: true,
          heightAuto: false, // Evita que SweetAlert modifique la altura del documento
          position: 'center' // Posición centrada
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Determinar qué campos faltan o tienen errores
      let camposFaltantes = [];
      if (!email) camposFaltantes.push('correo electrónico');
      if (!password) camposFaltantes.push('contraseña');
      
      let mensaje = 'Por favor, completa correctamente todos los campos';
      if (camposFaltantes.length > 0) {
        mensaje = `Por favor, completa los siguientes campos: ${camposFaltantes.join(', ')}`;
      } else if (emailError) {
        mensaje = 'El formato del correo electrónico no es válido';
      } else if (passwordError) {
        mensaje = 'La contraseña no cumple con los requisitos de seguridad';
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
        heightAuto: false, // Evita que SweetAlert modifique la altura del documento
        position: 'center' // Posición centrada
      });
    }
  };

  const handleForgotPassword = () => {
    // Navegar a la página de recuperación de contraseña
    navigate('/forgot-password');
  };

  return (
    <div className={styles.container_login}>
      <div className={styles.fondo_login}>
        <div className={styles.color_login}>
          <p className={styles.titulo}>Righteous</p>
          <p className={styles.bienvenido}>Bienvenido</p>
        </div>
        <div className={styles.container_image_login}>
          <img className={styles.image_login} src="/Images/Imagen1N.jpg" alt="Imgane de fondo" />
        </div>
      </div>
      <div className={styles.card}>
        <p className={styles.titulo_inicio}>Inicia sesión</p>
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
          <div className={styles.container_input}>
            <input
              id="password"
              className={styles.input_field}
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={handlePasswordChange}
            />
            <label htmlFor="password" className={styles.input_label}>Contraseña</label>
            <span className={styles.input_highlight}></span>
            <div className={styles.eye_icon} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye size={20} color="#007bff" /> : <EyeOff size={20} color="#007bff" />}
            </div>
            {passwordError && <p className={styles.error_text}>{passwordError}</p>}
          </div>
          <p className={styles.forgot_password} onClick={handleForgotPassword}>¿Olvidó su contraseña?</p>
          <div className={styles.botones}>
            <button 
              className={styles.boton_inicio} 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
