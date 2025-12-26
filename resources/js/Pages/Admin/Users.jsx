import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Assurez-vous d'avoir le fichier resources/js/Layouts/AdminLayout.jsx
import AdminLayout from '@/Layouts/AdminLayout'; 
import { Trash2, Users, GraduationCap, School, Plus, Search, X, Check, Loader, AlertCircle } from 'lucide-react';

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
export default function UsersPage() {
    // États pour les données
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]); 
    
    // États d'interface
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [toasts, setToasts] = useState([]);
    const showToast = (message, type = 'success') => { const id = Date.now(); setToasts(prev => [...prev, { id, message, type }]); };
    const removeToast = (id) => { setToasts(prev => prev.filter(toast => toast.id !== id)); };
    
    // État du formulaire
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        role: 'ETUDIANT', // Rôle par défaut
        matricule: '',
        id_groupe: '',
        specialite: '',
        telephone: ''
    });

    // Chargement initial
    useEffect(() => { 
        fetchUsers(); 
        fetchGroups();
    }, []);

    // 1. Récupérer les utilisateurs
    const fetchUsers = async () => {
        const token = localStorage.getItem('auth_token');
        try {
            const res = await axios.get('http://localhost:8000/api/admin/users', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setUsers(res.data.data); 
            setError(null);
        } catch (e) { 
            console.error(e);
            setError("Impossible de charger les utilisateurs.");
        } finally { 
            setLoading(false); 
        }
    };

    // 2. Récupérer les groupes
    const fetchGroups = async () => {
        const token = localStorage.getItem('auth_token');
        try {
            const res = await axios.get('http://localhost:8000/api/admin/groupes', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setGroups(res.data);
        } catch (e) { 
            console.error("Erreur chargement groupes", e);
        }
    };

    // 3. Supprimer un utilisateur (Sans confirmation bloquante)
    const handleDelete = async (id) => {
        // Suppression de la confirmation "confirm()"
        
        const token = localStorage.getItem('auth_token');
        try {
            // Optimistic UI : On supprime visuellement tout de suite pour la fluidité
            const previousUsers = [...users];
            setUsers(users.filter(u => u.id !== id));

            await axios.delete(`http://localhost:8000/api/admin/users/${id}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            const userName = users.find(u => u.id === id)?.name;
            showToast(`🗑️ ${userName || 'Utilisateur'} a été supprimé`, 'warning');
            
            // Pas d'alert("Succès") ici, l'action est visible
        } catch (e) { 
            // En cas d'erreur, on remet la liste comme avant et on affiche l'erreur en bas
            fetchUsers(); 
            showToast('❌ ' + (error.response?.data?.message || 'Une erreur est survenue'), 'error');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 4. Créer un utilisateur
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null); // Reset erreur
        const token = localStorage.getItem('auth_token');

        try {
            await axios.post('http://localhost:8000/api/admin/users', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Succès : On ferme juste la modale et on rafraîchit la liste
            // Pas d'alert("Succès")
            setIsModalOpen(false);
            setFormData({
                nom: '', prenom: '', email: '', password: '', role: 'ETUDIANT',
                matricule: '', id_groupe: '', specialite: '', telephone: ''
            });
            fetchUsers(); 
            showToast('✨ Utilisateur créé avec succès !', 'success');
        } catch (error) {
            console.error(error);
            // On affiche l'erreur dans l'UI au lieu d'une alerte
            setError(error.response?.data?.message || "Erreur lors de la création.");
        } finally {
            setSubmitting(false);
        }
    };

    // Filtrage dynamique
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const links = [
        { label: "Filières", href: "/admin/structure/filieres" },
        { label: "Groupes", href: "/admin/groupes" },
        { label: "Modules", href: "/admin/modules" },
        { label: "Documents", href: "/admin/documents" },
        { label: "Vidéos", href: "/admin/videos" }
    ];

    return (
        <AdminLayout title="Gestion des Utilisateurs">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                
                {/* En-tête de liste */}
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher par nom ou email..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2.5 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm outline-none"
                        />
                    </div>
                    <button 
                        onClick={() => { setError(null); setIsModalOpen(true); }}
                        className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-emerald-700 transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5 duration-200 w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-4 h-4" /> Nouvel Utilisateur
                    </button>
                </div>

                {/* Zone d'affichage des erreurs (remplace les alertes) */}
                {error && (
                    <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between text-sm animate-pulse">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> 
                            <span>{error}</span>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4"/></button>
                    </div>
                )}

                {/* Zone d'affichage des succès */}
                {success && (
                    <div className="mx-6 mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 flex items-center justify-between text-sm animate-fadeIn">
                        <div className="flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            <span>{success}</span>
                        </div>
                        <button onClick={() => setSuccess(null)} className="text-emerald-500 hover:text-emerald-700"><X className="w-4 h-4"/></button>
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
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Identité</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rôle</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Détails Métier</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Accès</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500 italic">
                                            Aucun utilisateur trouvé.
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm mr-4 shadow-sm group-hover:shadow-md transition-shadow">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{u.name}</div>
                                                    <div className="text-xs text-gray-500">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                                                u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                                u.role === 'PROF' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {u.etudiant ? (
                                                <div className="flex items-center gap-1.5">
                                                    <GraduationCap className="w-4 h-4 text-gray-400"/> 
                                                    <span>{u.etudiant.groupe?.nom_groupe || <span className="italic text-gray-400">Sans groupe</span>}</span>
                                                </div>
                                            ) : u.professeur ? (
                                                <div className="flex items-center gap-1.5">
                                                    <School className="w-4 h-4 text-gray-400"/> 
                                                    <span>{u.professeur.specialite || <span className="italic text-gray-400">Généraliste</span>}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                                            <a href="/admin/filieres" className="text-emerald-600 hover:underline" title="Filières">Filière</a>
                                            <a href="/admin/groupes" className="text-blue-600 hover:underline" title="Groupes">Groupe</a>
                                            <a href="/admin/modules" className="text-purple-600 hover:underline" title="Modules">Module</a>
                                            <a href="/admin/documents" className="text-gray-600 hover:underline" title="Documents">Documents</a>
                                            <a href="/admin/videos" className="text-pink-600 hover:underline" title="Vidéos">Vidéos</a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleDelete(u.id)} 
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

            {/* MODALE DE CRÉATION */}
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
                                        Ajouter un nouvel utilisateur
                                    </h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* 1. Informations de base (Identité) */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                            <input required type="text" name="prenom" value={formData.prenom} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border p-2.5 transition-shadow" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                            <input required type="text" name="nom" value={formData.nom} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border p-2.5 transition-shadow" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border p-2.5 transition-shadow" placeholder="exemple@ecole.com" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                                            <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border p-2.5 transition-shadow" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                            <input type="text" name="telephone" value={formData.telephone} onChange={handleInputChange} className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border p-2.5 transition-shadow" />
                                        </div>
                                    </div>

                                    {/* 2. Sélection du Rôle */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                                        <select 
                                            name="role" 
                                            value={formData.role} 
                                            onChange={handleInputChange}
                                            className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-lg border transition-shadow"
                                        >
                                            <option value="ETUDIANT">Étudiant</option>
                                            <option value="PROF">Professeur</option>
                                            <option value="ADMIN">Administrateur</option>
                                        </select>
                                    </div>

                                    {/* 3. Champs Conditionnels */}
                                    {formData.role === 'ETUDIANT' && (
                                        <div className="bg-emerald-50 p-4 rounded-lg space-y-3 border border-emerald-100 animate-fadeIn">
                                            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                                                <GraduationCap className="w-3 h-3" /> Détails Étudiant
                                            </p>
                                            <div>
                                                <label className="block text-sm font-medium text-emerald-900 mb-1">Matricule</label>
                                                <input required type="text" name="matricule" value={formData.matricule} onChange={handleInputChange} className="block w-full border-emerald-200 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border p-2.5 bg-white" placeholder="Ex: E2023001" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-emerald-900 mb-1">Groupe</label>
                                                <select 
                                                    required 
                                                    name="id_groupe" 
                                                    value={formData.id_groupe} 
                                                    onChange={handleInputChange}
                                                    className="block w-full pl-3 pr-10 py-2.5 text-base border-emerald-200 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-lg border bg-white"
                                                >
                                                    <option value="">Sélectionner un groupe...</option>
                                                    {groups.length > 0 ? (
                                                        groups.map(g => (
                                                            <option key={g.id_groupe} value={g.id_groupe}>{g.nom_groupe} ({g.filiere?.nom_filiere})</option>
                                                        ))
                                                    ) : (
                                                        <option value="" disabled>Aucun groupe disponible</option>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {formData.role === 'PROF' && (
                                        <div className="bg-blue-50 p-4 rounded-lg space-y-3 border border-blue-100 animate-fadeIn">
                                            <p className="text-xs font-bold text-blue-800 uppercase tracking-wide flex items-center gap-1">
                                                <School className="w-3 h-3" /> Détails Professeur
                                            </p>
                                            <div>
                                                <label className="block text-sm font-medium text-blue-900 mb-1">Spécialité</label>
                                                <input type="text" name="specialite" value={formData.specialite} onChange={handleInputChange} className="block w-full border-blue-200 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2.5 bg-white" placeholder="Ex: Développement Web" />
                                            </div>
                                        </div>
                                    )}

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
                                                <span className="flex items-center"><Loader className="animate-spin -ml-1 mr-2 h-4 w-4" /> Création...</span>
                                            ) : (
                                                <span className="flex items-center"><Check className="-ml-1 mr-2 h-4 w-4" /> Créer l'utilisateur</span>
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