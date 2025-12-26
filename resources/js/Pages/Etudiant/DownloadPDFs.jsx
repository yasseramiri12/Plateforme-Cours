/**
 * Page Télécharger PDFs - Affiche les PDFs disponibles pour téléchargement
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentLayout from '@/Layouts/StudentLayout';
import { Download, FileText, AlertCircle, Search } from 'lucide-react';

export default function DownloadPDFs() {
    const [pdfs, setPdfs] = useState([]);
    const [filteredPdfs, setFilteredPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [downloading, setDownloading] = useState({});

    // Charge les PDFs au montage
    useEffect(() => {
        fetchPDFs();
    }, []);

    // Filtre les PDFs
    useEffect(() => {
        const filtered = pdfs.filter(pdf =>
            pdf.titre.toLowerCase().includes(search.toLowerCase()) ||
            (pdf.description || '').toLowerCase().includes(search.toLowerCase())
        );
        setFilteredPdfs(filtered);
    }, [search, pdfs]);

    /**
     * Récupère les PDFs disponibles
     */
    const fetchPDFs = async () => {
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
            
            // Filtre les PDFs (COURS, TP, TD généralement en PDF)
            const pdfsCourses = (res.data.data || []).filter(course => 
                ['COURS', 'TP', 'TD'].includes(course.type_document)
            );
            setPdfs(pdfsCourses);
            setError(null);
        } catch (e) {
            console.error('Erreur chargement PDFs:', e);
            console.error('Response status:', e.response?.status);
            console.error('Response data:', e.response?.data);
            setError(`Impossible de charger les documents: ${e.response?.data?.message || e.message}`);
            setPdfs([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Télécharge un PDF
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
                fileName = `${titre}.pdf`;
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
            console.error('Response status:', e.response?.status);
            console.error('Response headers:', e.response?.headers);
            console.error('Response data:', e.response?.data);
            const errorMsg = e.response?.data?.message || e.message || 'Erreur inconnue';
            alert(`Impossible de télécharger le document. ${errorMsg}`);
            setPdfs([]);
        } finally {
            setDownloading(prev => ({ ...prev, [courseId]: false }));
        }
    };

    /**
     * Obtient le badge de type
     */
    const getTypeBadge = (type) => {
        const badges = {
            COURS: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Cours' },
            TP: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Travaux Pratiques' },
            TD: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Travaux Dirigés' }
        };
        return badges[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: type };
    };

    /**
     * Obtient la couleur du gradient
     */
    const getGradient = (type) => {
        const gradients = {
            COURS: 'from-blue-500 to-blue-600',
            TP: 'from-orange-500 to-orange-600',
            TD: 'from-purple-500 to-purple-600'
        };
        return gradients[type] || 'from-indigo-500 to-indigo-600';
    };

    return (
        <StudentLayout title="Télécharger PDFs">
            <div className="max-w-6xl">
                {/* Header avec recherche */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Documents Disponibles</h2>
                    
                    <div className="flex gap-3">
                        {/* Barre de recherche */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un document..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        
                        {/* Bouton actualiser */}
                        <button 
                            onClick={fetchPDFs}
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
                        <p className="text-gray-600">Chargement des documents...</p>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2 mb-6">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {!loading && filteredPdfs.length === 0 && !error && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-600">Aucun document disponible</p>
                    </div>
                )}

                {/* Liste des PDFs */}
                {!loading && filteredPdfs.length > 0 && (
                    <div className="space-y-3">
                        {filteredPdfs.map((pdf) => {
                            const typeBadge = getTypeBadge(pdf.type_document);
                            return (
                                <div 
                                    key={pdf.id_cours}
                                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${getGradient(pdf.type_document)}`}>
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>

                                        {/* Contenu */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <h3 className="text-base font-semibold text-gray-900">
                                                        {pdf.titre}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                        {pdf.description || 'Aucune description disponible'}
                                                    </p>
                                                </div>
                                                
                                                {/* Bouton télécharger */}
                                                <button
                                                    onClick={() => handleDownload(pdf.id_cours, pdf.titre)}
                                                    disabled={downloading[pdf.id_cours]}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 flex-shrink-0 whitespace-nowrap ${
                                                        downloading[pdf.id_cours]
                                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                    }`}
                                                >
                                                    <Download className="w-4 h-4" />
                                                    {downloading[pdf.id_cours] ? 'Téléch...' : 'Télécharger'}
                                                </button>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex items-center gap-2 flex-wrap mt-3">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeBadge.bg} ${typeBadge.text}`}>
                                                    {typeBadge.label}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Publié le {new Date(pdf.created_at).toLocaleDateString('fr-FR')}
                                                </span>
                                                {pdf.est_valide && (
                                                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                                                        ✓ Validé
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Statistiques */}
                {!loading && filteredPdfs.length > 0 && (
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                            <span className="font-semibold">{filteredPdfs.length}</span> document(s) trouvé(s)
                            {search && ` pour la recherche "${search}"`}
                        </p>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
