import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/fotos/logo.png';

const Footer = () => {
    const location = useLocation();
    const { user } = useAuth();
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    // Hide footer on auth pages to avoid scrolling/clutter
    if (['/login', '/register', '/cambiar-contrasena', '/reset-password', '/select-role'].includes(location.pathname)) {
        return null;
    }

    const isMentor = user && ['mentor', 'graduate', 'egresado'].includes((user.role || '').toLowerCase());
    const homeLink = isMentor ? '/mentor/dashboard' : (user ? '/student/dashboard' : '/');

    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <div className="flex items-center space-x-2">
                            <Link to={homeLink}>
                                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 cursor-pointer">
                                    EstaciónU+
                                </h3>
                            </Link>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Conectando el talento joven con las oportunidades que transforman el futuro profesional de la FIIS.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-slate-900 dark:text-white font-bold">Plataforma</h4>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            {isMentor ? (
                                <>
                                    <li><Link to="/mentor/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                                    <li><Link to="/mentores" className="hover:text-primary transition-colors">Mentores</Link></li>
                                    <li><Link to="/cuenta" className="hover:text-primary transition-colors">Mi perfil</Link></li>
                                    <li><Link to="/sesiones" className="hover:text-primary transition-colors">Mis Coffee Chats</Link></li>
                                    <li><Link to="/reporte" className="hover:text-primary transition-colors">Nuestro reporte</Link></li>
                                </>
                            ) : user ? (
                                <>
                                    <li><Link to="/student/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                                    <li><Link to="/mentores" className="hover:text-primary transition-colors">Mentores</Link></li>
                                    <li><Link to="/cuenta" className="hover:text-primary transition-colors">Mi perfil</Link></li>
                                    <li><Link to="/sesiones" className="hover:text-primary transition-colors">Mis Coffee Chats</Link></li>
                                    <li><Link to="/reporte" className="hover:text-primary transition-colors">Nuestro reporte</Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/" className="hover:text-primary transition-colors">Inicio</Link></li>
                                    <li><Link to="/reporte" className="hover:text-primary transition-colors">Nuestro reporte</Link></li>
                                    <li><Link to="/login" className="hover:text-primary transition-colors">Iniciar sesión</Link></li>
                                    <li><Link to="/register" className="hover:text-primary transition-colors">Únete</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-slate-900 dark:text-white font-bold">Legal</h4>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <li><button onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="hover:text-primary transition-colors bg-transparent border-none p-0 cursor-pointer text-left">Términos y Condiciones</button></li>
                            <li><button onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }} className="hover:text-primary transition-colors bg-transparent border-none p-0 cursor-pointer text-left">Privacidad</button></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-slate-900 dark:text-white font-bold">Contacto</h4>
                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <p className="flex items-center space-x-2">
                                <span className="material-icons text-primary text-base">email</span>
                                <span>proyectofiisperu@gmail.com</span>
                            </p>
                            <div className="flex space-x-3 pt-2">
                                <a
                                    href="https://www.linkedin.com/company/estacionu/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0A66C2] text-white hover:bg-[#004182] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
                                    title="LinkedIn EstaciónU"
                                >
                                    <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-slate-500 dark:text-slate-500">
                    <p>© {new Date().getFullYear()} EstaciónU+. Todos los derechos reservados.</p>
                    <div className="flex items-center">
                        <img src={logo} alt="EstaciónU Logo" className="h-10 opacity-80 hover:opacity-100 transition-opacity dark:invert dark:brightness-0" />
                    </div>
                </div>
            </div>

            {/* Terms Modal */}
            {showTerms && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowTerms(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl scale-100 transition-transform" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-icons text-primary">gavel</span>
                                Términos y Condiciones
                            </h3>
                            <button onClick={() => setShowTerms(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 text-slate-600 dark:text-slate-300 text-sm space-y-4">
                            <h4 className="font-bold text-slate-800 dark:text-white text-base">1. Aceptación de los términos</h4>
                            <p>Al acceder y utilizar EstaciónU+, usted acepta estar sujeto a estos términos y condiciones. Si no está de acuerdo con alguna parte, no podrá utilizar nuestros servicios.</p>
                            <h4 className="font-bold text-slate-800 dark:text-white text-base">2. Uso de la plataforma</h4>
                            <p>Nuestra plataforma conecta a estudiantes con mentores y egresados. Se espera un comportamiento profesional, respetuoso y ético en todo momento por parte de todos los usuarios.</p>
                            <h4 className="font-bold text-slate-800 dark:text-white text-base">3. Cuentas y seguridad</h4>
                            <p>Usted es responsable de mantener la confidencialidad de sus credenciales y de todas las actividades bajo su cuenta.</p>
                            <h4 className="font-bold text-slate-800 dark:text-white text-base">4. Propiedad intelectual</h4>
                            <p>Todo el contenido original, características y funcionalidad de la plataforma son propiedad exclusiva de EstaciónU+ y están protegidos por derechos de autor internacionales.</p>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                            <button onClick={() => setShowTerms(false)} className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20">
                                Aceptar y Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy Modal */}
            {showPrivacy && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowPrivacy(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl scale-100 transition-transform" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-icons text-primary">security</span>
                                Política de Privacidad
                            </h3>
                            <button onClick={() => setShowPrivacy(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 text-slate-600 dark:text-slate-300 text-sm space-y-4">
                            <h4 className="font-bold text-slate-800 dark:text-white text-base">1. Recopilación de información</h4>
                            <p>Recopilamos información personal que usted nos proporciona al registrarse, como su nombre, correo institucional, carrera profesional y preferencias de mentoría.</p>
                            <h4 className="font-bold text-slate-800 dark:text-white text-base">2. Uso de su información</h4>
                            <p>Utilizamos su información para personalizar su experiencia, facilitar conexiones entre mentores y estudiantes, y enviar notificaciones relevantes sobre sus solicitudes y sesiones (Coffee Chats).</p>
                            <h4 className="font-bold text-slate-800 dark:text-white text-base">3. Protección de datos</h4>
                            <p>Implementamos diversas medidas de seguridad estructural para mantener la seguridad de su información personal. Sus datos no serán vendidos ni comercializados con terceros.</p>
                            <h4 className="font-bold text-slate-800 dark:text-white text-base">4. Accesibilidad y control</h4>
                            <p>Usted tiene derecho a acceder, corregir o eliminar su información personal en cualquier momento desde los ajustes de su perfil de usuario en nuestra plataforma.</p>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                            <button onClick={() => setShowPrivacy(false)} className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20">
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;
