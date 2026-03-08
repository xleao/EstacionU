import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FluidBackground from '../components/FluidBackground';
import { useAuth } from '../context/AuthContext';

const AdminUsersPage = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        nombre_completo: '',
        correo: '',
        tipo_usuario: 'estudiante',
        telefono: '',
        universidad: '',
        carrera: '',
        password: ''
    });
    const [deletingUserId, setDeletingUserId] = useState(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, user = null) => {
        setModalMode(mode);
        if (mode === 'edit' && user) {
            setSelectedUser(user);
            setFormData({
                nombre_completo: user.nombre_completo || '',
                correo: user.correo || '',
                tipo_usuario: user.tipo_usuario || 'estudiante',
                telefono: user.telefono || '',
                universidad: user.universidad || '',
                carrera: user.carrera || ''
            });
        } else {
            setSelectedUser(null);
            setFormData({
                nombre_completo: '',
                correo: '',
                tipo_usuario: 'estudiante',
                telefono: '',
                universidad: '',
                carrera: '',
                password: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = modalMode === 'add' ? '/api/admin/users' : `/api/admin/users/${selectedUser.id}`;
        const method = modalMode === 'add' ? 'POST' : 'PUT';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchUsers();
                alert(modalMode === 'add' ? 'Usuario creado exitosamente' : 'Usuario actualizado exitosamente');
            } else {
                const err = await response.json();
                alert(`Error: ${err.detail || 'No se pudo guardar el usuario'}`);
            }
        } catch (error) {
            console.error("Error saving user:", error);
        }
    };

    const handleDeleteUser = (userId) => {
        // Prevent admin from deleting their own account
        if (user && user.id === userId) return;
        setDeletingUserId(userId);
        setDeleteSuccess(false);
    };

    const confirmDeleteUser = async () => {
        if (!deletingUserId) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/users/${deletingUserId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setUsers(users.filter(u => u.id !== deletingUserId));
                setDeleteSuccess(true);
                setTimeout(() => {
                    setDeletingUserId(null);
                    setDeleteSuccess(false);
                }, 1800);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ activo: !currentStatus })
            });
            if (response.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, activo: !currentStatus } : u));
            }
        } catch (error) {
            console.error("Error toggling user status:", error);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.correo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter ? u.tipo_usuario === roleFilter : true;
        const matchesStatus = statusFilter ? (statusFilter === 'activo' ? u.activo : !u.activo) : true;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    const goToNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const goToPrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    return (
        <div className="text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300 flex flex-col font-sans relative overflow-x-hidden">
            <FluidBackground />
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10 text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Panel de Administración</h1>
                        <p className="mt-1 text-slate-500 dark:text-slate-400">Gestiona los usuarios y roles de la plataforma EstaciónU.</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <button
                            onClick={() => handleOpenModal('add')}
                            className="inline-flex items-center px-5 py-2.5 bg-primary border border-transparent rounded-xl font-bold text-white hover:bg-blue-600 transition-all shadow-md shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary active:scale-95"
                        >
                            <span className="material-icons mr-2">person_add</span>
                            Agregar Usuario
                        </button>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 mb-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
                            <span className="material-icons text-xl">search</span>
                        </span>
                        <input
                            className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Buscar por nombre o correo..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="block w-40 pl-4 pr-10 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer">
                            <option value="">Todos los Roles</option>
                            <option value="estudiante">Estudiante</option>
                            <option value="mentor">Mentor</option>
                            <option value="admin">Administrador</option>
                        </select>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="block w-40 pl-4 pr-10 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer">
                            <option value="">Estado</option>
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Correo</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipo</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400"><p className="font-medium animate-pulse">Cargando...</p></td></tr>
                                ) : currentUsers.length > 0 ? (
                                    currentUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-400">#{u.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mr-3 border border-primary/10">{getInitials(u.nombre_completo)}</div>
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{u.nombre_completo || 'Sin nombre'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-medium">{u.correo}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${u.tipo_usuario === 'mentor' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : u.tipo_usuario === 'admin' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30' : 'bg-slate-100 text-slate-600'}`}>
                                                    {u.tipo_usuario || 'estudiante'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button onClick={() => handleToggleStatus(u.id, u.activo)} className={`relative inline-flex h-5 w-10 rounded-full transition-colors ${u.activo ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-600'}`}>
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${u.activo ? 'translate-x-5' : 'translate-x-1'} mt-0.5`}></span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-1">
                                                <button onClick={() => handleOpenModal('edit', u)} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all" title="Editar"><span className="material-icons text-xl">edit</span></button>
                                                {user && user.id === u.id ? (
                                                    <button disabled className="p-1.5 text-slate-200 dark:text-slate-600 rounded-lg cursor-not-allowed" title="No puedes eliminar tu propia cuenta">
                                                        <span className="material-icons text-xl">delete</span>
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                                                        <span className="material-icons text-xl">delete</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-medium">No se encontraron usuarios</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 font-medium">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredUsers.length)} de {filteredUsers.length}</div>
                        <div className="flex space-x-2">
                            <button onClick={goToPrevPage} className="px-3 py-1.5 border rounded-lg text-xs hover:bg-slate-50 transition-all disabled:opacity-50" disabled={currentPage === 1}>Anterior</button>
                            <div className="px-3 py-1.5 bg-primary rounded-lg text-xs text-white font-bold">{currentPage} / {totalPages || 1}</div>
                            <button onClick={goToNextPage} className="px-3 py-1.5 border rounded-lg text-xs hover:bg-slate-50 transition-all disabled:opacity-50" disabled={currentPage === totalPages || totalPages === 0}>Siguiente</button>
                        </div>
                    </div>
                </div>

                {/* CRUD Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl border border-white/20 overflow-hidden text-left">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{modalMode === 'add' ? 'Nuevo Usuario' : 'Editar Usuario'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="material-icons text-slate-400 hover:text-slate-600 transition-colors">close</button>
                            </div>
                            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                                        <input required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={formData.nombre_completo} onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                                        <input required type="email" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={formData.correo} onChange={(e) => setFormData({ ...formData, correo: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tipo de Usuario</label>
                                        <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer" value={formData.tipo_usuario} onChange={(e) => setFormData({ ...formData, tipo_usuario: e.target.value })}>
                                            <option value="estudiante">Estudiante</option>
                                            <option value="mentor">Mentor</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                                        <input className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                                    </div>
                                    {modalMode === 'add' && (
                                        <>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Universidad</label>
                                                <input className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={formData.universidad} onChange={(e) => setFormData({ ...formData, universidad: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Carrera</label>
                                                <input className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={formData.carrera} onChange={(e) => setFormData({ ...formData, carrera: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                                                <input required minLength={8} type="password" placeholder="Mínimo 8 caracteres" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-700 pt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Cancelar</button>
                                    <button type="submit" className="px-8 py-2.5 bg-primary text-white rounded-xl font-extrabold hover:bg-blue-600 shadow-lg shadow-primary/20 active:scale-95 transition-all">{modalMode === 'add' ? 'Crear Usuario' : 'Guardar Cambios'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deletingUserId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md" style={{ animation: 'adminFadeIn 0.25s ease-out both' }} onClick={() => !deleteSuccess && setDeletingUserId(null)}>
                        <style>{`
                            @keyframes adminFadeIn { from { opacity: 0; } to { opacity: 1; } }
                            @keyframes adminScaleUp { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                            @keyframes adminCheckBounce { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
                        `}</style>
                        <div
                            className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 max-w-sm w-full mx-4"
                            style={{ animation: 'adminScaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {!deleteSuccess ? (
                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-6 relative">
                                        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-75"></div>
                                        <span className="material-icons text-4xl text-red-500 relative z-10">person_remove</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">¿Eliminar usuario?</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-2 text-sm">
                                        Estás a punto de eliminar a <strong className="text-slate-700 dark:text-slate-200">{users.find(u => u.id === deletingUserId)?.nombre_completo || 'este usuario'}</strong>
                                    </p>
                                    <p className="text-red-400 dark:text-red-400 mb-8 text-xs font-semibold bg-red-50 dark:bg-red-500/10 rounded-xl py-2 px-3 inline-block">
                                        <span className="material-icons text-xs align-middle mr-1">warning</span>
                                        Se eliminará TODA su información (citas, perfiles, etc.)
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setDeletingUserId(null)}
                                            className="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                                        >
                                            No, mantener
                                        </button>
                                        <button
                                            onClick={confirmDeleteUser}
                                            className="flex-1 py-3.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold active:scale-95 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                                        >
                                            <span className="material-icons text-sm">delete_forever</span>
                                            Sí, eliminar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-6" style={{ animation: 'adminCheckBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
                                        <span className="material-icons text-4xl text-green-500">check_circle</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">¡Eliminado!</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        El usuario ha sido eliminado correctamente.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
            <footer className="mt-auto py-8 text-center text-slate-400 text-xs font-medium">© 2024 EstaciónU. Todos los derechos reservados.</footer>
        </div>
    );
};

export default AdminUsersPage;
