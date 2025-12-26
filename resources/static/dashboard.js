/**
 * ====================================================================
 * Dashboard - Plateforme de Cours (Vanilla JavaScript)
 * ====================================================================
 * 
 * Chapitre 1: Structure HTML et CSS (DOM)
 * - Utilise des IDs et classes pour la sélection d'éléments
 * - Structure sémantique avec sections claires
 * 
 * Chapitre 2: Manipulation du DOM
 * - DOM Selection: document.getElementById(), document.querySelector()
 * - Event Handling: addEventListener() pour tous les événements
 * - Style manipulation: element.style, element.className
 * 
 * Chapitre 3: Asynchrone et Fonctions
 * - Async/await pour les appels API
 * - Try/catch pour la gestion des erreurs
 * - Arrow Functions pour l'initialisation
 * ====================================================================
 */

// ====================================================================
// VARIABLES GLOBALES (État de l'application)
// ====================================================================

let appState = {
    courses: [],
    loading: false,
    error: null,
    stats: {
        creditsCompleted: 120,
        totalCredits: 144,
        gpa: 3.75,
        maxGpa: 4.0,
        activeCourses: 0
    }
};

// ====================================================================
// FONCTIONS D'AFFICHAGE DES MESSAGES
// ====================================================================

/**
 * Affiche une alerte à l'utilisateur
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type d'alerte: 'error', 'success', 'info'
 */
const showAlert = (message, type = 'error') => {
    // Sélection du conteneur des alertes
    const alertContainer = document.getElementById('alertContainer');

    // Création de l'élément d'alerte
    const alertElement = document.createElement('div');
    alertElement.className = `alert ${type}`;
    alertElement.innerHTML = `
        <span style="flex-shrink: 0;">
            ${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}
        </span>
        <span>${message}</span>
    `;

    // Ajout au conteneur
    alertContainer.appendChild(alertElement);

    // Suppression automatique après 5 secondes
    setTimeout(() => {
        alertElement.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alertElement.remove(), 300);
    }, 5000);
};

/**
 * Supprime tous les messages d'alerte
 */
const clearAlerts = () => {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = '';
};

// ====================================================================
// FONCTIONS D'AFFICHAGE DES COURS
// ====================================================================

/**
 * Affiche le spinner de chargement
 */
const showLoading = () => {
    const container = document.getElementById('coursesContainer');
    container.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Chargement des cours...</p>
        </div>
    `;
};

/**
 * Affiche l'état "aucun cours"
 */
const showEmptyState = () => {
    const container = document.getElementById('coursesContainer');
    container.innerHTML = `
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <p>Aucun cours disponible</p>
        </div>
    `;
};

/**
 * Affiche les cours récents
 * @param {Array} courses - Liste des cours à afficher
 */
const renderCourses = (courses) => {
    const container = document.getElementById('coursesContainer');

    if (courses.length === 0) {
        showEmptyState();
        return;
    }

    // Création de la liste des cours
    let coursesHtml = '<div class="courses-list">';

    // Boucle sur chaque cours
    courses.forEach((course) => {
        // Extraction de la première lettre du titre
        const firstLetter = (course.titre || '?').charAt(0).toUpperCase();

        coursesHtml += `
            <div class="course-item" data-course-id="${course.id_cours}">
                <div class="course-info">
                    <div class="course-avatar">${firstLetter}</div>
                    <div class="course-details">
                        <h4>${course.titre || 'Sans titre'}</h4>
                        <p>${course.type_document || 'COURS'}</p>
                    </div>
                </div>
                <button class="btn download-btn" data-course-id="${course.id_cours}">
                    <span>⬇️</span>
                    Télécharger
                </button>
            </div>
        `;
    });

    coursesHtml += '</div>';
    container.innerHTML = coursesHtml;

    // Attachement des événements de clic aux boutons de téléchargement
    attachDownloadListeners();
};

/**
 * Attache les écouteurs d'événement aux boutons de téléchargement
 */
const attachDownloadListeners = () => {
    const downloadButtons = document.querySelectorAll('.download-btn');

    downloadButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            // Récupération de l'ID du cours depuis l'attribut data
            const courseId = event.currentTarget.getAttribute('data-course-id');
            handleDownload(courseId);
        });
    });
};

/**
 * Met à jour l'affichage des statistiques
 */
const updateStats = () => {
    // Mise à jour du nombre de cours actifs
    document.getElementById('activeCourses').textContent = appState.stats.activeCourses;
};

// ====================================================================
// FONCTIONS API (Asynchrone - Chapitre 3)
// ====================================================================

/**
 * Récupère les cours de l'étudiant depuis l'API
 * Utilise async/await et try/catch comme montré en cours
 */
const fetchCourses = async () => {
    try {
        // Affichage du spinner
        showLoading();
        clearAlerts();

        // Configuration des headers
        const config = {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json'
            }
        };

        // Récupération du token JWT du localStorage
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Appel API asynchrone
        console.log('[API] Fetch courses depuis /api/etudiant/mes-cours');
        const response = await fetch('/api/etudiant/mes-cours', {
            method: 'GET',
            credentials: 'include',
            ...config
        });

        // Vérification du statut de la réponse
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        // Parsing de la réponse JSON
        const data = await response.json();
        console.log('[API] Réponse reçue:', data);

        // Extraction des données de cours
        const coursesData = data.data || data.cours || data;

        // Vérification du format
        if (Array.isArray(coursesData)) {
            // Stockage des 3 premiers cours dans l'état
            appState.courses = coursesData.slice(0, 3);

            // Mise à jour des statistiques
            appState.stats.activeCourses = coursesData.length;
            updateStats();

            // Affichage des cours
            renderCourses(appState.courses);
            appState.error = null;
        } else {
            throw new Error('Format de données inattendu');
        }
    } catch (error) {
        console.error('[API] Erreur:', error);

        // Gestion des erreurs
        if (error.message.includes('401') || error.message.includes('403')) {
            showAlert('Session expirée. Redirection vers la connexion...', 'error');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else if (error.message.includes('404')) {
            showAlert('Aucun cours trouvé.', 'info');

            // Données fictives pour la démo
            appState.courses = [
                { id_cours: 1, titre: 'Introduction à React', type_document: 'COURS', created_at: '2024-01-15' },
                { id_cours: 2, titre: 'Bases de Données SQL', type_document: 'TP', created_at: '2024-01-20' },
                { id_cours: 3, titre: 'Web Design', type_document: 'COURS', created_at: '2024-01-25' }
            ];

            appState.stats.activeCourses = appState.courses.length;
            updateStats();
            renderCourses(appState.courses);
        } else {
            showAlert('Impossible de charger les cours. Vérifiez votre connexion.', 'error');
            renderCourses([]);
        }

        appState.error = error.message;
    }
};

/**
 * Télécharge un document de cours
 * @param {number} courseId - ID du cours à télécharger
 */
const handleDownload = (courseId) => {
    try {
        console.log(`[Download] Téléchargement du cours ${courseId}`);

        // Redirection vers l'endpoint de téléchargement
        window.location.href = `/api/etudiant/cours/${courseId}/download`;
    } catch (error) {
        console.error('[Download] Erreur:', error);
        showAlert('Impossible de télécharger le document.', 'error');
    }
};

// ====================================================================
// INITIALISATION DE L'APPLICATION
// ====================================================================

/**
 * Initialise l'application au chargement de la page
 * Appelle les fonctions nécessaires pour charger les données
 */
const initializeApp = async () => {
    console.log('[Init] Initialisation de l\'application');

    try {
        // Chargement des cours
        await fetchCourses();

        console.log('[Init] Initialisation terminée');
    } catch (error) {
        console.error('[Init] Erreur lors de l\'initialisation:', error);
        showAlert('Erreur lors de l\'initialisation de l\'application.', 'error');
    }
};

// ====================================================================
// POINT D'ENTRÉE - Exécution au chargement du DOM
// ====================================================================

/**
 * Attente du chargement complet du DOM avant l'exécution
 * Equivalent de document.ready() en jQuery ou useEffect en React
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DOM] Document chargé');
    initializeApp();
});

// ====================================================================
// EXPORT (Pour utilisation en module si nécessaire)
// ====================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchCourses,
        handleDownload,
        showAlert,
        renderCourses,
        initializeApp
    };
}
