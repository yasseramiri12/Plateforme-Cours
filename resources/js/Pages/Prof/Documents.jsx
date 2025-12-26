/**
 * Page Documents - Vue alternative affichant les fichiers des cours
 * 
 * Fonctionnalités:
 * - Lister tous les documents/fichiers des cours
 * - Voir le statut de validation de chaque document
 * - Consulter/Télécharger les fichiers
 * - Supprimer des documents
 * 
 * Note: Les documents sont créés via les cours (/api/prof/cours)
 * Cette page est une vue de lecture des fichiers existants
 * 
 * API Utilisée:
 * - GET /api/prof/cours: Récupérer les cours (contient les fichiers)
 * - DELETE /api/prof/cours/{id}: Supprimer un cours (et son fichier)
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfLayout from '@/Layouts/ProfLayout';
import { Plus, Trash2, Download, Eye, FileText, AlertCircle, Loader, X, Check } from 'lucide-react';

/**
 * Page Documents - Affiche les documents (fichiers) des cours du professeur
 * Les documents font partie des cours, cette page est une vue alternative
 */
export default function Documents() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    // Charge les documents au montage
    useEffect(() => {
        fetchDocuments();
    }, []);

    // Récupère les cours qui contiennent les documents
    const fetchDocuments = async () => {
        const token = localStorage.getItem('auth_token');
        try {
            const res = await axios.get('http://localhost:8000/api/prof/cours', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const courses = res.data.data || res.data;
            
            // Transforme les cours en documents pour affichage
            const docs = courses.map(course => ({
                id_cours: course.id_cours,
                name: course.titre,
                type: course.type_document?.toLowerCase() || 'cours',
                uploadedAt: course.created_at?.split('T')[0] || '',
                fichier_url: course.fichier_url,
                est_valide: course.est_valide
            }));
            
            setDocuments(docs);
            setError(null);
        } catch (e) {
            console.error('Erreur chargement documents:', e);
            setError("Impossible de charger les documents.");
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    // Supprime un document (cours)
    const handleDelete = async (id) => {
        const token = localStorage.getItem('auth_token');
        try {
            const previousDocs = [...documents];
            setDocuments(documents.filter(d => d.id_cours !== id));
            
            await axios.delete(`http://localhost:8000/api/prof/cours/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (e) {
            fetchDocuments();
            setError("Erreur lors de la suppression du document.");
        }
    };

    // Détermine la couleur selon le type de fichier
    const getTypeColor = (type) => {
        const colors = {
            video: 'text-red-600 bg-red-50',
            td: 'text-blue-600 bg-blue-50',
            tp: 'text-orange-600 bg-orange-50',
            cours: 'text-green-600 bg-green-50'
        };
        return colors[type] || 'text-gray-600 bg-gray-50';
    };

    const filteredDocuments = documents.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ProfLayout title="Documents">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Mes Documents</h2>
                        <p className="text-gray-600 mt-1">Voir tous les fichiers de vos cours</p>
                    </div>
                </div>

                {/* Erreur */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2 text-sm">
                        <AlertCircle className="w-5 h-5" /> 
                        <span>{error}</span>
                    </div>
                )}

                {/* Recherche */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Rechercher un document..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>

                {/* Tableau Documents */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        Chargement des documents...
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fichier</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ajouté le</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">État</th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredDocuments.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500 italic">
                                            Aucun document trouvé
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDocuments.map((doc) => (
                                        <tr key={doc.id_cours} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(doc.type)}`}>
                                                        <span className="text-xs font-bold uppercase">{doc.type.substring(0, 2)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 max-w-xs truncate">{doc.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <span className="capitalize">{doc.type}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{doc.uploadedAt}</td>
                                            <td className="px-6 py-4">
                                                {doc.est_valide ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <Check className="w-3 h-3" /> Validé
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <AlertCircle className="w-3 h-3" /> En attente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a
                                                        href={doc.fichier_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                        title="Voir"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(doc.id_cours)}
                                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </ProfLayout>
    );
}
