/**
 * Page Calendrier - Affiche les cours et l'horaire
 * Vue calendrier avec les cours de l'étudiant
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentLayout from '@/Layouts/StudentLayout';
import { Calendar, BookOpen, User, MapPin, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Charge le calendrier au montage
    useEffect(() => {
        fetchCalendar();
    }, []);

    /**
     * Récupère les cours pour le calendrier
     */
    const fetchCalendar = async () => {
        try {
            setLoading(true);
            
            // Configuration avec credentials + token Bearer
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                withCredentials: true
            };
            
            // Ajouter le token Bearer si disponible
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            
            const res = await axios.get('/api/etudiant/calendrier', config);
            
            setCourses(res.data.data || []);
            setError(null);
        } catch (e) {
            console.error('Erreur chargement calendrier:', e);
            console.error('Response status:', e.response?.status);
            console.error('Response data:', e.response?.data);
            if (e.response?.status === 401) {
                setError("Session expirée. Veuillez vous reconnecter.");
            } else if (e.response?.status === 403) {
                setError("Accès non autorisé au calendrier.");
            } else {
                setError(`Impossible de charger le calendrier: ${e.response?.data?.message || e.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Fonctions de navigation du calendrier
    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);

    // Crée un tableau des jours
    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    /**
     * Obtient les cours pour un jour donné
     */
    const getCoursesForDay = (day) => {
        return courses.filter(course => {
            const courseDate = new Date(course.created_at);
            return courseDate.getDate() === day &&
                   courseDate.getMonth() === currentMonth.getMonth() &&
                   courseDate.getFullYear() === currentMonth.getFullYear();
        });
    };

    return (
        <StudentLayout title="Calendrier">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendrier */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Calendrier des Cours</h2>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={previousMonth}
                                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <span className="text-sm font-medium text-gray-900 w-40 text-center capitalize">
                                {monthName}
                            </span>
                            <button 
                                onClick={nextMonth}
                                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Jours de la semaine */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Jours du mois */}
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((day, index) => {
                            const daysCourses = day ? getCoursesForDay(day) : [];
                            const isToday = day === new Date().getDate() && 
                                          currentMonth.getMonth() === new Date().getMonth() &&
                                          currentMonth.getFullYear() === new Date().getFullYear();

                            return (
                                <div 
                                    key={index}
                                    className={`min-h-24 p-2 rounded-lg border transition-colors ${
                                        day === null 
                                            ? 'bg-gray-50 border-transparent' 
                                            : daysCourses.length > 0
                                            ? 'bg-indigo-50 border-indigo-200 hover:border-indigo-300'
                                            : isToday
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {day && (
                                        <>
                                            <div className={`text-xs font-semibold mb-1 ${
                                                isToday ? 'text-blue-600' : 'text-gray-700'
                                            }`}>
                                                {day}
                                            </div>
                                            <div className="space-y-0.5">
                                                {daysCourses.slice(0, 2).map((course, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className="text-xs px-1.5 py-0.5 bg-indigo-600 text-white rounded truncate"
                                                        title={course.titre}
                                                    >
                                                        {course.titre}
                                                    </div>
                                                ))}
                                                {daysCourses.length > 2 && (
                                                    <div className="text-xs text-gray-600 px-1.5">
                                                        +{daysCourses.length - 2} plus
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Légende */}
                    <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
                            <span>Aujourd'hui</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-indigo-50 border border-indigo-200 rounded"></div>
                            <span>Jour avec cours</span>
                        </div>
                    </div>
                </div>

                {/* Panel Événements */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Événements</h3>
                    
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                            <p className="text-xs text-gray-600">Chargement...</p>
                        </div>
                    ) : error ? (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-xs">Aucun cours pour ce mois</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {courses.map((course) => (
                                <div 
                                    key={course.id_cour}
                                    className="p-3 rounded-lg border border-gray-200 hover:border-indigo-200 hover:shadow-sm transition-all"
                                >
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                                        {course.titre}
                                    </h4>
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                        {course.description || 'Aucune description'}
                                    </p>
                                    <div className="space-y-1 text-xs text-gray-500">
                                        {course.type_document && (
                                            <div className="flex items-center gap-1.5">
                                                <BookOpen className="w-3 h-3" />
                                                <span>{course.type_document}</span>
                                            </div>
                                        )}
                                        {course.professeur && (
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-3 h-3" />
                                                <span>{course.professeur.name || 'Professeur'}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            <span>
                                                {new Date(course.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
