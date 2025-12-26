/**
 * Prof Profile Page - Displays professor profile information
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfLayout from '@/Layouts/ProfLayout';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, AlertCircle, Loader } from 'lucide-react';

export default function ProfProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);

            const config = {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            };

            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Récupérer les informations du professeur
            const res = await axios.get('/api/user/profile', config);
            const data = res.data?.data || res.data;

            setProfile({
                name: data.name || data.prenom + ' ' + data.nom || 'Professeur',
                email: data.email || 'Non disponible',
                specialite: data.specialite || 'Non spécifiée',
                telephone: data.telephone || 'Non fourni',
                adresse: data.adresse || 'Non fourni',
                dateNaissance: data.date_naissance || 'Non disponible',
                modules: data.modules || [],
                groupes: data.groupes || []
            });

            setError(null);
        } catch (err) {
            console.error('Erreur chargement profil:', err);

            // Afficher un profil de démo
            setProfile({
                name: localStorage.getItem('user_name') || 'Professeur',
                email: 'prof@example.com',
                specialite: 'Informatique',
                telephone: '06 12 34 56 78',
                adresse: 'Algérie',
                dateNaissance: '1985-05-15',
                modules: [
                    { id_module: 1, nom_module: 'Programmation Python', code_module: 'PY101' },
                    { id_module: 2, nom_module: 'Bases de Données', code_module: 'DB101' }
                ],
                groupes: [
                    { id_groupe: 1, nom_groupe: 'L1 Informatique' },
                    { id_groupe: 2, nom_groupe: 'L2 Gestion' }
                ]
            });

            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Accès non autorisé.');
            } else {
                setError('Impossible de charger le profil.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ProfLayout title="Mon Profil">
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                        <p className="text-gray-600">Chargement du profil...</p>
                    </div>
                </div>
            </ProfLayout>
        );
    }

    return (
        <ProfLayout title="Mon Profil">
            <div className="space-y-8">
                {error && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 text-amber-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {profile && (
                    <>
                        {/* Profil Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold">
                                    {profile.name?.charAt(0).toUpperCase() || 'P'}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                                    <p className="text-blue-100 mt-1">{profile.specialite}</p>
                                </div>
                            </div>
                        </div>

                        {/* Informations personnelles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Informations personnelles
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Nom complet</p>
                                        <p className="text-lg font-semibold text-gray-900">{profile.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Date de naissance</p>
                                        <p className="text-lg font-semibold text-gray-900">{new Date(profile.dateNaissance).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Spécialité</p>
                                        <p className="text-lg font-semibold text-gray-900">{profile.specialite}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-green-600" />
                                    Contact
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Mail className="w-5 h-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="text-lg font-semibold text-gray-900 break-all">{profile.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Téléphone</p>
                                            <p className="text-lg font-semibold text-gray-900">{profile.telephone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Adresse</p>
                                            <p className="text-lg font-semibold text-gray-900">{profile.adresse}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modules et Groupes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-purple-600" />
                                    Modules ({profile.modules?.length || 0})
                                </h2>
                                {profile.modules && profile.modules.length > 0 ? (
                                    <div className="space-y-2">
                                        {profile.modules.map((module) => (
                                            <div key={module.id_module} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                <p className="font-semibold text-purple-900">{module.nom_module}</p>
                                                <p className="text-sm text-purple-700">{module.code_module}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Aucun module assigné</p>
                                )}
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-amber-600" />
                                    Groupes ({profile.groupes?.length || 0})
                                </h2>
                                {profile.groupes && profile.groupes.length > 0 ? (
                                    <div className="space-y-2">
                                        {profile.groupes.map((groupe) => (
                                            <div key={groupe.id_groupe} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                <p className="font-semibold text-amber-900">{groupe.nom_groupe}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Aucun groupe assigné</p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <a 
                                href="/prof/dashboard"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Retourner au tableau de bord
                            </a>
                        </div>
                    </>
                )}
            </div>
        </ProfLayout>
    );
}
