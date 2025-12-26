/**
 * StudentLayout - Interface étudiante style Notion
 * Layout principal avec sidebar collapsible et navigation
 * 
 * @param {ReactNode} children - Contenu de la page
 * @param {string} title - Titre de la page
 */
import React, { useState, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    Menu, X, BookOpen, Home, Calendar, FileText, User, LogOut, Bell, Search,
    ChevronDown, Award, GraduationCap, Clock, ChevronRight, Users, Settings
} from 'lucide-react';

export default function StudentLayout({ children, title = 'Dashboard' }) {
    const { auth } = usePage().props;
    const url = usePage().url || window.location.pathname;

    // États pour gérer l'UI
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showNavbarProfile, setShowNavbarProfile] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSection, setExpandedSection] = useState({
        academic: true,  // Toujours ouvert par défaut
        documents: true  // Toujours ouvert par défaut
    });
    const notificationsRef = useRef(null);
    const navbarProfileRef = useRef(null);
    const sidebarProfileRef = useRef(null);


    // Toggle une section du menu
    const toggleSection = (section) => {
        setExpandedSection(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
        // Supprime tout le reste - on garde juste le toggle simple
    };

    // Charge les notifications au montage
    const fetchNotifications = async () => {
        try {
            // Configuration avec credentials + token Bearer
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                withCredentials: true
            };

            // Ajouter le token Bearer si disponible
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            const res = await axios.get('/api/etudiant/notifications', config);
            setNotifications(res.data.data || []);
        } catch (error) {
            console.error('Erreur chargement notifications:', error);
        }
    };

    // Gère la déconnexion
    const handleLogout = () => {
        // Configuration avec credentials + token Bearer
        const config = {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            withCredentials: true
        };

        // Ajouter le token Bearer si disponible
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        axios.post('/logout', {}, config)
            .then(() => {
                window.location.href = '/login';
            })
            .catch((error) => {
                console.error('Erreur déconnexion:', error);
                window.location.href = '/login';
            });
    };
    // Ferme les dropdowns quand on clique à l'extérieur
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            // Ferme notifications
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            // Ferme dropdown navbar profile
            if (navbarProfileRef.current && !navbarProfileRef.current.contains(event.target)) {
                setShowNavbarProfile(false);
            }
            // Ferme dropdown sidebar profile
            if (sidebarProfileRef.current && !sidebarProfileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">

            {/* Overlay mobile - Ferme le menu au clic */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR - Style Notion */}
            <aside className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    bg-white border-r border-gray-200
                    transform transition-all duration-300 ease-in-out overflow-hidden
                    ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-64'}
                    ${!sidebarOpen && 'lg:w-0 lg:border-r-0'}
                    flex flex-col
                `}>
                {/* Logo Header */}
                <div className="h-12 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                            <GraduationCap className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 truncate whitespace-nowrap">CoursHub</span>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-gray-600 shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-3 px-2">
                    {/* Dashboard - Page d'accueil */}
                    <Link
                        href="/etudiant/dashboard"
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors mb-1 whitespace-nowrap ${url === '/etudiant/dashboard' || url?.startsWith('/etudiant/dashboard')
                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-100 font-medium'
                            }`}
                    >
                        <Home className="w-4 h-4 shrink-0" />
                        <span className="truncate">Dashboard</span>
                    </Link>

                    {/* Section Academic - Cours et Calendrier */}
                    <div className="mt-4">
                        <button
                            onClick={() => toggleSection('academic')}
                            className="flex items-center justify-between w-full px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors whitespace-nowrap"
                        >
                            <span>Academic</span>
                            <ChevronRight className={`w-3 h-3 transition-transform shrink-0 ${expandedSection.academic ? 'rotate-90' : ''}`} />
                        </button>
                        {expandedSection.academic && (
                            <div className="mt-1 space-y-0.5">
                                {/* Mes Cours */}
                                <Link
                                    href="/etudiant/mes-cours"
                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors pl-4 whitespace-nowrap ${url?.startsWith('/etudiant/mes-cours')
                                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <BookOpen className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="truncate">Mes Cours</span>
                                </Link>

                                {/* Calendrier */}
                                <Link
                                    href="/etudiant/calendrier"
                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors pl-4 whitespace-nowrap ${url?.startsWith('/etudiant/calendrier')
                                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="truncate">Calendrier</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Section Documents */}
                    <div className="mt-4">
                        <button
                            onClick={() => toggleSection('documents')}
                            className="flex items-center justify-between w-full px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors whitespace-nowrap"
                        >
                            <span>Documents</span>
                            <ChevronRight className={`w-3 h-3 transition-transform shrink-0 ${expandedSection.documents ? 'rotate-90' : ''}`} />
                        </button>
                        {expandedSection.documents && (
                            <div className="mt-1 space-y-0.5">
                                {/* Télécharger Vidéo */}
                                <Link
                                    href="/etudiant/telecharger-video"
                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors pl-4 whitespace-nowrap ${url?.startsWith('/etudiant/telecharger-video')
                                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="truncate">Télécharger Vidéo</span>
                                </Link>

                                {/* Télécharger PDF */}
                                <Link
                                    href="/etudiant/telecharger-pdf"
                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors pl-4 whitespace-nowrap ${url?.startsWith('/etudiant/telecharger-pdf')
                                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="truncate">Télécharger PDF</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Footer avec profil utilisateur */}
                <div className="border-t border-gray-200 p-2 shrink-0">
                    <div className="relative" ref={sidebarProfileRef}> 
                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap"
                        >
                            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white font-semibold text-xs shrink-0">
                                {auth?.user?.name?.charAt(0).toUpperCase() || 'É'}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{auth?.user?.name || 'Étudiant'}</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                        </button>

                        {/* Dropdown profil */}
                        {showProfile && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                                <Link
                                    href="/etudiant/profil"
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <User className="w-4 h-4" />
                                    <span>Mon Profil</span>
                                </Link>
                                <hr className="my-1 border-gray-100" />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Déconnexion</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Contenu principal */}
            <div className="flex-1 flex flex-col min-h-screen">

                {/* NAVBAR - Barre supérieure */}
                <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="h-12 px-4 flex items-center justify-between">

                        {/* Section gauche - Menu et recherche */}
                        <div className="flex items-center gap-3">
                            {/* Toggle sidebar desktop */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="hidden lg:block text-gray-500 hover:text-gray-700 p-1"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            {/* Toggle sidebar mobile */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            {/* Barre de recherche */}
                            <div className="hidden md:flex items-center">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 w-64 lg:w-96 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section droite - Notifications et profil */}
                        <div className="flex items-center gap-2 relative">
                            {/* Bouton notifications */}
                            <div ref={notificationsRef} className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative text-gray-500 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                                    title="Notifications"
                                >
                                    <Bell className="w-5 h-5" />
                                    {/* Indicateur de notification */}
                                    {notifications.length > 0 && (
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                    )}
                                </button>

                                {/* Dropdown notifications */}
                                {showNotifications && (
                                    <div className="absolute top-12 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                        <div className="p-4 border-b border-gray-100">
                                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500 text-sm">
                                                    Aucune notification
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div key={notif.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                        <p className="text-sm font-medium text-gray-900">{notif.titre}</p>
                                                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                                                        <p className="text-xs text-gray-400 mt-2">{new Date(notif.created_at).toLocaleString('fr-FR')}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Avatar utilisateur avec dropdown */}
                            <div className="relative" ref={navbarProfileRef}> 
                                <button
                                    onClick={() => setShowNavbarProfile(!showNavbarProfile)}
                                    className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                                    title="Mon Profil"
                                >
                                    <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white font-semibold text-xs">
                                        {auth?.user?.name?.charAt(0).toUpperCase() || 'É'}
                                    </div>
                                </button>

                                {/* Dropdown profil navbar */}
                                {showNavbarProfile && (
                                    <div className="absolute top-10 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 w-48">
                                        <Link
                                            href="/etudiant/profil"
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <User className="w-4 h-4" />
                                            <span>Mon Profil</span>
                                        </Link>
                                        <hr className="my-1 border-gray-100" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Déconnexion</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* CONTENU DE LA PAGE */}
                <main className="flex-1 overflow-auto bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        {/* Titre de la page avec nom de l'utilisateur */}
                        {title && (
                            <div className="mb-6">
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Bienvenue, {auth?.user?.name || 'Étudiant'}
                                </h1>
                            </div>
                        )}

                        {/* Contenu injecté (Dashboard, Cours, etc.) */}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}