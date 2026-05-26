import React, { useState, useEffect } from 'react';
import { Course, ScheduleEvent, Assignment, StudentProfile, GradeItem } from './types';
import { 
  INITIAL_PROFILE, 
  INITIAL_COURSES, 
  INITIAL_SCHEDULE, 
  INITIAL_ASSIGNMENTS,
  calculateGpa
} from './data';
import DashboardOverview from './components/DashboardOverview';
import GradesSection from './components/GradesSection';
import ScheduleSection from './components/ScheduleSection';
import AssignmentsSection from './components/AssignmentsSection';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  CalendarDays, 
  ListTodo, 
  LayoutDashboard, 
  Clock, 
  Menu, 
  X, 
  User, 
  BookOpen, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  // --- Persistent States from Local Storage ---
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('st_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('st_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [schedule, setSchedule] = useState<ScheduleEvent[]>(() => {
    const saved = localStorage.getItem('st_schedule');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('st_assignments');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  // --- Layout states ---
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'schedule' | 'assignments'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date('2026-05-26T12:59:12Z')); // starting from real local time
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState(profile.name);
  const [editMajor, setEditMajor] = useState(profile.major);
  const [editSemester, setEditSemester] = useState(profile.semester);
  const [editTargetGpa, setEditTargetGpa] = useState(profile.targetGpa);

  // Quick Action Form triggers (passed down to force-expand forms in sections)
  const [assignmentFormRequested, setAssignmentFormRequested] = useState(false);

  // --- Clock updater to make it feel alive ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(prev => new Date(prev.getTime() + 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- State setters that auto-update Local Storage ---
  const saveProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    localStorage.setItem('st_profile', JSON.stringify(newProfile));
  };

  const saveCourses = (newCourses: Course[]) => {
    setCourses(newCourses);
    localStorage.setItem('st_courses', JSON.stringify(newCourses));
  };

  const saveSchedule = (newSchedule: ScheduleEvent[]) => {
    setSchedule(newSchedule);
    localStorage.setItem('st_schedule', JSON.stringify(newSchedule));
  };

  const saveAssignments = (newAssignments: Assignment[]) => {
    setAssignments(newAssignments);
    localStorage.setItem('st_assignments', JSON.stringify(newAssignments));
  };

  // --- Actions Handlers ---

  // Course handlers
  const handleAddCourse = (newCourseData: Omit<Course, 'id' | 'gradeEntries'>) => {
    const newCourse: Course = {
      ...newCourseData,
      id: `course-${Date.now()}`,
      gradeEntries: []
    };
    saveCourses([...courses, newCourse]);
  };

  const handleDeleteCourse = (courseId: string) => {
    const filtered = courses.filter(c => c.id !== courseId);
    saveCourses(filtered);
    
    // Also remove associated assignments & class schedule events to maintain integrity
    const filteredAssignments = assignments.filter(a => a.courseId !== courseId);
    saveAssignments(filteredAssignments);

    const filteredSchedule = schedule.filter(s => s.courseId !== courseId);
    saveSchedule(filteredSchedule);
  };

  // Grade handlers inside Course
  const handleAddGradeItem = (courseId: string, itemData: Omit<GradeItem, 'id'>) => {
    const updated = courses.map(course => {
      if (course.id === courseId) {
        const newItem: GradeItem = {
          ...itemData,
          id: `grade-${Date.now()}`
        };
        return {
          ...course,
          gradeEntries: [...course.gradeEntries, newItem]
        };
      }
      return course;
    });
    saveCourses(updated);
  };

  const handleDeleteGradeItem = (courseId: string, itemId: string) => {
    const updated = courses.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          gradeEntries: course.gradeEntries.filter(entry => entry.id !== itemId)
        };
      }
      return course;
    });
    saveCourses(updated);
  };

  // Schedule handlers
  const handleAddClass = (newEventData: Omit<ScheduleEvent, 'id'>) => {
    const newEvent: ScheduleEvent = {
      ...newEventData,
      id: `schedule-${Date.now()}`
    };
    saveSchedule([...schedule, newEvent]);
  };

  const handleDeleteClass = (classId: string) => {
    saveSchedule(schedule.filter(s => s.id !== classId));
  };

  // Assignment handlers
  const handleAddAssignment = (newAssignmentData: Omit<Assignment, 'id'>) => {
    const newAssignment: Assignment = {
      ...newAssignmentData,
      id: `assignment-${Date.now()}`
    };
    saveAssignments([...assignments, newAssignment]);
    setAssignmentFormRequested(false);
  };

  const handleToggleAssignment = (id: string) => {
    const updated = assignments.map(a => {
      if (a.id === id) {
        return { ...a, completed: !a.completed };
      }
      return a;
    });
    saveAssignments(updated);
  };

  const handleDeleteAssignment = (id: string) => {
    saveAssignments(assignments.filter(a => a.id !== id));
  };

  // Reset demo defaults helper
  const handleResetDemoDefaults = () => {
    if (confirm("Reset everything to original academic demo values? This over-writes all custom entered scores/classes.")) {
      saveProfile(INITIAL_PROFILE);
      saveCourses(INITIAL_COURSES);
      saveSchedule(INITIAL_SCHEDULE);
      saveAssignments(INITIAL_ASSIGNMENTS);
      setActiveTab('overview');
      setShowProfileEdit(false);
    }
  };

  // Edit profile submit
  const handleEditProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile({
      name: editName.trim(),
      major: editMajor.trim(),
      semester: editSemester.trim(),
      targetGpa: Number(editTargetGpa)
    });
    setShowProfileEdit(false);
  };

  // Global Quick actions triggers
  const triggerAddAssignmentTab = () => {
    setAssignmentFormRequested(true);
    setActiveTab('assignments');
  };

  // Tab configurations
  const menuItems = [
    { id: 'overview', label: 'At a Glance', icon: LayoutDashboard },
    { id: 'grades', label: 'Academic Grades', icon: GraduationCap },
    { id: 'schedule', label: 'Weekly Timetable', icon: CalendarDays },
    { id: 'assignments', label: 'Assignments Ledger', icon: ListTodo }
  ] as const;

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col font-sans text-dark-text" id="applet-core">
      
      {/* Top Profile & Header Control Bar */}
      <header className="sticky top-0 z-40 bg-dark-card border-b border-dark-border px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 hover:bg-dark-surface rounded-lg text-dark-muted lg:hidden cursor-pointer"
            id="mobile-hamburger-btn"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="p-2 bg-dark-surface border border-dark-border text-white rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </span>
            <div>
              <h1 className="font-semibold text-white leading-tight tracking-tight text-md">Campuses</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-dark-muted">Student Dashboard</span>
            </div>
          </div>
        </div>

        {/* Global profile/clock metrics */}
        <div className="flex items-center gap-6 text-xs">
          {/* Calendar status / Fallback Clock */}
          <div className="hidden md:flex items-center gap-2 text-dark-muted font-medium">
            <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <span className="text-dark-border">|</span>
            <span className="font-mono bg-dark-surface px-2 py-0.5 rounded font-semibold text-dark-text border border-dark-border">
              {currentTime.getUTCHours().toString().padStart(2, '0')}:
              {currentTime.getUTCMinutes().toString().padStart(2, '0')}:
              {currentTime.getUTCSeconds().toString().padStart(2, '0')} UTC
            </span>
          </div>

          <span className="w-px h-5 bg-dark-border hidden md:block" />

          {/* Student Capsule profile */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setEditName(profile.name);
                setEditMajor(profile.major);
                setEditSemester(profile.semester);
                setEditTargetGpa(profile.targetGpa);
                setShowProfileEdit(!showProfileEdit);
              }}
              className="flex items-center gap-2.5 text-left group hover:opacity-90 select-none cursor-pointer"
              id="student-profile-capsule"
            >
              <div className="w-8.5 h-8.5 rounded-full bg-dark-surface text-white flex items-center justify-center font-bold text-xs border border-dark-border group-hover:border-indigo-400 transition-all">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden sm:block">
                <p className="font-medium text-white text-[12px] group-hover:text-indigo-400 transition">{profile.name}</p>
                <p className="text-[10px] text-dark-muted truncate max-w-[130px] font-medium">{profile.semester}</p>
              </div>
            </button>
            
            <button 
              onClick={handleResetDemoDefaults}
              className="p-1.5 text-dark-muted hover:text-white hover:bg-dark-surface rounded-lg transition-all cursor-pointer"
              title="Reset initial applet demo values"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {showProfileEdit && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-card rounded-xl shadow-xl border border-dark-border w-full max-w-md overflow-hidden text-dark-text"
              id="profile-edit-modal"
            >
              <div className="p-5 border-b border-dark-border flex items-center justify-between bg-dark-surface text-white">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-semibold text-sm">Update Student Profile</h3>
                </div>
                <button 
                  onClick={() => setShowProfileEdit(false)} 
                  className="text-dark-muted hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <form onSubmit={handleEditProfileSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Full Student Name</label>
                  <input 
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Declared Major Area</label>
                  <input 
                    type="text"
                    required
                    value={editMajor}
                    onChange={(e) => setEditMajor(e.target.value)}
                    className="w-full text-xs p-2.5 rounded border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-dark-muted mb-1">Semester Designation</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Year 3, Sem 1"
                      value={editSemester}
                      onChange={(e) => setEditSemester(e.target.value)}
                      className="w-full text-xs p-2.5 rounded border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                  <div>
                     <label className="block text-xs font-semibold text-dark-muted mb-1">Target Semester GPA</label>
                    <input 
                      type="number"
                      required
                      min="1.0"
                      max="4.0"
                      step="0.1"
                      value={editTargetGpa}
                      onChange={(e) => setEditTargetGpa(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded border border-[#1F1F23] bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xs pt-3 border-t border-dark-border">
                  <button 
                    type="button" 
                    onClick={() => setShowProfileEdit(false)}
                    className="px-4 py-2 font-semibold bg-dark-surface hover:bg-dark-border border border-dark-border rounded-lg text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 font-semibold bg-[#3B82F6] hover:opacity-90 text-white rounded-lg shadow-sm cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Grid split structure */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        
        {/* Left Visual Sidebar Navigation - Large desktops only */}
        <aside className="w-60 bg-dark-card border border-dark-border rounded-xl p-4 space-y-6 hidden lg:block self-start text-dark-text">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-[#52525B] px-3 mb-2 font-bold font-mono">Main Navigation</span>
            <nav className="space-y-1">
              {menuItems.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${active ? 'bg-dark-border text-white' : 'text-dark-muted hover:bg-dark-surface hover:text-white'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4.5 h-4.5 ${active ? 'text-white' : 'text-dark-muted'}`} />
                      <span>{item.label}</span>
                    </div>

                    {/* Specific indicators */}
                    {item.id === 'assignments' && assignments.filter(a => !a.completed).length > 0 && (
                      <span className="bg-rose-950/40 text-rose-300 border border-rose-900/50 text-[10px] px-2 py-0.2 rounded-full font-semibold">
                        {assignments.filter(a => !a.completed).length}
                      </span>
                    )}
                    {item.id === 'grades' && (
                      <span className="text-[10px] font-bold text-[#3B82F6] font-mono">
                        {calculateGpa(courses).toFixed(2)}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-dark-border pt-4 space-y-3.5">
            <span className="text-[10px] uppercase tracking-widest text-[#52525B] px-3 mb-2 font-bold font-mono">Quick Profile</span>
            <div className="bg-dark-surface p-3 rounded-lg border border-dark-border space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-dark-muted">Declared Major:</span>
              </div>
              <p className="font-semibold text-white tracking-tight leading-tight">{profile.major}</p>
              <div className="border-t border-dark-border pt-2 flex justify-between items-center">
                <span className="text-dark-muted">GPA Standing:</span>
                <span className="font-semibold text-[#34D399] font-mono text-[13px]">
                  {calculateGpa(courses).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile menu wrapper drawer overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="absolute inset-0 bg-black"
              />
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="relative w-72 max-w-xs bg-dark-card border-r border-dark-border h-full shadow-xl flex flex-col p-5 space-y-6 text-dark-text"
              >
                <div className="flex items-center justify-between pb-3 border-b border-dark-border">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                    <span className="font-semibold text-white">Campuses Nav</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 hover:bg-dark-surface rounded-lg text-dark-muted cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {menuItems.map(item => {
                    const Icon = item.icon;
                    const active = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${active ? 'bg-dark-border text-white' : 'text-dark-muted hover:bg-dark-surface hover:text-white'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        {item.id === 'assignments' && assignments.filter(a => !a.completed).length > 0 && (
                          <span className="bg-rose-950/40 border border-rose-900/50 text-[10px] font-semibold px-2 py-0.5 rounded-full text-rose-300">
                            {assignments.filter(a => !a.completed).length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-auto border-t border-dark-border pt-4 space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-wider font-mono text-dark-muted px-2">Academic Enrollee</p>
                  <div className="flex items-center gap-2.5 p-2 bg-dark-surface rounded-lg border border-dark-border">
                    <div className="w-8.5 h-8.5 rounded-full bg-dark-border text-white flex items-center justify-center font-bold text-xs shrink-0 border border-dark-border">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-xs truncate">{profile.name}</p>
                      <p className="text-[10px] text-dark-muted truncate">{profile.major}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Central Display Canvas */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <DashboardOverview 
                  profile={profile}
                  courses={courses}
                  schedule={schedule}
                  assignments={assignments}
                  setActiveTab={setActiveTab}
                  openAddAssignment={triggerAddAssignmentTab}
                  openAddCourse={() => {
                    setActiveTab('grades');
                    // Find course trigger form in child? Let grades screen render open course
                  }}
                  openAddClass={() => {
                    setActiveTab('schedule');
                  }}
                />
              )}

              {activeTab === 'grades' && (
                <GradesSection 
                  courses={courses}
                  onAddCourse={handleAddCourse}
                  onDeleteCourse={handleDeleteCourse}
                  onAddGradeItem={handleAddGradeItem}
                  onDeleteGradeItem={handleDeleteGradeItem}
                />
              )}

              {activeTab === 'schedule' && (
                <ScheduleSection 
                  schedule={schedule}
                  courses={courses}
                  onAddClass={handleAddClass}
                  onDeleteClass={handleDeleteClass}
                />
              )}

              {activeTab === 'assignments' && (
                <AssignmentsSection 
                  assignments={assignments}
                  courses={courses}
                  onAddAssignment={handleAddAssignment}
                  onToggleAssignment={handleToggleAssignment}
                  onDeleteAssignment={handleDeleteAssignment}
                  showAddFormOnLoad={assignmentFormRequested}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer System Credits */}
      <footer className="bg-dark-card border-t border-dark-border py-4 px-6 mt-12 text-center text-[11px] font-medium text-dark-muted">
        <p>© 2026 Student Academic Workspace Dashboard. Built with React, Tailwind CSS and Motion.</p>
      </footer>
    </div>
  );
}
