import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePage, Link } from '@inertiajs/react';
import { 
    LayoutDashboard, Users, GraduationCap, School, BookOpen, LogOut,
    Menu, X, Bell, Search, Settings, ChevronDown, FileText, Video
} from 'lucide-react';

export default function AdminLayout({ children, title = 'Administration' }) {
    // Récupération simulée de l'utilisateur
    const { auth } = usePage().props;
    
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const navigation = [
        { name: 'Tableau de bord', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Utilisateurs', href: '/admin/users', icon: Users },
        { name: 'Filières', href: '/admin/filieres', icon: School },
        { name: 'Groupes', href: '/admin/groupes', icon: GraduationCap },
        { name: 'Modules', href: '/admin/modules', icon: BookOpen },
        { name: 'Documents', href: '/admin/documents', icon: FileText },
        { name: 'Vidéos', href: '/admin/videos', icon: Video },
    ];

    // Détection simplifiée de l'URL active pour la preview
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/admin/dashboard';

    // Charger les notifications
    const fetchNotifications = async () => {
        try {
            setLoadingNotifications(true);
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                withCredentials: true
            };
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            const res = await axios.get('/api/admin/cours/pending', config);
            const pendingCourses = res.data?.data || [];
            
            // Convertir les cours en notifications
            const notifs = pendingCourses.slice(0, 5).map(course => ({
                id: course.id_cours,
                titre: `Nouveau cours: ${course.titre}`,
                message: `Type: ${course.type_document}`,
                created_at: course.created_at
            }));
            
            setNotifications(notifs);
        } catch (error) {
            console.error('Erreur chargement notifications:', error);
            setNotifications([]);
        } finally {
            setLoadingNotifications(false);
        }
    };

    // Charger les notifications au montage
    useEffect(() => {
        fetchNotifications();
        // Actualiser les notifications toutes les 30 secondes
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        // Use Inertia's POST to logout
        axios.post('/logout').then(() => {
            window.location.href = '/login';
        }).catch(() => {
            window.location.href = '/login';
        });
    };

    // Stats fictives pour la sidebar
    const stats = [
        { label: 'Utilisateurs', value: '12', change: '+2', trend: 'up' },
        { label: 'Cours', value: '5', change: '+1', trend: 'up' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex font-sans text-gray-900">
            
            {/* OVERLAY MOBILE */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-72 bg-white border-r border-gray-200
                transform transition-transform duration-300 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${!sidebarOpen && 'lg:-translate-x-full lg:w-0'}
                flex flex-col shadow-xl lg:shadow-none overflow-hidden
            `}>
                {/* Header Sidebar */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                                <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-md flex items-center justify-center border border-white">
                                <span className="text-[10px] font-bold text-amber-900">A</span>
                            </div>
                        </div>
                        <div className={`${!sidebarOpen && 'hidden lg:block'}`}>
                            <span className="text-lg font-bold text-gray-800 block leading-tight">CoursHub</span>
                            <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Admin Panel</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
                    <div className="space-y-1">
                        {navigation.map((item) => {
                            // Logique simple pour "active state" dans la preview
                            const isActive = currentPath.includes(item.href) && item.href !== '#';
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                                        transition-all duration-200 relative overflow-hidden
                                        ${isActive 
                                            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-sm border border-emerald-100' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-r-full" />
                                    )}
                                    <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                    <span className="truncate">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Quick Stats Widget */}
                    <div className="mt-8 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 mx-1">
                        <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                            Activité
                        </h3>
                        <div className="space-y-3">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">{stat.label}</span>
                                    <span className="font-bold text-gray-900">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-default group mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                            {auth.user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{auth.user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{auth.user.email}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all duration-200"
                    >
                        <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* TOPBAR */}
                <header className="h-20 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
                    <div className="h-full px-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setMobileMenuOpen(true)}
                                className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="hidden lg:block p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="hidden md:block w-px h-6 bg-gray-300 mx-2"></div>
                            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden md:block relative mr-2">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Rechercher..." 
                                    className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-48 focus:w-64 transition-all"
                                />
                            </div>
                            
                            {/* Notifications Dropdown */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                                    title="Notifications"
                                >
                                    <Bell className="w-5 h-5" />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                                    )}
                                </button>

                                {/* Dropdown Content */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                                            <button
                                                onClick={() => setShowNotifications(false)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {loadingNotifications ? (
                                                <div className="p-4 text-center text-gray-500 text-sm">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                                                </div>
                                            ) : notifications.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500 text-sm">
                                                    Aucune notification
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div key={notif.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                                                        <p className="text-sm font-medium text-gray-900">{notif.titre}</p>
                                                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                                                        <p className="text-xs text-gray-400 mt-2">
                                                            {new Date(notif.created_at).toLocaleString('fr-FR')}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}