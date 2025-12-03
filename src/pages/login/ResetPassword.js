import styles from "./styles.module.css";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import authService from '../../services/auth';

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams(); // Para capturar parámetros de ruta

  // Extraer el token de los parámetros de la URL
  useEffect(() => {
    console.log('Iniciando extracción de token...');
    console.log('URL completa:', window.location.href);
    console.log('Params:', params);
    console.log('Location:', location);

    // Método 1: Intentar capturar desde parámetros de ruta (/:token)
    let tokenFromUrl = params.token;
    console.log('Token desde parámetros de ruta:', tokenFromUrl);

    if (!tokenFromUrl) {
      // Método 2: Intentar desde location.search (BrowserRouter)
      const queryParams = new URLSearchParams(location.search);
      tokenFromUrl = queryParams.get('token');
      console.log('Token desde location.search:', tokenFromUrl);
      
      // Método 3: Si no funciona, intentar desde location.hash (HashRouter)
      if (!tokenFromUrl && location.hash) {
        console.log('Extrayendo desde location.hash:', location.hash);
        // Extraer la parte de la query string después del hash y la ruta
        const hashParts = location.hash.split('?');
        console.log('Hash parts:', hashParts);
        
        if (hashParts.length > 1) {
          const hashQueryParams = new URLSearchParams(hashParts[1]);
          tokenFromUrl = hashQueryParams.get('token');
          console.log('Token desde location.hash:', tokenFromUrl);
        } else {
          // Intentar otra forma: a veces el formato es /#/reset-password?token=xxx
          const pathAndQuery = location.hash.substring(1); // quitar el #
          const queryStartPos = pathAndQuery.indexOf('?');
          
          if (queryStartPos !== -1) {
            const queryString = pathAndQuery.substring(queryStartPos + 1);
            console.log('Query string alternativa:', queryString);
            
            const altQueryParams = new URLSearchParams(queryString);
            tokenFromUrl = altQueryParams.get('token');
            console.log('Token desde query alternativa:', tokenFromUrl);
          }
        }
      }
      
      // Método 4: Intentar extraerlo directamente de la URL
      if (!tokenFromUrl) {
        const fullUrl = window.location.href;
        const tokenPos = fullUrl.indexOf('token=');
        
        if (tokenPos !== -1) {
          const tokenPart = fullUrl.substring(tokenPos + 6); // +6 para saltar 'token='
          const endPos = tokenPart.indexOf('&') !== -1 ? tokenPart.indexOf('&') : undefined;
          tokenFromUrl = endPos ? tokenPart.substring(0, endPos) : tokenPart;
          console.log('Token extraído directamente de URL:', tokenFromUrl);
        }
      }
    }
    
    console.log('Location completa:', location);
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      console.log('Token extraído de la URL:', tokenFromUrl);
    } else {
      console.error('No se encontró un token en la URL');
      console.error('URL completa actual:', window.location.href);
      console.error('pathname:', window.location.pathname);
      console.error('hash:', window.location.hash);
      console.error('search:', window.location.search);
      
      // Verificar si la URL está en el formato incorrecto (sin # cuando debería tenerlo)
      // o tiene dobles slashes
      if (window.location.pathname.includes('reset-password') && !window.location.hash) {
        console.log('Detectada URL sin hash o con formato incorrecto. Intentando redireccionar...');
        
        // Normalizar el pathname eliminando posibles dobles slashes
        let pathname = window.location.pathname;
        while (pathname.includes('//')) {
          pathname = pathname.replace('//', '/');
        }
        
        // Crear la URL correcta en formato HashRouter
        const correctPath = pathname.replace('/reset-password', 'reset-password');
        const correctUrl = `/#/${correctPath}${window.location.search}`;
        
        console.log(`Redirigiendo de ${window.location.href} a ${window.location.origin}${correctUrl}`);
        window.location.replace(correctUrl);
        return; // Evitar mostrar el error ya que estamos redireccionando
      }
      
      Swal.fire({
        title: 'Error',
        text: 'No se encontró un token válido. Por favor solicita un nuevo enlace de recuperación de contraseña.',
        icon: 'error',
        confirmButtonColor: '#FB8500',
        customClass: {
          confirmButton: 'font-dm-sans',
          title: 'font-dm-sans',
          popup: 'font-dm-sans swal-modal-login',
          container: 'swal-overlay-login'
        },
        confirmButtonText: 'Volver al inicio de sesión',
        backdrop: true,
        heightAuto: false,
        position: 'center'
      }).then(() => {
        navigate('/login');
      });
    }
  }, [location, navigate, params]);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validatePassword = (password) => {
    // Implementar las reglas de validación requeridas
    // Por ahora es simple, pero puedes hacerlo más complejo
    return password.length >= 6;
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

    if (!validatePassword(value)) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
    } else {
      setPasswordError("");
    }

    // Verificar si coincide con la confirmación si esta ya está llena
    if (passwordConfirm && value !== passwordConfirm) {
      setConfirmError("Las contraseñas no coinciden");
    } else if (passwordConfirm) {
      setConfirmError("");
    }
  };

  const handleConfirmChange = (e) => {
    const value = e.target.value;
    setPasswordConfirm(value);

    if (value !== password) {
      setConfirmError("Las contraseñas no coinciden");
    } else {
      setConfirmError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailError && !passwordError && !confirmError && email && password && passwordConfirm && token) {
      try {
        setLoading(true);
        console.log('Iniciando proceso de reseteo de contraseña');
        
        // Llamar al servicio de reseteo de contraseña
        await authService.resetPassword({ 
          email, 
          password, 
          password_confirmation: passwordConfirm, 
          token 
        });
        
        // Mostrar mensaje de éxito
        Swal.fire({
          title: '¡Éxito!',
          text: 'Tu contraseña ha sido cambiada correctamente',
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
        
      } catch (error) {
        console.error('Error al resetear contraseña:', {
          mensaje: error.message,
          estado: error.status,
          url: error.url,
          datos: error.data
        });
        
        // Mostrar mensaje de error
        let errorTitle = 'Error';
        let errorMsg = error.message || 'Ha ocurrido un error al intentar cambiar tu contraseña';
        
        // Personalizar mensaje según el código de error
        if (error.status) {
          switch (error.status) {
            case 400:
              errorTitle = 'Token inválido';
              errorMsg = 'El token de recuperación no es válido o ha expirado.';
              break;
            case 404:
              errorTitle = 'Correo no encontrado';
              errorMsg = 'No existe una cuenta asociada a este correo electrónico.';
              break;
            case 422:
              errorTitle = 'Datos inválidos';
              errorMsg = 'Por favor verifica tu correo y contraseña.';
              break;
            case 500:
              errorTitle = 'Error del servidor';
              errorMsg = 'Hay un problema en el servidor. Por favor, intenta nuevamente más tarde.';
              break;
            default:
              // Mantener los mensajes por defecto
          }
        }
        
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
          heightAuto: false,
          position: 'center'
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Determinar qué campos faltan o tienen errores
      let camposFaltantes = [];
      if (!email) camposFaltantes.push('correo electrónico');
      if (!password) camposFaltantes.push('contraseña');
      if (!passwordConfirm) camposFaltantes.push('confirmación de contraseña');
      if (!token) camposFaltantes.push('token (no encontrado en la URL)');
      
      let mensaje = 'Por favor, completa correctamente todos los campos';
      if (camposFaltantes.length > 0) {
        mensaje = `Por favor, completa los siguientes campos: ${camposFaltantes.join(', ')}`;
      } else if (emailError) {
        mensaje = 'El formato del correo electrónico no es válido';
      } else if (passwordError) {
        mensaje = 'La contraseña no cumple con los requisitos de seguridad';
      } else if (confirmError) {
        mensaje = 'Las contraseñas no coinciden';
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
          <p className={styles.bienvenido}>Nueva Contraseña</p>
        </div>
        <div className={styles.container_image_login}>
          <img className={styles.image_login} src="/Images/Imagen1N.jpg" alt="Imagen de fondo" />
        </div>
      </div>
      <div className={styles.card}>
        <p className={styles.titulo_inicio}>Establecer Nueva Contraseña</p>
        <p className={styles.subtitulo_recuperar}>Por favor, introduce tu correo electrónico y una nueva contraseña</p>
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
              placeholder="Nueva Contraseña"
              value={password}
              onChange={handlePasswordChange}
            />
            <label htmlFor="password" className={styles.input_label}>Nueva Contraseña</label>
            <span className={styles.input_highlight}></span>
            <div className={styles.eye_icon} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye size={20} color="#007bff" /> : <EyeOff size={20} color="#007bff" />}
            </div>
            {passwordError && <p className={styles.error_text}>{passwordError}</p>}
          </div>
          <div className={styles.container_input}>
            <input
              id="confirm-password"
              className={styles.input_field}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar Contraseña"
              value={passwordConfirm}
              onChange={handleConfirmChange}
            />
            <label htmlFor="confirm-password" className={styles.input_label}>Confirmar Contraseña</label>
            <span className={styles.input_highlight}></span>
            <div className={styles.eye_icon} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <Eye size={20} color="#007bff" /> : <EyeOff size={20} color="#007bff" />}
            </div>
            {confirmError && <p className={styles.error_text}>{confirmError}</p>}
          </div>
          <div className={styles.botones}>
            <button 
              className={styles.boton_inicio} 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Cambiar Contraseña'}
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
