import { Course, ScheduleEvent, Assignment, StudentProfile } from '../types';
import { calculateCourseAverage, calculateGpa, getGradeInfo } from '../data';
import { motion } from 'motion/react';
import { 
  GraduationCap, 
  CalendarDays, 
  ListTodo, 
  TrendingUp, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Plus
} from 'lucide-react';

interface DashboardOverviewProps {
  profile: StudentProfile;
  courses: Course[];
  schedule: ScheduleEvent[];
  assignments: Assignment[];
  setActiveTab: (tab: 'overview' | 'grades' | 'schedule' | 'assignments') => void;
  openAddAssignment: () => void;
  openAddCourse: () => void;
  openAddClass: () => void;
}

export default function DashboardOverview({
  profile,
  courses,
  schedule,
  assignments,
  setActiveTab,
  openAddAssignment,
  openAddCourse,
  openAddClass
}: DashboardOverviewProps) {
  // GPA Calculations
  const currentGpa = calculateGpa(courses);
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const gpaDiff = parseFloat((profile.targetGpa - currentGpa).toFixed(2));
  
  // Assignment stats
  const pendingAssignmentsCount = assignments.filter(a => !a.completed).length;
  const totalAssignmentsCount = assignments.length;
  const completedPercentage = totalAssignmentsCount > 0 
    ? Math.round(((totalAssignmentsCount - pendingAssignmentsCount) / totalAssignmentsCount) * 100) 
    : 0;

  // Today's classes
  const days: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = days[new Date().getDay()] as any;
  const todayClasses = schedule
    .filter(event => event.dayOfWeek === todayDayName)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Urgent assignments (not completed, sorted by due date, limit to 3)
  const urgentAssignments = assignments
    .filter(a => !a.completed)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  // Dynamic greeting based on current UTC time (metadata indicates noon/afternoon is 12:59 UTC, let's keep it clean)
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Convert tailwind color class prefix
  const getColorClasses = (color: string) => {
    const map: Record<string, { bg: string; text: string; border: string; accent: string }> = {
      indigo: { bg: 'bg-indigo-950/40', text: 'text-indigo-300', border: 'border-indigo-900/50', accent: 'bg-indigo-500' },
      emerald: { bg: 'bg-emerald-950/40', text: 'text-emerald-300', border: 'border-emerald-900/50', accent: 'bg-emerald-500' },
      amber: { bg: 'bg-amber-950/40', text: 'text-amber-300', border: 'border-amber-900/50', accent: 'bg-amber-500' },
      rose: { bg: 'bg-rose-950/40', text: 'text-rose-300', border: 'border-rose-900/50', accent: 'bg-rose-500' },
      violet: { bg: 'bg-violet-950/40', text: 'text-violet-300', border: 'border-violet-900/50', accent: 'bg-violet-500' },
      sky: { bg: 'bg-sky-950/40', text: 'text-sky-300', border: 'border-sky-900/50', accent: 'bg-sky-500' },
    };
    return map[color] || { bg: 'bg-dark-surface', text: 'text-dark-text', border: 'border-dark-border', accent: 'bg-dark-muted' };
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden bg-dark-card rounded-2xl text-dark-text p-8 md:p-10 shadow-sm border border-dark-border"
        id="dashboard-header-banner"
      >
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 translate-y-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-surface border border-dark-border text-xs font-semibold text-dark-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Semester Overview
          </div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-white font-sans mt-2">
            {getGreeting()}, <span className="font-semibold">{profile.name}</span>!
          </h1>
          <p className="text-dark-muted text-sm md:text-base leading-relaxed">
            You are enrolled in <span className="font-semibold text-white">{courses.length} courses</span> ({totalCredits} total credits) for <span className="text-indigo-400 font-medium">{profile.major}</span>.
          </p>
          <div className="flex flex-wrap gap-3 pt-3">
            <button 
              onClick={openAddAssignment}
              className="inline-flex items-center gap-2 px-4 py-2 bg-dark-accent hover:opacity-90 transition-all text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
              id="header-btn-assignment"
            >
              <Plus className="w-4 h-4" />
              Add Assignment
            </button>
            <button 
              onClick={openAddClass}
              className="inline-flex items-center gap-2 px-4 py-2 bg-dark-surface hover:bg-dark-border transition-all text-white text-xs font-semibold rounded-lg border border-dark-border cursor-pointer"
              id="header-btn-class"
            >
              <Plus className="w-4 h-4" />
              Schedule Event
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-statistics-bento">
        {/* GPA overview card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-dark-card p-6 rounded-xl border border-dark-border shadow-xs flex flex-col justify-between"
          id="stat-card-gpa"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-widest text-[#52525B] font-bold font-mono">Academic Standing</h3>
            <div className="p-2 bg-dark-surface text-indigo-400 rounded-lg border border-dark-border">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="my-5 flex items-baseline gap-2">
            <span className="text-4xl font-light text-white tracking-tight">{currentGpa.toFixed(2)}</span>
            <span className="text-dark-muted text-sm">/ 4.00</span>
          </div>
          <div className="border-t border-dark-border pt-3 mt-1 text-xs space-y-1.5">
            <div className="flex justify-between items-center text-dark-text">
              <span>Target GPA:</span>
              <span className="font-semibold text-white">{profile.targetGpa.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-dark-text">
              <span>Status:</span>
              {gpaDiff <= 0 ? (
                <span className="text-[#34D399] font-medium flex items-center gap-1">
                  On Track (+{Math.abs(gpaDiff).toFixed(2)})
                </span>
              ) : (
                <span className="text-orange-400 font-medium flex items-center gap-1">
                  {gpaDiff} points from target
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Assignment progress card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-dark-card p-6 rounded-xl border border-dark-border shadow-xs flex flex-col justify-between"
          id="stat-card-assignments"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-widest text-[#52525B] font-bold font-mono">Assignment Progress</h3>
            <div className="p-2 bg-dark-surface text-emerald-400 rounded-lg border border-dark-border">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>
          <div className="my-4 flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              {/* Custom SVG gauge circle */}
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" className="stroke-dark-surface fill-none" strokeWidth="5"></circle>
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  className="stroke-[#3B82F6] fill-none transition-all duration-500" 
                  strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - completedPercentage / 100)}`}
                />
              </svg>
              <span className="absolute text-xs font-bold text-white font-mono">{completedPercentage}%</span>
            </div>
            <div>
              <span className="text-2xl font-light text-white tracking-tight">{totalAssignmentsCount - pendingAssignmentsCount}</span>
              <span className="text-dark-muted text-sm"> / {totalAssignmentsCount} completed</span>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('assignments')}
            className="border-t border-dark-border pt-3 mt-1 text-xs text-dark-muted hover:text-[#3B82F6] font-medium inline-flex items-center justify-between group cursor-pointer text-left w-full"
            id="stat-btn-assignments"
          >
            Manage upcoming homeworks
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Schedule tracker card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-dark-card p-6 rounded-xl border border-dark-border shadow-xs flex flex-col justify-between"
          id="stat-card-schedule"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-widest text-[#52525B] font-bold font-mono">Today's Schedule</h3>
            <div className="p-2 bg-dark-surface text-amber-400 rounded-lg border border-dark-border">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="my-5 flex flex-col">
            <span className="text-2xl font-light text-white tracking-tight">
              {todayClasses.length} class{todayClasses.length !== 1 ? 'es' : ''}
            </span>
            <span className="text-dark-muted text-xs mt-0.5 font-mono capitalize">
              {todayDayName}, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <button 
            onClick={() => setActiveTab('schedule')}
            className="border-t border-dark-border pt-3 mt-1 text-xs text-dark-muted hover:text-[#3B82F6] font-medium inline-flex items-center justify-between group cursor-pointer text-left w-full"
            id="stat-btn-schedule"
          >
            Review weekly timetable
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Main Split Layout: Timeline & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Schedule Events Timeline */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-dark-card p-6 rounded-xl border border-dark-border shadow-xs flex flex-col h-full"
          id="block-today-timeline"
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-dark-border">
            <div>
              <h2 className="font-semibold text-white tracking-tight">Today's Timetable</h2>
              <p className="text-xs text-dark-muted">Classes scheduled for today</p>
            </div>
            <button 
              onClick={() => setActiveTab('schedule')} 
              className="text-xs text-[#3B82F6] hover:opacity-95 font-semibold cursor-pointer text-left"
              id="timeline-view-all"
            >
              Full Week
            </button>
          </div>

          {todayClasses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4">
              <div className="w-12 h-12 bg-dark-surface rounded-full flex items-center justify-center text-dark-muted mb-2 border border-dark-border">
                <CalendarDays className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-dark-text">No classes today!</p>
              <p className="text-xs text-dark-muted mt-1">Enjoy your study break, work on assignments, or catch up on reading.</p>
              <button 
                onClick={openAddClass}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-dark-surface hover:bg-dark-border text-white transition-colors rounded-md border border-dark-border cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule Class
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-1 flex-1">
              {todayClasses.map((event, index) => {
                const c = getColorClasses(event.color);
                return (
                  <div key={event.id} className="relative pl-6 pb-2 last:pb-0 group">
                    {/* Visual Vertical line connector */}
                    {index < todayClasses.length - 1 && (
                      <span className="absolute left-[7px] top-[18px] bottom-0 w-[2px] bg-dark-border" />
                    )}
                    {/* Timeline bullet dot */}
                    <span className={`absolute left-0 top-[6px] w-[14px] h-[14px] rounded-full border-2 border-dark-border shadow-xs ${c.accent}`} />
                    
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 p-3 rounded-lg hover:bg-dark-surface border border-transparent hover:border-dark-border transition-all">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${c.bg} ${c.text}`}>
                          {event.courseCode}
                        </span>
                        <h4 className="font-semibold text-sm text-white">{event.courseName}</h4>
                        
                        <div className="flex flex-wrap items-center gap-3 text-dark-muted text-xs pt-1">
                          <span className="flex items-center gap-1 font-medium text-dark-text">
                            <Clock className="w-3.5 h-3.5 text-dark-muted" />
                            {event.startTime} - {event.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-dark-muted" />
                            {event.room}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Urgent Assignments Deadlines */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-dark-card p-6 rounded-xl border border-dark-border shadow-xs flex flex-col h-full"
          id="block-urgent-assignments"
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-dark-border">
            <div>
              <h2 className="font-semibold text-white tracking-tight">Urgent Deadlines</h2>
              <p className="text-xs text-dark-muted">Upcoming assignments due soonest</p>
            </div>
            <button 
              onClick={() => setActiveTab('assignments')} 
              className="text-xs text-[#3B82F6] hover:opacity-95 font-semibold cursor-pointer text-left"
              id="assignments-view-all"
            >
              All Assignments
            </button>
          </div>

          {urgentAssignments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4">
              <div className="w-12 h-12 bg-dark-surface rounded-full flex items-center justify-center text-emerald-450 mb-2 border border-dark-border">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-dark-text">All caught up!</p>
              <p className="text-xs text-dark-muted mt-1">Excellent job! You have no pending assignments on your plate.</p>
              <button 
                onClick={openAddAssignment}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-dark-surface hover:bg-dark-border text-white transition-colors rounded-md border border-dark-border cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Homework
              </button>
            </div>
          ) : (
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                {urgentAssignments.map(assignment => {
                  const isHigh = assignment.priority === 'high';
                  const isMed = assignment.priority === 'medium';
                  
                  // Calculate days left relative to current timestamp
                  const today = new Date('2026-05-26'); 
                  const dueDate = new Date(assignment.dueDate);
                  const diffTime = dueDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  let countdownText = `${diffDays} days left`;
                  let urgencyBg = 'bg-dark-surface text-dark-text border border-dark-border';
                  
                  if (diffDays === 0) {
                    countdownText = 'Due Today';
                    urgencyBg = 'bg-rose-900/60 text-rose-200 border border-rose-750 font-semibold animate-pulse';
                  } else if (diffDays === 1) {
                    countdownText = 'Due Tomorrow';
                    urgencyBg = 'bg-amber-900/60 text-amber-200 border border-amber-750 font-semibold';
                  } else if (diffDays < 0) {
                    countdownText = 'Overdue';
                    urgencyBg = 'bg-red-950/60 text-red-200 border border-red-900/80 font-bold';
                  } else if (diffDays <= 3) {
                    urgencyBg = 'bg-rose-950/40 text-rose-300 border border-rose-900/50 font-medium';
                  }

                  return (
                    <div 
                      key={assignment.id} 
                      className="p-3.5 rounded-lg border border-dark-border bg-dark-surface/50 hover:bg-dark-surface transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm truncate">{assignment.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-dark-muted">
                          <span className="font-medium text-dark-text truncate max-w-[150px]">
                            {assignment.courseName.split(':')[0]}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{assignment.dueDate}</span>
                          {isHigh && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-rose-950/50 text-[10px] font-bold text-rose-300 border border-rose-900/50">
                              HIGH
                            </span>
                          )}
                          {isMed && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-950/50 text-[10px] font-bold text-amber-300 border border-amber-900/50">
                              MED
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <span className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider text-center ${urgencyBg}`}>
                        {countdownText}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-dark-border mt-2 flex justify-between items-center text-xs text-dark-muted">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
                  Keep grades up by completing priority tasks!
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
