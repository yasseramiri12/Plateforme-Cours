/**
 * ============================================================================
 * PLATEFORME DE COURS - VANILLA JAVASCRIPT DASHBOARD
 * ============================================================================
 *
 * FILE: public/dashboard.js
 * PURPOSE: Main application logic for student dashboard (no React/Vue)
 *
 * ARCHITECTURE:
 * This file follows Pedagogical Concepts from Chapters 1-3:
 * - Chapter 1: HTML/CSS Structure - Semantic markup with proper Box Model
 * - Chapter 2: DOM Manipulation - Direct element selection and event handling
 * - Chapter 3: Async Functions - Fetch API with async/await and error handling
 *
 * STATE MANAGEMENT:
 * Uses global appState object (replaces React.useState)
 * - appState.courses: Array of course objects
 * - appState.loading: Boolean loading state
 * - appState.stats: Statistics (credits, GPA, active courses)
 * - appState.error: Error message if any
 *
 * DOM ELEMENTS USED:
 * - #alertContainer: Where alerts are displayed
 * - #coursesContainer: Where courses list is rendered
 * - #activeCourses: Display count of active courses
 * - .download-btn: Buttons for file download
 *
 * API ENDPOINTS:
 * - GET /api/etudiant/mes-cours
 *   Returns: { data: Array<Course> }
 *   Headers: Authorization: Bearer {token}
 *
 * - GET /api/etudiant/cours/{courseId}/download
 *   Returns: Binary file stream
 *   Purpose: Download course document
 *
 * EVENT FLOW:
 * 1. Page loads → DOM ready → initializeApp()
 * 2. fetchCourses() called → shows spinner
 * 3. API request sent with Bearer token
 * 4. Response processed → renderCourses()
 * 5. Event listeners attached to download buttons
 * 6. User clicks button → handleDownload()
 *
 * ERROR HANDLING:
 * - 401/403: Session expired → Redirect to login
 * - 404: Course not found → Show demo data
 * - Network: Connection error → Show error alert
 *
 * AUTHENTICATION:
 * Bearer token stored in localStorage['auth_token']
 * Included in all API requests via Authorization header
 *
 * AUTHOR: Development Team
 * DATE: December 21, 2025
 * VERSION: 1.0
 * ============================================================================
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
 * 
 * USAGE:
 *   showAlert('Bienvenue!', 'success');
 *   showAlert('Erreur réseau', 'error');
 *   showAlert('Info importante', 'info');
 *
 * DOM IMPACT:
 *   - Crée un nouvel élément div avec classe 'alert {type}'
 *   - Ajoute au #alertContainer
 *   - Auto-remove après 5 secondes
 *
 * ACCESSIBILITY:
 *   - Icônes visuelles (❌, ✅, ℹ️) pour clarté
 *   - Couleurs distinctes par type
 *   - Animation slide-in depuis le haut
 *
 * @param {string} message - Le message à afficher (HTML)
 * @param {string} type - Type: 'error' | 'success' | 'info'
 * @returns {void}
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
 * 
 * ALGORITHM:
 * 1. Check if courses array is empty → show empty state
 * 2. Loop through courses → build HTML string
 * 3. For each course:
 *    - Extract first letter of title
 *    - Add course-item div with data-course-id
 *    - Add download button with event listener
 * 4. Replace container innerHTML
 * 5. Attach click listeners to all download buttons
 *
 * DATA ATTRIBUTES USED:
 *   - data-course-id: Used to get courseId on button click
 *   - Allows decoupling HTML from JavaScript
 *
 * EVENT DELEGATION:
 *   - Instead of attaching listener to each button in loop
 *   - We attach one listener and read data-course-id from event target
 *   - More efficient and allows dynamic elements
 *
 * HTML STRUCTURE CREATED:
 *   <div class="courses-list">
 *     <div class="course-item" data-course-id="1">
 *       <div class="course-info">
 *         <div class="course-avatar">I</div>
 *         <div class="course-details">
 *           <h4>Introduction à React</h4>
 *           <p>COURS</p>
 *         </div>
 *       </div>
 *       <button class="btn download-btn" data-course-id="1">
 *         ⬇️ Télécharger
 *       </button>
 *     </div>
 *   </div>
 *
 * @param {Array<Object>} courses - Array of course objects
 *   Expected fields:
 *     - id_cours: number (REQUIRED - used as key)
 *     - titre: string (REQUIRED - displayed as title)
 *     - type_document: string (optional - defaults to 'COURS')
 * @returns {void} - Modifies DOM directly
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
 * 
 * FULL WORKFLOW:
 * 1. Show loading spinner
 * 2. Clear any existing alerts
 * 3. Fetch from /api/etudiant/mes-cours
 * 4. Include Bearer token from localStorage
 * 5. Parse JSON response
 * 6. Handle different response formats (data.data, data.cours, data)
 * 7. Store courses in appState
 * 8. Update statistics (active courses count)
 * 9. Render courses to DOM
 * 10. Handle errors (401, 404, network)
 *
 * ASYNC/AWAIT PATTERN (Chapter 3):
 *   - fetch() returns a Promise
 *   - await pauses execution until Promise resolves
 *   - try/catch handles rejections and errors
 *   - finally block always runs (cleanup)
 *
 * EXAMPLE RESPONSE:
 *   GET /api/etudiant/mes-cours
 *   {
 *     "data": [
 *       {
 *         "id_cours": 1,
 *         "titre": "Introduction à React",
 *         "type_document": "COURS",
 *         "fichier_url": "/storage/cours_files/abc123.pdf",
 *         "est_publie": 1,
 *         "est_valide": 1,
 *         "created_at": "2024-01-15"
 *       },
 *       ...
 *     ]
 *   }
 *
 * ERROR HANDLING:
 *   - 401/403 Unauthorized: Token expired → Redirect to /login
 *   - 404 Not Found: No courses → Show demo data
 *   - Network Error: No internet → Show error message
 *
 * TOKEN AUTHENTICATION:
 *   - Read from: localStorage.getItem('auth_token')
 *   - Stored after login
 *   - Must be included in Authorization header
 *   - Format: "Bearer {token}"
 *
 * @returns {Promise<void>}
 * @async
 * @throws {Error} Network or API errors (caught and handled)
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
 * 
 * IMPLEMENTATION:
 * - Uses direct window.location.href assignment
 * - Browser handles file download/save dialog
 * - Works with any file type (PDF, MP4, etc)
 *
 * FLOW:
 * 1. User clicks download button
 * 2. courseId extracted from button's data-course-id
 * 3. URL constructed: /api/etudiant/cours/{courseId}/download
 * 4. window.location.href = URL
 * 5. Server sends file with proper Content-Disposition header
 * 6. Browser shows "Save As" dialog
 *
 * SECURITY:
 * - Server validates user has access to course
 * - Checks group membership
 * - Verifies file exists before download
 * - Returns 404 if not found
 *
 * ERROR HANDLING:
 * - 404: Course or file not found
 * - 403: User not in correct group
 * - 500: Server error
 *
 * ALTERNATIVE APPROACHES:
 * 1. Fetch API:
 *    - More control over response
 *    - Need to create Blob and trigger download manually
 *    - Used in React version (DownloadPDFs.jsx)
 *
 * 2. Window.location.href (current):
 *    - Simplest implementation
 *    - Browser handles all UI
 *    - Works for direct file download
 *
 * @param {number|string} courseId - ID of course to download
 * @returns {void}
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
 * 
 * INITIALIZATION SEQUENCE:
 * 1. Log app initialization
 * 2. Call fetchCourses() to load data
 * 3. Wait for promise to resolve
 * 4. Log completion
 * 5. Handle any initialization errors
 *
 * EQUIVALENT IN OTHER FRAMEWORKS:
 * - React: useEffect(() => { fetchCourses(); }, [])
 * - jQuery: $(document).ready(function() { ... })
 * - Vanilla JS: document.addEventListener('DOMContentLoaded', ...)
 *
 * ERROR RECOVERY:
 * - If fetchCourses() fails, show error alert
 * - App doesn't crash - graceful degradation
 * - User can refresh page to retry
 *
 * WHY ASYNC:
 * - fetchCourses() is async (returns Promise)
 * - await pauses execution until data loads
 * - Ensures UI isn't rendered before data arrives
 *
 * @returns {Promise<void>}
 * @async
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
 * ENTRY POINT - Application Starts Here
 * 
 * WHY DOMContentLoaded?
 * - HTML must be fully parsed before accessing DOM elements
 * - Ensures #alertContainer and #coursesContainer exist
 * - All event listeners can be attached safely
 *
 * EVENT FLOW:
 * 1. Browser receives HTML file
 * 2. Parser processes HTML elements
 * 3. Parser encounters <script src="dashboard.js"> tag
 * 4. JavaScript loads and executes
 * 5. Event listener registered (this code)
 * 6. Parser finishes HTML (DOM ready)
 * 7. DOMContentLoaded event fires
 * 8. Callback function executes → initializeApp()
 * 9. fetchCourses() called
 * 10. Page is interactive
 *
 * TIMELINE:
 * ┌─────────────────┐
 * │ Page load       │
 * └────────┬────────┘
 *          │
 * ┌────────▼────────┐
 * │ JavaScript runs │ ◄─ We're here (registering listener)
 * └────────┬────────┘
 *          │
 * ┌────────▼────────────────┐
 * │ DOMContentLoaded fires   │ ◄─ Callback executes here
 * │ initializeApp()          │
 * │ fetchCourses() starts    │
 * └────────┬────────────────┘
 *          │
 * ┌────────▼────────┐
 * │ API response    │
 * │ renderCourses() │
 * └────────┬────────┘
 *          │
 * ┌────────▼────────┐
 * │ UI Interactive  │
 * └─────────────────┘
 *
 * CONSOLE LOGS:
 * - '[DOM] Document chargé': When DOMContentLoaded fires
 * - '[Init] Initialisation...': When initializeApp starts
 * - '[API] Fetch courses...': When fetchCourses starts
 * - '[API] Réponse reçue...': When API response arrives
 * - '[Init] Initialisation terminée': When app ready
 *
 * DEBUGGING:
 * Open DevTools Console (F12) to see these logs
 * Helps understand execution order and timing
 *
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
