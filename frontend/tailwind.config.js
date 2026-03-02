/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: {
                    light: '#f8f9fa',
                    dark: '#0f172a',
                },
                primary: {
                    DEFAULT: '#3498db',
                    foreground: '#FFFFFF',
                },
                brand: {
                    beige: "#e9e4d9",
                    dark: "#1a1c1e"
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 1s ease-out forwards',
                'scroll': 'scroll 40s linear infinite',
                'border-pulse': 'pulse-border 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scroll: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                'pulse-border': {
                    '0%, 100%': { borderColor: 'rgba(52, 152, 219, 0.2)' },
                    '50%': { borderColor: '#3498db', boxShadow: '0 0 20px rgba(52, 152, 219, 0.4)' },
                },
                glow: {
                    '0%, 100%': { filter: 'drop-shadow(0 0 4px rgba(52, 152, 219, 0.3)) drop-shadow(0 0 8px rgba(52, 152, 219, 0.1))' },
                    '50%': { filter: 'drop-shadow(0 0 12px rgba(52, 152, 219, 0.7)) drop-shadow(0 0 24px rgba(52, 152, 219, 0.4))' },
                }
            },
            backgroundImage: {
                'hero-pattern': 'radial-gradient(#3C96E010 1px, transparent 1px)',
                'login-pattern': 'radial-gradient(#e9e4d9 1.5px, transparent 1.5px)',
            },
            backgroundSize: {
                'hero-pattern': '20px 20px',
                'login-pattern': '30px 30px',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
}
