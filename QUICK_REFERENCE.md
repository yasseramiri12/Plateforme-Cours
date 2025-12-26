# 🎓 CONCEPTS OOP DANS LE PROJET BACKEND

## 📚 TABLE DES MATIÈRES
1. **Héritage (Inheritance)**
2. **Encapsulation (Encapsulation)**
3. **Polymorphisme (Polymorphism)**
4. **Abstraction (Abstraction)**

---

# 1️⃣ HÉRITAGE (INHERITANCE)

## 📖 Définition
L'héritage permet à une classe enfant d'hériter des propriétés et méthodes d'une classe parent.

**Mot-clé** : `extends`

---

## 💡 EXEMPLE 1: Controller Inheritance

### Classe Parent (Abstraite)
```php
// app/Http/Controllers/Controller.php
abstract class Controller
{
    // Base controller - contient les fonctionnalités communes
}
```

### Classes Enfants (Héritent de Controller)
```php
// app/Http/Controllers/Api/StudentController.php
class StudentController extends Controller
{
    public function __construct(private readonly AnalyticsService $analytics)
    {
    }
    
    public function dashboard()
    {
        // Hérite des méthodes de Controller
    }
}

// app/Http/Controllers/Api/ChatbotController.php
class ChatbotController extends Controller
{
    public function __construct(
        private readonly AnalyticsService $analytics,
        private readonly AIService $aiService,
    ) {
    }
    
    public function ask(Request $request)
    {
        // Hérite des méthodes de Controller
    }
}

// app/Http/Controllers/Api/TeacherController.php
class TeacherController extends Controller
{
    // Hérite aussi de Controller
}
```

### Avantages
✅ **Réutilisation de code** : Toutes les classes héritent des fonctionnalités communes  
✅ **Maintenance facile** : Modifications au niveau parent affectent tous les enfants  
✅ **Cohérence** : Tous les contrôleurs suivent la même structure  

---

## 💡 EXEMPLE 2: Model Inheritance

### Classe Parent (Eloquent Model)
```php
// app/Models/User.php
class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasApiTokens;
    
    // Hérite de toutes les méthodes Eloquent
    // - save(), find(), where(), etc.
}
```

### Ce que User hérite de Authenticatable
```php
// Authenticatable fournit:
- authenticate()  // Authentifier l'utilisateur
- check()         // Vérifier si authentifié
- id()            // Récupérer l'ID
- hasRole()       // Vérifier le rôle
```

### Utilisation dans le code
```php
// app/Http/Controllers/Api/ChatbotController.php
$userId = Auth::id();  // ✅ Hérité d'Authenticatable
$user = User::findOrFail($userId);  // ✅ Hérité d'Eloquent Model
```

---

## 💡 EXEMPLE 3: Resource Inheritance

### Classe Parent
```php
// Illuminate\Http\Resources\Json\JsonResource
class JsonResource
{
    public function toArray($request)
    {
        // Méthode pour transformer les données
    }
}
```

### Classe Enfant
```php
// app/Http/Resources/GradeResource.php
class GradeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'valeur_note' => $this->valeur_note,
            'type_evaluation' => $this->type_evaluation,
            'date_evaluation' => $this->date_evaluation,
            'module' => $this->whenLoaded('module', function () {
                return [
                    'id' => $this->module->id,
                    'intitule' => $this->module->intitule,
                    'code_module' => $this->module->code_module,
                ];
            }),
        ];
    }
}
```

### Avantages
✅ **Transformation de données** : Hérite de la méthode `toArray()`  
✅ **Formatage JSON** : Convertit automatiquement en JSON  
✅ **Réutilisabilité** : Peut être utilisé dans plusieurs endpoints  

---

## 📊 RÉSUMÉ HÉRITAGE

| Classe Parent | Classes Enfants | Héritage |
|---------------|-----------------|----------|
| `Controller` | `StudentController`, `ChatbotController`, `TeacherController`, etc. | ✅ Oui |
| `Authenticatable` | `User` | ✅ Oui |
| `JsonResource` | `GradeResource`, `AttendanceResource` | ✅ Oui |
| `Model` | `User`, `Grade`, `Module`, `Seance` | ✅ Oui |

---

# 2️⃣ ENCAPSULATION (ENCAPSULATION)

## 📖 Définition
L'encapsulation cache les détails internes d'une classe et expose seulement ce qui est nécessaire.

**Modificateurs** : `public`, `private`, `protected`

---

## 💡 EXEMPLE 1: User Model - Encapsulation des Données Sensibles

### Code
```php
// app/Models/User.php
class User extends Authenticatable
{
    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',                      // ❌ Caché
        'two_factor_secret',             // ❌ Caché
        'two_factor_recovery_codes',     // ❌ Caché
        'remember_token',                // ❌ Caché
    ];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'nom',                           // ✅ Assignable
        'prenom',                        // ✅ Assignable
        'name',                          // ✅ Assignable
        'email',                         // ✅ Assignable
        'telephone',                     // ✅ Assignable
        'password',                      // ✅ Assignable
        'role',                          // ✅ Assignable
        'class_group_id',                // ✅ Assignable
        'status',                        // ✅ Assignable
    ];
}
```

### Avantages
✅ **Sécurité** : Les mots de passe ne sont jamais exposés en JSON  
✅ **Contrôle** : Seuls les attributs `fillable` peuvent être assignés en masse  
✅ **Protection** : Les données sensibles restent privées  

### Utilisation
```php
// ✅ Retourne l'utilisateur SANS le mot de passe
$user = User::find(1);
return response()->json($user);  // password n'est pas inclus

// ❌ Impossible d'assigner directement
$user->secret_field = 'value';  // Erreur : secret_field n'est pas fillable
```

---

## 💡 EXEMPLE 2: AnalyticsService - Encapsulation des Méthodes

### Code
```php
// app/Services/AnalyticsService.php
class AnalyticsService
{
    // ✅ Public - Accessible de l'extérieur
    public function calculateStudentGPA(int $userId): ?float
    {
        $avg = Grade::where('user_id', $userId)->avg('valeur_note');
        if ($avg === null) {
            return null;
        }
        return round((float) $avg, 2);
    }

    // ✅ Public - Accessible de l'extérieur
    public function getModuleTrend(int $userId, int $moduleId): string
    {
        $lastThreeAvg = Grade::where('user_id', $userId)
            ->where('module_id', $moduleId)
            ->orderByDesc('date_evaluation')
            ->take(3)
            ->avg('valeur_note');

        $moduleAvg = Grade::where('module_id', $moduleId)->avg('valeur_note');

        if ($lastThreeAvg === null || $moduleAvg === null) {
            return 'Stable';
        }

        $delta = (float) $lastThreeAvg - (float) $moduleAvg;
        if ($delta > 0.5) {
            return 'Up';
        }
        if ($delta < -0.5) {
            return 'Down';
        }
        return 'Stable';
    }

    // ✅ Public - Accessible de l'extérieur
    public function getAbsenceHours(int $userId): float
    {
        // Calcul des heures d'absence
    }
}
```

### Utilisation dans ChatbotController
```php
// app/Http/Controllers/Api/ChatbotController.php
class ChatbotController extends Controller
{
    public function __construct(
        private readonly AnalyticsService $analytics,  // ✅ Encapsulé
        private readonly AIService $aiService,        // ✅ Encapsulé
    ) {
    }

    public function ask(Request $request)
    {
        // Utilise les méthodes publiques de AnalyticsService
        $gpa = $this->analytics->calculateStudentGPA($user->id);  // ✅ Appel public
        $trend = $this->analytics->getModuleTrend($user->id, $moduleId);  // ✅ Appel public
        $hours = $this->analytics->getAbsenceHours($user->id);  // ✅ Appel public
    }
}
```

### Avantages
✅ **Abstraction** : Les détails internes sont cachés  
✅ **Interface claire** : Seulement les méthodes publiques sont exposées  
✅ **Maintenance** : Modifications internes n'affectent pas les utilisateurs  

---

## 💡 EXEMPLE 3: AIService - Encapsulation de la Configuration

### Code
```php
// app/Services/AIService.php
class AIService
{
    // ✅ Public - Accessible de l'extérieur
    public function getAIResponse(string $prompt): string
    {
        $apiKey = config('services.gemini.key');  // ✅ Encapsulé
        $model = config('services.gemini.model', 'gemini-1.5-flash');  // ✅ Encapsulé
        
        if (!$apiKey) {
            Log::error('Gemini API key missing');
            throw new \RuntimeException("Erreur de connexion à l'IA");
        }

        try {
            $url = sprintf(
                'https://generativelanguage.googleapis.com/v1/models/%s:generateContent?key=%s',
                $model,
                urlencode($apiKey)
            );

            $systemPrompt = "Vous êtes un assistant de tutorat académique...";
            $combinedPrompt = $systemPrompt."\n\nQuestion: ".$prompt;

            $response = Http::timeout(15)
                ->retry(2, 500)
                ->asJson()
                ->post($url, [
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [ ['text' => $combinedPrompt] ],
                        ],
                    ],
                ]);

            return $response['candidates'][0]['content']['parts'][0]['text'] ?? 'Pas de réponse';
        } catch (\Throwable $e) {
            Log::error('Gemini API error', ['error' => $e->getMessage()]);
            throw new \RuntimeException("Erreur lors de la communication avec l'IA");
        }
    }
}
```

### Avantages
✅ **Sécurité** : La clé API est encapsulée dans la configuration  
✅ **Flexibilité** : Peut changer le modèle sans modifier le code  
✅ **Gestion d'erreurs** : Les erreurs sont gérées en interne  

---

## 📊 RÉSUMÉ ENCAPSULATION

| Élément | Visibilité | Raison |
|---------|-----------|--------|
| `password` (User) | `protected $hidden` | Sécurité |
| `fillable` (User) | `protected $fillable` | Contrôle |
| `calculateStudentGPA()` | `public` | Interface |
| `getAIResponse()` | `public` | Interface |
| Clé API | `config()` | Sécurité |

---

# 3️⃣ POLYMORPHISME (POLYMORPHISM)

## 📖 Définition
Le polymorphisme permet à des objets de différentes classes de répondre au même appel de méthode de manière différente.

**Types** : Polymorphisme de méthode (Override)

---

## 💡 EXEMPLE 1: Resource Polymorphism

### Classe Parent
```php
// Illuminate\Http\Resources\Json\JsonResource
class JsonResource
{
    public function toArray($request)
    {
        // Implémentation par défaut
    }
}
```

### Classes Enfants - Implémentations Différentes

#### GradeResource
```php
// app/Http/Resources/GradeResource.php
class GradeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'valeur_note' => $this->valeur_note,
            'type_evaluation' => $this->type_evaluation,
            'date_evaluation' => $this->date_evaluation,
            'module' => $this->whenLoaded('module', function () {
                return [
                    'id' => $this->module->id,
                    'intitule' => $this->module->intitule,
                    'code_module' => $this->module->code_module,
                ];
            }),
        ];
    }
}
```

#### AttendanceResource
```php
// app/Http/Resources/AttendanceResource.php
class AttendanceResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'seance_id' => $this->seance_id,
            'statut' => $this->statut,
            'date_enregistrement' => $this->date_enregistrement,
            'seance' => $this->whenLoaded('seance', function () {
                return [
                    'id' => $this->seance->id,
                    'date_heure_debut' => $this->seance->date_heure_debut,
                    'module' => $this->seance->module->intitule ?? null,
                ];
            }),
        ];
    }
}
```

### Utilisation Polymorphe
```php
// app/Http/Controllers/Api/GradeController.php
public function index()
{
    $grades = Grade::all();
    return GradeResource::collection($grades);  // ✅ Utilise GradeResource::toArray()
}

// app/Http/Controllers/Api/AttendanceController.php
public function index()
{
    $attendance = Attendance::all();
    return AttendanceResource::collection($attendance);  // ✅ Utilise AttendanceResource::toArray()
}
```

### Avantages
✅ **Flexibilité** : Chaque ressource formate ses données différemment  
✅ **Réutilisabilité** : Même interface, implémentations différentes  
✅ **Maintenabilité** : Modifications isolées par ressource  

---

## 💡 EXEMPLE 2: Service Polymorphism

### Deux Services Différents

#### AnalyticsService
```php
// app/Services/AnalyticsService.php
class AnalyticsService
{
    public function calculateStudentGPA(int $userId): ?float
    {
        // Logique de calcul de GPA
    }

    public function getModuleTrend(int $userId, int $moduleId): string
    {
        // Logique de tendance
    }
}
```

#### AIService
```php
// app/Services/AIService.php
class AIService
{
    public function getAIResponse(string $prompt): string
    {
        // Logique d'IA
    }
}
```

### Utilisation Polymorphe dans ChatbotController
```php
// app/Http/Controllers/Api/ChatbotController.php
class ChatbotController extends Controller
{
    public function __construct(
        private readonly AnalyticsService $analytics,
        private readonly AIService $aiService,
    ) {
    }

    public function ask(Request $request)
    {
        // ✅ Polymorphisme : Utilise différents services selon le contexte
        
        if (str_contains($q, 'moyenne')) {
            // Utilise AnalyticsService
            $gpa = $this->analytics->calculateStudentGPA($user->id);
            return response()->json(['source' => 'local', 'answer' => "Votre moyenne est {$gpa}/20."]);
        }
        
        // Utilise AIService
        return response()->json(['source' => 'ai', 'answer' => $this->aiService->getAIResponse($question)]);
    }
}
```

### Avantages
✅ **Séparation des responsabilités** : Chaque service a sa propre logique  
✅ **Flexibilité** : Peut changer de service sans modifier le contrôleur  
✅ **Testabilité** : Chaque service peut être testé indépendamment  

---

## 📊 RÉSUMÉ POLYMORPHISME

| Classe Parent | Méthode | Enfants | Implémentations |
|---------------|---------|--------|-----------------|
| `JsonResource` | `toArray()` | `GradeResource`, `AttendanceResource` | Différentes |
| `AnalyticsService` | `calculateStudentGPA()` | Utilisée par ChatbotController | Spécifique |
| `AIService` | `getAIResponse()` | Utilisée par ChatbotController | Spécifique |

---

# 4️⃣ ABSTRACTION (ABSTRACTION)

## 📖 Définition
L'abstraction cache la complexité et expose seulement les détails essentiels.

**Mots-clés** : `abstract class`, `interface`

---

## 💡 EXEMPLE 1: Abstract Controller

### Classe Abstraite
```php
// app/Http/Controllers/Controller.php
abstract class Controller
{
    // Base controller - contient les fonctionnalités communes
    // Ne peut pas être instanciée directement
}
```

### Utilisation
```php
// ❌ Impossible
$controller = new Controller();  // Erreur : Cannot instantiate abstract class

// ✅ Correct
$controller = new StudentController();  // Hérité de Controller
$controller = new ChatbotController();  // Hérité de Controller
```

### Avantages
✅ **Force la structure** : Les enfants doivent implémenter les méthodes abstraites  
✅ **Prévient l'instanciation directe** : Garantit l'utilisation correcte  
✅ **Cohérence** : Tous les contrôleurs suivent la même structure  

---

## 💡 EXEMPLE 2: Service Abstraction

### AnalyticsService - Abstraction des Calculs

```php
// app/Services/AnalyticsService.php
class AnalyticsService
{
    /**
     * Abstraction : Cache la complexité du calcul de GPA
     * L'utilisateur ne voit que l'interface simple
     */
    public function calculateStudentGPA(int $userId): ?float
    {
        // Détails internes cachés
        $avg = Grade::where('user_id', $userId)->avg('valeur_note');
        if ($avg === null) {
            return null;
        }
        return round((float) $avg, 2);
    }

    /**
     * Abstraction : Cache la complexité du calcul de tendance
     */
    public function getModuleTrend(int $userId, int $moduleId): string
    {
        // Détails internes cachés
        $lastThreeAvg = Grade::where('user_id', $userId)
            ->where('module_id', $moduleId)
            ->orderByDesc('date_evaluation')
            ->take(3)
            ->avg('valeur_note');

        $moduleAvg = Grade::where('module_id', $moduleId)->avg('valeur_note');

        if ($lastThreeAvg === null || $moduleAvg === null) {
            return 'Stable';
        }

        $delta = (float) $lastThreeAvg - (float) $moduleAvg;
        if ($delta > 0.5) {
            return 'Up';
        }
        if ($delta < -0.5) {
            return 'Down';
        }
        return 'Stable';
    }

    /**
     * Abstraction : Cache la complexité du calcul d'absence
     */
    public function getAbsenceHours(int $userId): float
    {
        // Détails internes cachés
        // Calcul complexe...
    }
}
```

### Utilisation Simple
```php
// app/Http/Controllers/Api/ChatbotController.php
public function ask(Request $request)
{
    // ✅ Interface simple - Détails cachés
    $gpa = $this->analytics->calculateStudentGPA($user->id);  // Simple !
    $trend = $this->analytics->getModuleTrend($user->id, $moduleId);  // Simple !
    $hours = $this->analytics->getAbsenceHours($user->id);  // Simple !
    
    // L'utilisateur ne voit pas la complexité interne
}
```

### Avantages
✅ **Simplicité** : Interface simple pour utiliser le service  
✅ **Flexibilité** : Peut changer l'implémentation interne sans affecter l'utilisateur  
✅ **Maintenabilité** : Les détails complexes sont isolés  

---

## 💡 EXEMPLE 3: Model Abstraction

### User Model - Abstraction des Relations

```php
// app/Models/User.php
class User extends Authenticatable
{
    // ✅ Abstraction : Cache la complexité des relations
    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    public function seances()
    {
        return $this->belongsToMany(Seance::class, 'attendance');
    }

    public function classGroup()
    {
        return $this->belongsTo(ClassGroup::class);
    }

    public function recommendations()
    {
        return $this->hasMany(Recommendation::class);
    }

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'grades');
    }
}
```

### Utilisation Simple
```php
// app/Http/Controllers/Api/ChatbotController.php
$user = User::find($userId);

// ✅ Interface simple - Détails cachés
$total = $user->seances()->count();  // Simple !
$absent = $user->seances()->wherePivot('statut', 'absent')->count();  // Simple !

// L'utilisateur ne voit pas la complexité des jointures SQL
```

### Avantages
✅ **Abstraction des relations** : Les jointures SQL sont cachées  
✅ **Interface fluide** : Syntaxe simple et lisible  
✅ **Maintenabilité** : Modifications des relations isolées  

---

## 💡 EXEMPLE 4: Request Validation Abstraction

### Validation Abstraite
```php
// app/Http/Controllers/Api/ChatbotController.php
public function ask(Request $request)
{
    $question = (string) $request->input('question');
    
    // ✅ Abstraction : Cache la complexité de la validation
    if (trim($question) === '') {
        return response()->json(['message' => 'Question requise.'], 422);
    }
    
    // Détails de validation cachés - l'utilisateur voit juste le résultat
}
```

### Avantages
✅ **Validation simple** : Logique claire et lisible  
✅ **Sécurité** : Validation avant traitement  
✅ **Maintenabilité** : Règles de validation isolées  

---

## 📊 RÉSUMÉ ABSTRACTION

| Élément | Abstraction | Détails Cachés |
|---------|------------|-----------------|
| `Controller` | Classe abstraite | Implémentation commune |
| `AnalyticsService` | Méthodes publiques | Calculs complexes |
| `User` relations | Méthodes fluides | Jointures SQL |
| `AIService` | Interface simple | Appels API |
| Validation | Logique simple | Règles complexes |

---

# 🎯 RÉSUMÉ GLOBAL

## Tableau Récapitulatif

| Concept | Où | Exemple | Avantage |
|---------|-----|---------|----------|
| **Héritage** | `extends` | `StudentController extends Controller` | Réutilisation de code |
| **Encapsulation** | `protected`, `private` | `protected $hidden` | Sécurité |
| **Polymorphisme** | `toArray()` | `GradeResource`, `AttendanceResource` | Flexibilité |
| **Abstraction** | `abstract`, `public` | `AnalyticsService` | Simplicité |

---

## 🎓 POINTS CLÉS À RETENIR

### Héritage
✅ `StudentController extends Controller`  
✅ `User extends Authenticatable`  
✅ `GradeResource extends JsonResource`  

### Encapsulation
✅ `protected $hidden` (User)  
✅ `protected $fillable` (User)  
✅ Méthodes `public` (AnalyticsService)  

### Polymorphisme
✅ `toArray()` implémenté différemment dans `GradeResource` et `AttendanceResource`  
✅ Différents services utilisés selon le contexte  

### Abstraction
✅ `abstract class Controller`  
✅ Méthodes publiques cachent la complexité  
✅ Relations Eloquent abstraites  

---

## 💬 COMMENT L'EXPLIQUER AU PROFESSEUR

### Héritage
"Dans mon projet, j'utilise l'héritage pour que tous les contrôleurs héritent de la classe `Controller`. Par exemple, `StudentController extends Controller`, ce qui permet de réutiliser le code commun."

### Encapsulation
"J'encapsule les données sensibles en utilisant `protected $hidden` dans le modèle `User` pour cacher le mot de passe. Je contrôle aussi quels attributs peuvent être assignés avec `protected $fillable`."

### Polymorphisme
"J'utilise le polymorphisme avec les ressources. `GradeResource` et `AttendanceResource` héritent toutes deux de `JsonResource` mais implémentent `toArray()` différemment selon leurs besoins."

### Abstraction
"J'abstrais la complexité avec `AnalyticsService`. L'utilisateur appelle simplement `calculateStudentGPA()` sans voir les détails du calcul. C'est la même chose avec les relations Eloquent qui cachent les jointures SQL."