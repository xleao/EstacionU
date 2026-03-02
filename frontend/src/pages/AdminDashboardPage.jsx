import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FluidBackground from '../components/FluidBackground';
import { useAuth } from '../context/AuthContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AdminDashboardPage = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [daysFilter, setDaysFilter] = useState(15);

    useEffect(() => {
        const fetchStats = async () => {
            if (!data) setLoading(true); // Solo pantalla completa si es la primera carga
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/admin/dashboard-stats?days=${daysFilter}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error en al traer datos del dashboard');
                }
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [daysFilter]);


    // Helper functions for chart styling
    const getPrimaryColor = () => '#3C96E0';
    const getSecondaryColor = () => '#D8D2C3';
    const getDarkGray = () => '#111417';

    // Check if dark mode is active on document to adjust colors
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const chartBgColor = isDark ? '#1e293b' : '#ffffff';

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: chartBgColor,
                titleColor: isDark ? '#f8fafc' : '#0f172a',
                bodyColor: isDark ? '#cbd5e1' : '#475569',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
            }
        }
    };

    if (loading || !data) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <span className="material-icons animate-spin text-4xl text-primary">autorenew</span>
                </div>
            </div>
        );
    }

    const pointRad = 0;
    const evolutionData = {
        labels: data.charts.evolution.labels || [],
        datasets: [
            {
                label: 'Registros',
                data: data.charts.evolution.registrations || [],
                borderColor: '#3C96E0',
                backgroundColor: 'rgba(60, 150, 224, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: pointRad,
                pointHoverRadius: 8,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: '#3C96E0',
                pointBorderWidth: 2
            },
            {
                label: 'Citas',
                data: data.charts.evolution.appointments || [],
                borderColor: '#D8D2C3',
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: pointRad,
                pointHoverRadius: 8,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: '#D8D2C3',
                pointBorderWidth: 2
            }
        ]
    };

    const evolutionOptions = {
        ...commonOptions,
        animation: {
            duration: 1000,
            easing: 'easeOutQuart'
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            y: {
                grid: { color: gridColor, borderDash: [4, 4] },
                ticks: { color: textColor, padding: 10 },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: { color: textColor, padding: 10 },
                border: { display: false }
            }
        }
    };

    const sectorData = {
        labels: data.charts.sectors.labels || [],
        datasets: [{
            data: data.charts.sectors.data || [],
            backgroundColor: ['#3C96E0', '#D8D2C3', '#111417', '#63B3ED', '#E2E8F0'],
            borderWidth: 2,
            borderColor: isDark ? '#1e293b' : '#ffffff'
        }]
    };

    const statusData = {
        labels: data.charts.status.labels || [],
        datasets: [{
            data: data.charts.status.data || [],
            backgroundColor: ['#D8D2C3', '#3C96E0', '#10B981', '#EF4444'],
            borderRadius: 6,
            barPercentage: 0.6
        }]
    };

    const degreeData = {
        labels: data.charts.degrees.labels || [],
        datasets: [{
            data: data.charts.degrees.data || [],
            backgroundColor: ['#3C96E0', '#63B3ED', '#D8D2C3', '#111417'],
            borderWidth: 2,
            borderColor: isDark ? '#1e293b' : '#ffffff'
        }]
    };

    const topicsData = {
        labels: data.charts.topics.labels || [],
        datasets: [{
            data: data.charts.topics.data || [],
            backgroundColor: '#3C96E0',
            borderRadius: 4,
            barThickness: 16
        }]
    };

    // Build simple, readable summaries for legend lists
    const buildSummary = (labels = [], values = [], colors = []) => {
        const total = values.reduce((sum, v) => sum + (v || 0), 0) || 0;
        return labels.map((label, idx) => {
            const value = values[idx] || 0;
            const percent = total ? Math.round((value / total) * 100) : 0;
            return {
                label: label || 'Sin dato',
                value,
                percent,
                color: colors[idx] || '#CBD5F5'
            };
        }).sort((a, b) => b.value - a.value);
    };

    const sectorSummary = buildSummary(
        sectorData.labels,
        sectorData.datasets[0]?.data || [],
        sectorData.datasets[0]?.backgroundColor || []
    );

    const statusSummary = buildSummary(
        statusData.labels,
        statusData.datasets[0]?.data || [],
        statusData.datasets[0]?.backgroundColor || []
    );

    const degreeSummary = buildSummary(
        degreeData.labels,
        degreeData.datasets[0]?.data || [],
        degreeData.datasets[0]?.backgroundColor || []
    );

    const handleExportReport = () => {
        // Usa el diálogo de impresión del navegador para exportar como PDF
        window.print();
    };

    return (
        <div className="text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300 flex flex-col font-sans relative overflow-x-hidden">
            <div className="print-hide-global">
                <FluidBackground />
                <Navbar />
            </div>

            <main id="admin-dashboard-print" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10 bg-transparent">
                <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 animate-slide-down text-left">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">Panel de datos</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-normal">Visión general de usuarios, mentores y sesiones</p>
                    </div>
                    <div className="flex space-x-3 w-full sm:w-auto print-hide-global">
                        <button
                            onClick={handleExportReport}
                            className="flex-1 sm:flex-none justify-center flex items-center space-x-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                        >
                            <span className="material-icons text-sm">download</span>
                            <span>Exportar Reporte</span>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-left">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                                <span className="material-icons text-primary text-[22px]">groups</span>
                            </div>
                            <span className={`text-xs font-bold flex items-center px-2 py-1 rounded-full ${data.metrics.user_growth_rate >= 0 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-500 bg-red-50 dark:bg-red-900/20'}`}>
                                <span className="material-icons text-sm mr-0.5">{data.metrics.user_growth_rate >= 0 ? 'trending_up' : 'trending_down'}</span> {data.metrics.user_growth_rate}%
                            </span>
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Usuarios</h3>
                        <p className="text-4xl font-bold mt-1 text-slate-900 dark:text-white tracking-tight">{data.metrics.total_users}</p>
                        <p className="mt-2 text-xs text-slate-400">Últimos 30 días (+{data.metrics.new_users_30d})</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                                <span className="material-icons text-indigo-500 text-[22px]">verified</span>
                            </div>
                            <span className="text-xs font-bold text-primary flex items-center bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                                <span className="material-icons text-sm mr-0.5">add</span> +{data.metrics.new_mentors_30d} nuevos
                            </span>
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Mentores</h3>
                        <p className="text-4xl font-bold mt-1 text-slate-900 dark:text-white tracking-tight">{data.metrics.total_mentors}</p>
                        <p className="mt-2 text-xs text-slate-400">En total, últimos 30 días (+{data.metrics.new_mentors_30d})</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                <span className="material-icons text-slate-600 dark:text-slate-300 text-[22px]">school</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-500 flex items-center bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                                <span className="material-icons text-sm mr-0.5">trending_up</span> {data.metrics.active_students_percent}%
                            </span>
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Estudiantes Activos</h3>
                        <p className="text-4xl font-bold mt-1 text-slate-900 dark:text-white tracking-tight">{data.metrics.active_students}</p>
                        <p className="mt-2 text-xs text-slate-400">{data.metrics.active_students_percent}% de {data.metrics.total_students} estudiantes con al menos 1 sesión</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                                <span className="material-icons text-primary text-[22px]">thumb_up</span>
                            </div>
                            <span className="text-xs font-bold text-primary flex items-center bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                                <span className="material-icons text-sm mr-0.5">check_circle</span> {data.metrics.success_rate}%
                            </span>
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Global Session Success</h3>
                        <p className="text-4xl font-bold mt-1 text-slate-900 dark:text-white tracking-tight">{data.metrics.success_rate}%</p>
                        <p className="mt-2 text-xs text-slate-400">{data.metrics.successful_sessions} de {data.metrics.total_sessions} citas completadas</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="w-full lg:w-3/4 flex flex-col gap-6 text-left">

                        {/* Main Evolution Chart */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registros vs. Citas</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Crecimiento de los últimos {daysFilter} días</p>
                                </div>
                                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 items-center justify-between mt-4 sm:mt-0 gap-4">
                                    <div className="flex items-center space-x-6 bg-slate-50 dark:bg-slate-700/50 px-4 py-2 rounded-full">
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 rounded-full bg-primary mr-2 shadow-sm animate-pulse"></span>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Registros</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 rounded-full bg-[#D8D2C3] mr-2 shadow-sm animate-pulse" style={{ animationDelay: '0.5s' }}></span>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Citas</span>
                                        </div>
                                    </div>
                                    <div className="relative w-full sm:w-auto">
                                        <select
                                            value={daysFilter}
                                            onChange={(e) => setDaysFilter(Number(e.target.value))}
                                            className="w-full sm:w-auto appearance-none flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer pr-10"
                                        >
                                            <option value={7}>Últimos 7 días</option>
                                            <option value={15}>Últimos 15 días</option>
                                            <option value={30}>Últimos 30 días</option>
                                            <option value={60}>Últimos 2 meses</option>
                                            <option value={180}>Últimos 6 meses</option>
                                        </select>
                                        <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">expand_more</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[350px] w-full relative">
                                <Line data={evolutionData} options={evolutionOptions} />
                            </div>
                        </div>

                        {/* Three smaller charts row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Sectores */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.5s' }}>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 w-full text-left">Sectores</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 text-left">Distribución de mentores por sector</p>
                                <div className="relative h-[200px] w-full flex justify-center">
                                    <Doughnut data={sectorData} options={{ ...commonOptions, cutout: '75%' }} />
                                </div>
                                <div className="mt-4 w-full space-y-1">
                                    {sectorSummary.slice(0, 4).map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1 rounded transition-colors group">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="truncate max-w-[140px]">{item.label}</span>
                                            </div>
                                            <span className="font-semibold text-slate-700 dark:text-slate-100">
                                                {item.percent}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Estado de Citas */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.6s' }}>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 w-full text-left">Estado de Citas</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 text-left">Resumen rápido del flujo de sesiones</p>
                                <div className="relative h-[200px] w-full flex justify-center">
                                    <Bar data={statusData} options={{
                                        ...commonOptions,
                                        scales: {
                                            y: { display: false },
                                            x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } }, border: { display: false } }
                                        }
                                    }} />
                                </div>
                                <div className="mt-4 w-full space-y-1">
                                    {statusSummary.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1 rounded transition-colors group">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="truncate max-w-[120px]">{item.label}</span>
                                            </div>
                                            <span className="font-semibold text-slate-700 dark:text-slate-100">
                                                {item.percent}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Grados Académicos */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.7s' }}>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 w-full text-left">Grados Académicos</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 text-left">Nivel académico de los perfiles registrados</p>
                                <div className="relative h-[200px] w-full flex justify-center">
                                    <Pie data={degreeData} options={commonOptions} />
                                </div>
                                <div className="mt-4 w-full space-y-1">
                                    {degreeSummary.slice(0, 4).map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1 rounded transition-colors group">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="truncate max-w-[140px]">{item.label}</span>
                                            </div>
                                            <span className="font-semibold text-slate-700 dark:text-slate-100">
                                                {item.percent}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sesiones por Tema & Top Mentores */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 text-left animate-slide-up" style={{ animationDelay: '0.8s' }}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-icons text-primary">insights</span>
                                        Panorama de Sesiones
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Temas solicitados y mentores más activos</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="text-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                        <p className="text-2xl font-bold text-primary">{data.metrics.total_sessions}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Sesiones</p>
                                    </div>
                                    <div className="text-center px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                        <p className="text-2xl font-bold text-emerald-500">{data.metrics.successful_sessions}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Completadas</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Sessions by Topic - Horizontal Bar */}
                                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-5">
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                                        <span className="material-icons text-sm text-primary">topic</span>
                                        Temas más Solicitados
                                    </h4>
                                    {data.charts.sessions_by_topic && (
                                        <div className="h-56 relative w-full">
                                            <Bar
                                                data={{
                                                    labels: data.charts.sessions_by_topic.labels,
                                                    datasets: [{
                                                        data: data.charts.sessions_by_topic.data,
                                                        backgroundColor: [
                                                            'rgba(59, 130, 246, 0.75)',
                                                            'rgba(139, 92, 246, 0.75)',
                                                            'rgba(16, 185, 129, 0.75)',
                                                            'rgba(245, 158, 11, 0.75)',
                                                            'rgba(239, 68, 68, 0.75)',
                                                            'rgba(14, 165, 233, 0.75)',
                                                            'rgba(168, 85, 247, 0.75)',
                                                            'rgba(34, 197, 94, 0.75)',
                                                        ],
                                                        borderRadius: 6,
                                                        barThickness: 18,
                                                    }]
                                                }}
                                                options={{
                                                    ...commonOptions,
                                                    indexAxis: 'y',
                                                    animation: { duration: 800, easing: 'easeOutQuart' },
                                                    plugins: { ...commonOptions.plugins, legend: { display: false } },
                                                    scales: {
                                                        x: {
                                                            grid: { color: gridColor, borderDash: [4, 4] },
                                                            ticks: { color: textColor, stepSize: 1 },
                                                            border: { display: false }
                                                        },
                                                        y: {
                                                            grid: { display: false },
                                                            ticks: { color: textColor, font: { size: 11, weight: '600' } },
                                                            border: { display: false }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Top Mentors Ranking */}
                                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-5">
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                                        <span className="material-icons text-sm text-amber-500">emoji_events</span>
                                        Top Mentores
                                    </h4>
                                    <div className="space-y-3">
                                        {data.top_mentors && data.top_mentors.length > 0 ? (
                                            data.top_mentors.map((mentor, idx) => {
                                                const maxSessions = data.top_mentors[0].sessions || 1;
                                                const pct = Math.round((mentor.sessions / maxSessions) * 100);
                                                const medals = ['🥇', '🥈', '🥉'];
                                                return (
                                                    <div key={idx} className="group" style={{ animation: `fadeSlideIn 0.4s ease-out ${idx * 0.1}s both` }}>
                                                        <div className="flex items-center justify-between text-sm mb-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">{medals[idx] || `#${idx + 1}`}</span>
                                                                <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[160px]">{mentor.name}</span>
                                                            </div>
                                                            <span className="text-xs font-bold text-primary bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full">
                                                                {mentor.sessions} sesiones
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                                                style={{
                                                                    width: `${pct}%`,
                                                                    background: idx === 0 ? 'linear-gradient(90deg, #F59E0B, #EAB308)' :
                                                                        idx === 1 ? 'linear-gradient(90deg, #94A3B8, #CBD5E1)' :
                                                                            idx === 2 ? 'linear-gradient(90deg, #D97706, #B45309)' :
                                                                                'linear-gradient(90deg, #3B82F6, #60A5FA)'
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                                <span className="material-icons text-3xl mb-2">person_off</span>
                                                <p className="text-sm">Aún no hay sesiones registradas</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column / Activity Sidebar */}
                    <div className="w-full lg:w-1/3 xl:w-1/4 sticky top-[120px] self-start space-y-4">
                        {/* Live Activity Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col text-left overflow-hidden animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                            {/* Header */}
                            <div className="p-5 pb-4 bg-slate-50/50 dark:bg-slate-900/30">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
                                        <span className="relative mr-2.5">
                                            <span className="material-icons text-primary text-xl">notifications_active</span>
                                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
                                        </span>
                                        Actividad en Vivo
                                    </h3>
                                    <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full uppercase tracking-wider">En línea</span>
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 ml-[30px]">Últimas acciones en tiempo real</p>
                            </div>

                            {/* Activity Items */}
                            <div className="px-4 py-4 space-y-2 max-h-[480px] overflow-y-auto custom-scrollbar">
                                {data.recent_activities.map((activity, idx) => {
                                    const colorMap = {
                                        blue: { bg: 'bg-blue-50/50 dark:bg-blue-900/10', border: 'border-l-blue-400', icon: 'text-blue-500 dark:text-blue-400', badge: 'bg-blue-100/50 dark:bg-blue-900/20' },
                                        amber: { bg: 'bg-amber-50/50 dark:bg-amber-900/10', border: 'border-l-amber-400', icon: 'text-amber-500 dark:text-amber-400', badge: 'bg-amber-100/50 dark:bg-amber-900/20' },
                                        green: { bg: 'bg-emerald-50/50 dark:bg-emerald-900/10', border: 'border-l-emerald-400', icon: 'text-emerald-500 dark:text-emerald-400', badge: 'bg-emerald-100/50 dark:bg-emerald-900/20' },
                                        red: { bg: 'bg-red-50/50 dark:bg-red-900/10', border: 'border-l-red-400', icon: 'text-red-500 dark:text-red-400', badge: 'bg-red-100/50 dark:bg-red-900/20' },
                                        slate: { bg: 'bg-slate-50/50 dark:bg-slate-700/20', border: 'border-l-slate-400', icon: 'text-slate-500 dark:text-slate-400', badge: 'bg-slate-100/50 dark:bg-slate-700/40' },
                                        purple: { bg: 'bg-purple-50/50 dark:bg-purple-900/10', border: 'border-l-purple-400', icon: 'text-purple-500 dark:text-purple-400', badge: 'bg-purple-100/50 dark:bg-purple-900/20' },
                                    };
                                    const colors = colorMap[activity.color] || colorMap.slate;

                                    return (
                                        <div
                                            key={idx}
                                            className={`group relative rounded-xl border-l-[3px] ${colors.border} ${colors.bg} p-3.5 hover:translate-x-1 transition-all duration-300 ease-out cursor-default`}
                                            style={{ animation: `fadeSlideIn 0.4s ease-out ${idx * 0.08 + 0.5}s both` }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-8 h-8 rounded-lg ${colors.badge} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                    <span className={`material-icons text-[16px] ${colors.icon}`}>{activity.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-primary transition-colors">{activity.title}</p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{activity.desc}</p>
                                                </div>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap flex-shrink-0 mt-0.5">{activity.time}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20">
                                <button className="w-full py-2 text-[13px] text-primary font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all rounded-xl text-center flex items-center justify-center gap-1.5 active:scale-95">
                                    <span>Ver todo el historial</span>
                                    <span className="material-icons text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        {/* Extra quick stats below history */}
                        <div className="bg-white/90 dark:bg-slate-800/95 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 px-5 py-4 text-left backdrop-blur-sm animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <span className="material-icons text-primary text-[18px]">insights</span>
                                Resumen de Comunidad
                            </h4>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">
                                Datos agregados de perfiles y catálogo.
                            </p>
                            <div className="space-y-2 text-[12px] text-slate-600 dark:text-slate-300">
                                <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-[16px] text-primary">account_balance</span>
                                        </span>
                                        <span>Universidades distintas</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {data.sidebar_facts?.total_universities ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-[16px] text-emerald-500">school</span>
                                        </span>
                                        <span>Carreras registradas</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {data.sidebar_facts?.total_careers ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-[16px] text-indigo-500">business_center</span>
                                        </span>
                                        <span>Sectores de mentores</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {data.sidebar_facts?.total_sectors ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-[16px] text-purple-500">topic</span>
                                        </span>
                                        <span>Temas de mentoría</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {data.sidebar_facts?.total_topics ?? 0}
                                    </span>
                                </div>
                                <hr className="my-3 border-slate-100 dark:border-slate-700" />
                                <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-700/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-[16px] text-slate-500">group</span>
                                        </span>
                                        <span>Sesiones por mentor</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {data.sidebar_facts?.avg_sessions_per_mentor ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-700/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-[16px] text-slate-500">person</span>
                                        </span>
                                        <span>Sesiones por estudiante activo</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {data.sidebar_facts?.avg_sessions_per_active_student ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-700/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-[16px] text-slate-500">groups</span>
                                        </span>
                                        <span>Estudiantes por mentor</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white text-right">
                                        ~{data.sidebar_facts?.mentor_student_ratio ?? 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Indicadores de avance (progress_stats) */}
                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 px-5 py-4 text-left animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <span className="material-icons text-amber-500 text-[18px]">trending_up</span>
                                Avance de la plataforma
                            </h4>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">
                                Indicadores de uso y salud de EstaciónU.
                            </p>
                            <div className="space-y-2 text-[12px] text-slate-600 dark:text-slate-300">
                                <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-[16px] text-primary">event_available</span>
                                        </span>
                                        <span>Citas (últimos 7 días)</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">{data.progress_stats?.appointments_last_7d ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-[16px] text-emerald-500">schedule</span>
                                        </span>
                                        <span>Mentores con horarios</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">{data.progress_stats?.mentors_with_availability ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-[16px] text-blue-500">link</span>
                                        </span>
                                        <span>Perfiles con LinkedIn</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">{data.progress_stats?.profiles_with_linkedin ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-[16px] text-slate-500">photo_camera</span>
                                        </span>
                                        <span>Perfiles con foto</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">{data.progress_stats?.profiles_with_photo ?? 0}</span>
                                </div>
                                <hr className="my-3 border-slate-100 dark:border-slate-700" />
                                <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-[16px] text-amber-500">calendar_month</span>
                                        </span>
                                        <span>Este mes vs anterior</span>
                                    </div>
                                    <span className={`font-semibold ${(data.progress_stats?.appointments_month_trend ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                        {(data.progress_stats?.appointments_month_trend ?? 0) >= 0 ? '+' : ''}{data.progress_stats?.appointments_month_trend ?? 0}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-[16px] text-red-500">cancel</span>
                                        </span>
                                        <span>Tasa de cancelación</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">{data.progress_stats?.cancellation_rate ?? 0}%</span>
                                </div>
                                <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-[16px] text-slate-500">person_off</span>
                                        </span>
                                        <span>Estudiantes sin sesión</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">{data.progress_stats?.students_never_session ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-icons text-[16px] text-slate-500">person_off</span>
                                        </span>
                                        <span>Mentores sin sesión</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">{data.progress_stats?.mentors_never_session ?? 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Animations & print styles */}
                    <style>{`
                        @keyframes fadeSlideIn {
                            from { opacity: 0; transform: translateY(12px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes slideUp {
                            from { opacity: 0; transform: translateY(24px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes slideDown {
                            from { opacity: 0; transform: translateY(-20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes slideInRight {
                            from { opacity: 0; transform: translateX(30px); }
                            to { opacity: 1; transform: translateX(0); }
                        }
                        @keyframes scaleIn {
                            from { opacity: 0; transform: scale(0.95); }
                            to { opacity: 1; transform: scale(1); }
                        }
                        .animate-fade-in { animation: fadeSlideIn 0.8s ease-out both; }
                        .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
                        .animate-slide-down { animation: slideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
                        .animate-slide-in-right { animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
                        .animate-scale-in { animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
                        
                        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }

                        @media print {
                            @page {
                                size: A4 portrait;
                                margin: 12mm;
                            }

                            body {
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                                background: #ffffff !important;
                            }

                            /* Ocultar navbar, fondo, botones y footer global */
                            .print-hide-global,
                            footer,
                            .site-footer {
                                display: none !important;
                            }

                            /* Layout del dashboard en PDF */
                            #admin-dashboard-print {
                                max-width: 100% !important;
                                padding: 0 !important;
                                margin: 0 !important;
                                background: #ffffff !important;
                                overflow: visible !important;
                            }

                            #admin-dashboard-print * {
                                box-shadow: none !important;
                            }

                            /* Evitar sticky en PDF para que nada se solape */
                            #admin-dashboard-print .sticky {
                                position: static !important;
                                top: auto !important;
                            }
                        }
                    `}</style>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardPage;
