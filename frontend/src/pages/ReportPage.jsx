import React, { useCallback } from 'react';
import Navbar from '../components/Navbar';
import LakeBackground from '../components/LakeBackground';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const ReportPage = () => {
    // Configuración de Partículas Dispersas que se sienten atraídas al cursor
    const particlesInit = useCallback(async engine => {
        await loadSlim(engine);
    }, []);

    const particlesOptions = {
        fullScreen: { enable: false, zIndex: 0 },
        fpsLimit: 120,
        particles: {
            color: { value: ["#3C96E0", "#60A5FA", "#93C5FD"] },
            links: { enable: false }, // Dispersas, sin líneas
            move: {
                direction: "none",
                enable: true,
                outModes: { default: "out" }, // Evita que choquen con los bordes de la pantalla y se amontonen
                random: true,
                speed: 0.8,
                straight: false,
            },
            number: {
                density: { enable: true, area: 1200 },
                value: 800, // Partículas mucho más densas por el fondo
            },
            opacity: {
                value: { min: 0.1, max: 0.8 },
            },
            shape: {
                type: "circle",
            },
            size: {
                value: { min: 1, max: 4 },
                animation: {
                    enable: true,
                    speed: 1,
                    minimumValue: 1,
                    sync: false
                }
            },
        },
        interactivity: {
            events: {
                onHover: {
                    enable: false, // Sin interacción al pasar el mouse, solo flotan libres
                },
                onClick: {
                    enable: false,
                },
                resize: true,
            },
        },
        detectRetina: true,
    };


    // Chart 1: % Alumni at a Managerial Level
    const data1 = [
        { name: '< 3 años', alumni: 8 },
        { name: '4 años', alumni: 12 },
        { name: '5 años', alumni: 14 },
        { name: '6 años', alumni: 19 },
        { name: '7 años', alumni: 19 },
        { name: '8 años', alumni: 27 },
        { name: '9 años', alumni: 32 },
        { name: '10+ años', alumni: 39 },
    ];

    // Chart 2: Masters and PhDs: Focus Areas
    const data2 = [
        { name: 'MBA', sys: 3, ind: 30 },
        { name: 'Gestión Empresarial', sys: 22, ind: 42 },
        { name: 'Datos & CS', sys: 31, ind: 9 },
        { name: 'Ingeniería / Tec', sys: 5, ind: 9 },
        { name: 'Otros', sys: 39, ind: 10 },
    ];

    // Chart 3: Years After Graduation vs % Alumni
    const data3 = [
        { name: '< 3 años', alumni: 8 },
        { name: '4 años', alumni: 12 },
        { name: '5 años', alumni: 14 },
        { name: '6 años', alumni: 19 },
        { name: '7 años', alumni: 19 },
        { name: '8 años', alumni: 27 },
    ];

    // Chart 4: Job Placement by Economic Sectors
    const data4 = [
        { name: 'Consumo', sys: 3, ind: 20 },
        { name: 'Industrial', sys: 2, ind: 17 },
        { name: 'Financiero', sys: 45, ind: 16 },
        { name: 'Energía', sys: 1, ind: 7 },
        { name: 'Tecnología e IT', sys: 24, ind: 6 },
        { name: 'Otros', sys: 25, ind: 34 },
    ];

    // Chart 5: Job Placement by Function/Expertise Area
    const data5 = [
        { name: 'Data / Analytics', sys: 47, ind: 14 },
        { name: 'Operaciones', sys: 4, ind: 41 },
        { name: 'Ingeniería / Tec', sys: 30, ind: 6 },
        { name: 'Finanzas', sys: 3, ind: 11 },
        { name: 'Ventas', sys: 2, ind: 8 },
        { name: 'Otros', sys: 14, ind: 21 },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 shadow-lg rounded-xl">
                    <p className="font-bold text-slate-900 dark:text-white mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
                            {entry.name === 'alumni' ? '% Egresados' :
                                entry.name === 'sys' ? 'Ing. de Sistemas' :
                                    entry.name === 'ind' ? 'Ing. Industrial' : entry.name}: {entry.value}%
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-background-light dark:bg-background-dark relative overflow-hidden min-h-screen flex flex-col font-sans transition-colors duration-300 z-0">

            {/* Dispersed Particles Attracted to Cursor */}
            <div className="absolute inset-0 z-0 pointer-events-none blur-[1px] opacity-80">
                <Particles
                    id="tsparticles-report-dispersed"
                    init={particlesInit}
                    options={particlesOptions}
                    className="h-full w-full"
                />
            </div>

            <style>{`
                @keyframes heroFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
                @keyframes heroRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
            <Navbar />

            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 text-slate-900 dark:text-white">
                <style>{`
                    @keyframes reportFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes reportSlideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                    @keyframes reportWave { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(50px, 50px) scale(1.1); } }
                    .report-card { animation: reportFadeUp 0.6s ease-out both; }
                `}</style>

                <div id="report-title-container" className="text-center mb-24 mt-8 relative z-10" style={{ animation: 'reportFadeUp 0.6s ease-out both' }}>
                    <h1 className="text-5xl md:text-6xl font-medium tracking-tight mb-6 text-slate-900 dark:text-white">
                        Reporte de Egresados
                    </h1>
                    <p className="text-xl font-light text-slate-500 max-w-2xl mx-auto">
                        Estadísticas clave sobre el impacto y trayectoria de nuestros egresados en el mercado laboral.
                    </p>
                </div>

                {/* Section: Empleabilidad */}
                <section className="mb-20">
                    <h2 className="inline-block text-2xl font-semibold tracking-tight mb-12 pl-4 pr-6 py-2 border-l-4 border-primary bg-primary/5 rounded-r-lg text-slate-900 dark:text-white" style={{ animation: 'reportSlideIn 0.6s ease-out both 0.15s' }}>Empleabilidad</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Chart 1 */}
                        <div className="report-card p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-none hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-500" style={{ animationDelay: '0.2s' }}>
                            <h3 className="text-lg font-medium mb-10 text-center text-slate-800 dark:text-slate-200">% Egresados en Puestos Directivos</h3>
                            <div className="h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data1} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Bar dataKey="alumni" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Egresados" barSize={40} animationDuration={1200} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Chart 2 */}
                        <div className="report-card p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-none hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-500" style={{ animationDelay: '0.3s' }}>
                            <h3 className="text-lg font-medium mb-10 text-center text-slate-800 dark:text-slate-200">Áreas de Enfoque en Maestrías y Doctorados</h3>
                            <div className="h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data2} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                        <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Legend />
                                        <Bar dataKey="sys" name="Ing. de Sistemas" fill="#3B82F6" radius={[0, 6, 6, 0]} barSize={20} animationDuration={1200} />
                                        <Bar dataKey="ind" name="Ing. Industrial" fill="#EF4444" radius={[0, 6, 6, 0]} barSize={20} animationDuration={1400} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Educación */}
                <section className="mb-20">
                    <h2 className="inline-block text-2xl font-semibold tracking-tight mb-12 mt-16 pl-4 pr-6 py-2 border-l-4 border-emerald-500 bg-emerald-500/5 rounded-r-lg text-slate-900 dark:text-white" style={{ animation: 'reportSlideIn 0.6s ease-out both 0.35s' }}>Educación</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Chart 3 */}
                        <div className="report-card p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-none hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-500 lg:col-span-2" style={{ animationDelay: '0.4s' }}>
                            <h3 className="text-lg font-medium mb-10 text-center text-slate-800 dark:text-slate-200">Años desde la Graduación vs % de Egresados</h3>
                            <div className="h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data3} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Bar dataKey="alumni" fill="#10B981" radius={[6, 6, 0, 0]} name="Egresados" barSize={50} animationDuration={1200} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Chart 4 */}
                        <div className="report-card p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-none hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-500" style={{ animationDelay: '0.5s' }}>
                            <h3 className="text-lg font-medium mb-10 text-center text-slate-800 dark:text-slate-200">Ubicación Laboral por Sector Económico</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data4} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                        <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={110} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Legend />
                                        <Bar dataKey="sys" name="Ing. de Sistemas" fill="#3B82F6" radius={[0, 6, 6, 0]} barSize={15} animationDuration={1200} />
                                        <Bar dataKey="ind" name="Ing. Industrial" fill="#EF4444" radius={[0, 6, 6, 0]} barSize={15} animationDuration={1400} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Chart 5 */}
                        <div className="report-card p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-none hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-500" style={{ animationDelay: '0.6s' }}>
                            <h3 className="text-lg font-medium mb-10 text-center text-slate-800 dark:text-slate-200">Ubicación Laboral por Área de Función</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data5} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                        <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={110} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Legend />
                                        <Bar dataKey="sys" name="Ing. de Sistemas" fill="#3B82F6" radius={[0, 6, 6, 0]} barSize={15} animationDuration={1200} />
                                        <Bar dataKey="ind" name="Ing. Industrial" fill="#EF4444" radius={[0, 6, 6, 0]} barSize={15} animationDuration={1400} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default ReportPage;
