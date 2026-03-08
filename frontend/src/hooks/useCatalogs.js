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

let cachedSectores = null;
let cachedAreas = null;

export const useCatalogs = () => {
    const [sectores, setSectores] = useState(cachedSectores || defaultSectorOptions);
    const [areas, setAreas] = useState(cachedAreas || defaultAreaOptions);
    const [loading, setLoading] = useState(!cachedSectores && !cachedAreas);

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                if (!cachedSectores) {
                    const resSectores = await fetch('/api/catalogs/sectores');
                    if (resSectores.ok) {
                        const data = await resSectores.json();
                        if (data.length > 0) {
                            const filtered = data.filter(item => item.nombre.toLowerCase() !== "otros" && item.nombre.toLowerCase() !== "others");
                            cachedSectores = [...filtered.map((item) => item.nombre), "Otros"];
                            setSectores(cachedSectores);
                        }
                    }
                }

                if (!cachedAreas) {
                    const resAreas = await fetch('/api/catalogs/areas');
                    if (resAreas.ok) {
                        const data = await resAreas.json();
                        if (data.length > 0) {
                            const filtered = data.filter(item => item.nombre.toLowerCase() !== "otros" && item.nombre.toLowerCase() !== "others");
                            cachedAreas = [...filtered.map((item) => item.nombre), "Otros"];
                            setAreas(cachedAreas);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching catalogs:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!cachedSectores || !cachedAreas) {
            fetchCatalogs();
        }
    }, []);

    return { SECTOR_OPTIONS: sectores, AREA_OPTIONS: areas, loading };
};
