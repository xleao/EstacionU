
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReportPage from './pages/ReportPage';
import MentorsPage from './pages/MentorsPage';
import AccountPage from './pages/AccountPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import MySessionsPage from './pages/MySessionsPage';
import MentorDashboardPage from './pages/MentorDashboardPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSolicitudesPage from './pages/AdminSolicitudesPage';
import AdminCoffeeChatsPage from './pages/AdminCoffeeChatsPage';
import AdminCategoriasPage from './pages/AdminCategoriasPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import './index.css';

import ScrollToTop from './components/ScrollToTop';

import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';

function AppContent() {
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const hideFooter = ['/select-role', '/complete-profile'].includes(location.pathname);

    return (
        <AuthProvider>
            <PageTransition setLoading={setLoading} />
            {!loading && (
                <>
                    <ScrollToTop />
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/reporte" element={<ReportPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route
                            path="/select-role"
                            element={
                                <ProtectedRoute>
                                    <RoleSelectionPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/complete-profile"
                            element={
                                <ProtectedRoute>
                                    <CompleteProfilePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/mentores"
                            element={
                                <ProtectedRoute>
                                    <MentorsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/mentor/dashboard"
                            element={
                                <ProtectedRoute>
                                    <MentorDashboardPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/student/dashboard"
                            element={
                                <ProtectedRoute>
                                    <StudentDashboardPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute>
                                    <AdminDashboardPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/usuarios"
                            element={
                                <ProtectedRoute>
                                    <AdminUsersPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/solicitudes"
                            element={
                                <ProtectedRoute>
                                    <AdminSolicitudesPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/chats"
                            element={
                                <ProtectedRoute>
                                    <AdminCoffeeChatsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/categorias"
                            element={
                                <ProtectedRoute>
                                    <AdminCategoriasPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/cuenta"
                            element={
                                <ProtectedRoute>
                                    <AccountPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/sesiones"
                            element={
                                <ProtectedRoute>
                                    <MySessionsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/cambiar-contrasena"
                            element={
                                <ProtectedRoute>
                                    <ChangePasswordPage />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                    {!hideFooter && <Footer />}
                </>
            )}
        </AuthProvider>
    );
}

function App() {
    return (
        <GoogleOAuthProvider clientId="650998302216-vcquhvfi9esbhjb12dukg2e7gea1ab3b.apps.googleusercontent.com">
            <Router>
                <AppContent />
            </Router>
        </GoogleOAuthProvider>
    );
}

export default App;
