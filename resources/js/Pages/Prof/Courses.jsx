/**
 * Page Mes Cours - Interface de gestion des cours du professeur
 * 
 * Fonctionnalités:
 * - Lister tous les cours créés par le professeur
 * - Créer de nouveaux cours (upload de fichier + assignation aux groupes)
 * - Modifier les cours existants
 * - Supprimer les cours (API réelle)
 * 
 * API Utilisées:
 * - GET /api/prof/cours: Lister les cours
 * - GET /api/prof/my-groupes: Lister les groupes disponibles
 * - POST /api/prof/cours: Créer un cours (FormData avec fichier)
 * - PUT /api/prof/cours/{id}: Modifier un cours
 * - DELETE /api/prof/cours/{id}: Supprimer un cours
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfLayout from '@/Layouts/ProfLayout';
import { Plus, Trash2, Edit2, Search, AlertCircle, Check, X, Loader, Eye, Download } from 'lucide-react';

/**
 * Composant Toast - Notification temporaire (succès, erreur, avertissement)
 */
const Toast = ({ message, type = 'success', onClose }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => { setIsVisible(false); onClose(); }, 300);
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!isVisible) return null;

    const configs = {
        success: { bg: 'bg-gradient-to-r from-emerald-500 to-teal-600', icon: Check, iconBg: 'bg-emerald-400' },
        error: { bg: 'bg-gradient-to-r from-red-500 to-rose-600', icon: AlertCircle, iconBg: 'bg-red-400' },
        warning: { bg: 'bg-gradient-to-r from-red-500 to-rose-600', icon: AlertCircle, iconBg: 'bg-red-400' },
    };

    const config = configs[type] || configs.success;
    const IconComponent = config.icon;

    return (
        <div className={`${config.bg} text-white rounded-xl shadow-2xl p-4 flex items-center gap-4 min-w-[320px] max-w-md transform transition-all duration-300 ease-out ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
            <div className={`${config.iconBg} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <IconComponent className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <p className="flex-1 font-medium text-sm">{message}</p>
            <button onClick={() => { setIsExiting(true); setTimeout(onClose, 300); }} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const ToastContainer = ({ toasts, removeToast }) => (
    <div className="fixed top-6 right-6 z-[9999] space-y-3">
        {toasts.map(toast => <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />)}
    </div>
);

export default function CoursesPage() {
    // État principal
    const [courses, setCourses] = useState([]);
    const [groupes, setGroupes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [toasts, setToasts] = useState([]);

    // Affiche une notification temporaire
    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };
    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Données du formulaire
    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        fichier: null,
        groupes: [],
        type_document: 'COURS'
    });

    // Charge les données au montage du composant
    useEffect(() => {
        fetchCourses();
        fetchGroupes();
    }, []);

    // Récupère les cours du professeur depuis l'API
    const fetchCourses = async () => {
        const token = localStorage.getItem('auth_token');
        try {
            const res = await axios.get('http://localhost:8000/api/prof/cours', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data.data || res.data);
            setError(null);
        } catch (e) {
            console.error('Erreur chargement cours:', e);
            setError("Impossible de charger les cours.");
            setCourses([]); // Pas de mock data
        } finally {
            setLoading(false);
        }
    };

    // Récupère les groupes disponibles depuis l'API
    const fetchGroupes = async () => {
        const token = localStorage.getItem('auth_token');
        try {
            const res = await axios.get('http://localhost:8000/api/prof/my-groupes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroupes(res.data.data || res.data);
        } catch (e) {
            console.error('Erreur chargement groupes:', e);
            setGroupes([]);
        }
    };

    // Gère la suppression d'un cours
    const handleDelete = async (id) => {
        const token = localStorage.getItem('auth_token');
        try {
            const previousCourses = [...courses];
            setCourses(courses.filter(c => c.id_cours !== id));

            await axios.delete(`http://localhost:8000/api/prof/cours/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const courseName = previousCourses.find(c => c.id_cours === id)?.titre;
            showToast(`Cours "${courseName}" supprimé`, 'warning');
        } catch (e) {
            fetchCourses();
            showToast(e.response?.data?.message || 'Erreur lors de la suppression', 'error');
        }
    };

    // Gère les changements des champs du formulaire
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Gère la sélection d'un fichier
    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, fichier: e.target.files[0] }));
    };

    // Gère le changement de sélection des groupes (multi-select)
    const handleGroupeChange = (idGroupe) => {
        setFormData(prev => ({
            ...prev,
            groupes: prev.groupes.includes(idGroupe)
                ? prev.groupes.filter(g => g !== idGroupe)
                : [...prev.groupes, idGroupe]
        }));
    };

    // Envoie le formulaire pour créer ou modifier un cours
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        const token = localStorage.getItem('auth_token');

        try {
            const submitData = new FormData();
            submitData.append('titre', formData.titre);
            submitData.append('description', formData.description);
            submitData.append('type_document', formData.type_document);

            if (formData.fichier) {
                submitData.append('fichier', formData.fichier);
            }

            // Ajoute les IDs des groupes sélectionnés
            formData.groupes.forEach(g => submitData.append('groupes[]', g));

            if (editingId) {
                await axios.post(`http://localhost:8000/api/prof/cours/${editingId}?_method=PUT`, submitData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                showToast('Cours modifié avec succès !', 'success');
            } else {
                await axios.post('http://localhost:8000/api/prof/cours', submitData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                showToast('Cours créé avec succès !', 'success');
            }

            resetForm();
            fetchCourses();
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || "Erreur lors de l'opération.");
            showToast(error.response?.data?.message || 'Erreur', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Réinitialise le formulaire aux valeurs par défaut
    const resetForm = () => {
        setFormData({ titre: '', description: '', fichier: null, groupes: [], type_document: 'COURS' });
        setEditingId(null);
        setIsModalOpen(false);
    };

    // Charge les données du cours à modifier dans le formulaire
    const handleEdit = (course) => {
        setFormData({
            titre: course.titre || '',
            description: course.description || '',
            fichier: null,
            type_document: course.type_document || 'COURS',
            groupes: course.groupes?.map(g => g.id_groupe) || []
        });
        setEditingId(course.id_cours);
        setIsModalOpen(true);
    };

    const filteredCourses = courses.filter(c =>
        (c.titre || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ProfLayout title="Mes Cours">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un cours..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2.5 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none"
                        />
                    </div>
                    <button
                        onClick={() => { setError(null); resetForm(); setIsModalOpen(true); }}
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5 duration-200 w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-4 h-4" /> Nouveau Cours
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between text-sm animate-pulse">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        Chargement des données...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Titre</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">État</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCourses.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500 italic">
                                            Aucun cours trouvé.
                                        </td>
                                    </tr>
                                ) : filteredCourses.map((course) => (
                                    <tr key={course.id_cours} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm mr-4 shadow-sm group-hover:shadow-md transition-shadow">
                                                    {(course.titre || '').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-sm font-semibold text-gray-900">{course.titre}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${course.type_document === 'VIDEO' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    course.type_document === 'TP' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                {course.type_document}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {course.est_valide ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <Check className="w-3 h-3" /> Validé
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <AlertCircle className="w-3 h-3" /> En attente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                                            <a
                                                href={course.fichier_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-all duration-200"
                                                title="Voir"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => handleEdit(course)}
                                                className="text-gray-400 hover:text-emerald-600 p-2 hover:bg-emerald-50 rounded-full transition-all duration-200"
                                                title="Modifier"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course.id_cours)}
                                                className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all duration-200"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-gray-100">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
                                    <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                                        {editingId ? 'Modifier le Cours' : 'Créer un nouveau cours'}
                                    </h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre du Cours</label>
                                        <input required type="text" name="titre" value={formData.titre} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2.5 transition-shadow" placeholder="ex. Introduction à Python" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea rows="3" name="description" value={formData.description} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2.5 transition-shadow resize-none" placeholder="Description du cours..." />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fichier du Cours {!editingId && <span className="text-red-500">*</span>}</label>
                                        <input type="file" onChange={handleFileChange} required={!editingId} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2.5 transition-shadow" />
                                        <p className="text-xs text-gray-500 mt-1">Max 20 MB</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de Document</label>
                                        <select name="type_document" value={formData.type_document} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2.5 transition-shadow">
                                            <option value="COURS">Cours</option>
                                            <option value="TP">TP</option>
                                            <option value="TD">TD</option>
                                            <option value="VIDEO">Vidéo</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Groupes (sélectionnez au moins un)</label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                                            {groupes.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic">Aucun groupe disponible</p>
                                            ) : (
                                                groupes.map(groupe => (
                                                    <label key={groupe.id_groupe} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.groupes.includes(groupe.id_groupe)}
                                                            onChange={() => handleGroupeChange(groupe.id_groupe)}
                                                            className="rounded"
                                                        />
                                                        <span className="text-sm text-gray-700">{groupe.nom_groupe}</span>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                        {formData.groupes.length > 0 && (
                                            <p className="text-xs text-green-600 mt-2">✓ {formData.groupes.length} groupe(s) sélectionné(s)</p>
                                        )}
                                    </div>

                                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 mt-6">
                                        <button
                                            type="button"
                                            className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting || formData.groupes.length === 0}
                                            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white ${submitting || formData.groupes.length === 0 ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                                        >
                                            {submitting ? (
                                                <span className="flex items-center"><Loader className="animate-spin -ml-1 mr-2 h-4 w-4" /> {editingId ? 'Modification...' : 'Création...'}</span>
                                            ) : (
                                                <span className="flex items-center"><Check className="-ml-1 mr-2 h-4 w-4" /> {editingId ? 'Modifier' : 'Créer le cours'}</span>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ProfLayout>
    );
}
