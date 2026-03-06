import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FluidBackground from '../components/FluidBackground';
import CoffeeChatModal from '../components/CoffeeChatModal';
import { SECTOR_OPTIONS, AREA_OPTIONS } from '../components/CustomCombobox';

export const MentorCard = ({ name, role, area, bio, tags, image, schedule, disponibilidades, linkedin_url, url_logo_empresa, empresa, onBookChat, index }) => {
    return (
        <div
            className="mentor-card-enter bg-white dark:bg-slate-800/80 dark:backdrop-blur-md rounded-[2rem] p-6 text-center h-full flex flex-col items-center border border-slate-100 dark:border-slate-700 relative group z-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* Top accent line */}
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

            <div className="relative mb-3">
                <div className="w-36 h-36 rounded-full bg-slate-50 dark:bg-slate-700 overflow-hidden ring-4 ring-slate-50 dark:ring-slate-700 group-hover:ring-primary/20 transition-all duration-500">
                    <img
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src={image && image !== "https://via.placeholder.com/150" ? image : `https://api.dicebear.com/9.x/notionists/svg?seed=${name.replace(/\s/g, '')}&backgroundColor=transparent`}
                    />
                </div>
                {/* Company logo badge (fallback to status dot if no logo) */}
                {url_logo_empresa && (
                    <div className="absolute bottom-0 right-0 w-11 h-11 rounded-full bg-white dark:bg-slate-800 border-[3px] border-white dark:border-slate-800 shadow-sm overflow-hidden transition-transform duration-300">
                        <img
                            src={url_logo_empresa}
                            alt={empresa || `Logo de la empresa de ${name}`}
                            className="w-full h-full object-contain"
                        />
                    </div>
                )}
            </div>
            <div className="text-center mb-3">
                <h3 className="text-xl font-bold text-[#111417] dark:text-white mb-1 group-hover:text-primary transition-colors duration-300">{name}</h3>
                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{area}</span>
                    <span className="text-xs font-semibold text-primary uppercase tracking-widest">{role}</span>
                </div>
            </div>
            <div className="speech-bubble w-full rounded-2xl p-4 mb-4 text-center group-hover:border-primary/20 transition-colors duration-300">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Quiero que me consulten sobre:</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-3">"{bio}"</p>
            </div>

            <div className="w-full mb-5 border-t border-slate-50 dark:border-slate-700/50 pt-4">
                <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                    <span className="material-symbols-outlined text-[18px] material-icons">schedule</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Disponibilidad</span>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 px-2">
                    {disponibilidades && disponibilidades.length > 0 ? (
                        disponibilidades.slice(0, 3).map((disp, idx) => (
                            <span key={idx} className="px-2 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {disp.dia.substring(0, 3)}. {disp.hora_inicio}-{disp.hora_fin}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{schedule}</span>
                    )}
                    {disponibilidades && disponibilidades.length > 3 && (
                        <span className="text-[10px] font-bold text-primary self-center">+{disponibilidades.length - 3} más</span>
                    )}
                </div>
            </div>
            <div className="w-full space-y-3 mt-auto">
                <button
                    onClick={onBookChat}
                    type="button"
                    className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-[0.98]">
                    <span className="material-icons text-[18px]">coffee</span>
                    Agendar Coffee Chat
                </button>
                {linkedin_url ? (
                    <a
                        className="flex items-center justify-center gap-1.5 w-full py-3.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:bg-[#0A66C2] dark:hover:bg-[#0A66C2] hover:text-white dark:hover:text-white hover:border-[#0A66C2] dark:hover:border-[#0A66C2] text-slate-500 dark:text-slate-300 text-sm font-semibold rounded-2xl hover:shadow-lg hover:shadow-[#0A66C2]/20 transition-all group/linkedin active:scale-[0.98]"
                        href={linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <svg className="w-4 h-4 fill-current transition-colors" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                        </svg>
                        LinkedIn
                    </a>
                ) : (
                    <button
                        className="flex items-center justify-center gap-1.5 w-full py-3.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-sm font-semibold rounded-2xl cursor-not-allowed"
                        disabled
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                        </svg>
                        LinkedIn no disponible
                    </button>
                )}
            </div>
        </div>
    );
};



const MentorsPage = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState(null);

    const handleOpenModal = (mentor) => {
        setSelectedMentor(mentor);
        setIsModalOpen(true);
    };

    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-trigger')) {
                setOpenDropdown(null);
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const [mentors, setMentors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArea, setSelectedArea] = useState('');
    const [selectedSector, setSelectedSector] = useState('');
    const [loaded, setLoaded] = useState(false);

    const fetchMentors = async () => {
        try {
            const response = await fetch('/api/mentors');
            if (response.ok) {
                const data = await response.json();
                setMentors(data);
            }
        } catch (error) {
            console.error("Error fetching mentors:", error);
        } finally {
            setLoaded(true);
        }
    };

    useEffect(() => {
        fetchMentors();

        // WebSocket for real-time updates
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // In dev, use the proxy or direct backend port it's running on backend. But Vite proxy handles upgraded ws correctly if configured. 
        // We'll connect using the standard path. Vite configuration in `vite.config.js` might need proxy ws:true, but usually it works.
        const wsUrl = `${protocol}//${window.location.host}/api/ws/mentors`;

        let ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            if (event.data === "mentors_updated") {
                console.log("Real-time update received: Reloading mentors...");
                fetchMentors();
            }
        };

        ws.onopen = () => {
            console.log("Connected to Mentors WebSocket feed.");
        };

        ws.onclose = () => {
            console.log("Disconnected from Mentors WebSocket feed.");
        };

        return () => {
            if (ws) ws.close();
        };
    }, []);

    const extraAreas = [...new Set(
        mentors
            .map(m => m.role)
            .filter(Boolean)
            .filter(area => !AREA_OPTIONS.includes(area))
    )];

    const extraSectors = [...new Set(
        mentors
            .map(m => m.area)
            .filter(Boolean)
            .filter(sector => !SECTOR_OPTIONS.includes(sector))
    )];

    const areaOptions = [...AREA_OPTIONS, ...extraAreas];
    const sectorOptions = [...SECTOR_OPTIONS, ...extraSectors];

    const filteredMentors = mentors.filter(mentor => {
        const isNotSelf = user ? mentor.id !== user.id : true;
        const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesArea = selectedArea ? mentor.role === selectedArea : true;
        const matchesSector = selectedSector ? mentor.area === selectedSector : true;
        return isNotSelf && matchesSearch && matchesArea && matchesSector;
    });

    return (
        <div className="min-h-screen font-sans text-[#111417] dark:text-white antialiased selection:bg-[#3C96E0]/20 relative overflow-hidden">
            <FluidBackground />
            <Navbar />
            <style>{`
                .speech-bubble {
                    position: relative;
                    background-color: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    transition: background-color 0.3s, border-color 0.3s;
                }
                .dark .speech-bubble {
                    background-color: rgba(51, 65, 85, 0.4);
                    border-color: rgba(71, 85, 105, 0.5);
                }
                .speech-bubble::after {
                    content: '';
                    position: absolute;
                    top: -9px;
                    left: 50%;
                    transform: translateX(-50%);
                    border-left: 9px solid transparent;
                    border-right: 9px solid transparent;
                    border-bottom: 9px solid #E2E8F0;
                }
                .dark .speech-bubble::after {
                    border-bottom-color: rgba(71, 85, 105, 0.5);
                }
                .speech-bubble::before {
                    content: '';
                    position: absolute;
                    top: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-bottom: 8px solid #F8FAFC;
                    z-index: 1;
                }
                .dark .speech-bubble::before {
                    border-bottom-color: #1e293b; /* slate-800 approx background for cards */
                }
                @keyframes mentorCardEnter {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .mentor-card-enter {
                    animation: mentorCardEnter 0.6s ease-out both;
                }
                @keyframes filterBarEnter {
                    from { opacity: 0; transform: translateY(-16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes titleEnter {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes badgeEnter {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>

            <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                {/* Search & Filter bar with entrance animation */}
                <section className="mb-12 relative z-20" style={{ animation: 'filterBarEnter 0.6s ease-out both' }}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-[2rem] shadow-sm border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-shadow duration-300">

                        <div className="relative group w-full md:w-[28rem]">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <span className="material-icons text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar mentor por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 rounded-full pl-11 pr-6 py-3 text-sm font-medium text-[#111417] dark:text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative group flex-1 min-w-[200px]">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <span className="material-icons text-primary text-base">filter_list</span>
                                </div>
                                <select
                                    value={selectedArea}
                                    onChange={(e) => setSelectedArea(e.target.value)}
                                    className="custom-select w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-10 py-3 text-sm font-medium text-[#111417] dark:text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer hover:border-primary/50"
                                >
                                    <option value="">Todas las áreas</option>
                                    {areaOptions.map((area, idx) => (
                                        <option key={idx} value={area}>{area}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative group flex-1 min-w-[200px]">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <span className="material-icons text-primary text-base">category</span>
                                </div>
                                <select
                                    value={selectedSector}
                                    onChange={(e) => setSelectedSector(e.target.value)}
                                    className="custom-select w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-10 py-3 text-sm font-medium text-[#111417] dark:text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer hover:border-primary/50"
                                >
                                    <option value="">Todos los sectores</option>
                                    {sectorOptions.map((sector, idx) => (
                                        <option key={idx} value={sector}>{sector}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-200/50 gap-4">
                        <div style={{ animation: 'titleEnter 0.7s ease-out both 0.2s' }}>
                            <h2 className="text-4xl font-bold tracking-tight mb-2 text-[#111417] dark:text-white">
                                <span>Mentores</span> <span className="text-primary">Destacados</span>
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Conectando experiencia con tu futuro</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm px-5 py-2 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-2" style={{ animation: 'badgeEnter 0.5s ease-out both 0.4s' }}>
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-sm font-bold text-[#111417] dark:text-white uppercase tracking-wider">{filteredMentors.length} Disponibles</span>
                        </div>
                    </div>
                    {filteredMentors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredMentors.map((mentor, index) => (
                                <MentorCard key={index} {...mentor} index={index} onBookChat={() => handleOpenModal(mentor)} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700" style={{ animation: 'mentorCardEnter 0.5s ease-out both' }}>
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-icons text-3xl text-slate-300 dark:text-slate-500">person_search</span>
                            </div>
                            <h3 className="text-xl font-bold text-[#111417] dark:text-white mb-1">No encontramos mentores</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">Prueba ajustando tus filtros de búsqueda</p>
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedArea(''); setSelectedSector(''); }}
                                className="mt-4 px-6 py-2 bg-white dark:bg-slate-900 border border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </section>
            </main>

            <CoffeeChatModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mentor={selectedMentor}
            />
        </div>
    );
};

export default MentorsPage;
