import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit2, 
  Search,
  AlertCircle,
  Check,
  X,
  Loader
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

export default function ModulesPage() {
    // États pour les données
    const [modules, setModules] = useState([]);
    
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
        nom_module: '',
        code_module: '',
        description: '',
        credit: ''
    });

    // Chargement initial
    useEffect(() => { 
        fetchModules(); 
    }, []);

    // 1. Récupérer les modules
    const fetchModules = async () => {
        const token = localStorage.getItem('auth_token');
        try {
            const res = await axios.get('http://localhost:8000/api/admin/modules', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setModules(res.data.data || res.data);
            setError(null);
        } catch (e) { 
            console.error(e);
            setError("Impossible de charger les modules.");
        } finally { 
            setLoading(false); 
        }
    };

    // 2. Supprimer un module
    const handleDelete = async (id) => {
        const token = localStorage.getItem('auth_token');
        try {
            const previousModules = [...modules];
            setModules(modules.filter(m => m.id_module !== id));

            await axios.delete(`http://localhost:8000/api/admin/modules/${id}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            const moduleName = previousModules.find(m => m.id_module === id)?.nom_module;
            showToast(`Module ${moduleName || ''} supprimé`, 'warning');
        } catch (e) { 
            fetchModules(); 
            showToast(e.response?.data?.message || 'Erreur lors de la suppression', 'error');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. Créer ou modifier un module
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        const token = localStorage.getItem('auth_token');

        try {
            if (editingId) {
                // Modification
                await axios.put(`http://localhost:8000/api/admin/modules/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showToast('Module modifié avec succès !', 'success');
            } else {
                // Création
                await axios.post('http://localhost:8000/api/admin/modules', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showToast('Module créé avec succès !', 'success');
            }
            
            resetForm();
            fetchModules();
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || "Erreur lors de l'opération.");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({ nom_module: '', code_module: '', description: '', credit: '' });
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleEdit = (module) => {
        setFormData({
            nom_module: module.nom_module || '',
            code_module: module.code_module || '',
            description: module.description || '',
            credit: module.credit || ''
        });
        setEditingId(module.id_module);
        setIsModalOpen(true);
    };

    // Filtrage dynamique
    const filteredModules = modules.filter(m => 
        (m.nom_module || '').toLowerCase().includes(search.toLowerCase()) || 
        (m.code_module || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout title="Gestion des Modules">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                
                {/* En-tête de liste */}
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un module..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2.5 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm outline-none"
                        />
                    </div>
                    <button 
                        onClick={() => { setError(null); resetForm(); setIsModalOpen(true); }}
                        className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-emerald-700 transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5 duration-200 w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-4 h-4" /> Nouveau Module
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
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nom du Module</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Crédits</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredModules.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500 italic">
                                            Aucun module trouvé.
                                        </td>
                                    </tr>
                                ) : filteredModules.map((m) => (
                                    <tr key={m.id_module} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm mr-4 shadow-sm group-hover:shadow-md transition-shadow">
                                                    {(m.nom_module || '').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-sm font-semibold text-gray-900">{m.nom_module}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                                {m.code_module}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {m.description || <span className="italic text-gray-400">Aucune description</span>}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold border border-indigo-200">
                                                {m.credit || 0} <span className="text-xs">pts</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                                            <button 
                                                onClick={() => handleEdit(m)} 
                                                className="text-gray-400 hover:text-emerald-600 p-2 hover:bg-emerald-50 rounded-full transition-all duration-200"
                                                title="Modifier"
                                            >
                                                <Edit2 className="w-4 h-4"/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(m.id_module)} 
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
                                        {editingId ? 'Modifier le Module' : 'Créer un nouveau module'}
                                    </h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Module</label>
                                            <input required type="text" name="nom_module" value={formData.nom_module} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border p-2.5 transition-shadow" placeholder="ex. Programmation Orientée Objet" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                            <input required type="text" name="code_module" value={formData.code_module} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border p-2.5 transition-shadow" placeholder="ex. POO" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Crédits ECTS</label>
                                        <input required type="number" name="credits_ects" value={formData.credits_ects} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border p-2.5 transition-shadow" placeholder="0" min="0" step="1" />
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
                                                <span className="flex items-center"><Check className="-ml-1 mr-2 h-4 w-4" /> {editingId ? 'Modifier' : 'Créer le module'}</span>
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
