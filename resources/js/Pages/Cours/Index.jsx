import React from 'react';

// --- MOCKS POUR LA PRÉVISUALISATION (À REMPLACER DANS LARAVEL) ---

// Simulation du Layout Authentifié de Breeze
const AuthenticatedLayout = ({ user, header, children }) => (
    <div className="min-h-screen bg-gray-100 font-sans">
        <nav className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-4">
                        <div className="text-blue-600 font-bold text-xl">PlateformeCours</div>
                        <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                             <a href="#" className="inline-flex items-center px-1 pt-1 border-b-2 border-indigo-400 text-sm font-medium leading-5 text-gray-900 focus:outline-none focus:border-indigo-700 transition duration-150 ease-in-out">
                                Cours
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="text-gray-500 text-sm">{user?.name || 'Utilisateur'}</span>
                    </div>
                </div>
            </div>
        </nav>
        {header && (
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {header}
                </div>
            </header>
        )}
        <main>{children}</main>
    </div>
);

// Simulation du composant Head
const Head = ({ title }) => <div className="hidden" data-title={title}></div>;

// Données de démonstration pour voir le rendu
const mockCours = [
    {
        id_cours: 1,
        titre: "Introduction aux Bases de Données",
        description: "Concepts fondamentaux, modèle relationnel et SQL. Ce cours couvre les bases nécessaires pour comprendre les SGBD.",
        type_document: "COURS",
        fichier_url: "#",
        groupes: [{ id_groupe: 1, nom_groupe: "L1 Info Grp A" }, { id_groupe: 2, nom_groupe: "L1 Info Grp B" }]
    },
    {
        id_cours: 2,
        titre: "TP1 - Installation MySQL & Workbench",
        description: "Guide pas à pas pour installer l'environnement de développement sur Windows et Linux.",
        type_document: "TP",
        fichier_url: "#",
        groupes: [{ id_groupe: 1, nom_groupe: "L1 Info Grp A" }]
    },
    {
        id_cours: 3,
        titre: "Algorithmes de Tri - Vidéo Explicative",
        description: "Visualisation des tris à bulles, insertion et quicksort.",
        type_document: "VIDEO",
        fichier_url: "#",
        groupes: []
    },
    {
        id_cours: 4,
        titre: "Exercices Corrigés - Algèbre Relationnelle",
        description: "",
        type_document: "TD",
        fichier_url: "#",
        groupes: [{ id_groupe: 3, nom_groupe: "L2 Info" }]
    }
];

const mockAuth = { user: { name: "Professeur Demo" } };

// --- COMPOSANT PRINCIPAL ---

export default function Index({ auth = mockAuth, cours = mockCours }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Liste des Cours</h2>}
        >
            <Head title="Cours" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Grille responsive : 1 colonne sur mobile, 2 sur tablette, 3 sur ordi */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cours.map((c) => (
                                <div key={c.id_cours} className="border rounded-lg p-4 hover:shadow-lg transition bg-gray-50 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-blue-600 truncate flex-1 pr-2" title={c.titre}>
                                            {c.titre}
                                        </h3>
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold whitespace-nowrap ${
                                            c.type_document === 'VIDEO' ? 'bg-red-100 text-red-800' : 
                                            c.type_document === 'TP' ? 'bg-purple-100 text-purple-800' : 
                                            c.type_document === 'TD' ? 'bg-orange-100 text-orange-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {c.type_document}
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                                        {c.description || <span className="italic text-gray-400">Aucune description disponible.</span>}
                                    </p>
                                    
                                    <div className="mt-auto pt-3 border-t border-gray-200">
                                        <div className="mb-3">
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">
                                                Disponible pour :
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {c.groupes && c.groupes.length > 0 ? (
                                                    c.groupes.map(g => (
                                                        <span key={g.id_groupe} className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded border border-green-200">
                                                            {g.nom_groupe}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 italic">Aucun groupe assigné</span>
                                                )}
                                            </div>
                                        </div>

                                        <button 
                                            className="w-full mt-2 text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center gap-2"
                                            onClick={() => alert(`Téléchargement de : ${c.titre}`)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Télécharger
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {cours.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                <p>Aucun cours n'a été publié pour le moment.</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}