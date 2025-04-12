import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { HiUserCircle } from "react-icons/hi2";
import { FaRegBell } from "react-icons/fa6";
import { FaUserFriends, FaFileAlt, FaImage, FaClipboard } from "react-icons/fa";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [showMenu, setShowMenu] = useState(false);
  const [showOptions, setShowOptions] = useState(null);

  const pacientes = [
    { nombre: "Laura Gómez Rodríguez", correo: "laura.gomez@example.com" },
    { nombre: "Andrés Martínez Ramírez", correo: "andres.martinez@example.com" },
    { nombre: "Camila Torres Jiménez", correo: "camila.torres@example.com" },
    { nombre: "Juan Pablo Sánchez", correo: "juan.sanchez@example.com" },
    { nombre: "Felipe Castro Mendoza", correo: "felipe.castro@example.com" },
  ];

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const toggleOptions = (index) => {
    setShowOptions(showOptions === index ? null : index);
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.container_header}>
          <div className={styles.logo}>
              <img src="/Images/Logo2.png" alt="Logo" />
              <p>Righteous</p>
          </div>
            <nav className={styles.nav_header}>
              <FaRegBell className={styles.icon} size={29} />
              <div className={styles.user} onClick={toggleMenu}>
                <p className={styles.name_user}>Miranda</p>
                <HiUserCircle className={styles.icon_user} size={35}/>
                  {showMenu && (
                    <div className={styles.dropdown}>
                      <p>Ver perfil</p>
                      <p>Cerrar sesión</p>
                    </div>
                  )}
              </div>
            </nav>
        </div>
      </header>
      <div className={styles.main}>
        <div className={styles.sidebar}>
          <ul>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.active : ""}>
                <FaUserFriends className={styles.icon_menu} /> 
                  <p>Pacientes</p>
              </NavLink>
            </li>
            <li>
              <NavLink to="/documentos" className={({ isActive }) => isActive ? styles.active : ""}>
                <FaFileAlt className={styles.icon_menu} /> 
                  <p>Documentos</p>
              </NavLink>
            </li>
            <li>
              <NavLink to="/publicaciones" className={({ isActive }) => isActive ? styles.active : ""}>
                <FaImage className={styles.icon_menu} />
                  <p>Publicaciones</p>
              </NavLink>
            </li>
            <li>
              <NavLink to="/test" className={({ isActive }) => isActive ? styles.active : ""}>
                <FaClipboard className={styles.icon_menu} />
                  <p>Test</p>
              </NavLink>
            </li>
          </ul>
        </div>
        <div className={styles.content}>
          <h2>Lista de pacientes</h2>
          <button className={styles.addButton}>Agregar paciente</button>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((paciente, index) => (
                <tr key={index}>
                  <td>{paciente.nombre}</td>
                  <td>{paciente.correo}</td>
                  <td>
                    <button className={styles.viewButton}>Ver historial</button>
                    <MoreVertical onClick={() => toggleOptions(index)} />
                    {showOptions === index && (
                      <div className={styles.options}>
                        <p>Editar paciente</p>
                        <p>Eliminar paciente</p>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
