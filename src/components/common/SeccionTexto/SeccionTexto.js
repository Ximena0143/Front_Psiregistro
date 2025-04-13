import { useState } from 'react';
import styles from './styles.module.css';

const SeccionTexto = ({ titulo, descripcion }) => {
    const [mostrarTexto, setMostrarTexto] = useState(false);

    const alternarTexto = () => {
        setMostrarTexto(!mostrarTexto);
    };

    return (
        <div>
            <div className={styles.container_descripcion_servi}>
                <div className={styles.container_titulo_mas}>
                    <h4 className={styles.subtitulo_servi}>{titulo}</h4>
                    <button className={styles.boton_mas} onClick={alternarTexto}>
                        <img
                            width="24"
                            height="24"
                            src={
                                mostrarTexto
                                    ? "https://img.icons8.com/ios-filled/50/219EBC/minus-math.png"
                                    : "https://img.icons8.com/android/24/219EBC/plus.png"
                            }
                            alt={mostrarTexto ? "plus" : "minus"}
                        />
                    </button>
                </div>
                <div className={`${styles.texto_container} ${mostrarTexto ? styles.texto_visible : styles.texto_oculto}`}>
                    <p className={styles.descripcion2_servi}>{descripcion}</p>
                </div>
                <hr className={styles.linea_servi} />
            </div>
        </div>
    );
};

export default SeccionTexto;
