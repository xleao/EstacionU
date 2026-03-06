import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import FeaturedMentors from '../components/FeaturedMentors';
import LakeBackground from '../components/LakeBackground';

const LandingPage = () => {
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        if (user) {
            const role = (user.role || '').toLowerCase();
            const hasNoRole = !role || role === 'user' || role === 'usuario';
            if (hasNoRole || user.onboarding_completo === false) {
                // If they visit the landing page without finishing onboarding, treat it as an abort and log them out
                logout();
            }
        }
    }, [user, logout]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (user) {
        // Enforce role selection and onboarding even if landing on the root page
        const role = (user.role || '').toLowerCase();
        const hasNoRole = !role || role === 'user' || role === 'usuario';

        if (hasNoRole || user.onboarding_completo === false) {
            // They are about to be logged out by useEffect, show loading state temporarily
            return (
                <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            );
        }

        const isMentor = ['mentor', 'graduate', 'egresado'].includes(role);
        return <Navigate to={isMentor ? "/mentor/dashboard" : "/student/dashboard"} replace />;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen relative">
            <LakeBackground blur="blur-[40px]" />
            <div className="relative z-10">
                <Navbar />
                <Hero />
                <HowItWorks />
                <FeaturedMentors />
            </div>

        </div>
    );
};

export default LandingPage;
