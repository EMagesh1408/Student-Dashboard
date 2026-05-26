import React, { useState } from 'react';
import { ScheduleEvent, Course, DayOfWeek } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  BookOpen, 
  Tv, 
  ListFilter,
  Check, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface ScheduleSectionProps {
  schedule: ScheduleEvent[];
  courses: Course[];
  onAddClass: (event: Omit<ScheduleEvent, 'id'>) => void;
  onDeleteClass: (classId: string) => void;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ScheduleSection({
  schedule,
  courses,
  onAddClass,
  onDeleteClass
}: ScheduleSectionProps) {
  // Navigation tabs: 'grid' vs 'details' 
  const [activeSubTab, setActiveSubTab] = useState<'week-grid' | 'agenda-view'>('week-grid');
  const [selectedDayTab, setSelectedDayTab] = useState<DayOfWeek>('Monday');

  // Form states
  const [showAddClassForm, setShowAddClassForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [customCourseName, setCustomCourseName] = useState('');
  const [customCourseCode, setCustomCourseCode] = useState('');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [room, setRoom] = useState('');
  const [color, setColor] = useState('indigo');
  const [formError, setFormError] = useState('');

  const colorsOption = ['indigo', 'emerald', 'amber', 'rose', 'violet', 'sky'];

  // Current Time / State detection
  const isClassActive = (event: ScheduleEvent) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = days[new Date().getDay()] as DayOfWeek;

    if (event.dayOfWeek !== currentDayName) return false;

    const parseMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = parseMinutes(event.startTime);
    const endMinutes = parseMinutes(event.endTime);

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  const handleAddClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || (!selectedCourseId && (!customCourseName || !customCourseCode))) {
      setFormError('Please select a course and enter room location details');
      return;
    }

    // Time validation (start must be before end)
    if (startTime >= endTime) {
      setFormError('Start time must be strictly before end time');
      return;
    }

    let code = '';
    let name = '';
    let eventColor = color;
    let finalCourseId = selectedCourseId;

    if (selectedCourseId) {
      const match = courses.find(c => c.id === selectedCourseId);
      if (match) {
        code = match.code;
        name = match.name;
        eventColor = match.color;
      }
    } else {
      code = customCourseCode.toUpperCase().trim();
      name = customCourseName.trim();
      finalCourseId = 'custom';
    }

    onAddClass({
      courseId: finalCourseId,
      courseCode: code,
      courseName: name,
      dayOfWeek: selectedDay,
      startTime,
      endTime,
      room: room.trim(),
      color: eventColor
    });

    // Reset Form
    setSelectedCourseId('');
    setCustomCourseName('');
    setCustomCourseCode('');
    setRoom('');
    setFormError('');
    setShowAddClassForm(false);
  };

  const getColorClasses = (colorName: string) => {
    const map: Record<string, { bg: string; text: string; border: string; accent: string; darkText: string }> = {
      indigo: { bg: 'bg-indigo-950/50', text: 'text-indigo-300', border: 'border-indigo-900/40', accent: 'bg-indigo-500', darkText: 'text-indigo-200' },
      emerald: { bg: 'bg-emerald-950/50', text: 'text-emerald-300', border: 'border-emerald-900/40', accent: 'bg-emerald-500', darkText: 'text-emerald-200' },
      amber: { bg: 'bg-amber-950/50', text: 'text-amber-300', border: 'border-amber-900/40', accent: 'bg-amber-500', darkText: 'text-amber-200' },
      rose: { bg: 'bg-rose-950/50', text: 'text-rose-300', border: 'border-rose-900/40', accent: 'bg-rose-500', darkText: 'text-rose-200' },
      violet: { bg: 'bg-violet-950/50', text: 'text-violet-300', border: 'border-violet-900/40', accent: 'bg-violet-500', darkText: 'text-violet-200' },
      sky: { bg: 'bg-sky-950/50', text: 'text-sky-300', border: 'border-sky-900/40', accent: 'bg-sky-500', darkText: 'text-sky-200' },
    };
    return map[colorName] || { bg: 'bg-dark-surface', text: 'text-dark-text', border: 'border-dark-border', accent: 'bg-indigo-500', darkText: 'text-dark-text' };
  };

  return (
    <div className="space-y-6 text-dark-text font-sans">

      {/* Title Header with tab switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-dark-border">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Your Weekly Timetable</h2>
          <p className="text-xs text-dark-muted mt-0.5">Manage class scheduling, locate lectures, and track active modules.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub tab togglers */}
          <div className="bg-dark-card p-1 rounded-lg border border-dark-border flex text-xs">
            <button 
              onClick={() => setActiveSubTab('week-grid')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors cursor-pointer ${activeSubTab === 'week-grid' ? 'bg-dark-surface border border-dark-border text-white shadow-xs' : 'text-dark-muted hover:text-white'}`}
            >
              Full Week Layout
            </button>
            <button 
              onClick={() => setActiveSubTab('agenda-view')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors cursor-pointer ${activeSubTab === 'agenda-view' ? 'bg-dark-surface border border-dark-border text-white shadow-xs' : 'text-dark-muted hover:text-white'}`}
              id="subtab-agenda"
            >
              Agenda List
            </button>
          </div>

          <button 
            onClick={() => setShowAddClassForm(!showAddClassForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:opacity-95 transition-colors rounded-lg shadow-sm cursor-pointer"
            id="scheduler-btn-toggle"
          >
            <Plus className="w-4 h-4" />
            Schedule Class
          </button>
        </div>
      </div>

      {/* Add Class Scheduler Collapsible Form */}
      <AnimatePresence>
        {showAddClassForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleAddClassSubmit}
              className="bg-dark-card p-5 rounded-xl border border-dark-border shadow-xs space-y-4"
              id="form-add-class"
            >
              <div className="flex items-center justify-between pb-2 border-b border-dark-border">
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-indigo-400" />
                  Define Term Timetable Entry
                </h3>
              </div>

              {formError && (
                <div className="p-2.5 bg-rose-955/50 border border-rose-900/40 rounded-md text-xs text-rose-300 font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Course Selection */}
                <div>
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Select Registered course</label>
                  <select 
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      setCustomCourseCode('');
                      setCustomCourseName('');
                    }}
                    className="w-full text-xs p-2 rounded-md border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6] cursor-pointer"
                  >
                    <option value="">-- Or enter Custom Course details below --</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.code}: {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Day Selection */}
                <div>
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Lecture Day</label>
                  <select 
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                    className="w-full text-xs p-2 rounded-md border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6] cursor-pointer"
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom course field details if no registered course selected */}
              {!selectedCourseId && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 bg-dark-surface border border-dark-border rounded-lg">
                  <div>
                    <label className="block text-[11px] font-semibold text-dark-muted mb-1">Custom Code *</label>
                    <input 
                      type="text"
                      placeholder="e.g., PHY-102"
                      value={customCourseCode}
                      onChange={(e) => setCustomCourseCode(e.target.value)}
                      className="w-full text-xs p-2 rounded border border-dark-border bg-dark-card text-white focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-dark-muted mb-1">Custom Name *</label>
                    <input 
                      type="text"
                      placeholder="e.g., Quantum Physics & Theory"
                      value={customCourseName}
                      onChange={(e) => setCustomCourseName(e.target.value)}
                      className="w-full text-xs p-2 rounded border border-dark-border bg-dark-card text-white focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                </div>
              )}

              {/* Timing and location inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Start Time (24h) *</label>
                  <input 
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-md border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-muted mb-1">End Time (24h) *</label>
                  <input 
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-md border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Room Location *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g., Tech Center, Rm 102"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full text-xs p-2 rounded-md border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              {/* Custom course theme colors */}
              {!selectedCourseId && (
                <div className="space-y-1">
                  <span className="block text-xs font-semibold text-dark-muted">Representational Theme Color</span>
                  <div className="flex gap-2">
                    {colorsOption.map(c => {
                      const sample = getColorClasses(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-6 h-6 rounded-full ${sample.accent} border-2 ${color === c ? 'border-white scale-105 shadow-sm' : 'border-dark-border'} transition-all cursor-pointer`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddClassForm(false)}
                  className="px-3.5 py-1.5 font-semibold text-white bg-dark-surface hover:bg-dark-border border border-dark-border transition-colors rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-[#3B82F6] hover:opacity-95 transition-colors rounded-lg shadow-sm cursor-pointer"
                >
                  Confirm Entry
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout Option 1: Horizontal grid weekdays */}
      {activeSubTab === 'week-grid' ? (
        <div className="space-y-4">
          
          {/* Weekday select buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 bg-dark-card p-1.5 rounded-xl border border-dark-border">
            {DAYS_OF_WEEK.map(day => {
              const count = schedule.filter(e => e.dayOfWeek === day).length;
              const isSelected = selectedDayTab === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDayTab(day)}
                  className={`py-2 px-2 rounded-lg text-center cursor-pointer transition-all ${isSelected ? 'bg-dark-surface text-white border border-dark-border font-bold shadow-xs' : 'text-dark-muted hover:bg-dark-surface/60 hover:text-white'}`}
                >
                  <span className="text-[10px] uppercase font-mono tracking-wider block">{day.slice(0, 3)}</span>
                  <span className="text-xs text-dark-muted block mt-0.5">{count} class{count !== 1 ? 'es' : ''}</span>
                </button>
              );
            })}
          </div>

          {/* Timetable classes for selected day */}
          <div className="bg-dark-card p-6 rounded-xl border border-dark-border shadow-xs h-full" id={`timetable-day-${selectedDayTab}`}>
            <div className="flex items-center justify-between pb-3 border-b border-dark-border mb-6">
              <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-400 animate-pulse" />
                {selectedDayTab}'s Agenda Details
              </h3>
              <span className="text-xs font-mono text-dark-muted uppercase tracking-widest bg-dark-surface border border-dark-border px-2.5 py-1 rounded">
                Semester Block Planner
              </span>
            </div>

            {schedule.filter(e => e.dayOfWeek === selectedDayTab).length === 0 ? (
              <div className="py-16 text-center max-w-md mx-auto">
                <div className="w-12 h-12 bg-dark-surface rounded-full flex items-center justify-center text-dark-muted mx-auto mb-3 border border-dark-border">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-white text-sm">No Scheduled Lectures</h4>
                <p className="text-dark-muted text-xs mt-1">
                  You are free from formal classes on {selectedDayTab}! Click "Schedule Class" on the top right to register modules.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {schedule
                  .filter(e => e.dayOfWeek === selectedDayTab)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(event => {
                    const c = getColorClasses(event.color);
                    const active = isClassActive(event);

                    return (
                      <div 
                        key={event.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 rounded-xl border ${active ? 'border-[#3B82F6] bg-indigo-950/20 shadow-xs text-white' : 'border-dark-border bg-dark-surface/50'} hover:bg-dark-surface transition-all group`}
                        id={`schedule-item-${event.id}`}
                      >
                        <div className="flex items-start gap-4 min-w-0">
                          {/* Left hand coloring status block */}
                          <div className={`w-1.5 self-stretch rounded-full ${c.accent}`} />
                          
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-widest ${c.bg} ${c.text} border ${c.border}`}>
                                {event.courseCode}
                              </span>
                              {active && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded-full border border-indigo-900/50 animate-pulse">
                                  IN SESSION
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-white text-base md:text-md truncate">{event.courseName}</h4>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-dark-muted text-xs font-semibold pt-0.5">
                              <span className="flex items-center gap-1 text-dark-text">
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

                        <div className="shrink-0 flex items-center justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-dark-border gap-2">
                          <button
                            onClick={() => {
                              if (confirm(`Drop this class session: ${event.courseName} scheduled for ${event.dayOfWeek}s?`)) {
                                onDeleteClass(event.id);
                              }
                            }}
                            className="text-dark-muted hover:text-rose-450 p-2 hover:bg-rose-955/50 rounded-lg transition-colors cursor-pointer"
                            title="Remove class session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Layout Option 2: Chronological Agenda view across entire week */
        <div className="bg-dark-card p-6 rounded-xl border border-dark-border shadow-xs">
          <div className="space-y-8">
            {DAYS_OF_WEEK.map(day => {
              const dayClasses = schedule
                .filter(e => e.dayOfWeek === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              if (dayClasses.length === 0) return null;

              return (
                <div key={day} className="space-y-3" id={`agenda-day-${day}`}>
                  <h3 className="font-semibold text-white text-sm uppercase tracking-wider font-mono border-b border-dark-border pb-1 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                    {day}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dayClasses.map(event => {
                      const c = getColorClasses(event.color);
                      return (
                        <div key={event.id} className="p-4 rounded-lg bg-dark-surface/50 border border-dark-border flex justify-between gap-3 items-center hover:bg-dark-surface transition-colors">
                          <div className="space-y-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-widest ${c.bg} ${c.text} border ${c.border}`}>
                              {event.courseCode}
                            </span>
                            <h4 className="font-semibold text-white text-sm">{event.courseName}</h4>
                            <div className="flex items-center gap-3 text-xs text-dark-muted pt-0.5">
                              <span className="flex items-center gap-1 font-semibold text-dark-text">
                                <Clock className="w-3.5 h-3.5 text-dark-muted" />
                                {event.startTime} - {event.endTime}
                              </span>
                              <span className="flex items-center gap-1 truncate max-w-[150px]">
                                <MapPin className="w-3.5 h-3.5 text-dark-muted" />
                                {event.room}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => onDeleteClass(event.id)}
                            className="text-dark-muted hover:text-rose-450 p-1.5 hover:bg-rose-955/50 rounded transition-colors cursor-pointer animate-none"
                            title="Remove class"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {schedule.length === 0 && (
              <div className="py-16 text-center max-w-md mx-auto">
                <div className="w-12 h-12 bg-dark-surface rounded-full flex items-center justify-center text-dark-muted mx-auto mb-3 border border-dark-border">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-white text-sm">No Scheduled Lectures</h4>
                <p className="text-dark-muted text-xs mt-1">
                  You have not registered any schedules. Click the top button to program in lecture hours.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
