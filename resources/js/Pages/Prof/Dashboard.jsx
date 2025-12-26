/**
 * PAGE TABLEAU DE BORD - PROFESSEUR
 * ===================================
 * 
 * Cette page affiche un aperçu des données du professeur:
 * - Statistiques: nombre de modules, groupes, documents
 * - Liste des modules assignés au professeur
 * - Actions rapides pour créer des cours et gérer les documents
 * 
 * Flux de données:
 * 1. Au chargement du composant (useEffect), on appelle fetchDashboardData()
 * 2. Cette fonction récupère les données de 2 endpoints API:
 *    - /api/prof/my-modules -> Liste des modules du professeur
 *    - /api/prof/my-groupes -> Nombre de groupes accessibles
 * 3. Les données sont affichées dans des cartes statut et un tableau
 * 
 * Authentification:
 * - Utilise un token JWT stocké dans localStorage (auth_token)
 * - Ce token est envoyé dans le header Authorization: Bearer {token}
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfLayout from '@/Layouts/ProfLayout';
import { BookOpen, Users, FileText, TrendingUp, AlertCircle, Loader } from 'lucide-react';

export default function ProfDashboard() {
    // ========== ÉTAT LOCAL ==========
    // Statistiques du professeur (nombre de modules, groupes, documents)
    const [stats, setStats] = useState({
        courses: 0,      // Nombre de modules enseignés
        groups: 0,       // Nombre de groupes assignés
        documents: 0,    // Nombre de documents uploadés
    });

    // Liste des modules assignés au professeur
    const [myModules, setMyModules] = useState([]);

    // État du chargement (true = en cours, false = terminé)
    const [loading, setLoading] = useState(true);

    // Message d'erreur s'il y a un problème lors du chargement
    const [error, setError] = useState(null);

    // ========== HOOKS ==========
    // useEffect déclenche une fonction au chargement du composant
    // [] = dépendances vides = s'exécute UNE SEULE FOIS au montage
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // ========== FONCTION PRINCIPALE ==========
    /**
     * Récupère les données du dashboard depuis l'API Laravel
     * Effectue 2 requêtes en parallèle avec Promise.all() pour plus de performance
     */
    const fetchDashboardData = async () => {
        try {
            // Active l'indicateur de chargement
            setLoading(true);

            // Configuration des headers HTTP
            const config = { 
                headers: { 
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json'
                },
                withCredentials: true // Inclure les cookies de session
            };

            // Récupère le token JWT du localStorage si disponible
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Promise.all() = exécute 2 requêtes en même temps (plus rapide que séquentiel)
            const [resModules, resGroupes] = await Promise.all([
                // Requête 1: Récupère tous les modules du professeur
                axios.get('/api/prof/my-modules', config),

                // Requête 2: Récupère tous les groupes disponibles pour le professeur
                axios.get('/api/prof/my-groupes', config)
            ]);

            // Extrait les données des réponses (data ou array vide par défaut)
            const modules = resModules?.data?.data || resModules?.data || [];
            const groupes = resGroupes?.data?.data || resGroupes?.data || [];

            // Met à jour l'état avec les données récupérées
            setMyModules(Array.isArray(modules) ? modules : []);
            setStats({
                courses: Array.isArray(modules) ? modules.length : 0,      // Compte le nombre de modules
                groups: Array.isArray(groupes) ? groupes.length : 0,       // Compte le nombre de groupes
                documents: 0,                 // Sera calculé depuis les modules
            });

            // Efface tout message d'erreur s'il y en avait un avant
            setError(null);

        } catch (err) {
            // Gestion des erreurs: log dans la console + message utilisateur
            console.error('Error fetching dashboard data:', err);
            
            // Afficher un message d'erreur plus descriptif
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Vous n\'êtes pas autorisé à accéder à cette page');
            } else if (err.response?.status === 404) {
                setError('Les données demandées n\'existent pas');
            } else {
                setError('Erreur lors du chargement des données. Vérifiez votre connexion.');
            }

            // ⚠️ MODE DÉMO: Si l'API échoue, affiche des données fictives
            // (À SUPPRIMER en production quand l'API sera stable)
            setMyModules([
                { id_module: 1, nom_module: 'Programmation Python', code_module: 'PY101' },
                { id_module: 2, nom_module: 'Bases de Données', code_module: 'DB101' },
                { id_module: 3, nom_module: 'Algorithmes', code_module: 'ALG101' }
            ]);
            setStats({
                courses: 3,
                groups: 2,
                documents: 5,
            });

        } finally {
            // S'exécute TOUJOURS (succès ou erreur) pour désactiver le loading
            setLoading(false);
        }
    };

    // ========== COMPOSANT STATISTIQUES ==========
    /**
     * Composant réutilisable pour afficher une statistique
     * 
     * Props:
     * - icon: Icône Lucide à afficher (ex: BookOpen, Users, FileText)
     * - title: Titre de la statistique (ex: "Modules Enseignés")
     * - value: La valeur numérique à afficher
     * - color: Couleur Tailwind pour l'icône et le nombre (ex: "text-blue-600")
     */
    const StatCard = ({ icon: Icon, title, value, color }) => (
        // Card avec fond blanc, bordure grise, ombre légère, et effet au survol
        <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between">
                {/* Section texte (titre + valeur) */}
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    {/* La valeur s'affiche grande et en couleur */}
                    <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
                </div>

                {/* Section icône (cercle coloré avec l'icône) */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color.replace('text-', 'bg-').replace('-600', '-100')} text-${color.split('-')[1]}-600`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );

    return (
        // Layout du professeur: fournit la barre latérale et la structure globale
        <ProfLayout title="Tableau de Bord">
            {/* ========== MESSAGE D'ERREUR ========== */}
            {/* Affiche une alerte si une erreur s'est produite lors du chargement */}
            {error && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 text-amber-700">
                    {/* Icône d'alerte */}
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {/* Message d'erreur */}
                    <span>{error}</span>
                </div>
            )}

            {/* ========== ÉCRAN DE CHARGEMENT ========== */}
            {/* Affiche un spinner si les données se chargent */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        {/* Spinner animé */}
                        <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                        {/* Texte de chargement */}
                        <p className="text-gray-600">Chargement des données...</p>
                    </div>
                </div>
            ) : (
                /* ========== CONTENU PRINCIPAL (une fois les données chargées) ========== */
                <div className="space-y-8">

                    {/* ========== 1. STATISTIQUES (3 cartes) ========== */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1: Modules enseignés */}
                        <StatCard 
                            icon={BookOpen}                    // Icône livre
                            title="Modules Enseignés"          // Titre
                            value={stats.courses}              // Nombre de modules
                            color="text-blue-600"              // Couleur bleue
                        />

                        {/* Card 2: Groupes assignés */}
                        <StatCard 
                            icon={Users}                       // Icône utilisateurs
                            title="Groupes"                    // Titre
                            value={stats.groups}               // Nombre de groupes
                            color="text-indigo-600"            // Couleur indigo
                        />

                        {/* Card 3: Documents uploadés */}
                        <StatCard 
                            icon={FileText}                    // Icône document
                            title="Documents Uploadés"         // Titre
                            value={stats.documents}            // Nombre de documents
                            color="text-emerald-600"           // Couleur vert
                        />
                    </div>

                    {/* ========== 2. SECTION: MES MODULES ========== */}
                    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                        {/* En-tête de la section */}
                        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                {/* Icône section */}
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                Mes Modules
                            </h2>
                        </div>
                        
                        {/* Cas 1: Aucun module assigné */}
                        {myModules.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                {/* Icône grise */}
                                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                {/* Message vide */}
                                <p>Aucun module assigné pour le moment</p>
                            </div>
                        ) : (
                            /* Cas 2: Afficher la liste des modules */
                            <div className="divide-y divide-gray-200">
                                {/* Boucle sur chaque module et affiche une ligne */}
                                {myModules.map((module) => (
                                    <div 
                                        key={module.id_module}                    // Clé React unique
                                        className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between"
                                    >
                                        {/* Colonne 1: Icône + informations du module */}
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Avatar circulaire avec première lettre du module */}
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                                                {module.nom_module?.charAt(0).toUpperCase() || '?'}
                                            </div>

                                            {/* Détails du module */}
                                            <div>
                                                {/* Nom du module */}
                                                <p className="font-semibold text-gray-900">{module.nom_module}</p>
                                                {/* Code du module (ex: PY101) */}
                                                <p className="text-sm text-gray-500">{module.code_module}</p>
                                            </div>
                                        </div>

                                        {/* Colonne 2: Bouton "Gérer" */}
                                        <a 
                                            href={`/prof/courses?module=${module.id_module}`}  // Lien vers la gestion des cours de ce module
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                        >
                                            Gérer
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ========== 3. SECTION: ACTIONS RAPIDES ========== */}
                    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
                        {/* Titre de la section */}
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            {/* Icône section */}
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Actions Rapides
                        </h2>

                        {/* Grille de 2 actions rapides (1 colonne sur mobile, 2 sur desktop) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Action 1: Créer un nouveau cours */}
                            <a 
                                href="/prof/courses"  // Lien vers la page de création de cours
                                className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            >
                                <p className="font-semibold text-gray-900">Créer un nouveau cours</p>
                                <p className="text-sm text-gray-500 mt-1">Ajouter un document, vidéo ou TP</p>
                            </a>

                            {/* Action 2: Gérer les documents */}
                            <a 
                                href="/prof/documents"  // Lien vers la page de gestion des documents
                                className="p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                            >
                                <p className="font-semibold text-gray-900">Gérer mes documents</p>
                                <p className="text-sm text-gray-500 mt-1">Voir et modifier vos ressources</p>
                            </a>
                        </div>
                    </div>

                </div>
            )}
        </ProfLayout>
    );
}
