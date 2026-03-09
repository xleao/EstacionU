import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FluidBackground from '../components/FluidBackground';

const AdminCategoriasPage = () => {
    const [sectores, setSectores] = useState([]);
    const [areas, setAreas] = useState([]);
    const [instituciones, setInstituciones] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [temas, setTemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null });
    const [addModal, setAddModal] = useState({ isOpen: false, type: null });
    const [newItemName, setNewItemName] = useState('');
    const [addErrorMsg, setAddErrorMsg] = useState(null);

    useEffect(() => {
        fetchCatalogs();
    }, []);

    const fetchCatalogs = async () => {
        try {
            setLoading(true);
            const resSec = await fetch('/api/catalogs/sectores');
            const resAre = await fetch('/api/catalogs/areas');
            const resInst = await fetch('/api/catalogs/instituciones');
            const resCarr = await fetch('/api/catalogs/carreras');
            const resTem = await fetch('/api/catalogs/temas');
            if (resSec.ok) setSectores(await resSec.json());
            if (resAre.ok) setAreas(await resAre.json());
            if (resInst.ok) setInstituciones(await resInst.json());
            if (resCarr.ok) setCarreras(await resCarr.json());
            if (resTem.ok) setTemas(await resTem.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        if (e) e.preventDefault();
        const { type } = addModal;
        const value = newItemName;
        if (!value.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const endpointMap = {
                'sector': '/api/catalogs/sectores',
                'area': '/api/catalogs/areas',
                'institucion': '/api/catalogs/instituciones',
                'carrera': '/api/catalogs/carreras',
                'tema': '/api/catalogs/temas'
            };
            const endpoint = endpointMap[type];
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nombre: value })
            });
            if (res.ok) {
                setNewItemName('');
                setAddModal({ isOpen: false, type: null });
                setAddErrorMsg(null);
                fetchCatalogs();
            } else {
                let detail = `Error ${res.status}`;
                try {
                    const data = await res.json();
                    detail = data.detail || detail;
                } catch (_) { }
                console.error("API Error:", res.status, detail);
                setAddErrorMsg(detail);
                setTimeout(() => setAddErrorMsg(null), 5000);
            }
        } catch (error) {
            console.error("Network Error:", error);
            setAddErrorMsg('Error de conexión con el servidor.');
            setTimeout(() => setAddErrorMsg(null), 5000);
        }
    };

    const openAddModal = (type) => {
        setAddModal({ isOpen: true, type });
        setNewItemName('');
        setAddErrorMsg(null);
    };

    const confirmDelete = (type, id) => {
        setDeleteModal({ isOpen: true, type, id });
    };

    const handleDelete = async () => {
        const { type, id } = deleteModal;
        try {
            const token = localStorage.getItem('token');
            const endpointMap = {
                'sector': `/api/catalogs/sectores/${id}`,
                'area': `/api/catalogs/areas/${id}`,
                'institucion': `/api/catalogs/instituciones/${id}`,
                'carrera': `/api/catalogs/carreras/${id}`,
                'tema': `/api/catalogs/temas/${id}`
            };
            const endpoint = endpointMap[type];
            const res = await fetch(endpoint, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchCatalogs();
                setDeleteModal({ isOpen: false, type: null, id: null });
            } else {
                let detail = `Error ${res.status}`;
                try {
                    const data = await res.json();
                    detail = data.detail || detail;
                } catch (_) { }
                setErrorMsg(detail);
                setTimeout(() => setErrorMsg(null), 5000);
            }
        } catch (error) {
            setErrorMsg('Error de conexión con el servidor.');
            setTimeout(() => setErrorMsg(null), 5000);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300 relative">
            <FluidBackground />
            <div className="relative z-10">
                <Navbar />

                <main className="max-w-7xl mx-auto px-6 py-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-fade-in">
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                <span className="material-icons text-primary text-3xl">category</span>
                                Áreas y Sectores
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">Configura las opciones que aparecerán en los menús de selección de perfiles.</p>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {errorMsg && (
                        <div className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-600 dark:text-red-400 font-semibold animate-fade-in">
                            <span className="material-icons">error_outline</span>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-20 animate-pulse">
                            <span className="material-icons text-slate-300 dark:text-slate-600 text-5xl mb-3">hourglass_empty</span>
                            <p className="text-slate-500 font-semibold">Cargando datos...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Sectores Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 animate-slide-up" style={{ animationDelay: '100ms' }}>
                                <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-500 flex items-center justify-center">
                                            <span className="material-icons">business</span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sectores Económicos</h2>
                                            <p className="text-sm text-slate-500 font-medium">{sectores.length} registrados</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openAddModal('sector')}
                                        className="p-2 sm:px-4 sm:py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-orange-500/20 active:scale-95"
                                        title="Añadir Sector"
                                    >
                                        <span className="material-icons text-[20px] sm:text-sm">add</span>
                                        <span className="hidden sm:inline">Añadir</span>
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                    {sectores.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{item.nombre}</span>
                                            <button
                                                onClick={() => confirmDelete('sector', item.id)}
                                                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Eliminar"
                                            >
                                                <span className="material-icons text-[18px]">delete_outline</span>
                                            </button>
                                        </div>
                                    ))}
                                    {sectores.length === 0 && (
                                        <p className="text-center py-6 text-slate-400 text-sm font-medium">No hay sectores registrados.</p>
                                    )}
                                </div>
                            </div>

                            {/* Areas Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 animate-slide-up" style={{ animationDelay: '200ms' }}>
                                <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            <span className="material-icons">category</span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Áreas de Funciones</h2>
                                            <p className="text-sm text-slate-500 font-medium">{areas.length} registradas</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openAddModal('area')}
                                        className="p-2 sm:px-4 sm:py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-primary/20 active:scale-95"
                                        title="Añadir Área"
                                    >
                                        <span className="material-icons text-[20px] sm:text-sm">add</span>
                                        <span className="hidden sm:inline">Añadir</span>
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                    {areas.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{item.nombre}</span>
                                            <button
                                                onClick={() => confirmDelete('area', item.id)}
                                                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Eliminar"
                                            >
                                                <span className="material-icons text-[18px]">delete_outline</span>
                                            </button>
                                        </div>
                                    ))}
                                    {areas.length === 0 && (
                                        <p className="text-center py-6 text-slate-400 text-sm font-medium">No hay áreas registradas.</p>
                                    )}
                                </div>
                            </div>

                            {/* Instituciones Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 animate-slide-up" style={{ animationDelay: '300ms' }}>
                                <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-500 flex items-center justify-center">
                                            <span className="material-icons">account_balance</span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Instituciones</h2>
                                            <p className="text-sm text-slate-500 font-medium">{instituciones.length} registradas</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openAddModal('institucion')}
                                        className="p-2 sm:px-4 sm:py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95"
                                        title="Añadir Institución"
                                    >
                                        <span className="material-icons text-[20px] sm:text-sm">add</span>
                                        <span className="hidden sm:inline">Añadir</span>
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                    {instituciones.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{item.nombre}</span>
                                            <button
                                                onClick={() => confirmDelete('institucion', item.id)}
                                                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Eliminar"
                                            >
                                                <span className="material-icons text-[18px]">delete_outline</span>
                                            </button>
                                        </div>
                                    ))}
                                    {instituciones.length === 0 && (
                                        <p className="text-center py-6 text-slate-400 text-sm font-medium">No hay instituciones registradas.</p>
                                    )}
                                </div>
                            </div>

                            {/* Carreras Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 animate-slide-up" style={{ animationDelay: '400ms' }}>
                                <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-500 flex items-center justify-center">
                                            <span className="material-icons">school</span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Carreras</h2>
                                            <p className="text-sm text-slate-500 font-medium">{carreras.length} registradas</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openAddModal('carrera')}
                                        className="p-2 sm:px-4 sm:py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-green-500/20 active:scale-95"
                                        title="Añadir Carrera"
                                    >
                                        <span className="material-icons text-[20px] sm:text-sm">add</span>
                                        <span className="hidden sm:inline">Añadir</span>
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                    {carreras.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{item.nombre}</span>
                                            <button
                                                onClick={() => confirmDelete('carrera', item.id)}
                                                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Eliminar"
                                            >
                                                <span className="material-icons text-[18px]">delete_outline</span>
                                            </button>
                                        </div>
                                    ))}
                                    {carreras.length === 0 && (
                                        <p className="text-center py-6 text-slate-400 text-sm font-medium">No hay carreras registradas.</p>
                                    )}
                                </div>
                            </div>

                            {/* Temas Coffee Chat Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 animate-slide-up md:col-span-2" style={{ animationDelay: '500ms' }}>
                                <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/40 text-pink-500 flex items-center justify-center">
                                            <span className="material-icons">forum</span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Temas de Coffee Chat</h2>
                                            <p className="text-sm text-slate-500 font-medium">{temas.length} registrados</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openAddModal('tema')}
                                        className="p-2 sm:px-4 sm:py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-pink-500/20 active:scale-95"
                                        title="Añadir Tema"
                                    >
                                        <span className="material-icons text-[20px] sm:text-sm">add</span>
                                        <span className="hidden sm:inline">Añadir</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                    {temas.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{item.nombre}</span>
                                            <button
                                                onClick={() => confirmDelete('tema', item.id)}
                                                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Eliminar"
                                            >
                                                <span className="material-icons text-[18px]">delete_outline</span>
                                            </button>
                                        </div>
                                    ))}
                                    {temas.length === 0 && (
                                        <p className="text-center py-6 col-span-full text-slate-400 text-sm font-medium">No hay temas registrados.</p>
                                    )}
                                </div>
                            </div>


                        </div>
                    )}
                </main>
            </div>

            {/* Add Modal */}
            {addModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 max-w-sm w-full transform transition-all animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
                                Añadir {addModal.type === 'institucion' ? 'Institución' : addModal.type}
                            </h3>
                            <button onClick={() => setAddModal({ isOpen: false, type: null })} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        {addErrorMsg && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-semibold">
                                <span className="material-icons text-[18px]">error_outline</span>
                                <span className="flex-1">{addErrorMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleAdd}>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 capitalize">
                                    Nombre de {addModal.type === 'institucion' ? 'institución' : addModal.type}
                                </label>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder={`Ej. ${addModal.type === 'sector' ? 'Tecnología' : addModal.type === 'area' ? 'Marketing' : addModal.type === 'institucion' ? 'Universidad XYZ' : addModal.type === 'carrera' ? 'Ingeniería XYZ' : 'Tema XYZ'}`}
                                    className={`w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 outline-none focus:ring-2 transition-all font-medium text-slate-900 dark:text-white focus:border-primary focus:ring-primary/20`}
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setAddModal({ isOpen: false, type: null })}
                                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newItemName.trim()}
                                    className={`flex-1 py-3 px-4 rounded-xl text-white font-bold active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary hover:bg-blue-600 shadow-primary/30`}
                                >
                                    <span className="material-icons text-[18px]">add_circle</span>
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div
                        className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 max-w-sm w-full mx-4 transform transition-all animate-slide-up"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-5">
                                <span className="material-icons text-3xl text-red-500">warning_amber</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 capitalize">¿Eliminar {deleteModal.type === 'institucion' ? 'institución' : deleteModal.type}?</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-[200px] mx-auto text-sm mb-8 leading-relaxed">
                                Esta acción lo quitará permanentemente de las opciones.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setDeleteModal({ isOpen: false, type: null, id: null })}
                                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold active:scale-95 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                                >
                                    <span className="material-icons text-[18px]">delete</span>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategoriasPage;
