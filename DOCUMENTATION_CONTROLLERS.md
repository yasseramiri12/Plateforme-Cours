# 📚 Documentation des Controllers Laravel - Plateforme Cours

## Table des matières
1. [Architecture Générale](#architecture-générale)
2. [Controller de Base](#controller-de-base)
3. [Controllers d'Authentification](#controllers-dauthentification)
4. [Controllers de Gestion Administrative](#controllers-de-gestion-administrative)
5. [Controllers Métier](#controllers-métier)
6. [Flow d'Authentification](#flow-dauthentification)

---

## Architecture Générale

### Structure du Projet
```
app/Http/Controllers/
├── Controller.php                    # Classe de base
├── CoursController.php               # Gestion générale des cours
├── ProfileController.php             # Gestion du profil utilisateur
└── Api/
    ├── AuthController.php            # Authentification (Login)
    ├── AdminController.php           # Création d'utilisateurs
    ├── AdminStructureController.php  # Gestion Filière/Groupe/Module
    ├── AdminUserController.php       # Gestion des utilisateurs
    ├── AdminAssignmentController.php # Assignation Prof/Module
    ├── AdminValidationController.php # Validation des cours
    ├── EtudiantCoursController.php   # Cours pour étudiants
    └── ProfCoursController.php       # Cours pour professeurs
```

### Principes Architecturaux
- **Separation of Concerns** : Chaque controller a une responsabilité unique
- **RESTful API** : Les routes API suivent les conventions REST
- **Authentification basée Token** : Utilise Sanctum pour l'API mobile
- **Polymorphisme manuel** : Relation User → Etudiant/Professeur

---

## Controller de Base

### 📄 `Controller.php`

```php
abstract class Controller
{
    //
}
```

**Rôle** : Classe parente de tous les controllers.
- Actuellement vide, héritée de `BaseController` de Laravel
- Peut être enrichie avec des méthodes communes à tous les controllers

---

## Controllers d'Authentification

### 📄 `Api/AuthController.php`

Ce controller gère le **login centralisé** sur la table `users` avec support de deux types d'authentification.

#### Méthode : `login(Request $request)`

**Objectif** : Authentifier un utilisateur et retourner un token API

**Processus** :
1. **Validation des données**
   - Email requis et valide
   - Mot de passe requis
   ```php
   $credentials = $request->validate([
       'email' => 'required|email',
       'password' => 'required',
   ]);
   ```

2. **Authentification standard Laravel**
   - Vérifie les credentials avec `Auth::attempt()`
   - Recherche dans la table `users`

3. **Génération du Token Sanctum**
   ```php
   $token = $user->createToken('auth_token')->plainTextToken;
   ```

4. **Récupération du profil métier** (polymorphisme manuel)
   - Si l'utilisateur est un **ETUDIANT** :
     - Charge le profil `Etudiant` avec son `Groupe`
   - Si l'utilisateur est un **PROF** :
     - Charge le profil `Professeur`

5. **Réponse JSON**
   ```json
   {
       "status": "success",
       "message": "Connexion réussie",
       "role": "ETUDIANT",
       "user": { ... },
       "profil_metier": { ... },
       "token": "1|abc..."
   }
   ```

**Cas d'erreur** : Retourne `401` si les identifiants sont incorrects

---

#### Méthode : `loginWeb(Request $request)`

**Objectif** : Authentifier un utilisateur pour l'interface Web (React/Inertia)

**Différence avec `login()`** :
- Crée une **SESSION** (Cookie) au lieu d'un simple token
- Utilise `Auth::attempt()` + `$request->session()->regenerate()`
- Retourne aussi un token pour les futurs appels API via Axios

**Processus** :
1. Même validation que `login()`
2. Authentification avec session `Auth::attempt($credentials)`
3. **Régénération de la session** : `$request->session()->regenerate()` (CRUCIAL pour sécurité)
4. Récupération du profil métier (même que login)
5. Retour du token + indication de réussite

**Quand l'utiliser** ?
- Pour les applications Web (React/Inertia)
- Quand le navigateur gère les cookies

---

## Controllers de Gestion Administrative

### 📄 `Api/AdminController.php`

Ce controller gère la **création centralisée** des utilisateurs avec leur profil métier associé.

#### Méthode : `storeUser(Request $request)`

**Objectif** : Créer un nouvel utilisateur (Admin, Prof ou Étudiant) avec son profil complet

**Validation complète** :
```php
[
    // Identité (Table users)
    'nom' => 'required|string|max:50',
    'prenom' => 'required|string|max:50',
    'email' => 'required|email|unique:users',
    'password' => 'required|min:6',
    'role' => 'required|in:ETUDIANT,PROF,ADMIN',
    
    // Infos communes
    'telephone' => 'nullable|string|max:20',
    'adresse' => 'nullable|string|max:255',
    'date_naissance' => 'nullable|date',
    
    // Spécifique Étudiant
    'matricule' => 'required_if:role,ETUDIANT|unique:etudiants',
    'id_groupe' => 'required_if:role,ETUDIANT|exists:groupes,id_groupe',
    
    // Spécifique Professeur
    'specialite' => 'nullable|string|max:100',
]
```

**Processus de création** :
1. **Crée le compte de connexion** (Table `users`)
   ```php
   User::create([
       'name' => $validated['prenom'] . ' ' . $validated['nom'],
       'email' => $validated['email'],
       'password' => Hash::make($validated['password']),
       'role' => $validated['role'],
   ]);
   ```

2. **Crée le profil métier** (Table `etudiants` ou `professeurs`)
   - Préparation des données communes
   - **Si ETUDIANT** :
     ```php
     $user->etudiant()->create([
         'matricule' => $validated['matricule'],
         'id_groupe' => $validated['id_groupe'],
         'date_inscription' => now(),
         ...
     ]);
     ```
   - **Si PROF** :
     ```php
     $user->professeur()->create([
         'specialite' => $validated['specialite'],
         'date_embauche' => now(),
         'est_actif' => true,
         ...
     ]);
     ```

**Réponse** : Retourne l'utilisateur créé avec code `201`

---

### 📄 `Api/AdminStructureController.php`

Ce controller gère les **éléments structurels** du système (Filière, Groupe, Module, Documents).

#### 1️⃣ Gestion des Filières

**`indexFilieres()`**
- Retourne toutes les filières
- Réponse : `[{id_filiere, nom_filiere, description, ...}]`

**`storeFiliere(Request $request)`**
- Crée une nouvelle filière
- Validation : `nom_filiere` (unique et requis)
- Retourne code `201`

**`updateFiliere(Request $request, $id)`**
- Met à jour une filière
- Gère l'unicité du nom même si on change juste la description
- Validation avec `unique:filieres,nom_filiere,' . $id . ',id_filiere`

**`destroyFiliere($id)`**
- Supprime une filière
- Attention : échouera si des groupes sont liés (contraint par `onDelete('restrict')`)
- Gère l'exception et retourne `409` si impossible

---

#### 2️⃣ Gestion des Groupes

**`indexGroupes()`**
- Retourne tous les groupes avec les infos de leur filière
- Utilise `Groupe::with('filiere')->get()`

**`storeGroupe(Request $request)`**
- Crée un groupe
- Validation requise : `nom_groupe`, `annee_scolaire`, `capacite_max`, `id_filiere`
- Exemple : "Groupe L2 Info 2023-2024"

**`updateGroupe(Request $request, $id)`**
- Met à jour un groupe

**`destroyGroupe($id)`**
- Supprime un groupe

---

#### 3️⃣ Gestion des Modules

**`indexModules()`**
- Retourne tous les modules

**`storeModule(Request $request)`**
- Crée un module
- Validation : `nom_module`, `code_module` (unique), `credits_ects`
- Exemple : Code = "INFO-101", Crédits = 3

**`updateModule(Request $request, $id)`**
- Met à jour un module
- Gère l'unicité du code

**`destroyModule($id)`**
- Supprime un module

---

#### 4️⃣ Gestion des Documents et Vidéos

**`indexDocuments()` / `indexVideos()`**
- Listent les documents/vidéos publiés
- Filtres : `type_document = 'COURS'` ou `'VIDEO'`

**`storeDocument(Request $request)` / `storeVideo(Request $request)`**
- Créent un document/vidéo
- Définissent automatiquement :
  - `est_publie = true`
  - `est_valide = false` (attend validation admin)
  - `date_creation = now()`

**`updateDocument(Request $request, $id)` / `updateVideo(...)`**
- Modifient un document/vidéo

**`destroyDocument($id)` / `destroyVideo($id)`**
- Suppriment un document/vidéo

---

### 📄 `Api/AdminUserController.php`

Ce controller gère la **gestion complète des utilisateurs créés**.

#### Méthode : `index()`

**Objectif** : Lister tous les utilisateurs avec leurs profils métier

```php
User::with(['etudiant.groupe', 'professeur'])
    ->orderBy('created_at', 'desc')
    ->get();
```

**Retourne** :
```json
{
    "count": 42,
    "data": [
        {
            "id": 1,
            "name": "Dupont Paul",
            "email": "paul@example.com",
            "role": "ETUDIANT",
            "etudiant": { "matricule": "M12345", "groupe": {...} },
            "professeur": null
        }
    ]
}
```

---

#### Méthode : `show($id)`

**Objectif** : Récupérer les détails d'un utilisateur spécifique

```php
User::with(['etudiant.groupe', 'professeur'])->find($id);
```

**Retourne** : L'utilisateur avec tous ses détails ou `404` s'il n'existe pas

---

#### Méthode : `destroy($id)`

**Objectif** : Supprimer un utilisateur et son profil

**Protections** :
- Empêche la suppression du Super Admin (ID = 1, rôle = ADMIN)
- Suppression en cascade du profil (grâce à `onDelete('cascade')`)

**Retourne** : Message de succès ou code `403` si Super Admin

---

#### Méthode : `update(Request $request, $id)`

**Objectif** : Mettre à jour les infos d'un utilisateur

**Processus** :
1. Met à jour les infos générales dans `users`
2. Met à jour le profil `etudiant` s'il existe
3. Met à jour le profil `professeur` s'il existe
4. Retourne l'utilisateur frais avec les relations chargées

---

### 📄 `Api/AdminAssignmentController.php`

Ce controller gère les **assignations** entre les entités (Professeur↔Module, Filière↔Module).

#### Programme (Filière ↔ Module)

**`addModuleToFiliere(Request $request)`**

Ajoute un module au programme d'une filière

```php
$filiere->modules()->syncWithoutDetaching([
    $id_module => [
        'semestre' => $validated['semestre'],  // 1-6
        'coefficient' => $validated['coefficient']  // Poids dans le calcul
    ]
]);
```

**Paramètres** :
- `id_filiere` (exists dans filieres)
- `id_module` (exists dans modules)
- `semestre` (1-6)
- `coefficient` (≥ 1)

---

**`removeModuleFromFiliere($id_filiere, $id_module)`**

Retire un module d'une filière

```php
$filiere->modules()->detach($id_module);
```

---

#### Enseignement (Professeur ↔ Module)

**`assignProfToModule(Request $request)`**

Assigne un professeur à un module

```php
$prof->modules()->syncWithoutDetaching([
    $id_module => [
        'annee_affectation' => '2023-2024',
        'est_coordinateur' => false
    ]
]);
```

**Paramètres** :
- `id_prof` (exists dans professeurs)
- `id_module` (exists dans modules)
- `annee_affectation` (string, ex: "2023-2024")
- `est_coordinateur` (boolean, optionnel)

---

**`detachProfFromModule($id_prof, $id_module)`**

Désassigne un professeur d'un module

```php
$prof->modules()->detach($id_module);
```

---

### 📄 `Api/AdminValidationController.php`

Ce controller gère la **validation des cours** publiés par les professeurs avant qu'ils ne soient accessibles aux étudiants.

#### Méthode : `index()`

**Objectif** : Lister tous les cours (validés ou non)

```php
Cour::with(['groupes', 'groupes.filiere'])
    ->orderBy('created_at', 'desc')
    ->get();
```

---

#### Méthode : `pending()`

**Objectif** : Lister UNIQUEMENT les cours en attente de validation

```php
Cour::with('groupes')
    ->where('est_valide', false)
    ->get();
```

---

#### Méthode : `validateCourse($id)`

**Objectif** : Valider un cours et le rendre visible aux étudiants

**Processus** :
```php
$cour->est_valide = true;
$cour->est_publie = true;
$cour->save();
```

**Conséquence** : Le cours devient accessible aux étudiants du groupe cible

---

#### Méthode : `rejectCourse($id)`

**Objectif** : Rejeter/supprimer un cours inapproprié

**Deux options** :
- **Option A** : Juste le dépublier (masquer aux étudiants)
  ```php
  $cour->update(['est_publie' => false]);
  ```
- **Option B** : Supprimer définitivement
  ```php
  $cour->delete();
  ```

**⚠️ Attention** : Penser à supprimer le fichier physique aussi avec `Storage::delete()`

---

## Controllers Métier

### 📄 `Api/EtudiantCoursController.php`

Ce controller gère l'**accès des étudiants** aux cours qui leur sont destinés.

#### Méthode : `index(Request $request)`

**Objectif** : Lister les cours accessibles pour l'étudiant connecté

**Processus de sécurité** :
1. Récupère l'utilisateur connecté
   ```php
   $user = $request->user();
   ```

2. Récupère son profil métier Étudiant
   ```php
   $etudiantProfile = $user->etudiant;
   ```

3. Vérifie que l'étudiant a un groupe
   ```php
   if (!$etudiantProfile || !$etudiantProfile->id_groupe) {
       return 403; // Accès refusé
   }
   ```

4. Récupère les cours via la table pivot `diffusion`
   ```php
   $cours = Cour::whereHas('groupes', function ($query) use ($idGroupe) {
                    $query->where('groupes.id_groupe', $idGroupe);
                })
                ->where('est_publie', true)      // Publié par le prof
                ->where('est_valide', true)      // Validé par l'admin
                ->with('groupes:id_groupe,nom_groupe')
                ->orderBy('created_at', 'desc')
                ->get();
   ```

**Conditions pour voir un cours** :
- ✅ Le cours est lié au groupe de l'étudiant
- ✅ Le cours est publié (`est_publie = true`)
- ✅ Le cours est validé (`est_valide = true`)

---

#### Méthode : `download(Request $request, $id)`

**Objectif** : Télécharger un fichier de cours avec vérifications de sécurité

**5 étapes de vérification** :

1. **Vérification du profil**
   - L'utilisateur est bien un étudiant
   - A un groupe assigné

2. **Vérification d'existence**
   - Le cours existe
   - Retourne `404` sinon

3. **Vérification du statut**
   - Le cours est validé (`est_valide = true`)
   - Le cours est publié (`est_publie = true`)
   - Retourne `403` sinon

4. **Vérification du groupe** (IMPORTANTE)
   - Vérifie via la table `diffusion` que le cours est destiné au groupe
   - Empêche un étudiant d'accéder à un cours d'un autre groupe
   ```php
   $isDiffuse = $cour->groupes()->where('groupes.id_groupe', $idGroupe)->exists();
   ```

5. **Gestion du chemin fichier**
   - Gère plusieurs stratégies de chemins (`/storage/`, `storage/`, relatif)
   - Vérifie que le fichier existe sur le disque `public`
   - Retourne `404` si le fichier n'existe pas

**Retourne** : Télécharge le fichier avec le nom du cours

---

#### Méthode : `getProfile(Request $request)`

**Objectif** : Récupérer le profil complet de l'étudiant connecté

**Retourne** :
```json
{
    "status": "success",
    "data": {
        "id_etudiant": 1,
        "matricule": "M12345",
        "nom": "Dupont",
        "prenom": "Paul",
        "email": "paul@example.com",
        "groupe": {
            "id_groupe": 1,
            "nom_groupe": "L2 Info A",
            "filiere": { "id_filiere": 2, "nom_filiere": "Informatique" }
        }
    }
}
```

---

#### Méthode : `getNotifications(Request $request)`

**Objectif** : Récupérer les 5 derniers cours publiés pour le groupe de l'étudiant

```php
$notifications = Cour::whereHas('groupes', function ($query) use ($etudiant) {
                         $query->where('groupes.id_groupe', $etudiant->id_groupe);
                     })
                     ->where('est_publie', true)
                     ->where('est_valide', true)
                     ->orderBy('created_at', 'desc')
                     ->limit(5)
                     ->get();
```

**Retourne** : Tableau de notifications formatées avec titre et message

---

#### Méthode : `getCalendar(Request $request)`

**Objectif** : Récupérer le calendrier/planning des cours

(Détails à implémenter)

---

### 📄 `Api/ProfCoursController.php`

Ce controller gère la **création et gestion des cours** par les professeurs.

#### Méthode : `getMyModules(Request $request)`

**Objectif** : Récupérer les modules enseignés par le professeur

```php
$prof = $request->user()->professeur;
return $prof->modules;  // Via la table enseigner
```

**Retourne** : Tableau des modules du professeur

---

#### Méthode : `getMyGroupes()`

**Objectif** : Récupérer tous les groupes disponibles

```php
Groupe::all();
```

**Note** : Le professeur peut assigner ses cours à n'importe quel groupe (à vérifier si c'est le comportement voulu)

---

#### Méthode : `index(Request $request)`

**Objectif** : Lister tous les cours créés (par tous les profs)

```php
Cour::with('groupes')
    ->orderBy('created_at', 'desc')
    ->get();
```

**⚠️ À améliorer** : Filtrer les cours du professeur connecté uniquement

---

#### Méthode : `store(Request $request)`

**Objectif** : Créer un nouveau cours avec upload de fichier

**Validation requise** :
```php
[
    'titre' => 'required|string|max:255',
    'type_document' => 'required|in:COURS,TD,TP,VIDEO',
    'fichier' => 'required|file|max:20480',  // 20MB max
    'groupes' => 'required|array|exists:groupes,id_groupe',
    'description' => 'nullable|string'
]
```

**Processus** :

1. **Upload du fichier**
   ```php
   $path = $request->file('fichier')->store('cours_files', 'public');
   $url = 'cours_files/' . basename($path);
   ```

2. **Création en base de données**
   ```php
   $cour = new Cour();
   $cour->titre = $request->titre;
   $cour->type_document = $request->type_document;
   $cour->fichier_url = $url;
   $cour->est_publie = true;
   $cour->est_valide = false;  // Attend validation admin
   $cour->save();
   ```

3. **Assignation aux groupes**
   ```php
   $cour->groupes()->sync($request->groupes);
   ```

**Retourne** : Le cours créé avec code `201`

**Important** : Le cours est publié mais EN ATTENTE DE VALIDATION par l'admin avant d'être visible aux étudiants

---

#### Méthode : `update(Request $request, $id)`

**Objectif** : Modifier un cours

**Champs modifiables** :
- `titre`
- `description`
- `type_document`
- `groupes` (liste des groupes)

**Validation** : Utilise `sometimes` pour permettre des mises à jour partielles

---

#### Méthode : `destroy($id)`

**Objectif** : Supprimer un cours

**Processus** :
1. Récupère le cours
2. Supprime le fichier physique du disque `public`
3. Supprime l'enregistrement DB

**Gestion du chemin** :
```php
$path = $cour->fichier_url;
if (strpos($path, '/') === 0) {
    $path = substr($path, 1);  // Enlever le premier /
}
if (Storage::disk('public')->exists($path)) {
    Storage::disk('public')->delete($path);
}
$cour->delete();
```

---

### 📄 `ProfileController.php`

Ce controller gère le **profil** de l'utilisateur connecté (Web).

#### Méthode : `edit(Request $request): Response`

**Objectif** : Afficher le formulaire d'édition du profil

**Utilise Inertia** (React) pour le rendu

```php
return Inertia::render('Profile/Edit', [
    'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
    'status' => session('status'),
]);
```

---

#### Méthode : `update(ProfileUpdateRequest $request): RedirectResponse`

**Objectif** : Mettre à jour les infos du profil

**Processus** :
1. Remplit l'utilisateur avec les données validées
2. Si l'email change, réinitialise `email_verified_at`
3. Sauvegarde
4. Redirige vers le formulaire

```php
$request->user()->fill($request->validated());
if ($request->user()->isDirty('email')) {
    $request->user()->email_verified_at = null;
}
$request->user()->save();
```

---

#### Méthode : `destroy(Request $request): RedirectResponse`

**Objectif** : Supprimer le compte de l'utilisateur

**Processus** :
1. Valide le mot de passe actuel
2. Récupère l'utilisateur
3. Déconnecte (logout)
4. Supprime l'utilisateur
5. Invalide la session
6. Régénère le token CSRF
7. Redirige vers la page d'accueil

```php
$request->validate(['password' => 'required|current_password']);
$user = $request->user();
Auth::logout();
$user->delete();
$request->session()->invalidate();
$request->session()->regenerateToken();
return Redirect::to('/');
```

---

### 📄 `CoursController.php`

Ce controller gère l'**affichage générique** des cours (Web).

#### Méthode : `index()`

**Objectif** : Afficher la liste des cours

**Retourne une vue Inertia** (React)

```php
$cours = Cour::with('groupes')->get();
return Inertia::render('Cours/Index', [
    'cours' => $cours,
    'auth' => ['user' => Auth::user()]
]);
```

---

## Flow d'Authentification

### Diagramme d'Authentification

```
┌─────────────────────────────────────────────────────────────┐
│                   UTILISATEUR                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
          ┌────────────────────────┐
          │  Login (email/mdp)     │
          └────────────┬───────────┘
                       │
         ┌─────────────┴──────────────┐
         │ Type de client?           │
         └─────────────┬──────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
    ┌──────────────┐         ┌─────────────┐
    │ Web/Inertia  │         │ Mobile/SPA  │
    │ (Browser)    │         │ (Postman)   │
    └─────┬────────┘         └──────┬──────┘
          │                         │
          ▼                         ▼
    ┌──────────────────┐   ┌───────────────┐
    │ loginWeb()       │   │ login()       │
    │                  │   │               │
    │ - Validation     │   │ - Validation  │
    │ - Auth::attempt()│   │ - Auth::attempt
    │ - Session        │   │ - Token       │
    │ - Regenerate()   │   │ - Sanctum     │
    │ - Token          │   │               │
    └────────┬─────────┘   └────────┬──────┘
             │                      │
             ▼                      ▼
        ┌─────────────────────────────────────┐
        │ Récupération du profil métier       │
        │                                      │
        │ Si role = ETUDIANT:                 │
        │   - user->etudiant()->with('groupe')│
        │                                      │
        │ Si role = PROF:                     │
        │   - user->professeur               │
        └────────┬────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Réponse JSON       │
        │                    │
        │ - status           │
        │ - user             │
        │ - profil_metier    │
        │ - token (si API)   │
        │ - role             │
        └────────────────────┘
```

### Flux de Request Authentifiée

```
Frontend (avec token)
    │
    │ Headers: Authorization: Bearer <token>
    │
    ▼
Middleware d'authentification (Sanctum)
    │
    │ Vérifie le token
    │ Charge $request->user()
    │
    ▼
Controller API
    │
    │ $request->user() disponible
    │ $request->user()->etudiant/professeur
    │
    ▼
Retour JSON
```

---

## Hiérarchie des Rôles et Droits

### 1. ADMIN
- Peut gérer toutes les entités
- Valide les cours
- Crée des utilisateurs/étudiants/profs
- Gère la structure (filières, groupes, modules)

### 2. PROF
- Crée et publie ses cours
- Assigne ses cours à des groupes
- Les cours attendent validation de l'admin
- Accède uniquement aux modules qu'on lui a assignés (théoriquement)

### 3. ETUDIANT
- Accède seulement aux cours de son groupe
- Télécharge les fichiers
- Consulte son profil

---

## Points Clés à Retenir

### ✅ Bonnes Pratiques Utilisées

1. **Validation centralisée** : Chaque méthode valide ses inputs
2. **Gestion d'erreurs** : Codes HTTP appropriés (201, 403, 404, etc.)
3. **Relations Eager Loading** : `with('groupes', 'filiere')` pour éviter les N+1 queries
4. **Sécurité multicouche** :
   - Vérification du rôle
   - Vérification du groupe (côté serveur)
   - Protection des fichiers
5. **Polymorphisme manuel** : User → Etudiant/Professeur

### ⚠️ Points à Améliorer

1. **ProfCoursController::index()** : Devrait filtrer les cours du prof connecté uniquement
2. **Suppression de fichiers** : Pas toujours nettoyée lors des suppressions
3. **Autorisation granulaire** : Pourrait utiliser des Policies Laravel
4. **Gestion des fichiers** : Manque de contrôle du MIME type
5. **Rate limiting** : Ajouter pour éviter les abus

### 🔒 Sécurité

- Tous les chemins critiques sont validés
- Les fichiers téléchargés sont restreints au groupe
- Les mots de passe sont hashés
- Les sessions sont régénérées après login
- Les tokens Sanctum sont utilisés pour l'API

---

## Conclusion

La structure des controllers suit une architecture **RESTful** claire avec une **séparation des responsabilités** logique. Chaque controller a un rôle bien défini et les flows d'authentification supportent à la fois des clients **Web** (sessions) et **mobiles/SPA** (tokens).

