import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, BookOpen, Users, FileText, Video } from 'lucide-react';

// --- CONSTANTES ---
const API_URL = '/login-web';

// --- COMPOSANT REUTILISABLE (POUR LA PARTIE DROITE) ---
const FeatureCard = ({ icon: Icon, bgClass, iconColorClass, title, description }) => (
    <div className="flex items-start space-x-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-5 hover:bg-opacity-20 transition-all">
        <div className="flex-shrink-0">
            <div className={`w-14 h-14 ${bgClass} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className={`w-7 h-7 ${iconColorClass}`} />
            </div>
        </div>
        <div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-emerald-100 text-sm">{description}</p>
        </div>
    </div>
);

// --- COMPOSANT PRINCIPAL ---
export default function Login() {
    const [values, setValues] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Gestion des champs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
    };

    // Traitement du succès
    const handleLoginSuccess = ({ token, role, user, profil_metier }) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_role', role);
        localStorage.setItem('user_name', user.name || `${user.nom} ${user.prenom}`);
        
        if (role === 'ETUDIANT' && profil_metier) {
            localStorage.setItem('id_groupe', profil_metier.id_groupe);
        }

        // Redirection
        window.location.href = '/dashboard-client';
    };

    // Traitement des erreurs
    const handleLoginError = (err) => {
        console.error(err);
        if (err.response?.status === 401) {
            setError("Email ou mot de passe incorrect.");
        } else if (err.response?.status === 422) {
            setError("Veuillez remplir tous les champs correctement.");
        } else {
            setError("Une erreur de connexion est survenue. Vérifiez le serveur.");
        }
    };

    // Soumission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.post(API_URL, values, {
                headers: { 'Accept': 'application/json' }
            });
            handleLoginSuccess(data);
        } catch (err) {
            handleLoginError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans text-gray-900">
            {/* --- SECTION GAUCHE : FORMULAIRE --- */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-md w-full space-y-8">
                    
                    {/* Header Logo */}
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="relative group cursor-default">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                                    <BookOpen className="w-10 h-10 text-white" strokeWidth={2.5} />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center shadow-lg">
                                    <FileText className="w-4 h-4 text-amber-900" />
                                </div>
                            </div>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bienvenue sur CoursHub</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Votre espace de gestion des cours et documents
                        </p>
                    </div>

                    {/* Alerte Erreur */}
                    {error && (
                        <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-center gap-3 animate-pulse">
                            <svg className="h-5 w-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Formulaire */}
                    <div className="mt-8 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Input Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Adresse email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={values.email}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 bg-gray-50"
                                        placeholder="exemple@ecole.com"
                                    />
                                </div>
                            </div>

                            {/* Input Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={values.password}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 bg-gray-50"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-600 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                                        Se souvenir de moi
                                    </label>
                                </div>
                                <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                                    Mot de passe oublié ?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transform hover:-translate-y-0.5 ${
                                    loading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Connexion en cours...
                                    </span>
                                ) : 'Se connecter'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Pas encore de compte ?{' '}
                                <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                                    Contactez l'administrateur
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION DROITE : VISUEL --- */}
            <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white z-10">
                    <div className="max-w-lg space-y-10">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl mb-6 shadow-2xl ring-1 ring-white/30">
                                <BookOpen className="w-14 h-14 text-white" strokeWidth={2} />
                            </div>
                            <h1 className="text-5xl font-extrabold mb-4 tracking-tight drop-shadow-sm">CoursHub</h1>
                            <p className="text-emerald-50 text-xl font-light">Plateforme de gestion des cours et documents pédagogiques</p>
                        </div>

                        {/* Liste des fonctionnalités via composant */}
                        <div className="grid grid-cols-1 gap-6 mt-16">
                            <FeatureCard 
                                icon={FileText} 
                                bgClass="bg-amber-400" 
                                iconColorClass="text-amber-900" 
                                title="Documents & Supports" 
                                description="Organisez et partagez tous vos cours, TPs et TDs en un seul endroit" 
                            />
                            <FeatureCard 
                                icon={Users} 
                                bgClass="bg-purple-400" 
                                iconColorClass="text-purple-900" 
                                title="Gestion par Groupes" 
                                description="Assignez facilement les ressources à vos différents groupes d'étudiants" 
                            />
                            <FeatureCard 
                                icon={Video} 
                                bgClass="bg-rose-400" 
                                iconColorClass="text-rose-900" 
                                title="Contenu Multimédia" 
                                description="Intégrez des vidéos, PDFs et autres formats pour enrichir vos cours" 
                            />
                        </div>
                    </div>
                </div>

                {/* Arrière-plan animé et décoratif */}
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-400 opacity-10 rounded-full blur-[100px]"></div>
                    <div className="absolute top-[40%] left-[20%] w-4 h-4 bg-amber-300 rounded-full animate-bounce delay-700"></div>
                    <div className="absolute bottom-[30%] right-[20%] w-3 h-3 bg-purple-300 rounded-full animate-ping delay-1000"></div>
                </div>
            </div>
        </div>
    );
}