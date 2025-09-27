import { useState, useRef, useEffect } from 'react';
import styles from './styles.module.css';

const SeccionTexto = ({ titulo, descripcion }) => {
    const [mostrarTexto, setMostrarTexto] = useState(false);
    const [altura, setAltura] = useState(0);
    const contenidoRef = useRef(null);

    // Medir la altura del contenido cuando cambia
    useEffect(() => {
        if (mostrarTexto && contenidoRef.current) {
            setAltura(contenidoRef.current.scrollHeight);
        } else {
            setAltura(0);
        }
    }, [mostrarTexto]);

    const alternarTexto = () => {
        setMostrarTexto(!mostrarTexto);
    };

    return (
        <div className={styles.seccion_texto_wrapper}>
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
                            alt={mostrarTexto ? "minus" : "plus"}
                        />
                    </button>
                </div>
                <div 
                    className={styles.texto_container} 
                    style={{ height: `${altura}px` }}
                >
                    <div ref={contenidoRef} className={styles.texto_contenido}>
                        <p className={styles.descripcion2_servi}>{descripcion}</p>
                    </div>
                </div>
                <hr className={styles.linea_servi} />
            </div>
        </div>
    );
};

export default SeccionTexto;
