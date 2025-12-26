/**
 * Page Mon Profil - Affiche les informations du profil étudiant
 * Récupère les données depuis la base de données et les affiche
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentLayout from '@/Layouts/StudentLayout';
import { User, Mail, Phone, MapPin, Calendar, Award, GraduationCap, AlertCircle } from 'lucide-react';

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Charge les données du profil au montage
    useEffect(() => {
        fetchProfile();
    }, []);

    /**
     * Récupère les informations du profil de l'étudiant
     */
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/etudiant/profil', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            setProfile(res.data.data);
            setError(null);
        } catch (e) {
            console.error('Erreur chargement profil:', e);
            if (e.response?.status === 401) {
                setError("Session expirée. Veuillez vous reconnecter.");
            } else if (e.response?.status === 404) {
                setError("Profil non trouvé.");
            } else {
                setError("Impossible de charger votre profil. Veuillez réessayer.");
            }
        } finally {
            setLoading(false);
        }
    };

    // État de chargement
    if (loading) {
        return (
            <StudentLayout title="Mon Profil">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                        <p className="text-gray-600">Chargement de votre profil...</p>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    // État d'erreur
    if (error) {
        return (
            <StudentLayout title="Mon Profil">
                <div className="max-w-2xl mx-auto">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    if (!profile) {
        return (
            <StudentLayout title="Mon Profil">
                <div className="text-center py-12">
                    <p className="text-gray-600">Aucune information de profil disponible.</p>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout title="Mon Profil">
            <div className="max-w-3xl mx-auto">
                {/* Header avec avatar */}
                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-4xl mb-4">
                            {profile?.prenom?.charAt(0).toUpperCase() || 'É'}{profile?.nom?.charAt(0).toUpperCase() || 'É'}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {profile?.prenom} {profile?.nom}
                        </h1>
                        <p className="text-gray-600 mb-4">Matricule: <span className="font-semibold">{profile?.matricule}</span></p>
                        
                        {profile?.groupe && (
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-sm text-gray-500">Groupe:</span>
                                <span className="text-lg font-semibold text-indigo-600">{profile.groupe.nom_groupe}</span>
                                {profile.groupe.filiere && (
                                    <>
                                        <span className="text-sm text-gray-500">Filière:</span>
                                        <span className="text-base font-medium text-gray-700">{profile.groupe.filiere.nom_filiere}</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid Informations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Email */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                                <p className="text-sm text-gray-900 break-all">{profile?.email || 'Non disponible'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Téléphone */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Phone className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Téléphone</p>
                                <p className="text-sm text-gray-900">{profile?.telephone || 'Non disponible'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Adresse */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Adresse</p>
                                <p className="text-sm text-gray-900">{profile?.adresse || 'Non disponible'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Date de Naissance */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date de Naissance</p>
                                <p className="text-sm text-gray-900">
                                    {profile?.date_naissance 
                                        ? new Date(profile.date_naissance).toLocaleDateString('fr-FR', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })
                                        : 'Non disponible'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Date d'Inscription */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Award className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date d'Inscription</p>
                                <p className="text-sm text-gray-900">
                                    {profile?.date_inscription 
                                        ? new Date(profile.date_inscription).toLocaleDateString('fr-FR', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })
                                        : 'Non disponible'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ID Étudiant */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <GraduationCap className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">ID Étudiant</p>
                                <p className="text-sm text-gray-900 font-mono">{profile?.id_etudiant}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bouton Actualiser */}
                <div className="flex justify-center">
                    <button 
                        onClick={fetchProfile}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Actualiser les Informations
                    </button>
                </div>
            </div>
        </StudentLayout>
    );
}
