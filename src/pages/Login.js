import styles from "./Login.module.css";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Login() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin1234");
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
      backdrop: false,
      allowOutsideClick: false
    });
  }, []);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
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
      setPasswordError("Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!emailError && !passwordError && email && password) {
      console.log("Email:", email);
      console.log("Contraseña:", password);
      navigate("/dashboard");
    } else {
      console.log("Hay errores en el formulario");
    }
  };

  const handleSignup = () => {
    navigate("/signup");
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
          <div className={styles.botones}>
            <button className={styles.boton_inicio} type="submit">Iniciar Sesión</button>
          </div>
        </form>
      </div>
    </div>
  );
}
