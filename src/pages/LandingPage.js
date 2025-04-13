import SeccionTexto from '../components/common/SeccionTexto/SeccionTexto';
import styles from './LandingPage.module.css';
import React from 'react';
import Header from '../components/layout/Header/Header';

const LandingPage = () => {

    return (
        <div className={styles.container}>
            <Header variant="landing" />
            <body className={styles.body}>
                <section id="Inicio">
                    <div className={styles.container_inicio}>
                        <div className={styles.item1_inicio}>
                            <p className={styles.subtitulo}>Empresa de salud integral de psicólogos</p>
                            <h3>Tu centro de salud psicológica de confianza</h3>
                        </div>
                        <div className={styles.item2_inicio}>
                            <img className={styles.image1} src="/Images/Imagen1P.jpg" alt="Imagen1 Inicio" />
                        </div>
                        <div className={styles.item3_inicio}>
                            <img className={styles.image2} src="/Images/Imagen2P.jpg" alt="Imagen2 Inicio" />
                        </div>
                    </div>
                </section>
                <section id="Nosotros">
                    <div className={styles.container_nosotros}>
                        <div className={styles.item1_nosotros}>
                            <img className={styles.image1_n} src="/Images/Imagen1N.jpg" alt="Imagen1 Nosotros" />
                        </div>
                        <div className={styles.item2_nosotros}>
                            <h4>Nuestra Misión</h4>
                            <p className={styles.mision}>Proporcionar servicios psicológicos integrales
                                y personalizados que promuevan el bienestar emocional y mental de nuestros
                                clientes. Nos comprometemos a ofrecer un apoyo profesional de alta calidad,
                                basado en la empatía, la confidencialidad y el respeto, para ayudar a las
                                personas a alcanzar su potencial pleno y mejorar su calidad de vida.</p>
                        </div>
                    </div>
                </section>
                <section id="Descripcion">
                    <div className={styles.container_descripcion}>
                        <div className={styles.item1_descripcion}>
                            <h1>Todas las personas merecen recibir atención psicológica
                                especializada. Nuestra visión es ponerla al alcance de todos.</h1>
                        </div>
                    </div>
                </section>
                <section id="Publicaciones">
                    <div className={styles.container_publicacion}>
                        <div className={styles.item1_publicacion}>
                            <h4 className={styles.titulo_publicacion}>Eventos</h4>
                            <p className={styles.parrafo_publicacion}>Conoce los eventos realizados mes a mes por nuestros expertos</p>
                        </div>
                        <div className={styles.item2_publicacion}>
                            <div className={styles.container_titulo_publi2}>
                                <h3 className={styles.titulo_publi2}>Fortalecimiento de la inteligencia emocional en el aula</h3>
                            </div>
                            <div className={styles.container_imagen_publi2}>
                                <img className={styles.image1_publi} src="/Images/Imagen1Publi.jpg" alt="Imagen1 publicaciones" />
                            </div>
                            <div className={styles.container_descripcion_publi}>
                                <p className={styles.descripcion_publi}>En colaboración con la <strong>Institución Educativa San Gabriel</strong>,
                                    realizamos una charla dirigida a los maestros de secundaria para brindarles herramientas efectivas
                                    que les permitan manejar sus emociones y ayudar a sus estudiantes a desarrollar una inteligencia
                                    emocional saludable. </p>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="Servicios">
                    <div className={styles.container_servicios}>
                        <div className={styles.item1_servicios}>
                            <div className={styles.container_encabezado_servi}>
                                <h3 className={styles.titulo_servi}>Nuestros Servicios</h3>
                                <p className={styles.descripcion_servi}>El centro de Especialidades Psicológicas
                                    se dedica a ofrecer atención de primera categoría.</p>
                            </div>
                            <SeccionTexto
                                titulo="Servicios Terapéuticos"
                                descripcion="Psicoterapia Individual: Tratamiento de trastornos emocionales, conductuales, 
                                sistémicos y psicológicos a través de sesiones individuales."
                            />

                            <SeccionTexto
                                titulo="Servicios de Prevención y Educación"
                                descripcion="Terapia de Prevención: Programas diseñados para prevenir problemas psicológicos 
                                mediante el fortalecimiento de habilidades de afrontamiento y la promoción del bienestar emocional."
                            />

                            <SeccionTexto
                                titulo="Servicios Especializados"
                                descripcion="Tratamiento de Trastornos Específicos: Tratamiento especializado para trastornos 
                                como la ansiedad, la depresión, el trastorno obsesivo-compulsivo (TOC), el trastorno bipolar, entre otros."
                            />
                        </div>
                        <div className={styles.item2_servicios}>
                            <img className={styles.image1_publi} src="/Images/Imagen1S.jpg" alt="Imagen1 servicios" />
                        </div>
                    </div>
                </section>
                <section id="Psicologos">
                    <div className={styles.container_psicologos}>
                        <div className={styles.container_titulo_psicologos}>
                            <h4 className={styles.titulo_psicologos}>Nuestros psicólogos especialistas</h4>
                        </div>
                        <div className={styles.container_info_psicologos}>
                            <div className={styles.item1_psicologos}>
                                <p className={styles.nombre_psicologo}>Dra. Jimena García</p>
                                <p className={styles.especialidad_psicologos}>Psicóloga forense</p>
                                <img className={styles.imagen_psicologos} src="/Images/Imagen1PSI.jpg" alt="Imagen1 psicologos" />
                                <p className={styles.descripcion_psicologos}>Descripción de la especialización de cada psicólogo </p>
                            </div>
                            <div className={styles.item1_psicologos}>
                                <p className={styles.nombre_psicologo}>Dr. César Estrada</p>
                                <p className={styles.especialidad_psicologos}>Psicólogo educación y del desarrollo</p>
                                <img className={styles.imagen_psicologos} src="/Images/Imagen2PSI.jpg" alt="Imagen2 psicologos" />
                                <p className={styles.descripcion_psicologos}>Descripción de la especialización de cada psicólogo </p>
                            </div>
                            <div className={styles.item1_psicologos}>
                                <p className={styles.nombre_psicologo}>Dra. Marisol Flores</p>
                                <p className={styles.especialidad_psicologos}>Psicóloga pareja y familiar</p>
                                <img className={styles.imagen_psicologos} src="/Images/Imagen3PSI.jpg" alt="Imagen3 psicologos" />
                                <p className={styles.descripcion_psicologos}>Descripción de la especialización de cada psicólogo </p>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="Contacto">
                    <div className={styles.container_contacto}>
                        <div className={styles.item1_contacto}>
                            <div className={styles.card}>
                                <div className={styles.titulo_contacto}>
                                    <p>Datos de contacto</p>
                                </div>
                                <div className={styles.container_direccion}>
                                    <p className={styles.subtitulo_contacto}>Dirección</p>
                                    <p className={styles.descripcion_contacto}>Calle 12 # 34-56, Bogotá D. C.</p>
                                </div>
                                <div className={styles.container_correo}>
                                    <p className={styles.subtitulo_contacto}>Correo</p>
                                    <p className={styles.descripcion_contacto}>holapsi@gmail.com</p>
                                </div>
                                <div className={styles.container_numero}>
                                    <p className={styles.subtitulo_contacto}>Numero</p>
                                    <p className={styles.descripcion_contacto}>+57 300 123 4567</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.item2_contacto}>
                            <img className={styles.image1_c} src="/Images/Imagen1c.jpg" alt="Imagen1 contacto" />
                        </div>
                    </div>

                </section>
                <section>
                <div className={styles.container_footer}>
                    <div className={styles.item1_footer}>
                        <div className={styles.descripcion_footer}>
                            <p  className={styles.somos}>Somos una clínica especialista en psicología.</p>
                        </div>
                        <div className={styles.descripcion2_footer}>
                            <p className={styles.compania}>Compañia<br /></p>
                            <ul className={styles.nav_links_footer}>
                                <li><a href="#Inicio"><button className={styles.boton_footer}>Inicio</button></a></li>
                                <li><a href="#Nosotros"><button className={styles.boton_footer}>Nosotros</button></a></li>
                                <li><a href="#Servicios"><button className={styles.boton_footer}>Servicios</button></a></li>
                                <li><a href="#Contacto"><button className={styles.boton_footer}>Contacto</button></a></li>
                            </ul>
                        </div>
                    </div>
                    <div className={styles.linea_amarilla}></div>
                    <div className={styles.item2_footer}> 
                        &copy; 2025 Righteous | Todos los derechos reservados
                    </div>
                </div>
            </section>
            </body>
        </div>
    );
};
export default LandingPage;