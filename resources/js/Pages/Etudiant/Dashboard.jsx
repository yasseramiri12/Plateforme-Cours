/**
 * Page Dashboard Étudiant - Affiche les statistiques et cours récents
 * - Crédits complétés
 * - Moyenne générale (GPA)
 * - Cours actifs
 * - Horaire du jour
 */
import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import StudentLayout from '@/Layouts/StudentLayout';
import { Award, TrendingUp, BookMarked, Clock, User, BookOpen, AlertCircle, Download } from 'lucide-react';

export default function Dashboard() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        creditsCompleted: 120,
        totalCredits: 144,
        gpa: 3.75,
        maxGpa: 4.0,
        activeCourses: 0
    });

    // Charge les données au montage du composant
    useEffect(() => {
        fetchCourses();
    }, []);

    /**
     * Récupère les cours disponibles de l'étudiant
     * Utilise axios avec les credentials de session Laravel
     */
    const fetchCourses = async () => {
        try {
            setLoading(true);

            // Configuration des headers
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            };

            // Récupère le token JWT du localStorage si disponible
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Utilise l'API endpoint au lieu de la route web
            const res = await axios.get('/api/etudiant/mes-cours', config);
            
            const coursesData = res.data.data || res.data.cours || res.data;
            
            // Vérifie si c'est un tableau
            if (Array.isArray(coursesData)) {
                setCourses(coursesData.slice(0, 3)); // Affiche les 3 premiers cours
                
                // Mise à jour des statistiques
                setStats(prev => ({
                    ...prev,
                    activeCourses: coursesData.length
                }));
            } else {
                console.error('Format de données inattendu:', coursesData);
                setCourses([]);
            }
            
            setError(null);
        } catch (e) {
            console.error('Erreur chargement cours:', e);
            
            if (e.response?.status === 401 || e.response?.status === 403) {
                setError("Session expirée. Veuillez vous reconnecter.");
                // Redirection vers login après 2 secondes
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else if (e.response?.status === 404) {
                setError("Aucun cours trouvé.");
                // Afficher des données fictives pour la démo
                setCourses([
                    { id_cours: 1, titre: 'Introduction à React', type_document: 'COURS', created_at: '2024-01-15' },
                    { id_cours: 2, titre: 'Bases de Données SQL', type_document: 'TP', created_at: '2024-01-20' },
                    { id_cours: 3, titre: 'Web Design', type_document: 'COURS', created_at: '2024-01-25' }
                ]);
            } else {
                setError("Impossible de charger les cours. Vérifiez votre connexion.");
            }
            
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Télécharge un document de cours
     * @param {number} courseId - ID du cours
     */
    const handleDownload = async (courseId) => {
        try {
            // Redirection vers l'endpoint de téléchargement
            window.location.href = `/api/etudiant/cours/${courseId}/download`;
        } catch (e) {
            console.error('Erreur téléchargement:', e);
            alert('Impossible de télécharger le document.');
        }
    };

    return (
        <StudentLayout title="Dashboard">
            <div className="space-y-8">
                
                {/* Message d'erreur */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Crédits complétés</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.creditsCompleted}/{stats.totalCredits}</p>
                            </div>
                            <Award className="w-8 h-8 text-amber-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Moyenne générale</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.gpa}/{stats.maxGpa}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Cours actifs</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeCourses}</p>
                            </div>
                            <BookMarked className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Classe</p>
                                <p className="text-2xl font-bold text-gray-900">Gr. 1</p>
                            </div>
                            <User className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Cours récents */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            Cours récents
                        </h2>
                        <a href="/etudiant/mes-cours" className="text-sm text-blue-600 hover:text-blue-700">
                            Voir tous →
                        </a>
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">
                            <div className="animate-spin mx-auto mb-3 w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                            <p>Chargement des cours...</p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="bg-white rounded-lg p-8 text-center text-gray-500 border border-gray-200">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Aucun cours disponible</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {courses.map((course) => (
                                <div key={course.id_cours} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                                            {course.titre?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{course.titre}</p>
                                            <p className="text-sm text-gray-500">{course.type_document || 'COURS'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDownload(course.id_cours)}
                                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Télécharger
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Horaire du jour */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-600" />
                        Horaire d'aujourd'hui
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                            <div>
                                <p className="font-semibold text-gray-900">Programmation Python</p>
                                <p className="text-sm text-gray-500">08:00 - 10:00</p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">En cours</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                            <div>
                                <p className="font-semibold text-gray-900">Bases de Données</p>
                                <p className="text-sm text-gray-500">10:30 - 12:30</p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">À venir</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="font-semibold text-gray-900">Algèbre Linéaire</p>
                                <p className="text-sm text-gray-500">14:00 - 16:00</p>
                            </div>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">Plus tard</span>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
