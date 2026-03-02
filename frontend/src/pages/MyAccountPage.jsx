import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const MyAccountPage = () => {
    const { user, logout } = useAuth();

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-5xl text-slate-400 dark:text-slate-500 overflow-hidden shadow-inner">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-icons text-6xl">person</span>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{user?.name || user?.username || 'Usuario'}</h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">{user?.email || 'correo@ejemplo.com'}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mb-8">
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Rol</p>
                                    <p className="font-medium text-slate-900 dark:text-slate-200 capitalize">{user?.role || 'Estudiante'}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Miembro desde</p>
                                    <p className="font-medium text-slate-900 dark:text-slate-200">{new Date().getFullYear()}</p>
                                </div>
                            </div>

                            <button
                                onClick={logout}
                                className="inline-flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 px-6 py-3 rounded-xl transition-colors font-semibold"
                            >
                                <span className="material-icons text-xl">logout</span>
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAccountPage;
