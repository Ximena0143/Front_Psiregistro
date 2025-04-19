import styles from "./styles.module.css";
import React, { useState } from 'react';
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [lastName, setLastName] = useState("");
  const [secondLastName, setSecondLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Correo:", email);
    console.log("Contraseña:", password);
    console.log("Primer Nombre:", firstName);
    console.log("Segundo Nombre:", secondName);
    console.log("Primer Apellido:", lastName);
    console.log("Segundo Apellido:", secondLastName);
    navigate("/dashboard");
    // Aquí conectamos la API para crear la cuenta
  };

  return (
    <div className={styles.container_signup}>
      <div className={styles.fondo_signup}>
        <div className={styles.color_signup}>
        </div>
        <div className={styles.container_image_signup}>
          <img className={styles.image_signup} src="/Images/Imagen1S.jpg" alt="Imagen de fondo" />
        </div>
      </div>
      <div className={styles.card}>
        <p className={styles.titulo_signup}>Regístrate</p>
        <div className={styles.linea1_azul}></div>
        <form onSubmit={handleSubmit} className={styles.form_signup}>
          <div className={styles.container_input_double}>
            <div className={styles.container_input}>
              <label htmlFor="email" className={styles.text}>Correo:</label>
              <input
                id="email"
                name="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.container_input}>
              <label htmlFor="password" className={styles.text}>Contraseña:</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className={styles.eye_icon} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
              </div>
            </div>
          </div>
          <div className={styles.subtitulo_signup}><p>Información Basica</p></div>
          <div className={styles.linea1_azul}></div>
          <div className={styles.container_input_double}>
            <div className={styles.container_input}>
              <label htmlFor="firstName" className={styles.text}>Primer Nombre:</label>
              <input
                id="firstName"
                name="firstName"
                className={styles.input}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className={styles.container_input}>
              <label htmlFor="secondName" className={styles.text}>Segundo Nombre:</label>
              <input
                id="secondName"
                name="secondName"
                className={styles.input}
                value={secondName}
                onChange={(e) => setSecondName(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.container_input_double}>
            <div className={styles.container_input}>
              <label htmlFor="lastName" className={styles.text}>Primer Apellido:</label>
              <input
                id="lastName"
                name="lastName"
                className={styles.input}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className={styles.container_input}>
              <label htmlFor="secondLastName" className={styles.text}>Segundo Apellido:</label>
              <input
                id="secondLastName"
                name="secondLastName"
                className={styles.input}
                value={secondLastName}
                onChange={(e) => setSecondLastName(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.botones}>
            <button className={styles.boton} type="submit">Crear cuenta</button>
          </div>
        </form>
      </div>
    </div>
  );
}
