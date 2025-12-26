/**
 * Page Mes Cours - Student Courses View
 * Modern LMS-style course listing with search, filtering, and progress tracking
 * 
 * Features:
 * - Real-time course fetching from Laravel API
 * - Search & type filtering with compact toolbar
 * - Progress indicators and completion badges
 * - Loading skeletons for better UX
 * - Read-only access (no edit/delete capabilities)
 * - Responsive grid layout (1 col mobile, 2 tablet, 3 desktop)
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentLayout from '@/Layouts/StudentLayout';
import { Search, BookOpen, Eye, Download, AlertCircle, ChevronRight, Filter } from 'lucide-react';

// Skeleton Loader Component
const CourseSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
        <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300" />
        <div className="p-6 -mt-12 relative">
            <div className="w-16 h-16 bg-gray-200 rounded-lg mb-3" />
            <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
            <div className="h-3 bg-gray-200 rounded mb-4 w-full" />
            <div className="h-2 bg-gray-200 rounded-full mb-4" />
            <div className="flex gap-2">
                <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            </div>
        </div>
    </div>
);

export default function MyCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [downloading, setDownloading] = useState({});

    // Fetch courses on component mount
    useEffect(() => {
        fetchCourses();
    }, []);

    // Fetch student courses from API
    const fetchCourses = async () => {
        try {
            setLoading(true);
            
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
            
            const res = await axios.get('/api/etudiant/mes-cours', config);
            setCourses(res.data.data || res.data);
            setError(null);
        } catch (e) {
            console.error('Error fetching courses:', e);
            if (e.response?.status === 401) {
                setError('Session expirée. Veuillez vous reconnecter.');
            } else if (e.response?.status === 403) {
                setError('Accès non autorisé à vos cours.');
            } else {
                setError('Impossible de charger les cours. Vérifiez votre connexion internet.');
            }
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    // View course document in new tab
    const handleView = async (courseId, titre, fichierUrl) => {
        try {
            // Open the file directly from its storage URL
            // The browser will handle PDF/video display natively
            if (fichierUrl) {
                // fichier_url is the full path like /storage/cours_files/xyz.pdf
                window.open(fichierUrl, '_blank');
            } else {
                alert('Aucun fichier associé à ce cours.');
            }
        } catch (e) {
            console.error('Erreur affichage document:', e);
            alert(`Impossible d'afficher le document: ${e.message}`);
        }
    };

    // Filter courses by search and type
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.titre.toLowerCase().includes(search.toLowerCase()) ||
                            (course.description || '').toLowerCase().includes(search.toLowerCase());
        const matchesFilter = typeFilter === 'all' || 
                            course.type_document.toLowerCase() === typeFilter.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    // Get type badge styling
    const getTypeBadge = (type) => {
        const badges = {
            COURS: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Cours', gradient: 'from-blue-500 to-blue-600' },
            TP: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Travaux Pratiques', gradient: 'from-orange-500 to-orange-600' },
            TD: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Travaux Dirigés', gradient: 'from-purple-500 to-purple-600' },
            VIDEO: { bg: 'bg-red-100', text: 'text-red-700', label: 'Vidéo', gradient: 'from-red-500 to-red-600' }
        };
        return badges[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: type, gradient: 'from-gray-500 to-gray-600' };
    };

    // Get gradient color for card header
    const getHeaderGradient = (type) => {
        const gradients = {
            VIDEO: 'from-red-500 via-red-400 to-rose-400',
            TP: 'from-orange-500 via-orange-400 to-amber-400',
            TD: 'from-purple-500 via-purple-400 to-violet-400',
            COURS: 'from-blue-500 via-blue-400 to-cyan-400'
        };
        return gradients[type] || 'from-indigo-500 via-indigo-400 to-blue-400';
    };

    // Simulate progress (in production, this would come from API)
    const getProgress = (index) => {
        return 40 + (index % 4) * 20;
    };

    /**
     * Télécharge un document de cours
     */
    const handleDownload = async (courseId, titre) => {
        try {
            setDownloading(prev => ({ ...prev, [courseId]: true }));
            
            // Lance le téléchargement
            const link = document.createElement('a');
            link.href = `/api/etudiant/cours/${courseId}/download`;
            link.setAttribute('download', `${titre}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error('Erreur téléchargement:', e);
            alert('Impossible de télécharger le document.');
        } finally {
            setDownloading(prev => ({ ...prev, [courseId]: false }));
        }
    };

    return (
        <StudentLayout title="Mes Cours">
            <div className="space-y-6">
                {/* Header avec filtres */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Mes Cours</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {filteredCourses.length} cours disponible{filteredCourses.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <button 
                            onClick={fetchCourses}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Actualiser
                        </button>
                    </div>

                    {/* Barre de recherche et filtres */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Recherche */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par titre ou description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Filtre par type */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white cursor-pointer"
                            >
                                <option value="all">Tous les types</option>
                                <option value="COURS">Cours</option>
                                <option value="TP">Travaux Pratiques</option>
                                <option value="TD">Travaux Dirigés</option>
                                <option value="VIDEO">Vidéos</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Messages d'état */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* État de chargement */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => <CourseSkeleton key={i} />)}
                    </div>
                ) : (
                    <>
                        {/* Aucun cours */}
                        {filteredCourses.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-gray-600 font-medium">
                                    {search || typeFilter !== 'all' 
                                        ? 'Aucun cours ne correspond à vos critères de recherche'
                                        : 'Aucun cours disponible pour le moment'}
                                </p>
                                {(search || typeFilter !== 'all') && (
                                    <button 
                                        onClick={() => {
                                            setSearch('');
                                            setTypeFilter('all');
                                        }}
                                        className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Grille de cours */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredCourses.map((course, index) => {
                                        const typeBadge = getTypeBadge(course.type_document);
                                        const progress = getProgress(index);
                                        
                                        return (
                                            <div 
                                                key={course.id_cours}
                                                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:border-indigo-300 flex flex-col"
                                            >
                                                {/* Header avec gradient */}
                                                <div className={`h-24 bg-gradient-to-br ${getHeaderGradient(course.type_document)}`} />

                                                {/* Contenu */}
                                                <div className="p-6 -mt-8 relative flex flex-col flex-1">
                                                    {/* Icône */}
                                                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br ${typeBadge.gradient}`}>
                                                        <BookOpen className="w-8 h-8 text-white" />
                                                    </div>

                                                    {/* Titre et description */}
                                                    <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">
                                                        {course.titre}
                                                    </h3>
                                                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                                        {course.description || 'Aucune description disponible'}
                                                    </p>

                                                    {/* Barre de progression */}
                                                    <div className="mb-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-medium text-gray-700">Progression</span>
                                                            <span className="text-xs font-semibold text-indigo-600">{progress}%</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all"
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Type badge */}
                                                    <div className="mb-3">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${typeBadge.bg} ${typeBadge.text}`}>
                                                            {typeBadge.label}
                                                        </span>
                                                    </div>

                                                    {/* Boutons d'action */}
                                                    <div className="flex gap-2 mt-auto">
                                                        <button 
                                                            onClick={() => handleDownload(course.id_cours, course.titre)}
                                                            disabled={downloading[course.id_cours]}
                                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors text-sm ${
                                                                downloading[course.id_cours]
                                                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                            }`}
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            {downloading[course.id_cours] ? 'Téléch...' : 'Télécharger'}
                                                        </button>
                                                        
                                                        <button 
                                                            onClick={() => handleView(course.id_cours, course.titre, course.fichier_url)}
                                                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                                            title="Afficher le document"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Statistiques */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total Cours', value: courses.length, icon: '📚' },
                                        { label: 'Cours', value: courses.filter(c => c.type_document === 'COURS').length, icon: '📖' },
                                        { label: 'TP', value: courses.filter(c => c.type_document === 'TP').length, icon: '🔬' },
                                        { label: 'Vidéos', value: courses.filter(c => c.type_document === 'VIDEO').length, icon: '🎥' }
                                    ].map((stat, idx) => (
                                        <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                                            <div className="text-2xl mb-2">{stat.icon}</div>
                                            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                            <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </StudentLayout>
    );
}
