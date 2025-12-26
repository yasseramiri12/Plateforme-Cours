import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, BookOpen, CheckCircle, XCircle, Shield, 
    LayoutDashboard, School, LogOut, GraduationCap,
    Menu, X, Bell, Search, Settings, ChevronDown, FileText, Video
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ pending: 0, users: 0, modules: 0 });
    const [pendingCourses, setPendingCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState(null);

    // Chargement initial
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        const config = { 
            headers: { 
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json'
            },
            withCredentials: true
        };

        // Ajouter le token si disponible
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            // Récupérer les données réelles
            const [resPending, resUsers, resMod] = await Promise.all([
                axios.get('/api/admin/cours/pending', config),
                axios.get('/api/admin/users', config),
                axios.get('/api/admin/modules', config)
            ]);

            const pendingData = resPending?.data?.data || [];
            const usersData = resUsers?.data?.data || [];
            const modulesData = resMod?.data?.data || [];

            setPendingCourses(Array.isArray(pendingData) ? pendingData : []);
            setStats({
                pending: Array.isArray(pendingData) ? pendingData.length : 0,
                users: Array.isArray(usersData) ? usersData.length : 0,
                modules: Array.isArray(modulesData) ? modulesData.length : 0
            });

        } catch (error) {
            console.warn("Mode démo : API non accessible, utilisation de données fictives.");
            // Afficher des données de démo
            setPendingCourses([
                { 
                    id_cours: 1, 
                    titre: "Introduction à React", 
                    type_document: "COURS", 
                    created_at: "2024-01-25", 
                    fichier_url: "#",
                    groupes: [{ id_groupe: 1, nom_groupe: "L1 Informatique" }]
                },
                { 
                    id_cours: 2, 
                    titre: "TP Base de Données Avancées", 
                    type_document: "TP", 
                    created_at: "2024-01-26", 
                    fichier_url: "#",
                    groupes: [{ id_groupe: 2, nom_groupe: "L2 Gestion" }]
                }
            ]);
            setStats({ pending: 2, users: 15, modules: 8 });
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS COURS ---
    const handleValidateCourse = async (id) => {
        if (!confirm('Valider et publier ce cours ?')) return;
        
        const token = localStorage.getItem('auth_token');
        const config = { 
            headers: { 
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            withCredentials: true
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            await axios.patch(`/api/admin/cours/${id}/validate`, {}, config);
            
            // Mettre à jour l'état local
            setPendingCourses(prev => prev.filter(c => c.id_cours !== id));
            setStats(prev => ({ ...prev, pending: prev.pending - 1 }));
            
            // Afficher un message de succès
            setActionMessage({ type: 'success', text: 'Cours validé avec succès !' });
            setTimeout(() => setActionMessage(null), 3000);
            
            // Recharger les données après 1 seconde
            setTimeout(fetchDashboardData, 1000);
        } catch (e) {
            console.error('Erreur validation:', e);
            setActionMessage({ type: 'error', text: 'Erreur lors de la validation du cours.' });
            setTimeout(() => setActionMessage(null), 3000);
        }
    };

    const handleRejectCourse = async (id) => {
        if (!confirm('Supprimer ce cours définitivement ?')) return;
        
        const token = localStorage.getItem('auth_token');
        const config = { 
            headers: { 
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            withCredentials: true
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            await axios.delete(`/api/admin/cours/${id}/reject`, config);
            
            // Mettre à jour l'état local
            setPendingCourses(prev => prev.filter(c => c.id_cours !== id));
            setStats(prev => ({ ...prev, pending: prev.pending - 1 }));
            
            setActionMessage({ type: 'success', text: 'Cours supprimé avec succès !' });
            setTimeout(() => setActionMessage(null), 3000);
            
            // Recharger les données après 1 seconde
            setTimeout(fetchDashboardData, 1000);
        } catch (e) {
            console.error('Erreur suppression:', e);
            setActionMessage({ type: 'error', text: 'Erreur lors de la suppression du cours.' });
            setTimeout(() => setActionMessage(null), 3000);
        }
    };

    return (
        <AdminLayout title="Tableau de Bord">
            <div className="space-y-8">
                
                {/* Message d'action */}
                {actionMessage && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${
                        actionMessage.type === 'success' 
                            ? 'bg-green-50 border border-green-200 text-green-700' 
                            : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                        {actionMessage.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span>{actionMessage.text}</span>
                    </div>
                )}
                
                {/* 1. STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-medium text-gray-500">En attente de validation</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pending}</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                            <Shield className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Utilisateurs inscrits</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.users}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Modules actifs</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.modules}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                            <BookOpen className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* 2. SECTION VALIDATION */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-600" />
                            Cours à modérer
                        </h3>
                        {pendingCourses.length > 0 && (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                {pendingCourses.length} Nouveaux
                            </span>
                        )}
                    </div>
                    
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                            Chargement des données...
                        </div>
                    ) : (
                        <div className="p-6">
                            {pendingCourses.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                    <p className="text-gray-900 text-lg font-semibold">Tout est à jour !</p>
                                    <p className="text-gray-500 text-sm mt-1">Aucun nouveau cours à valider pour le moment.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {pendingCourses.map((course) => (
                                        <li key={course.id_cours} className="py-4 hover:bg-gray-50 transition-colors rounded-lg px-2 -mx-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <p className="text-base font-bold text-indigo-900 truncate">{course.titre}</p>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                                            course.type_document === 'VIDEO' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                            course.type_document === 'TP' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                            'bg-blue-50 text-blue-700 border-blue-200'
                                                        }`}>
                                                            {course.type_document}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span>{new Date(course.created_at).toLocaleDateString('fr-FR')}</span>
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" />
                                                            {course.groupes?.length > 0 ? course.groupes.map(g => g.nom_groupe).join(', ') : 'Non assigné'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {course.fichier_url && course.fichier_url !== '#' ? (
                                                        <a href={course.fichier_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                                            Aperçu
                                                        </a>
                                                    ) : (
                                                        <span className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-300 rounded-lg">
                                                            Sans fichier
                                                        </span>
                                                    )}
                                                    <button 
                                                        onClick={() => handleValidateCourse(course.id_cours)}
                                                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm hover:shadow transition-all flex items-center gap-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4" /> Valider
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRejectCourse(course.id_cours)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Rejeter"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
