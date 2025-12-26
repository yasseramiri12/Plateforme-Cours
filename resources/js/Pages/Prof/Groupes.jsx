/**
 * Page Groupes - Voir les groupes d'étudiants disponibles
 * 
 * Fonctionnalités:
 * - Afficher les groupes existants
 * - Voir les détails de chaque groupe (capacité, année scolaire)
 * - Les groupes sont gérés par l'admin (pas de création/modification/suppression ici)
 * 
 * API Utilisée:
 * - GET /api/prof/my-groupes: Récupérer les groupes disponibles pour assigner les cours
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfLayout from '@/Layouts/ProfLayout';
import { Plus, Trash2, Users, BookOpen, Loader, AlertCircle } from 'lucide-react';

/**
 * Page Groupes - Affiche les groupes disponibles (lecture seule depuis l'API)
 * Les groupes sont gérés par l'admin, les profs ne peuvent les voir que
 */
export default function Groupes() {
    const [groupes, setGroupes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Charge les groupes au montage
    useEffect(() => {
        fetchGroupes();
    }, []);

    // Récupère les groupes disponibles depuis l'API
    const fetchGroupes = async () => {
        const token = localStorage.getItem('auth_token');
        try {
            const res = await axios.get('http://localhost:8000/api/prof/my-groupes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroupes(res.data.data || res.data);
            setError(null);
        } catch (e) {
            console.error('Erreur chargement groupes:', e);
            setError("Impossible de charger les groupes.");
            setGroupes([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProfLayout title="Mes Groupes">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Groupes Disponibles</h2>
                        <p className="text-gray-600 mt-1">Voir les groupes pour assigner vos cours</p>
                    </div>
                </div>

                {/* Erreur */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2 text-sm">
                        <AlertCircle className="w-5 h-5" /> 
                        <span>{error}</span>
                    </div>
                )}

                {/* Chargement */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                        Chargement des groupes...
                    </div>
                ) : (
                    // Grille de groupes
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupes.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Aucun groupe disponible</p>
                            </div>
                        ) : (
                            groupes.map((groupe) => (
                                <div
                                    key={groupe.id_groupe}
                                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900">{groupe.nom_groupe}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{groupe.annee_scolaire || 'Année scolaire'}</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-5 h-5 text-purple-600" />
                                            <div>
                                                <p className="text-xs text-gray-600">Capacité</p>
                                                <p className="text-lg font-bold text-gray-900">{groupe.capacite_max || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </ProfLayout>
    );
}
