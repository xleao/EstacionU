import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WaveBackground from '../components/WaveBackground';

const ChangePasswordPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const getPasswordStrength = (pass) => {
        if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
        let score = 0;
        if (pass.length > 5) score++;
        if (pass.length > 7) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass) || /[A-Z]/.test(pass)) score++;

        switch (score) {
            case 0:
            case 1: return { score: 1, label: 'Insegura', color: 'bg-red-500 text-red-500' };
            case 2: return { score: 2, label: 'Débil', color: 'bg-orange-500 text-orange-500' };
            case 3: return { score: 3, label: 'Media', color: 'bg-yellow-500 text-yellow-500' };
            case 4: return { score: 4, label: 'Fuerte', color: 'bg-green-500 text-green-500' };
            default: return { score: 0, label: '', color: 'bg-slate-200 text-slate-500' };
        }
    };

    const strength = getPasswordStrength(formData.newPassword);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword.length < 8) {
            setError('La nueva contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Las nuevas contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/me/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: formData.currentPassword,
                    new_password: formData.newPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Error al cambiar la contraseña');
            }

            setSuccess('¡Contraseña actualizada exitosamente!');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => {
                navigate('/cuenta');
            }, 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 h-screen overflow-hidden flex flex-col font-sans transition-colors duration-300 relative selection:bg-[#3C96E0]/20">
            <WaveBackground />
            <Navbar />

            <main className="flex-grow flex items-center justify-center p-4 relative z-10">
                <div className="max-w-[390px] w-full">
                    {/* Header Controls */}
                    <div className="mb-4 flex justify-center">
                        <button
                            onClick={() => navigate('/cuenta')}
                            className="text-slate-500 hover:text-[#3C96E0] transition-colors flex items-center gap-1.5 text-xs font-bold bg-white px-5 py-2 rounded-xl shadow-sm border border-[#D8D2C3]/60 w-fit"
                        >
                            <span className="material-icons text-[16px]">arrow_back</span> Volver a Mi Perfil
                        </button>
                    </div>

                    {/* Window Card */}
                    <div className="bg-[#FFFFFF] rounded-3xl shadow-md shadow-[#3C96E0]/5 border border-[#3C96E0]/10 overflow-hidden relative">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 border-[3px] border-[#3C96E0]/10 shadow-[0_0_20px_rgba(60,150,224,0.05)] rounded-3xl pointer-events-none"></div>

                        <div className="px-6 py-5 border-b border-[#D8D2C3]/30 bg-[#F4FAFF]/30 text-center">
                            <h1 className="text-2xl font-bold flex justify-center items-center gap-2 text-[#3C96E0]">
                                <span className="material-icons text-3xl">lock_reset</span> Cambiar Contraseña
                            </h1>
                            <p className="mt-1 flex justify-center text-slate-500 font-medium text-xs leading-tight px-2">Actualiza tu contraseña para mantener tu cuenta segura.</p>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-2 animate-in fade-in">
                                        <span className="material-icons text-[18px]">error_outline</span> {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="bg-[#3C96E0] text-white p-3 rounded-xl text-xs font-bold shadow-lg shadow-[#3C96E0]/20 flex items-center gap-2 animate-in fade-in">
                                        <span className="material-icons text-[18px]">check_circle</span> {success}
                                    </div>
                                )}

                                {/* Current Password */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1" htmlFor="currentPassword">
                                        Contraseña Actual
                                    </label>
                                    <div className="relative">
                                        <input
                                            className="w-full rounded-xl border bg-[#F9FAFB] border-[#D8D2C3] px-4 py-3 text-sm font-semibold text-[#111417] focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] focus:bg-[#FFFFFF] shadow-sm transform transition-all outline-none pr-10"
                                            id="currentPassword"
                                            placeholder="••••••••"
                                            required
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#3C96E0] transition-colors p-1 flex"
                                        >
                                            <span className="material-icons text-[18px]">{showCurrentPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <hr className="border-[#D8D2C3]/30" />

                                {/* New Password */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end mb-1">
                                        <label className="text-[11px] font-bold text-[#3C96E0] uppercase tracking-widest ml-1 flex items-center gap-1 group relative" htmlFor="newPassword">
                                            Nueva Contraseña
                                            <span className="material-icons text-[14px] cursor-help">info</span>
                                            <div className="absolute left-0 bottom-full mb-2 w-48 bg-[#111417] text-white text-[11px] rounded-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-xl normal-case font-medium tracking-normal">
                                                <p className="font-bold mb-1 text-[#3C96E0]">Requisitos:</p>
                                                <ul className="list-disc pl-3 space-y-0.5 text-slate-300">
                                                    <li>Mínimo 8 caracteres</li>
                                                    <li>Al menos 1 número</li>
                                                    <li>1 Mayúscula o símbolo especial</li>
                                                </ul>
                                            </div>
                                        </label>
                                        {formData.newPassword && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 ${strength.color.split(' ')[1]}`}>
                                                {strength.label}
                                            </span>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <input
                                            className="w-full rounded-xl border bg-[#F4FAFF] border-[#3C96E0]/40 px-4 py-3 text-sm font-semibold text-[#111417] focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] focus:bg-[#FFFFFF] shadow-sm outline-none transition-all pr-10"
                                            id="newPassword"
                                            placeholder="••••••••"
                                            required
                                            type={showNewPassword ? "text" : "password"}
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#3C96E0] transition-colors p-1 flex"
                                        >
                                            <span className="material-icons text-[18px]">{showNewPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>

                                    {/* Strength Bar */}
                                    {formData.newPassword && (
                                        <div className="mt-2 flex gap-1 h-1 mx-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-full flex-1 rounded-full transition-all duration-500 ease-out ${i <= strength.score ? strength.color.split(' ')[0] : 'bg-[#D8D2C3]/40'}`}
                                                ></div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Confirm New Password */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#3C96E0] uppercase tracking-widest ml-1" htmlFor="confirmPassword">
                                        Repetir Nueva Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            className="w-full rounded-xl border bg-[#F4FAFF] border-[#3C96E0]/40 px-4 py-3 text-sm font-semibold text-[#111417] focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] focus:bg-[#FFFFFF] shadow-sm outline-none transition-all pr-10"
                                            id="confirmPassword"
                                            placeholder="••••••••"
                                            required
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#3C96E0] transition-colors p-1 flex"
                                        >
                                            <span className="material-icons text-[18px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full bg-[#3C96E0] hover:bg-[#2A86D1] text-[#FFFFFF] px-6 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-[#3C96E0]/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 ${loading || success ? 'opacity-70 cursor-not-allowed transform-none' : ''}`}
                                    >
                                        {loading ? 'Actualizando...' : (success ? 'Actualizado' : 'Actualizar Contraseña')}
                                        {!loading && !success && <span className="material-icons text-[18px]">lock_reset</span>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChangePasswordPage;
