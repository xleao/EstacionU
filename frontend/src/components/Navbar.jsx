
import logo from '../assets/fotos/logo.png';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth(); // Get user and logout from context

    useEffect(() => {
        setIsMobileMenuOpen(false); // Close menu on route change
    }, [location.pathname]);

    useEffect(() => {
        if (localStorage.theme === 'dark') {
            document.documentElement.classList.add('dark');
            setDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setDarkMode(false);
        }
    }, []);

    useEffect(() => {
        if (showLogoutModal || isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showLogoutModal, isMobileMenuOpen]);

    const toggleTheme = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setDarkMode(true);
        }
    };

    // Helper to determine if a path is active
    const isActive = (path) => location.pathname === path;
    const isGroupActive = (paths) => paths.includes(location.pathname);

    // Determine if the user is a mentor/graduate
    const isMentor = user && ['mentor', 'graduate', 'egresado'].includes((user.role || '').toLowerCase());

    // Determine if the user is an admin
    const isAdmin = user && ['admin', 'administrador'].includes((user.role || '').toLowerCase());

    return (
        <>
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex-shrink-0 flex items-center space-x-2">
                            <Link to={isAdmin ? '/admin/dashboard' : (isMentor ? '/mentor/dashboard' : (user ? '/student/dashboard' : '/'))}>
                                <img
                                    alt="EstaciónU+ Logo"
                                    className="h-16 w-auto object-contain cursor-pointer dark:brightness-0 dark:invert animate-glow"
                                    src={logo}
                                />
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">

                            {/* ADMIN NAV */}
                            {isAdmin ? (
                                <>
                                    <Link
                                        className={`${isActive('/admin/dashboard') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-semibold hover:text-primary transition-colors`}
                                        to="/admin/dashboard"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        className={`${isActive('/admin/usuarios') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-semibold hover:text-primary transition-colors`}
                                        to="/admin/usuarios"
                                    >
                                        Usuarios
                                    </Link>
                                </>
                            ) : isMentor ? (
                                <>
                                    <Link
                                        className={`${isActive('/mentor/dashboard') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-semibold hover:text-primary transition-colors`}
                                        to="/mentor/dashboard"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        className={`${isActive('/mentores') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-semibold hover:text-primary transition-colors`}
                                        to="/mentores"
                                    >
                                        Mentores
                                    </Link>
                                    <Link
                                        className={`${isActive('/cuenta') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-semibold hover:text-primary transition-colors`}
                                        to="/cuenta"
                                    >
                                        Mi perfil
                                    </Link>
                                    <Link
                                        className={`${isActive('/sesiones') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-semibold hover:text-primary transition-colors`}
                                        to="/sesiones"
                                    >
                                        Mis Coffee Chats
                                    </Link>
                                    <Link
                                        className={`${isActive('/reporte') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-semibold hover:text-primary transition-colors`}
                                        to="/reporte"
                                    >
                                        Nuestro reporte
                                    </Link>
                                </>
                            ) : user ? (
                                /* STUDENT NAV (logged in) */
                                <>
                                    <Link
                                        className={`${isActive('/student/dashboard') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-semibold hover:text-blue-600 transition-colors`}
                                        to="/student/dashboard"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        className={`${isActive('/mentores') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-semibold hover:text-primary transition-colors`}
                                        to="/mentores"
                                    >
                                        Mentores
                                    </Link>
                                    <Link
                                        className={`${isActive('/cuenta') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-semibold hover:text-primary transition-colors`}
                                        to="/cuenta"
                                    >
                                        Mi perfil
                                    </Link>
                                    <Link
                                        className={`${isActive('/sesiones') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-semibold hover:text-primary transition-colors`}
                                        to="/sesiones"
                                    >
                                        Mis Coffee Chats
                                    </Link>
                                    <Link
                                        className={`${isActive('/reporte') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-semibold hover:text-primary transition-colors`}
                                        to="/reporte"
                                    >
                                        Nuestro reporte
                                    </Link>
                                </>
                            ) : (
                                /* LOGGED OUT NAV - CENTERED DOCK */
                                <div className="flex items-center space-x-1 sm:space-x-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                    <Link
                                        className={`px-4 py-2 rounded-full text-[14px] ${isActive('/') ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium'} transition-all`}
                                        to="/"
                                    >
                                        Inicio
                                    </Link>

                                    <Link
                                        className={`px-4 py-2 rounded-full text-[14px] ${isActive('/reporte') ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium'} transition-all`}
                                        to="/reporte"
                                    >
                                        Nuestro reporte
                                    </Link>

                                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1"></div>

                                    <Link
                                        to="/login"
                                        className="px-4 py-2 rounded-full text-[14px] font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                                    >
                                        Iniciar sesión
                                    </Link>

                                    <Link
                                        className="relative bg-white hover:bg-[#3C96E0]/10 text-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 px-5 py-2 rounded-full font-bold text-[14px] transition-all active:scale-95 group"
                                        to="/register"
                                    >
                                        {/* Blinking Border Overlay - Tech Blue */}
                                        <div className="absolute inset-0 rounded-full border-2 border-[#3C96E0] dark:border-[#2A86D1] shadow-[0_0_14px_rgba(60,150,224,0.5)] animate-pulse pointer-events-none group-hover:border-[#2A86D1] dark:group-hover:border-[#3C96E0] transition-colors"></div>
                                        <span className="relative z-10 px-1 tracking-wide">Únete</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex space-x-2 mr-2">
                                <a
                                    href="https://www.linkedin.com/company/estacionu/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0A66C2] text-white hover:bg-[#004182] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
                                    title="LinkedIn EstaciónU"
                                >
                                    <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </a>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center mr-1"
                                >
                                    <span className={`material-icons ${darkMode ? 'hidden' : 'block'}`}>dark_mode</span>
                                    <span className={`material-icons ${darkMode ? 'block' : 'hidden'}`}>light_mode</span>
                                </button>

                                {user && (
                                    <button
                                        onClick={() => setShowLogoutModal(true)}
                                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 border ring-1 ring-slate-200 dark:ring-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:ring-red-500 hover:border-red-500 text-red-500 hover:text-white hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:-translate-y-[2px] active:translate-y-[1px] active:shadow-inner transition-all duration-300 group"
                                        title="Cerrar Sesión"
                                    >
                                        <span className="material-icons text-xl font-bold group-hover:animate-pulse">power_settings_new</span>
                                    </button>
                                )}

                                {/* Hamburger Button */}
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center ml-2 active:scale-95 shadow-sm"
                                >
                                    <span className="material-icons">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* MOBILE MENU OVERLAY */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[45] bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                        className="absolute right-0 top-20 bottom-0 w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col space-y-4">
                            {isAdmin ? (
                                <>
                                    <Link className={`${isActive('/admin/dashboard') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-bold py-3 border-b border-slate-100 dark:border-slate-800 transition-colors`} to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                                    <Link className={`${isActive('/admin/usuarios') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-bold py-3 border-b border-slate-100 dark:border-slate-800 transition-colors`} to="/admin/usuarios" onClick={() => setIsMobileMenuOpen(false)}>Usuarios</Link>
                                </>
                            ) : isMentor ? (
                                <>
                                    <Link className={`${isActive('/mentor/dashboard') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-bold py-3 border-b border-slate-100 dark:border-slate-800 transition-colors`} to="/mentor/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                                    <Link className={`${isActive('/mentores') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-bold py-3 border-b border-slate-100 dark:border-slate-800 transition-colors`} to="/mentores" onClick={() => setIsMobileMenuOpen(false)}>Mentores</Link>
                                    <Link className={`${isActive('/cuenta') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-bold py-3 border-b border-slate-100 dark:border-slate-800 transition-colors`} to="/cuenta" onClick={() => setIsMobileMenuOpen(false)}>Mi perfil</Link>
                                    <Link className={`${isActive('/sesiones') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-bold py-3 border-b border-slate-100 dark:border-slate-800 transition-colors`} to="/sesiones" onClick={() => setIsMobileMenuOpen(false)}>Mis Coffee Chats</Link>
                                    <Link className={`${isActive('/reporte') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-bold py-3 border-b border-slate-100 dark:border-slate-800 transition-colors`} to="/reporte" onClick={() => setIsMobileMenuOpen(false)}>Nuestro reporte</Link>
                                </>
                            ) : user ? (
                                <>
                                    <Link className={`${isActive('/student/dashboard') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-bold py-3 border-b border-slate-100 dark:border-slate-800 transition-colors`} to="/student/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                                    <Link className={`${isActive('/mentores') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-bold py-3 border-b border-slate-100 dark:border-slate-800 transition-colors`} to="/mentores" onClick={() => setIsMobileMenuOpen(false)}>Mentores</Link>
                                    <Link className={`${isActive('/cuenta') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-bold py-3 border-b border-slate-100 dark:border-slate-800 transition-colors`} to="/cuenta" onClick={() => setIsMobileMenuOpen(false)}>Mi perfil</Link>
                                    <Link className={`${isActive('/sesiones') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-bold py-3 border-b border-slate-100 dark:border-slate-800 transition-colors`} to="/sesiones" onClick={() => setIsMobileMenuOpen(false)}>Mis Coffee Chats</Link>
                                    <Link className={`${isActive('/reporte') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-bold py-3 border-b border-slate-100 dark:border-slate-800 transition-colors`} to="/reporte" onClick={() => setIsMobileMenuOpen(false)}>Nuestro reporte</Link>
                                </>
                            ) : (
                                <>
                                    <Link className={`${isActive('/') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-bold py-3 border-b border-slate-100 dark:border-slate-800 transition-colors`} to="/" onClick={() => setIsMobileMenuOpen(false)}>Inicio</Link>
                                    <Link className={`${isActive('/reporte') ? 'text-primary' : 'text-slate-600 dark:text-slate-300'} font-bold py-3 border-b border-slate-100 dark:border-slate-800 transition-colors`} to="/reporte" onClick={() => setIsMobileMenuOpen(false)}>Nuestro reporte</Link>
                                    <Link className="text-slate-600 dark:text-slate-300 font-bold py-3 border-b border-slate-100 dark:border-slate-800 transition-colors" to="/login" onClick={() => setIsMobileMenuOpen(false)}>Iniciar sesión</Link>
                                    <Link className="bg-primary text-white text-center font-bold py-3.5 mt-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-600 active:scale-95 transition-all" to="/register" onClick={() => setIsMobileMenuOpen(false)}>Únete ahora</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* LOGOUT CONFIRMATION MODAL */}
            {showLogoutModal && createPortal(
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-md animate-fade-in" style={{ position: 'fixed' }}>
                    <div
                        className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 max-w-sm w-full mx-4 transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-6 relative group">
                                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-75"></div>
                                <span className="material-icons text-4xl text-red-500 relative z-10 transition-transform duration-300 group-hover:scale-110">power_settings_new</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">¿Cerrar Sesión?</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-[200px] mx-auto text-sm">
                                ¿Estás seguro que deseas salir de tu cuenta de EstaciónU?
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        setShowLogoutModal(false);
                                        logout();
                                    }}
                                    className="flex-1 py-3.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold active:scale-95 transition-all shadow-lg shadow-red-500/30"
                                >
                                    Salir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default Navbar;
