import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
  Play, 
  Plus, 
  Trash2, 
  Edit2, 
  Search,
  AlertCircle,
  Check,
  X,
  Loader,
  Eye
} from 'lucide-react';

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
        warning: { bg: 'bg-gradient-to-r from-amber-500 to-orange-600', icon: AlertCircle, iconBg: 'bg-amber-400' },
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

export default function VideosPage() {
    // États pour les données
    const [videos, setVideos] = useState([]);
    
    // États d'interface
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const [toasts, setToasts] = useState([]);
    const showToast = (message, type = 'success') => { const id = Date.now(); setToasts(prev => [...prev, { id, message, type }]); };
    const removeToast = (id) => { setToasts(prev => prev.filter(toast => toast.id !== id)); };
    
    // État du formulaire
    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        lien_video: '',
        duree: '',
        categorie: 'COURS'
    });

    // Chargement initial
    useEffect(() => { 
        fetchVideos(); 
    }, []);

    // 1. Récupérer les vidéos
    const fetchVideos = async () => {
        const token = localStorage.getItem('auth_token');
        try {
            const res = await axios.get('http://localhost:8000/api/admin/videos', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setVideos(res.data.data || res.data);
            setError(null);
        } catch (e) { 
            console.error(e);
            setError("Impossible de charger les vidéos.");
        } finally { 
            setLoading(false); 
        }
    };

    // 2. Supprimer une vidéo
    const handleDelete = async (id) => {
        const token = localStorage.getItem('auth_token');
        try {
            const previousVideos = [...videos];
            setVideos(videos.filter(v => v.id_video !== id && v.id !== id));

            await axios.delete(`http://localhost:8000/api/admin/videos/${id}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            const videoName = previousVideos.find(v => v.id_video === id || v.id === id)?.titre;
            showToast(`Vidéo ${videoName || ''} supprimée`, 'warning');
        } catch (e) { 
            fetchVideos(); 
            showToast(e.response?.data?.message || 'Erreur lors de la suppression', 'error');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. Créer ou modifier une vidéo
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        const token = localStorage.getItem('auth_token');

        try {
            if (editingId) {
                // Modification
                await axios.put(`http://localhost:8000/api/admin/videos/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showToast('Vidéo modifiée avec succès !', 'success');
            } else {
                // Création
                await axios.post('http://localhost:8000/api/admin/videos', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showToast('Vidéo créée avec succès !', 'success');
            }
            
            resetForm();
            fetchVideos();
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || "Erreur lors de l'opération.");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({ titre: '', description: '', lien_video: '', duree: '', categorie: 'COURS' });
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleEdit = (video) => {
        setFormData({
            titre: video.titre || '',
            description: video.description || '',
            lien_video: video.lien_video || '',
            duree: video.duree || '',
            categorie: video.categorie || 'COURS'
        });
        setEditingId(video.id_video || video.id);
        setIsModalOpen(true);
    };

    // Filtrage dynamique
    const filteredVideos = videos.filter(v => 
        (v.titre || '').toLowerCase().includes(search.toLowerCase()) || 
        (v.categorie || '').toLowerCase().includes(search.toLowerCase())
    );

    const getCategoryColor = (cat) => {
        switch(cat) {
            case 'COURS': return 'bg-pink-50 text-pink-700 border-pink-200';
            case 'TUTORIEL': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'CONFERENCE': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'DEMONSTRATION': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const formatDuration = (duree) => {
        if (!duree) return '-';
        if (typeof duree === 'number') {
            const minutes = Math.floor(duree / 60);
            const seconds = duree % 60;
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        return duree;
    };

    return (
        <AdminLayout title="Gestion des Vidéos">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                
                {/* En-tête de liste */}
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher une vidéo..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2.5 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm outline-none"
                        />
                    </div>
                    <button 
                        onClick={() => { setError(null); resetForm(); setIsModalOpen(true); }}
                        className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-emerald-700 transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5 duration-200 w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-4 h-4" /> Nouvelle Vidéo
                    </button>
                </div>

                {/* Zone d'affichage des erreurs */}
                {error && (
                    <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between text-sm animate-pulse">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> 
                            <span>{error}</span>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4"/></button>
                    </div>
                )}

                {/* Tableau */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-2"></div>
                        Chargement des données...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Titre</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Catégorie</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Durée</th>
                                    <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Lien</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredVideos.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500 italic">
                                            Aucune vidéo trouvée.
                                        </td>
                                    </tr>
                                ) : filteredVideos.map((v) => (
                                    <tr key={v.id_video || v.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm mr-4 shadow-sm group-hover:shadow-md transition-shadow">
                                                    <Play className="w-5 h-5" />
                                                </div>
                                                <div className="text-sm font-semibold text-gray-900">{v.titre}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getCategoryColor(v.categorie)}`}>
                                                {v.categorie}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {v.description || <span className="italic text-gray-400">Aucune description</span>}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-semibold border border-yellow-200">
                                                {formatDuration(v.duree)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {v.lien_video ? (
                                                <a 
                                                    href={v.lien_video} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Regarder
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Pas de lien</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                                            <button 
                                                onClick={() => handleEdit(v)} 
                                                className="text-gray-400 hover:text-emerald-600 p-2 hover:bg-emerald-50 rounded-full transition-all duration-200"
                                                title="Modifier"
                                            >
                                                <Edit2 className="w-4 h-4"/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(v.id_video || v.id)} 
                                                className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all duration-200"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODALE DE CRÉATION/ÉDITION */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Overlay */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                        {/* Contenu Modale */}
                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-gray-100">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
                                    <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                                        {editingId ? 'Modifier la Vidéo' : 'Créer une nouvelle vidéo'}
                                    </h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                                        <input required type="text" name="titre" value={formData.titre} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border p-2.5 transition-shadow" placeholder="ex. Introduction to Web Development" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                                        <select required name="categorie" value={formData.categorie} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border p-2.5 transition-shadow">
                                            <option value="COURS">Cours</option>
                                            <option value="TUTORIEL">Tutoriel</option>
                                            <option value="CONFERENCE">Conférence</option>
                                            <option value="DEMONSTRATION">Démonstration</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea rows="3" name="description" value={formData.description} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border p-2.5 transition-shadow resize-none" placeholder="Brève description de la vidéo..." />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Durée (secondes)</label>
                                            <input type="number" name="duree" value={formData.duree} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border p-2.5 transition-shadow" placeholder="600" min="0" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Lien YouTube/Vidéo</label>
                                            <input type="url" name="lien_video" value={formData.lien_video} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border p-2.5 transition-shadow" placeholder="https://..." />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 mt-6">
                                        <button
                                            type="button"
                                            className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white ${submitting ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors`}
                                        >
                                            {submitting ? (
                                                <span className="flex items-center"><Loader className="animate-spin -ml-1 mr-2 h-4 w-4" /> {editingId ? 'Modification...' : 'Création...'}</span>
                                            ) : (
                                                <span className="flex items-center"><Check className="-ml-1 mr-2 h-4 w-4" /> {editingId ? 'Modifier' : 'Créer la vidéo'}</span>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
