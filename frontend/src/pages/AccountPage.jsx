import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LakeBackground from '../components/LakeBackground';
import { CustomCombobox } from '../components/CustomCombobox';
import { useCatalogs } from '../hooks/useCatalogs';

const UNIVERSITY_OPTIONS = ['UNI', 'Otros'];
const CAREER_OPTIONS = [
    'Ingeniería Industrial',
    'Ingeniería de Inteligencia Artificial',
    'Ingeniería de Software',
    'Ingeniería de Sistemas',
    'Otros'
];

const AccountPage = () => {
    const { user, refreshUser } = useAuth();
    const { AREA_OPTIONS, SECTOR_OPTIONS } = useCatalogs();

    // Status message state
    const [statusMessage, setStatusMessage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [imageUploadLoading, setImageUploadLoading] = useState(false);
    const [companyLogoLoading, setCompanyLogoLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isAddHistoryOpen, setIsAddHistoryOpen] = useState(false);
    const [editingHistoryIndex, setEditingHistoryIndex] = useState(null);
    const [newHistory, setNewHistory] = useState({
        universidad: '',
        carrera: '',
        anioInicio: '',
        anioFin: ''
    });

    // Fallback logic for name if user is not fully loaded yet
    const fullName = user?.nombre_completo || (user ? `${user.nombre || ''} ${user.apellidos || ''}`.trim() : '');

    const [formData, setFormData] = useState({
        nombre_completo: user?.nombre_completo || fullName || '',
        celular: user?.telefono_movil || '',
        fechaNacimiento: user?.fecha_nacimiento || '',
        genero: user?.genero || '',
        universidad: user?.universidad || '',
        carrera: user?.carrera || '',
        anioInicio: user?.anio_inicio || '',
        anioFin: user?.anio_fin === -1 ? 'cursando' : (user?.anio_fin || ''),
        linkedin: user?.url_linkedin || '',
        biografia: user?.biografia || '',
        horario_sugerido: user?.horario_sugerido || '',
        sector_nombre: user?.sector_nombre || '',
        area_nombre: user?.area_nombre || '',
        empresa: user?.empresa || '',
        url_logo_empresa: user?.url_logo_empresa || '',
        disponibilidades: user?.disponibilidades || []
    });

    useEffect(() => {
        if (isAddHistoryOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isAddHistoryOpen]);

    const initialEducation = user?.universidad && user?.universidad !== 'Pendiente' && user?.universidad !== 'Completada' ? [{
        universidad: user.universidad,
        carrera: user.carrera || '',
        anioInicio: user.anio_inicio || '',
        anioFin: user.anio_fin === -1 ? 'cursando' : (user.anio_fin || '')
    }] : [];

    const [educationList, setEducationList] = useState(initialEducation);

    const handleNewHistoryChange = (e) => {
        setNewHistory({ ...newHistory, [e.target.name]: e.target.value });
    };

    const handleAddHistory = () => {
        if (!newHistory.universidad || !newHistory.carrera) return;

        let updatedList;
        if (editingHistoryIndex !== null) {
            updatedList = [...educationList];
            updatedList[editingHistoryIndex] = newHistory;
            setEducationList(updatedList);
        } else {
            updatedList = [...educationList, newHistory];
            setEducationList(updatedList);
        }

        // If it's the first element (or we just edited the first one), update formData
        if (updatedList.length === 1 || editingHistoryIndex === 0) {
            setFormData({
                ...formData,
                universidad: updatedList[0].universidad,
                carrera: updatedList[0].carrera,
                anioInicio: updatedList[0].anioInicio,
                anioFin: updatedList[0].anioFin
            });
        }

        setIsAddHistoryOpen(false);
        setEditingHistoryIndex(null);
        setNewHistory({ universidad: '', carrera: '', anioInicio: '', anioFin: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setIsSaving(true);
        setStatusMessage(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/me/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre_completo: formData.nombre_completo,
                    telefono_movil: formData.celular,
                    fecha_nacimiento: formData.fechaNacimiento || null,
                    genero: formData.genero,
                    universidad: formData.universidad,
                    carrera: formData.carrera,
                    anio_inicio: formData.anioInicio ? parseInt(formData.anioInicio) : null,
                    anio_fin: formData.anioFin ? (formData.anioFin === 'cursando' ? -1 : parseInt(formData.anioFin)) : null,
                    url_linkedin: formData.linkedin,
                    biografia: formData.biografia,
                    horario_sugerido: formData.horario_sugerido,
                    sector_nombre: formData.sector_nombre,
                    area_nombre: formData.area_nombre,
                    empresa: formData.empresa,
                    url_logo_empresa: formData.url_logo_empresa,
                    disponibilidades: formData.disponibilidades
                })
            });

            if (response.ok) {
                setStatusMessage({ type: 'success', text: '¡Perfil guardado estupendamente!' });
                setIsEditing(false);
                if (refreshUser) refreshUser();
            } else {
                setStatusMessage({ type: 'error', text: 'Hubo un error al guardar los cambios.' });
            }
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Error de conexión.' });
        }
        setIsSaving(false);

        // Hide message after 3 seconds
        setTimeout(() => setStatusMessage(null), 3000);
    };

    const handleImageClick = () => {
        if (isEditing) {
            document.getElementById('profile-image-input').click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            setStatusMessage({ type: 'error', text: 'Solo se permiten imágenes PNG o JPEG.' });
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            setStatusMessage({ type: 'error', text: 'La foto excede el límite de 50MB.' });
            return;
        }

        setImageUploadLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/me/profile-picture', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setStatusMessage({ type: 'success', text: '¡Foto de perfil actualizada!' });
                if (refreshUser) refreshUser();
            } else {
                const error = await response.json();
                setStatusMessage({ type: 'error', text: error.detail || 'Error al subir la imagen.' });
            }
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Error de conexión al subir imagen.' });
        } finally {
            setImageUploadLoading(false);
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    const handleProfilePictureDelete = async (e) => {
        e.stopPropagation();
        setImageUploadLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/me/profile-picture', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                setStatusMessage({ type: 'success', text: '¡Foto de perfil eliminada!' });
                if (refreshUser) refreshUser();
            } else {
                setStatusMessage({ type: 'error', text: 'Error al eliminar la foto.' });
            }
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Error de conexión.' });
        } finally {
            setImageUploadLoading(false);
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    const handleCompanyLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            setStatusMessage({ type: 'error', text: 'Solo se permiten imágenes PNG o JPEG.' });
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            setStatusMessage({ type: 'error', text: 'El logo excede el límite de 50MB.' });
            return;
        }

        setCompanyLogoLoading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/me/company-logo', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: uploadData
            });

            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({ ...prev, url_logo_empresa: data.url_logo_empresa }));
                setStatusMessage({ type: 'success', text: '¡Logo de empresa subido!' });
            } else {
                const error = await response.json();
                setStatusMessage({ type: 'error', text: error.detail || 'Error al subir el logo.' });
            }
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Error de conexión al subir logo.' });
        } finally {
            setCompanyLogoLoading(false);
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#111417] dark:text-slate-100 min-h-screen font-sans selection:bg-[#3C96E0]/20 transition-colors duration-300 relative">
            <LakeBackground blur="blur-[40px]" />
            <div className="relative z-10">
                <Navbar />

                <main className="max-w-3xl mx-auto pt-8 pb-16 px-6 lg:px-8 relative">
                    {/* Page entrance styles */}
                    <style>{`
                        @keyframes profileFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                        @keyframes profileSlideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                        @keyframes profileFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
                        .profile-section { animation: profileFadeUp 0.6s ease-out both; }
                    `}</style>
                    {/* Status Toast */}
                    {statusMessage && (
                        <div className={`fixed top-24 right-5 md:right-10 z-[100] px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-8 fade-in duration-300 ${statusMessage.type === 'success' ? 'bg-[#3C96E0] text-white' : 'bg-red-500 text-white'}`}>
                            <span className="material-icons">{statusMessage.type === 'success' ? 'check_circle' : 'error'}</span>
                            <span className="font-bold text-sm">{statusMessage.text}</span>
                        </div>
                    )}
                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6" style={{ animation: 'profileSlideIn 0.6s ease-out both' }}>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-primary">Mi Perfil</h1>
                            <p className="mt-2 text-slate-400 font-medium max-w-lg">Gestiona tu información personal y trayectoria académica para conectar mejor.</p>
                        </div>

                        {/* Control actions for the whole profile */}
                        <div className="flex items-center gap-3">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => {
                                            if (isEditing) {
                                                setFormData({
                                                    nombre_completo: user?.nombre_completo || fullName || '',
                                                    celular: user?.telefono_movil || '',
                                                    fechaNacimiento: user?.fecha_nacimiento || '',
                                                    genero: user?.genero || '',
                                                    universidad: user?.universidad || '',
                                                    carrera: user?.carrera || '',
                                                    anioInicio: user?.anio_inicio || '',
                                                    anioFin: user?.anio_fin === -1 ? 'cursando' : (user?.anio_fin || ''),
                                                    linkedin: user?.url_linkedin || '',
                                                    biografia: user?.biografia || '',
                                                    horario_sugerido: user?.horario_sugerido || '',
                                                    sector_nombre: user?.sector_nombre || '',
                                                    area_nombre: user?.area_nombre || '',
                                                    empresa: user?.empresa || '',
                                                    url_logo_empresa: user?.url_logo_empresa || '',
                                                    disponibilidades: user?.disponibilidades || []
                                                });
                                            }
                                            setIsEditing(false);
                                        }}
                                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-icons text-[18px]">close</span>
                                        Cancelar
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="group relative overflow-hidden px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#3C96E0] to-[#6366f1] text-white hover:shadow-xl hover:shadow-[#3C96E0]/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 shadow-lg shadow-[#3C96E0]/30 active:scale-95"
                                >
                                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
                                    <span className="material-icons text-[18px]">edit</span>
                                    Editar Perfil
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Datos Personales */}
                        <section className="profile-section bg-white dark:bg-slate-800/80 dark:backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden relative hover:shadow-lg hover:shadow-primary/5 transition-all duration-500" style={{ animationDelay: '0.1s' }}>
                            <div className="px-7 py-5 border-b border-[#D8D2C3]/30 dark:border-slate-700/50 flex justify-between items-center relative z-10">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-[#111417] dark:text-white">
                                    <span className="material-icons text-[#3C96E0] dark:text-primary">person</span> Datos Personales
                                </h2>
                            </div>
                            <div className="p-7">
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Profile Picture */}
                                    <div className="flex-shrink-0 flex flex-col items-center gap-4 relative">
                                        <div className={`absolute -inset-4 bg-gradient-to-br from-[#3C96E0] to-transparent rounded-[2.5rem] -z-10 transition-opacity duration-500 ${isEditing ? 'opacity-15' : 'opacity-5'}`}></div>
                                        <div
                                            onClick={handleImageClick}
                                            className={`relative w-28 h-28 rounded-[2rem] overflow-hidden bg-[#F9FAFB] dark:bg-slate-900/60 transition-all duration-300 group ${isEditing ? 'shadow-lg shadow-[#3C96E0]/20 ring-4 ring-[#F4FAFF] border-2 border-[#3C96E0]/30 dark:border-primary/30 cursor-pointer' : 'shadow-inner'}`}
                                        >
                                            {imageUploadLoading ? (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm z-20">
                                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            ) : null}
                                            <img
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                                src={user?.url_foto || `https://api.dicebear.com/9.x/notionists/svg?seed=${fullName.replace(/\s/g, '')}&backgroundColor=transparent`}
                                            />
                                            <div className={`absolute inset-0 bg-[#111417]/40 flex items-center justify-center transition-opacity backdrop-blur-sm ${isEditing ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 hidden'}`}>
                                                <span className="material-icons text-[#FFFFFF]">photo_camera</span>
                                            </div>
                                        </div>
                                        <input
                                            id="profile-image-input"
                                            type="file"
                                            accept="image/jpeg, image/png"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        {isEditing && (
                                            <div className="flex flex-col items-center gap-1.5 animate-in fade-in">
                                                <button
                                                    onClick={handleImageClick}
                                                    className="text-sm font-bold text-[#3C96E0] dark:text-primary hover:text-[#2A86D1] transition-colors"
                                                    type="button"
                                                    disabled={imageUploadLoading}
                                                >
                                                    {imageUploadLoading ? 'Subiendo...' : 'Cambiar foto'}
                                                </button>
                                                {user?.url_foto && (
                                                    <button
                                                        type="button"
                                                        onClick={handleProfilePictureDelete}
                                                        className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors bg-red-50 px-2 py-1 rounded-md"
                                                        disabled={imageUploadLoading}
                                                    >
                                                        <span className="material-icons text-[14px]">delete</span>
                                                        Eliminar
                                                    </button>
                                                )}
                                                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">PNG/JPEG, Max 50MB</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Form Fields */}
                                    <fieldset disabled={!isEditing} className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 group border-none p-0 m-0 min-w-0">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                                            <input
                                                name="nombre_completo"
                                                className="w-full rounded-2xl border bg-[#F4FAFF] dark:bg-slate-900/80 border-[#3C96E0]/40 dark:border-primary/40 px-5 py-3 text-sm font-semibold text-[#111417] dark:text-white focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] dark:focus:border-primary focus:bg-[#FFFFFF] dark:focus:bg-slate-800 dark:bg-slate-800/80 dark:backdrop-blur-xl shadow-sm shadow-[#3C96E0]/5 outline-none transition-all placeholder:text-slate-400 dark:text-slate-500 disabled:bg-[#F9FAFB] dark:disabled:bg-slate-900/40 dark:bg-slate-900/60 disabled:border-transparent disabled:text-[#111417] dark:disabled:text-slate-500 dark:text-white disabled:shadow-none disabled:opacity-100 disabled:cursor-default"
                                                type="text"
                                                value={formData.nombre_completo}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                                            <div className="relative">
                                                <input
                                                    className="w-full rounded-2xl border border-[#D8D2C3]/50 dark:border-slate-700/50 bg-[#F9FAFB] dark:bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed pr-10"
                                                    type="email"
                                                    value={user?.email || ''}
                                                    disabled
                                                />
                                                <span className="material-icons absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[18px]">lock</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Celular / WhatsApp</label>
                                            <div className="flex">
                                                <span className={`inline-flex items-center px-4 rounded-l-2xl border border-r-0 font-semibold text-sm transition-colors ${isEditing ? 'border-[#3C96E0]/40 dark:border-primary/40 bg-[#F4FAFF] dark:bg-slate-900/80 text-[#3C96E0] dark:text-primary' : 'border-transparent bg-[#F9FAFB] dark:bg-slate-900/60 text-slate-400 dark:text-slate-500'}`}>+51</span>
                                                <input
                                                    name="celular"
                                                    className="w-full rounded-r-2xl border border-l-0 bg-[#F4FAFF] dark:bg-slate-900/80 border-[#3C96E0]/40 dark:border-primary/40 px-4 py-3 text-sm font-semibold text-[#111417] dark:text-white focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] dark:focus:border-primary focus:bg-[#FFFFFF] dark:focus:bg-slate-800 dark:bg-slate-800/80 dark:backdrop-blur-xl shadow-sm shadow-[#3C96E0]/5 outline-none transition-all disabled:bg-[#F9FAFB] dark:disabled:bg-slate-900/40 dark:bg-slate-900/60 disabled:border-transparent disabled:text-[#111417] dark:disabled:text-slate-500 dark:text-white disabled:shadow-none disabled:opacity-100 disabled:cursor-default"
                                                    type="tel"
                                                    value={formData.celular}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Fecha de Nacimiento</label>
                                            <input
                                                name="fechaNacimiento"
                                                className="w-full rounded-2xl border bg-[#F4FAFF] dark:bg-slate-900/80 border-[#3C96E0]/40 dark:border-primary/40 px-5 py-3 text-sm font-semibold text-[#111417] dark:text-white focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] dark:focus:border-primary focus:bg-[#FFFFFF] dark:focus:bg-slate-800 dark:bg-slate-800/80 dark:backdrop-blur-xl shadow-sm shadow-[#3C96E0]/5 outline-none transition-all disabled:bg-[#F9FAFB] dark:disabled:bg-slate-900/40 dark:bg-slate-900/60 disabled:border-transparent disabled:text-[#111417] dark:disabled:text-slate-500 dark:text-white disabled:shadow-none disabled:opacity-100 disabled:cursor-default"
                                                type="date"
                                                value={formData.fechaNacimiento}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Género</label>
                                            <div className="relative">
                                                <select
                                                    name="genero"
                                                    className="custom-select w-full rounded-2xl border bg-[#F4FAFF] dark:bg-slate-900/80 border-[#3C96E0]/40 dark:border-primary/40 px-5 py-3 text-sm font-semibold text-[#111417] dark:text-white focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] dark:focus:border-primary focus:bg-[#FFFFFF] dark:focus:bg-slate-800 dark:bg-slate-800/80 dark:backdrop-blur-xl shadow-sm shadow-[#3C96E0]/5 outline-none transition-all disabled:bg-[#F9FAFB] dark:disabled:bg-slate-900/40 disabled:border-transparent disabled:text-[#111417] dark:disabled:text-slate-500 disabled:shadow-none disabled:opacity-100 disabled:cursor-default"
                                                    value={formData.genero}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    <option value="m">Masculino</option>
                                                    <option value="f">Femenino</option>
                                                    <option value="o">Otro / Prefiero no decirlo</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Institución / Centro de Estudios</label>
                                            <input
                                                name="universidad"
                                                className="w-full rounded-2xl border bg-[#F4FAFF] dark:bg-slate-900/80 border-[#3C96E0]/40 dark:border-primary/40 px-5 py-3 text-sm font-semibold text-[#111417] dark:text-white focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] dark:focus:border-primary focus:bg-[#FFFFFF] dark:focus:bg-slate-800 dark:bg-slate-800/80 dark:backdrop-blur-xl shadow-sm shadow-[#3C96E0]/5 outline-none transition-all disabled:bg-[#F9FAFB] dark:disabled:bg-slate-900/40 dark:bg-slate-900/60 disabled:border-transparent disabled:text-[#111417] dark:disabled:text-slate-500 dark:text-white disabled:shadow-none disabled:opacity-100 disabled:cursor-default"
                                                type="text"
                                                value={formData.universidad}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Carrera / Programa</label>
                                            <input
                                                name="carrera"
                                                className="w-full rounded-2xl border bg-[#F4FAFF] dark:bg-slate-900/80 border-[#3C96E0]/40 dark:border-primary/40 px-5 py-3 text-sm font-semibold text-[#111417] dark:text-white focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] dark:focus:border-primary focus:bg-[#FFFFFF] dark:focus:bg-slate-800 dark:bg-slate-800/80 dark:backdrop-blur-xl shadow-sm shadow-[#3C96E0]/5 outline-none transition-all disabled:bg-[#F9FAFB] dark:disabled:bg-slate-900/40 dark:bg-slate-900/60 disabled:border-transparent disabled:text-[#111417] dark:disabled:text-slate-500 dark:text-white disabled:shadow-none disabled:opacity-100 disabled:cursor-default"
                                                type="text"
                                                value={formData.carrera}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Periodo Académico</label>
                                            <div className="flex gap-4">
                                                <div className="relative w-full">
                                                    <select
                                                        name="anioInicio"
                                                        className="custom-select w-full rounded-2xl border bg-[#F4FAFF] dark:bg-slate-900/80 border-[#3C96E0]/40 dark:border-primary/40 px-5 py-3 text-sm font-semibold text-[#111417] dark:text-white focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] dark:focus:border-primary focus:bg-[#FFFFFF] dark:focus:bg-slate-800 dark:bg-slate-800/80 dark:backdrop-blur-xl shadow-sm shadow-[#3C96E0]/5 outline-none transition-all disabled:bg-[#F9FAFB] dark:disabled:bg-slate-900/40 disabled:border-transparent disabled:text-[#111417] dark:disabled:text-slate-500 disabled:shadow-none disabled:opacity-100 disabled:cursor-default"
                                                        value={formData.anioInicio}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">Año inicio</option>
                                                        {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="relative w-full">
                                                    <select
                                                        name="anioFin"
                                                        className="custom-select w-full rounded-2xl border bg-[#F4FAFF] dark:bg-slate-900/80 border-[#3C96E0]/40 dark:border-primary/40 px-5 py-3 text-sm font-semibold text-[#111417] dark:text-white focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] dark:focus:border-primary focus:bg-[#FFFFFF] dark:focus:bg-slate-800 dark:bg-slate-800/80 dark:backdrop-blur-xl shadow-sm shadow-[#3C96E0]/5 outline-none transition-all disabled:bg-[#F9FAFB] dark:disabled:bg-slate-900/40 disabled:border-transparent disabled:text-[#111417] dark:disabled:text-slate-500 disabled:shadow-none disabled:opacity-100 disabled:cursor-default"
                                                        value={formData.anioFin}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">Año fin</option>
                                                        <option value="cursando">Cursando (Actualidad)</option>
                                                        {Array.from({ length: 45 }, (_, i) => new Date().getFullYear() + 5 - i).map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">LinkedIn URL</label>
                                            <input
                                                name="linkedin"
                                                className="w-full rounded-2xl border bg-[#F4FAFF] dark:bg-slate-900/80 border-[#3C96E0]/40 dark:border-primary/40 px-5 py-3 text-sm font-semibold text-[#111417] dark:text-white focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] dark:focus:border-primary focus:bg-[#FFFFFF] dark:focus:bg-slate-800 dark:bg-slate-800/80 dark:backdrop-blur-xl shadow-sm shadow-[#3C96E0]/5 outline-none transition-all placeholder:text-slate-400 dark:text-slate-500 disabled:bg-[#F9FAFB] dark:disabled:bg-slate-900/40 dark:bg-slate-900/60 disabled:border-transparent disabled:text-[#111417] dark:disabled:text-slate-500 dark:text-white disabled:shadow-none disabled:opacity-100 disabled:cursor-default"
                                                type="url"
                                                placeholder="Ej. https://www.linkedin.com/in/tu-perfil/"
                                                value={formData.linkedin}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        </section>

                        {/* Perfil de Mentor (Solo para Mentores Destacados) */}
                        {user?.role === 'mentor' && user?.destacado === true && (
                            <section className="profile-section bg-white dark:bg-slate-800/80 dark:backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden relative z-10 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500" style={{ animationDelay: '0.15s' }}>
                                <div className="px-7 py-5 border-b border-[#D8D2C3]/30 dark:border-slate-700/50 flex justify-between items-center relative z-10">
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-[#111417] dark:text-white">
                                        <span className="material-icons text-[#3C96E0] dark:text-primary">star</span> Perfil Público de Mentor
                                    </h2>
                                </div>
                                <div className="p-7">
                                    <fieldset disabled={!isEditing} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 border-none p-0 m-0 min-w-0">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Sector Económico</label>
                                            <CustomCombobox
                                                name="sector_nombre"
                                                options={SECTOR_OPTIONS}
                                                placeholder="Ej. Consumer & Retail"
                                                value={formData.sector_nombre}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Área de Funciones / Rol</label>
                                            <CustomCombobox
                                                name="area_nombre"
                                                options={AREA_OPTIONS}
                                                placeholder="Ej. Marketing/Communications"
                                                value={formData.area_nombre}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mensaje de Mentoría</label>
                                                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{formData.biografia?.length || 0}/80</span>
                                            </div>
                                            <textarea
                                                name="biografia"
                                                maxLength={80}
                                                className="w-full rounded-2xl border bg-[#F4FAFF] dark:bg-slate-900/80 border-[#3C96E0]/40 dark:border-primary/40 px-5 py-3 text-sm font-semibold text-[#111417] dark:text-white focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] dark:focus:border-primary focus:bg-[#FFFFFF] dark:focus:bg-slate-800 dark:bg-slate-800/80 dark:backdrop-blur-xl shadow-sm shadow-[#3C96E0]/5 outline-none transition-all placeholder:text-slate-400 dark:text-slate-500 disabled:bg-[#F9FAFB] dark:disabled:bg-slate-900/40 dark:bg-slate-900/60 disabled:border-transparent disabled:text-[#111417] dark:disabled:text-slate-500 dark:text-white disabled:shadow-none disabled:opacity-100 disabled:cursor-default resize-y min-h-[100px]"
                                                placeholder='Ej. "Quiero que me consulten sobre: Disponible para mentorías."'
                                                value={formData.biografia}
                                                onChange={handleChange}
                                            />
                                        </div>



                                        {/* Empresa Section */}
                                        <div className="space-y-4 md:col-span-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <span className="material-icons text-[16px]">business</span> Empresa donde trabajas
                                            </label>
                                            <div className="flex flex-col md:flex-row gap-5 items-start">
                                                {/* Company Logo */}
                                                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                                                    <div
                                                        onClick={() => { if (isEditing) document.getElementById('company-logo-input').click(); }}
                                                        className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/60 border-2 border-dashed transition-all duration-300 flex items-center justify-center group ${isEditing ? 'border-[#3C96E0]/40 dark:border-primary/40 cursor-pointer hover:border-[#3C96E0] hover:bg-[#F4FAFF] dark:hover:bg-slate-800' : 'border-slate-200 dark:border-slate-700/50'}`}
                                                    >
                                                        {companyLogoLoading ? (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm z-20">
                                                                <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                            </div>
                                                        ) : null}
                                                        {formData.url_logo_empresa ? (
                                                            <>
                                                                <img
                                                                    src={formData.url_logo_empresa}
                                                                    alt="Logo empresa"
                                                                    className="w-full h-full object-contain p-1"
                                                                />
                                                                {isEditing && (
                                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                                                        <span className="material-icons text-white text-[20px]">photo_camera</span>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
                                                                <span className="material-icons text-[24px]">add_photo_alternate</span>
                                                                <span className="text-[10px] font-bold">Logo</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input
                                                        id="company-logo-input"
                                                        type="file"
                                                        accept="image/jpeg, image/png"
                                                        className="hidden"
                                                        onChange={handleCompanyLogoChange}
                                                    />
                                                    {isEditing && (
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            {formData.url_logo_empresa && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFormData(prev => ({ ...prev, url_logo_empresa: '' }));
                                                                    }}
                                                                    className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors bg-red-50 px-2 py-1 rounded-md"
                                                                >
                                                                    <span className="material-icons text-[14px]">delete</span>
                                                                    Eliminar
                                                                </button>
                                                            )}
                                                            <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">PNG/JPEG, Max 50MB</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Company Name */}
                                                <div className="flex-grow w-full space-y-2">
                                                    <input
                                                        name="empresa"
                                                        className="w-full rounded-2xl border bg-[#F4FAFF] dark:bg-slate-900/80 border-[#3C96E0]/40 dark:border-primary/40 px-5 py-3 text-sm font-semibold text-[#111417] dark:text-white focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] dark:focus:border-primary focus:bg-[#FFFFFF] dark:focus:bg-slate-800 dark:bg-slate-800/80 dark:backdrop-blur-xl shadow-sm shadow-[#3C96E0]/5 outline-none transition-all placeholder:text-slate-400 dark:text-slate-500 disabled:bg-[#F9FAFB] dark:disabled:bg-slate-900/40 dark:bg-slate-900/60 disabled:border-transparent disabled:text-[#111417] dark:disabled:text-slate-500 dark:text-white disabled:shadow-none disabled:opacity-100 disabled:cursor-default"
                                                        type="text"
                                                        placeholder="Ej. Google, BCP, Interbank..."
                                                        value={formData.empresa}
                                                        onChange={handleChange}
                                                    />
                                                    <p className="text-[10px] text-slate-400 font-medium ml-1">Nombre de la empresa donde trabajas actualmente.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 md:col-span-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Horarios Específicos</label>
                                                    <p className="text-[10px] text-slate-400 font-medium ml-1">Define los rangos donde los estudiantes podrán solicitar citas.</p>
                                                </div>
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                disponibilidades: [...(formData.disponibilidades || []), { dia: 'Lunes', hora_inicio: '09:00', hora_fin: '10:00' }]
                                                            });
                                                        }}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-all"
                                                    >
                                                        <span className="material-icons text-sm">add</span>
                                                        Añadir Horario
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                                {(formData.disponibilidades && formData.disponibilidades.length > 0) ? (
                                                    formData.disponibilidades.map((disp, idx) => (
                                                        <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-700/50 group/item transition-all hover:border-primary/30">
                                                            <div className="flex-1 min-w-[120px] relative">
                                                                <select
                                                                    disabled={!isEditing}
                                                                    value={disp.dia}
                                                                    onChange={(e) => {
                                                                        const newList = [...formData.disponibilidades];
                                                                        newList[idx].dia = e.target.value;
                                                                        setFormData({ ...formData, disponibilidades: newList });
                                                                    }}
                                                                    className="custom-select w-full bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer disabled:cursor-default pr-8"
                                                                >
                                                                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                                                                        <option key={d} value={d}>{d}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    disabled={!isEditing}
                                                                    type="time"
                                                                    value={disp.hora_inicio}
                                                                    onChange={(e) => {
                                                                        const newList = [...formData.disponibilidades];
                                                                        newList[idx].hora_inicio = e.target.value;
                                                                        setFormData({ ...formData, disponibilidades: newList });
                                                                    }}
                                                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold outline-none focus:border-primary transition-all disabled:bg-transparent disabled:border-transparent"
                                                                />
                                                                <span className="text-slate-400">-</span>
                                                                <input
                                                                    disabled={!isEditing}
                                                                    type="time"
                                                                    value={disp.hora_fin}
                                                                    onChange={(e) => {
                                                                        const newList = [...formData.disponibilidades];
                                                                        newList[idx].hora_fin = e.target.value;
                                                                        setFormData({ ...formData, disponibilidades: newList });
                                                                    }}
                                                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold outline-none focus:border-primary transition-all disabled:bg-transparent disabled:border-transparent"
                                                                />
                                                            </div>
                                                            {isEditing && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newList = [...formData.disponibilidades];
                                                                        newList.splice(idx, 1);
                                                                        setFormData({ ...formData, disponibilidades: newList });
                                                                    }}
                                                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                                                                >
                                                                    <span className="material-icons text-[18px]">delete</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                                                        <p className="text-sm font-medium text-slate-400">No has definido horarios específicos todavía.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                            </section>
                        )}

                        {/* Historial Académico */}
                        <section className="profile-section bg-white dark:bg-slate-800/80 dark:backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden relative z-10 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500" style={{ animationDelay: '0.2s' }}>
                            <div className="px-7 py-5 border-b border-[#D8D2C3]/30 dark:border-slate-700/50 flex justify-between items-center relative z-10">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-[#111417] dark:text-white">
                                    <span className="material-icons text-[#3C96E0] dark:text-primary">school</span> Historial Académico
                                </h2>
                                {isEditing && (
                                    <button
                                        onClick={() => {
                                            setEditingHistoryIndex(null);
                                            setNewHistory({ universidad: '', carrera: '', anioInicio: '', anioFin: '' });
                                            setIsAddHistoryOpen(true);
                                        }}
                                        className="text-[#3C96E0] dark:text-primary hover:bg-[#3C96E0]/10 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-1">
                                        <span className="material-icons text-sm">add</span> Añadir
                                    </button>
                                )}
                            </div>
                            <div className="p-7 space-y-4">
                                {educationList.length === 0 ? (
                                    <p className="text-slate-400 dark:text-slate-500 text-sm font-semibold">No hay historial académico agregado. ¡Añade uno ahora!</p>
                                ) : (
                                    educationList.map((edu, index) => (
                                        <div key={index} className="p-5 border border-[#D8D2C3]/50 dark:border-slate-700/50 rounded-[1.5rem] flex justify-between items-start hover:border-[#3C96E0]/50 hover:shadow-md hover:shadow-[#3C96E0]/5 transition-all group bg-[#FFFFFF] dark:bg-slate-800/80 dark:backdrop-blur-xl">
                                            <div>
                                                <h3 className="text-base font-bold text-[#111417] dark:text-white mb-1">{edu.universidad || 'Institución - Pendiente'}</h3>
                                                <p className="text-[#3C96E0] dark:text-primary font-semibold text-sm mb-1">{edu.carrera || 'Carrera - Pendiente'}</p>
                                                <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                                                    {edu.anioInicio || edu.anioFin ?
                                                        `${edu.anioInicio || '...'} - ${edu.anioFin === 'cursando' ? 'Actualidad' : (edu.anioFin || '...')}`
                                                        : 'En progreso'}
                                                </span>
                                            </div>
                                            {isEditing && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingHistoryIndex(index);
                                                            setNewHistory(educationList[index]);
                                                            setIsAddHistoryOpen(true);
                                                        }}
                                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-[#3C96E0] dark:text-primary transition-colors"><span className="material-icons text-[20px]">edit</span></button>
                                                    <button
                                                        onClick={() => {
                                                            const newList = [...educationList];
                                                            newList.splice(index, 1);
                                                            setEducationList(newList);
                                                        }}
                                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors"><span className="material-icons text-[20px]">delete</span></button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Seguridad */}
                        <section className="profile-section bg-white dark:bg-slate-800/80 dark:backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden relative z-10 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500" style={{ animationDelay: '0.3s' }}>
                            <div className="px-7 py-5 border-b border-[#D8D2C3]/30 dark:border-slate-700/50 flex justify-between items-center relative z-10">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-[#111417] dark:text-white">
                                    <span className="material-icons text-slate-400 dark:text-slate-500">security</span> Seguridad de la Cuenta
                                </h2>
                            </div>
                            <div className="p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="text-base font-bold text-[#111417] dark:text-white mb-1">Contraseña</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Te recomendamos usar una contraseña fuerte que no utilices en otros sitios web.</p>
                                </div>
                                <Link
                                    to="/cambiar-contrasena"
                                    className="whitespace-nowrap bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 hover:border-[#3C96E0] hover:text-[#3C96E0] dark:text-primary hover:bg-[#F4FAFF] dark:bg-slate-900/80 px-6 py-3 rounded-2xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                                >
                                    <span className="material-icons text-[18px]">lock_reset</span> Cambiar Contraseña
                                </Link>
                            </div>
                        </section>

                        {/* Removed the floating action button to keep things clean */}
                    </div>

                    {/* Modal Float for Adding Academic History */}
                    {
                        isAddHistoryOpen && (
                            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                                {/* Backdrop */}
                                <div
                                    className="absolute inset-0 bg-[#111417]/30 backdrop-blur-sm animate-in fade-in duration-300"
                                    onClick={() => { setIsAddHistoryOpen(false); setEditingHistoryIndex(null); }}
                                ></div>

                                {/* Modal Content */}
                                <div className="bg-[#FFFFFF] dark:bg-slate-800/80 dark:backdrop-blur-xl w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 fade-in duration-300 overflow-hidden border border-[#D8D2C3] dark:border-slate-700/50/60 dark:border-slate-700/60 hover:shadow-[#3C96E0]/10 transition-shadow">
                                    <div className="px-7 py-5 border-b border-[#D8D2C3]/30 dark:border-slate-700/50 flex justify-between items-center group">
                                        <h2 className="text-xl font-bold flex items-center gap-2 text-[#111417] dark:text-white">
                                            <span className="material-icons text-[#3C96E0] dark:text-primary group-hover:rotate-12 transition-transform">school</span> {editingHistoryIndex !== null ? 'Editar Historial' : 'Añadir Historial'}
                                        </h2>
                                        <button
                                            onClick={() => { setIsAddHistoryOpen(false); setEditingHistoryIndex(null); }}
                                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <span className="material-icons">close</span>
                                        </button>
                                    </div>

                                    <div className="p-8 space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Institución / Centro de Estudios</label>
                                            <CustomCombobox
                                                name="universidad"
                                                options={UNIVERSITY_OPTIONS}
                                                placeholder="Ej. UNI, Cibertec, UPC..."
                                                value={newHistory.universidad}
                                                onChange={handleNewHistoryChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Carrera / Programa</label>
                                            <CustomCombobox
                                                name="carrera"
                                                options={CAREER_OPTIONS}
                                                placeholder="Ej. Ing. de Sistemas, Diseño Gráfico..."
                                                value={newHistory.carrera}
                                                onChange={handleNewHistoryChange}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Periodo Académico</label>
                                            <div className="flex gap-4">
                                                <div className="relative w-full">
                                                    <select
                                                        name="anioInicio"
                                                        className="custom-select w-full rounded-2xl border border-[#D8D2C3] dark:border-slate-700/50 bg-[#F9FAFB] dark:bg-slate-900/60 px-5 py-3 text-sm font-semibold text-[#111417] dark:text-white focus:bg-[#FFFFFF] dark:focus:bg-slate-800 dark:bg-slate-800/80 dark:backdrop-blur-xl focus:ring-2 focus:ring-[#3C96E0]/20 focus:border-[#3C96E0] dark:focus:border-primary outline-none transition-all"
                                                        value={newHistory.anioInicio}
                                                        onChange={handleNewHistoryChange}
                                                    >
                                                        <option value="">Año inicio</option>
                                                        {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="relative w-full">
                                                    <select
                                                        name="anioFin"
                                                        className="custom-select w-full rounded-2xl border border-[#D8D2C3] dark:border-slate-700/50 bg-[#F9FAFB] dark:bg-slate-900/60 px-5 py-3 text-sm font-semibold text-[#111417] dark:text-white focus:bg-[#FFFFFF] dark:focus:bg-slate-800 dark:bg-slate-800/80 dark:backdrop-blur-xl focus:ring-2 focus:ring-[#3C96E0]/20 focus:border-[#3C96E0] dark:focus:border-primary outline-none transition-all"
                                                        value={newHistory.anioFin}
                                                        onChange={handleNewHistoryChange}
                                                    >
                                                        <option value="">Año fin</option>
                                                        <option value="cursando">Cursando (Actualidad)</option>
                                                        {Array.from({ length: 45 }, (_, i) => new Date().getFullYear() + 5 - i).map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-8 py-5 border-t border-[#D8D2C3]/30 dark:border-slate-700/50 bg-[#F9FAFB] dark:bg-slate-900/60 flex justify-end gap-3 rounded-b-[2.5rem]">
                                        <button
                                            onClick={() => { setIsAddHistoryOpen(false); setEditingHistoryIndex(null); }}
                                            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleAddHistory}
                                            className="bg-[#3C96E0] hover:bg-[#2A86D1] text-[#FFFFFF] px-9 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-[#3C96E0]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none"
                                            disabled={!newHistory.universidad || !newHistory.carrera}
                                        >
                                            Añadir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                </main >

                {/* Floating action bar when editing */}
                {isEditing && (
                    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
                        <div className="max-w-4xl mx-auto px-4 pb-4">
                            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-black/10 px-6 py-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
                                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Editando perfil...</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            setFormData({
                                                nombre_completo: user?.nombre_completo || fullName || '',
                                                celular: user?.telefono_movil || '',
                                                fechaNacimiento: user?.fecha_nacimiento || '',
                                                genero: user?.genero || '',
                                                universidad: user?.universidad || '',
                                                carrera: user?.carrera || '',
                                                anioInicio: user?.anio_inicio || '',
                                                anioFin: user?.anio_fin === -1 ? 'cursando' : (user?.anio_fin || ''),
                                                linkedin: user?.url_linkedin || '',
                                                biografia: user?.biografia || '',
                                                horario_sugerido: user?.horario_sugerido || '',
                                                sector_nombre: user?.sector_nombre || '',
                                                area_nombre: user?.area_nombre || '',
                                                empresa: user?.empresa || '',
                                                url_logo_empresa: user?.url_logo_empresa || '',
                                                disponibilidades: user?.disponibilidades || []
                                            });
                                            setIsEditing(false);
                                        }}
                                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Descartar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className={`px-7 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#3C96E0] to-[#2A7BC8] text-white shadow-lg shadow-[#3C96E0]/25 hover:shadow-xl hover:shadow-[#3C96E0]/35 transition-all flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                                    >
                                        <span className="material-icons text-[18px]">check</span>
                                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div >
        </div >
    );
};

export default AccountPage;
