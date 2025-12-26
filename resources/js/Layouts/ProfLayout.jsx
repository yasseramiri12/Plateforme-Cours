import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Menu, X, BookOpen, LayoutDashboard, FileText, LogOut, Bell, Search, ChevronDown, Users, Settings, User, GraduationCap, Calendar, BarChart, FolderOpen } from 'lucide-react';

/**
 * ProfLayout - Layout principal pour l'interface professeur
 * Gère la sidebar, navbar et le contenu principal
 * 
 * @param {ReactNode} children - Contenu de la page à afficher
 * @param {string} title - Titre de la page (optionnel)
 */
export default function ProfLayout({ children, title = 'Espace Professeur' }) {
    // Récupère les données de l'utilisateur et l'URL actuelle depuis Inertia
    const { auth, url } = usePage().props;

    // États pour gérer l'ouverture/fermeture des composants UI
    const [sidebarOpen, setSidebarOpen] = useState(true);        // Sidebar desktop
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Menu mobile
    const [showNotifications, setShowNotifications] = useState(false); // Dropdown notifications
    const [showProfile, setShowProfile] = useState(false);       // Dropdown profil

    // Configuration du menu de navigation principal
    const navigation = [
        {
            name: 'Tableau de bord',
            href: route('prof.dashboard'),  // Génère l'URL depuis les routes Laravel
            icon: LayoutDashboard,
            routeName: 'prof.dashboard'     // Nom de route pour détecter la page active
        },
        {
            name: 'Mes Cours',
            href: route('prof.courses'),
            icon: BookOpen,
            routeName: 'prof.courses'
        },
        {
            name: 'Groupes',
            href: route('prof.groupes'),
            icon: Users,
            routeName: 'prof.groupes'
        },
        {
            name: 'Documents',
            href: route('prof.documents'),
            icon: FolderOpen,
            routeName: 'prof.documents'
        },
    ];

    // Récupère le nom de la route actuelle (ex: "prof.dashboard")
    const currentRouteName = route().current();

    /**
     * Gère la déconnexion de l'utilisateur
     * Envoie une requête POST à /logout puis redirige vers la page d'accueil
     */
    const handleLogout = () => {
        axios.post('/logout').then(() => {
            window.location.href = '/login';
        }).catch(() => {
            window.location.href = '/login';
        });
    };

    /**
     * Vérifie si une route est active
     * Retourne true si:
     * - La route correspond exactement (prof.courses === prof.courses)
     * - C'est une sous-route (prof.courses.show commence par prof.courses)
     * 
     * @param {string} routeName - Nom de la route à vérifier
     * @returns {boolean}
     */
    const isRouteActive = (routeName) => {
        if (!currentRouteName) return false;
        return currentRouteName === routeName || currentRouteName.startsWith(routeName + '.');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-violet-50 flex font-sans text-gray-900">

            {/* Overlay sombre pour mobile - Ferme le menu quand on clique dessus */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR - Barre latérale de navigation */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-72 bg-white border-r border-gray-200
                transform transition-all duration-300 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${!sidebarOpen && 'lg:-translate-x-full lg:w-0'}
                flex flex-col shadow-2xl lg:shadow-none
            `}>
                {/* Header avec logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        {/* Logo avec icône de graduation */}
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-bold text-gray-900">CoursHub</span>
                    </div>
                    {/* Bouton fermer (mobile uniquement) */}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-gray-900 p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Menu de navigation - Itère sur le tableau navigation[] */}
                <nav className="flex-1 overflow-y-auto py-6 px-4">
                    <div className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = isRouteActive(item.routeName);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                                        transition-all duration-200
                                        ${isActive
                                            ? 'bg-gray-100 text-gray-900'  // Style actif
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'  // Style normal
                                        }
                                    `}
                                >
                                    {/* Icône - Change de couleur si actif */}
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Pied de page avec profil utilisateur */}
                <div className="border-t border-gray-200 p-4">
                    {/* Carte utilisateur */}
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 mb-3">
                        {/* Avatar avec initiale */}
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-md">
                            {auth?.user?.name?.charAt(0).toUpperCase() || 'T'}
                        </div>

                        {/* Infos utilisateur */}
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-semibold text-gray-900 truncate">{auth?.user?.name || 'Professeur'}</p>
                            <p className="text-xs text-gray-500">Enseignant</p>
                        </div>
                    </div>

                    {/* Boutons avec icônes uniquement */}
                    <div className="flex gap-2">
                        {/* Bouton Mon Profil - Icône seule */}
                        <Link
                            href={route('prof.profile')}
                            className="flex-1 flex items-center justify-center px-3 py-2 text-purple-600 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors border border-purple-200"
                            title="Mon Profil"
                        >
                            <User className="w-5 h-5" />
                        </Link>

                        {/* Bouton Déconnexion - Icône seule */}
                        <button
                            onClick={handleLogout}
                            className="flex-1 flex items-center justify-center px-3 py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors border border-rose-200"
                            title="Déconnexion"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Contenu principal */}
            <div className="flex-1 flex flex-col min-h-screen">

                {/* NAVBAR SUPÉRIEURE - Sticky en haut de la page */}
                <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                    <div className="h-16 px-4 flex items-center justify-between">

                        {/* Section gauche - Boutons menu et recherche */}
                        <div className="flex items-center gap-4">
                            {/* Toggle sidebar desktop */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="hidden lg:block text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            {/* Toggle sidebar mobile */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            {/* Barre de recherche - Cachée sur mobile */}
                            <div className="hidden md:flex items-center">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher..."
                                        className="pl-10 pr-4 py-2 w-64 lg:w-96 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section droite - Notifications et profil */}
                        <div className="flex items-center gap-3">

                            {/* Dropdown Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                                >
                                    <Bell className="w-5 h-5" />
                                    {/* Point rouge = notification non lue */}
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                                </button>

                                {/* Menu déroulant notifications */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                                                <p className="text-sm text-gray-800">Nouveau cours ajouté</p>
                                                <p className="text-xs text-gray-500 mt-1">Il y a 2 heures</p>
                                            </div>
                                            <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                                <p className="text-sm text-gray-800">Message reçu</p>
                                                <p className="text-xs text-gray-500 mt-1">Il y a 5 heures</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dropdown Profil utilisateur - Caché sur mobile */}
                            <div className="relative hidden sm:block">
                                <button
                                    onClick={() => setShowProfile(!showProfile)}
                                    className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs">
                                        {auth?.user?.name?.charAt(0).toUpperCase() || 'T'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 hidden lg:block">
                                        {auth?.user?.name || 'Professeur'}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                </button>

                                {/* Menu déroulant profil */}
                                {showProfile && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="font-semibold text-gray-800 text-sm">{auth?.user?.name || 'Professeur'}</p>
                                            <p className="text-xs text-gray-500">{auth?.user?.email || 'professeur@courshub.com'}</p>
                                        </div>
                                        <a href="/prof/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            <User className="w-4 h-4" />
                                            <span>Mon profil</span>
                                        </a>
                                        <hr className="my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-medium"
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

                {/* CONTENU DE LA PAGE - Affiche les children */}
                <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-purple-50 to-violet-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Affiche le titre si fourni */}
                        {title && (
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{title}</h1>
                            </div>
                        )}
                        {/* Contenu de la page (Dashboard, Cours, etc.) */}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}