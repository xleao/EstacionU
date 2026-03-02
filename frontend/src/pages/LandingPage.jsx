import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import FeaturedMentors from '../components/FeaturedMentors';
import LakeBackground from '../components/LakeBackground';

const LandingPage = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (user) {
        const isMentor = ['mentor', 'graduate', 'egresado'].includes((user.role || '').toLowerCase());
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
