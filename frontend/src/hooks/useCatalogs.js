import { useState, useEffect } from 'react';

// Default backup values in case the API fails or is loading
const defaultSectorOptions = [
    "Agriculture, Livestock & Agribusiness",
    "Consulting & Professional Services",
    "Consumer & Retail",
    "Corporate Services & Holding Companies",
    "Education & Research",
    "Energy, Utilities & Natural Resources",
    "Financial Services",
    "Government, Public Sector & Nonprofits",
    "Healthcare & Life Sciences",
    "Hospitality & Tourism",
    "Industrial / Manufacturing",
    "Media, Entertainment & Communications",
    "Real Estate, Construction & Infrastructure",
    "Supply Chain, Logistics & Transportation",
    "Technology",
    "Otros"
];

const defaultAreaOptions = [
    "Customer Service and Support",
    "Data and Analytics",
    "Engineering and Technology",
    "Entrepeneurship",
    "Finance/Accounting",
    "General Management",
    "Human Resources",
    "Marketing/Communications",
    "Operations/SCM",
    "Product Management",
    "Project Management",
    "Research/Academia",
    "Sales/Business Development",
    "Strategy/Consulting",
    "Otros"
];

const defaultInstitutionOptions = [
    "UNI",
    "UNMSM",
    "PUCP",
    "UPC",
    "ULima",
    "Otros"
];

const defaultCareerOptions = [
    "Ingeniería Industrial",
    "Ingeniería de Sistemas",
    "Ingeniería de Software",
    "Ingeniería de Inteligencia Artificial",
    "Administración",
    "Otros"
];

const defaultThemeOptions = [
    "Revisión de CV / Portfolio",
    "Orientación de Carrera",
    "Desarrollo de Habilidades Soft",
    "Networking Estratégico",
    "Insight del Sector Industrial",
    "Tu trabajo y/o linea de carrera",
    "Experiencia en un sector o industria",
    "Orientacion universitaria y/o posgrado",
    "Otro"
];

let cachedSectores = null;
let cachedAreas = null;
let cachedInstituciones = null;
let cachedCarreras = null;
let cachedTemas = null;

export const useCatalogs = () => {
    const [sectores, setSectores] = useState(cachedSectores || defaultSectorOptions);
    const [areas, setAreas] = useState(cachedAreas || defaultAreaOptions);
    const [instituciones, setInstituciones] = useState(cachedInstituciones || defaultInstitutionOptions);
    const [carreras, setCarreras] = useState(cachedCarreras || defaultCareerOptions);
    const [temas, setTemas] = useState(cachedTemas || defaultThemeOptions);
    const [loading, setLoading] = useState(!cachedSectores && !cachedAreas && !cachedInstituciones && !cachedCarreras && !cachedTemas);

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const resSectores = await fetch('/api/catalogs/sectores');
                if (resSectores.ok) {
                    const data = await resSectores.json();
                    if (data.length > 0) {
                        const filtered = data.filter(item => item.nombre.toLowerCase() !== "otros" && item.nombre.toLowerCase() !== "others");
                        cachedSectores = [...filtered.map((item) => item.nombre), "Otros"];
                        setSectores(cachedSectores);
                    }
                }

                const resAreas = await fetch('/api/catalogs/areas');
                if (resAreas.ok) {
                    const data = await resAreas.json();
                    if (data.length > 0) {
                        const filtered = data.filter(item => item.nombre.toLowerCase() !== "otros" && item.nombre.toLowerCase() !== "others");
                        cachedAreas = [...filtered.map((item) => item.nombre), "Otros"];
                        setAreas(cachedAreas);
                    }
                }

                const resInst = await fetch('/api/catalogs/instituciones');
                if (resInst.ok) {
                    const data = await resInst.json();
                    if (data.length > 0) {
                        const filtered = data.filter(item => item.nombre.toLowerCase() !== "otros" && item.nombre.toLowerCase() !== "otro");
                        cachedInstituciones = [...filtered.map((item) => item.nombre), "Otros"];
                        setInstituciones(cachedInstituciones);
                    }
                }

                const resCarr = await fetch('/api/catalogs/carreras');
                if (resCarr.ok) {
                    const data = await resCarr.json();
                    if (data.length > 0) {
                        const filtered = data.filter(item => item.nombre.toLowerCase() !== "otros" && item.nombre.toLowerCase() !== "otro");
                        cachedCarreras = [...filtered.map((item) => item.nombre), "Otros"];
                        setCarreras(cachedCarreras);
                    }
                }

                const resTemas = await fetch('/api/catalogs/temas');
                if (resTemas.ok) {
                    const data = await resTemas.json();
                    if (data.length > 0) {
                        const filtered = data.filter(item => item.nombre.toLowerCase() !== "otro" && item.nombre.toLowerCase() !== "otros");
                        cachedTemas = [...filtered.map((item) => item.nombre), "Otro"];
                        setTemas(cachedTemas);
                    }
                }
            } catch (error) {
                console.error("Error fetching catalogs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCatalogs();
    }, []);

    return {
        SECTOR_OPTIONS: sectores,
        AREA_OPTIONS: areas,
        INSTITUTION_OPTIONS: instituciones,
        CAREER_OPTIONS: carreras,
        THEME_OPTIONS: temas,
        loading
    };
};
