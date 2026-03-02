import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

const FeaturedMentors = () => {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refTitle, isTitleVisible] = useIntersectionObserver({ threshold: 0.3, triggerOnce: true });

    // Drag to scroll & Auto scroll
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const animationRef = useRef(null);

    // Auto-scrolling logic via requestAnimationFrame so it plays nice with drag
    useEffect(() => {
        const carousel = scrollRef.current;
        if (!carousel) return;

        let scrollSpeed = 0.5; // pixel per frame, slightly slower for elegance
        const scroll = () => {
            if (!isDragging) {
                if (carousel.scrollLeft >= (carousel.scrollWidth / 2)) {
                    // Instantly snap to 0 when halfway visually
                    carousel.scrollLeft = 0;
                } else {
                    carousel.scrollLeft += scrollSpeed;
                }
            }
            animationRef.current = requestAnimationFrame(scroll);
        };

        animationRef.current = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationRef.current);
    }, [isDragging, loading]);

    const handleDragStart = (e) => {
        setIsDragging(true);
        setStartX((e.pageX || e.touches[0].pageX) - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };
    const handleDragMove = (e) => {
        if (!isDragging) return;
        // Don't prevent default on touch as it breaks native scroll completely if not careful, 
        // but since we custom scroll, we can.
        if (e.type !== 'touchmove') e.preventDefault();
        const x = (e.pageX || e.touches[0].pageX) - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; // faster scroll with mouse drag
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };
    const handleDragEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const response = await fetch('/api/mentors');
                if (response.ok) {
                    const data = await response.json();
                    // Add random images using a minimalist set (DiceBear Notcommands or Avataaars for clean look)
                    const mentorsWithImages = data.map((mentor, index) => ({
                        ...mentor,
                        // Use real image if exists, otherwise fallback to notionists style illustration
                        image: mentor.image && mentor.image !== "https://via.placeholder.com/150"
                            ? mentor.image
                            : `https://api.dicebear.com/9.x/notionists/svg?seed=${mentor.name || index}&backgroundColor=e5e7eb,d1d5db`
                    }));
                    setMentors(mentorsWithImages);
                } else {
                    console.error("Failed to fetch mentors");
                }
            } catch (error) {
                console.error("Error fetching mentors:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMentors();
    }, []);

    // Ensure we have enough items for a smooth loop (at least 6-8 items visually)
    // If we have few mentors, we multiply the list until it's long enough
    let displayMentors = mentors;
    while (displayMentors.length > 0 && displayMentors.length < 6) {
        displayMentors = [...displayMentors, ...mentors];
    }
    // Now create the seamless loop pair (original + duplicate) for the 50% scroll
    const carouselMentors = mentors.length > 0 ? [...displayMentors, ...displayMentors] : [];

    if (loading) {
        return (
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/30 blur-3xl -z-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (mentors.length === 0) {
        return (
            <section className="py-20 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Mentores destacados</h2>
                    <p className="text-slate-600 dark:text-slate-400">Pronto se unirán nuestros mentores.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 overflow-hidden bg-slate-50/50 dark:bg-slate-900/30 relative">
            {/* Ambient blobs */}
            <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-primary/3 blur-3xl pointer-events-none" style={{ animation: 'fmBlob 10s ease-in-out infinite' }} />
            <div className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-blue-200/5 blur-3xl pointer-events-none" style={{ animation: 'fmBlob 8s ease-in-out infinite 3s' }} />

            <div ref={refTitle} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Mentores destacados</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto mb-8">
                        Los mejores profesionales listos para guiarte en tu camino profesional
                    </p>
                    <Link to="/login" className="inline-flex items-center space-x-3 px-8 py-3 bg-primary hover:bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300 group">
                        <span>Ver todos los mentores</span>
                        <span className="material-icons group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                </div>
            </div>

            {/* Outer clips visually, inner is the actual scrollable container */}
            <div className="relative w-full mx-auto" style={{ maxWidth: '1200px' }}>
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50/90 dark:from-slate-900/90 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50/90 dark:from-slate-900/90 to-transparent z-10 pointer-events-none" />

                <div
                    ref={scrollRef}
                    className={`flex py-6 mentor-scroll ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                    style={{ overflowX: 'scroll', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    onMouseDown={handleDragStart}
                    onMouseMove={handleDragMove}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                    onTouchStart={handleDragStart}
                    onTouchMove={handleDragMove}
                    onTouchEnd={handleDragEnd}
                >
                    {carouselMentors.map((mentor, index) => (
                        <div key={`${mentor.id}-${index}`} className="w-[300px] mx-4 flex-shrink-0 transform transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01]">
                            <div className="relative bg-white dark:bg-slate-800 rounded-[28px] p-6 shadow-sm hover:shadow-2xl border border-slate-100 dark:border-slate-700/50 text-center flex flex-col items-center h-full group hover:shadow-primary/10 transition-all duration-500 overflow-hidden">
                                {/* Top gradient accent */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative mb-4 mt-2">
                                    <div className="w-[120px] h-[120px] rounded-full mx-auto ring-4 ring-slate-50 dark:ring-slate-700/50 group-hover:ring-primary/20 transition-all duration-500">
                                        <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                            <img
                                                alt={mentor.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                src={mentor.image}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                                            />
                                        </div>
                                    </div>
                                    {/* Company logo badge (fallback to status dot if no logo) */}
                                    {mentor.url_logo_empresa ? (
                                        <div className="absolute bottom-0 right-1 w-11 h-11 rounded-full bg-white border-[2px] border-white dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
                                            <img
                                                src={mentor.url_logo_empresa}
                                                alt={mentor.empresa || `Logo de la empresa de ${mentor.name}`}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="absolute bottom-1 right-2 w-3.5 h-3.5 bg-emerald-400 rounded-full border-[2px] border-white dark:border-slate-800 transition-all duration-300" />
                                    )}
                                </div>

                                {/* Name & Role */}
                                <h4 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors duration-300 mb-0.5">{mentor.name}</h4>
                                <p className="text-slate-500 text-[14px] font-medium mb-5">{mentor.role}</p>

                                {/* Tags */}
                                <div className="flex flex-wrap justify-center gap-1.5 mb-5 min-h-[48px] items-start">
                                    {mentor.tags.map((tag, i) => (
                                        <span key={i}
                                            className={`px-3 py-1 text-[11px] font-medium rounded-full border transition-all duration-300 ${tag === 'Experto' ? 'bg-primary/5 dark:bg-primary/10 text-primary border-primary/20' : 'bg-white dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600/50 group-hover:border-slate-300'}`}
                                            style={{ transitionDelay: `${i * 50}ms` }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Button */}
                                <div className="w-full mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                    <button className="w-full py-2.5 bg-slate-50 hover:bg-primary text-slate-700 hover:text-white dark:bg-slate-700/50 dark:hover:bg-primary dark:text-slate-300 rounded-[14px] font-medium text-[14px] transition-all duration-300 flex items-center justify-center gap-2">
                                        <span>Ver Perfil</span>
                                        <span className="material-icons text-[16px] transition-transform duration-300 group-hover:translate-x-1 opacity-0 group-hover:opacity-100 absolute right-6">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes fmBlob { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-15px) scale(1.03); } }
                .mentor-scroll::-webkit-scrollbar { display: none; }
            `}</style>
        </section>
    );
};

export default FeaturedMentors;
