import React, { useState, useEffect, useRef } from 'react';

export const SECTOR_OPTIONS = [
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

export const AREA_OPTIONS = [
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

export const CustomCombobox = ({ name, options, placeholder, value, onChange, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Only filter when user is actively typing; show all when opened via arrow button
    const filteredOptions = searchQuery
        ? options.filter(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()))
        : options;

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <input
                    name={name}
                    className="w-full rounded-2xl border bg-[#F4FAFF] dark:bg-slate-900/80 border-[#3C96E0]/40 dark:border-primary/40 px-5 py-3 pr-10 text-sm font-semibold text-[#111417] dark:text-white focus:ring-2 focus:ring-[#3C96E0]/30 focus:border-[#3C96E0] dark:focus:border-primary focus:bg-[#FFFFFF] dark:focus:bg-slate-800 dark:bg-slate-800/80 dark:backdrop-blur-xl shadow-sm shadow-[#3C96E0]/5 outline-none transition-all placeholder:text-slate-400 dark:text-slate-500 disabled:bg-[#F9FAFB] dark:disabled:bg-slate-900/40 dark:bg-slate-900/60 disabled:border-transparent disabled:text-[#111417] dark:disabled:text-slate-500 disabled:shadow-none disabled:opacity-100 disabled:cursor-default"
                    type="text"
                    placeholder={placeholder}
                    value={isOpen ? searchQuery : value}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        // Also propagate typed value to parent for custom entries
                        onChange({ target: { name, value: e.target.value } });
                        setIsOpen(true);
                    }}
                    onClick={() => {
                        if (!disabled) {
                            setSearchQuery('');
                            setIsOpen(true);
                        }
                    }}
                    disabled={disabled}
                    autoComplete="off"
                />
                <div
                    className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-1.5 rounded-full transition-colors ${disabled ? 'text-slate-400/50 cursor-not-allowed' : 'text-slate-400 hover:text-[#3C96E0] hover:bg-[#3C96E0]/10 dark:hover:text-primary dark:hover:bg-primary/20 cursor-pointer'}`}
                    onClick={(e) => {
                        e.preventDefault();
                        if (!disabled) {
                            setSearchQuery('');
                            setIsOpen(!isOpen);
                        }
                    }}
                >
                    <span className={`material-icons text-[20px] transition-transform duration-300 pointer-events-none ${isOpen ? 'rotate-180 text-[#3C96E0] dark:text-primary' : ''}`}>
                        expand_more
                    </span>
                </div>
            </div>
            {isOpen && !disabled && (
                <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <ul className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, idx) => (
                                <li
                                    key={idx}
                                    className={`px-4 py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-all flex items-center justify-between group
                                        ${value === opt
                                            ? 'bg-[#F4FAFF] dark:bg-slate-700/80 text-[#3C96E0] dark:text-primary'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-[#111417] dark:hover:text-white'
                                        }`}
                                    onClick={() => {
                                        if (opt === 'Otros') {
                                            onChange({ target: { name, value: '' } });
                                        } else {
                                            onChange({ target: { name, value: opt } });
                                        }
                                        setSearchQuery('');
                                        setIsOpen(false);
                                    }}
                                >
                                    {opt}
                                    {value === opt && <span className="material-icons text-[18px]">check_circle</span>}
                                    {opt === 'Otros' && <span className="material-icons text-[18px] opacity-70">edit</span>}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400 text-center flex flex-col items-center gap-2">
                                <span className="material-icons text-slate-300 dark:text-slate-600 text-[32px] mb-1">edit_note</span>
                                <div>
                                    <span className="font-bold text-[#111417] dark:text-white">"{searchQuery}"</span>
                                    <p className="mt-1 text-xs">se guardará como personalizado</p>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};



