/**
 * Page Télécharger Vidéos - Affiche les vidéos disponibles pour téléchargement
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentLayout from '@/Layouts/StudentLayout';
import { Download, Play, AlertCircle, Search, Filter } from 'lucide-react';

export default function DownloadVideos() {
    const [videos, setVideos] = useState([]);
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [downloading, setDownloading] = useState({});

    // Charge les vidéos au montage
    useEffect(() => {
        fetchVideos();
    }, []);

    // Filtre les vidéos
    useEffect(() => {
        const filtered = videos.filter(video =>
            video.titre.toLowerCase().includes(search.toLowerCase()) ||
            (video.description || '').toLowerCase().includes(search.toLowerCase())
        );
        setFilteredVideos(filtered);
    }, [search, videos]);

    /**
     * Récupère les vidéos disponibles
     */
    const fetchVideos = async () => {
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
            
            // Filtre les vidéos
            const videosCourses = (res.data.data || []).filter(course => 
                course.type_document === 'VIDEO'
            );
            setVideos(videosCourses);
            setError(null);
        } catch (e) {
            console.error('Erreur chargement vidéos:', e);
            console.error('Response status:', e.response?.status);
            console.error('Response data:', e.response?.data);
            setError(`Impossible de charger les vidéos: ${e.response?.data?.message || e.message}`);
            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Télécharge une vidéo
     */
    const handleDownload = async (courseId, titre) => {
        try {
            setDownloading(prev => ({ ...prev, [courseId]: true }));
            
            // Configuration avec credentials + token Bearer
            const config = {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                withCredentials: true,
                responseType: 'blob',
                validateStatus: () => true // Accept all status codes
            };
            
            // Ajouter le token Bearer si disponible
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            
            // Télécharger le fichier avec axios pour gérer les headers d'authentification
            const res = await axios.get(`/api/etudiant/cours/${courseId}/download`, config);
            
            // Vérifier le code de statut
            if (res.status !== 200) {
                const contentType = res.headers['content-type'];
                if (contentType && contentType.includes('application/json')) {
                    const text = await res.data.text();
                    const error = JSON.parse(text);
                    throw new Error(error.message || `Erreur serveur (${res.status})`);
                }
                throw new Error(`Erreur serveur (${res.status}): Impossible de télécharger le fichier`);
            }
            
            // Vérifier le type de contenu
            const contentType = res.headers['content-type'];
            if (contentType && (contentType.includes('application/json') || contentType.includes('text/html'))) {
                const text = await res.data.text();
                const error = JSON.parse(text);
                throw new Error(error.message || 'Erreur serveur');
            }
            
            // Déterminer l'extension du fichier
            let fileName = titre;
            const contentDisposition = res.headers['content-disposition'];
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?([^"\n]+)"?/);
                if (fileNameMatch) {
                    fileName = fileNameMatch[1];
                }
            } else {
                fileName = `${titre}.mp4`;
            }
            
            // Créer un blob et déclencher le téléchargement
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
        } catch (e) {
            console.error('Erreur téléchargement:', e);
            alert('Impossible de télécharger la vidéo. Vérifiez votre accès.');
        } finally {
            setDownloading(prev => ({ ...prev, [courseId]: false }));
        }
    };

    return (
        <StudentLayout title="Télécharger Vidéos">
            <div className="max-w-6xl">
                {/* Header avec recherche */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Vidéos Disponibles</h2>
                    
                    <div className="flex gap-3">
                        {/* Barre de recherche */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une vidéo..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        
                        {/* Bouton actualiser */}
                        <button 
                            onClick={fetchVideos}
                            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Actualiser
                        </button>
                    </div>
                </div>

                {/* Messages d'état */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                        <p className="text-gray-600">Chargement des vidéos...</p>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2 mb-6">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {!loading && filteredVideos.length === 0 && !error && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Play className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-600">Aucune vidéo disponible</p>
                    </div>
                )}

                {/* Liste des vidéos */}
                {!loading && filteredVideos.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredVideos.map((video) => (
                            <div 
                                key={video.id_cours}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Thumbnail placeholder */}
                                <div className="w-full h-40 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center relative group">
                                    <Play className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>

                                {/* Contenu */}
                                <div className="p-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {video.titre}
                                    </h3>
                                    
                                    <p className="text-xs text-gray-600 mb-4 line-clamp-3">
                                        {video.description || 'Aucune description disponible'}
                                    </p>

                                    {/* Infos */}
                                    <div className="space-y-1 mb-4 text-xs text-gray-500">
                                        <div>Type: <span className="font-medium text-indigo-600">Vidéo</span></div>
                                        <div>
                                            Publié: <span className="font-medium">
                                                {new Date(video.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bouton télécharger */}
                                    <button
                                        onClick={() => handleDownload(video.id_cours, video.titre)}
                                        disabled={downloading[video.id_cours]}
                                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${
                                            downloading[video.id_cours]
                                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                    >
                                        <Download className="w-4 h-4" />
                                        {downloading[video.id_cours] ? 'Téléchargement...' : 'Télécharger'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Statistiques */}
                {!loading && filteredVideos.length > 0 && (
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                            <span className="font-semibold">{filteredVideos.length}</span> vidéo(s) trouvée(s)
                            {search && ` pour la recherche "${search}"`}
                        </p>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
