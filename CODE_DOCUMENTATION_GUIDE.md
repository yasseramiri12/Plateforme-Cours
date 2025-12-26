/**
 * QUICK REFERENCE: Code Documentation Standards
 * Used throughout the plateforme-cours project
 * 
 * ============================================================================
 * FILE HEADERS (Top of every .js, .php file)
 * ============================================================================
 */

/**
 * FILE: path/to/file.js
 * PURPOSE: Brief description of what this file does
 * 
 * DEPENDENCIES: Other files this depends on
 * EXPORTS: What this file exports/returns
 * 
 * KEY FUNCTIONS:
 *   - functionName(): What it does
 *   - functionName(): What it does
 */

/**
 * ============================================================================
 * FUNCTION HEADERS
 * ============================================================================
 */

/**
 * Descriptive function name explaining what it does
 * 
 * ALGORITHM/WORKFLOW:
 *   1. Step 1: What happens
 *   2. Step 2: What happens
 *   3. Step 3: What happens
 *
 * EXAMPLE USAGE:
 *   const result = myFunction(param1, param2);
 *   console.log(result); // Output: ...
 *
 * PARAMETERS:
 *   @param {type} name - Description with type
 *   @param {type} name - Description
 *
 * RETURN VALUE:
 *   @returns {type} - Description of return value
 *
 * THROWS:
 *   @throws {Error} - When and why error is thrown
 *
 * NOTES:
 *   - Important detail
 *   - Gotcha or edge case
 *   - Performance consideration
 */
const myFunction = (param1, param2) => {
    // Implementation
};

/**
 * ============================================================================
 * INLINE COMMENTS (Inside function body)
 * ============================================================================
 */

const complexFunction = async (userId) => {
    // Fetches user data from database
    const user = await User.find(userId);

    // Validates user exists before proceeding
    if (!user) {
        throw new Error('User not found');
    }

    // Extracts only needed fields for response
    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    // Returns formatted response to client
    return {
        success: true,
        data: safeUser,
        timestamp: new Date().toISOString()
    };
};

/**
 * ============================================================================
 * SECTION COMMENTS (Organizing code blocks)
 * ============================================================================
 */

// ====================================================================
// STATE MANAGEMENT
// ====================================================================
let appState = {
    courses: [],
    loading: false
};

// ====================================================================
// DOM MANIPULATION FUNCTIONS
// ====================================================================
const renderUI = () => {
    // Code here
};

// ====================================================================
// API CALLS
// ====================================================================
const fetchData = async () => {
    // Code here
};

/**
 * ============================================================================
 * COMMON PATTERNS IN THIS PROJECT
 * ============================================================================
 */

// 1. ASYNC/AWAIT PATTERN (Chapter 3)
const fetchCourses = async () => {
    try {
        // 1. Show loading state
        showLoading();

        // 2. Make API call
        const response = await fetch('/api/url', {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 3. Check response status
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        // 4. Parse response
        const data = await response.json();

        // 5. Update state
        appState.courses = data.data;

        // 6. Render UI
        renderCourses(appState.courses);

        // 7. Clear errors
        appState.error = null;
    } catch (error) {
        // 8. Handle errors
        console.error('[API] Error:', error);
        showAlert(error.message, 'error');
    }
};

// 2. DOM MANIPULATION PATTERN (Chapter 2)
const renderCourses = (courses) => {
    // 1. Get container
    const container = document.getElementById('coursesContainer');

    // 2. Handle empty state
    if (courses.length === 0) {
        container.innerHTML = '<p>No courses</p>';
        return;
    }

    // 3. Build HTML
    let html = '<div class="courses-list">';
    courses.forEach(course => {
        html += `<div>${course.title}</div>`;
    });
    html += '</div>';

    // 4. Update DOM
    container.innerHTML = html;

    // 5. Attach event listeners
    attachListeners();
};

// 3. EVENT LISTENER PATTERN (Chapter 2)
const attachListeners = () => {
    // Get all buttons
    const buttons = document.querySelectorAll('.download-btn');

    // Attach listener to each
    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Get data from element
            const courseId = event.target.getAttribute('data-course-id');

            // Call handler
            handleDownload(courseId);
        });
    });
};

/**
 * ============================================================================
 * DOCUMENTATION CHECKLIST
 * ============================================================================
 * 
 * For every function, include:
 * ☑ One-line description (what it does)
 * ☑ Algorithm/workflow (numbered steps)
 * ☑ Parameter types and descriptions
 * ☑ Return type and description
 * ☑ Example usage (if not obvious)
 * ☑ Error handling explanation
 * ☑ Related functions
 * 
 * For every file, include:
 * ☑ File purpose
 * ☑ Key functions exported
 * ☑ Dependencies
 * ☑ Architecture notes
 * ☑ Important concepts used
 * 
 * ============================================================================
 * SECTION ORGANIZATION
 * ============================================================================
 * 
 * 1. FILE HEADER (what, why, how)
 * 2. IMPORTS/DEPENDENCIES
 * 3. CONFIGURATION/CONSTANTS
 * 4. STATE (global variables)
 * 5. HELPER FUNCTIONS (internal utilities)
 * 6. PUBLIC FUNCTIONS (main logic)
 * 7. INITIALIZATION (entry point)
 * 8. EXPORTS
 */
