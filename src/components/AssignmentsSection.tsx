import React, { useState } from 'react';
import { Assignment, Course, PriorityLevel } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Calendar, 
  Filter, 
  SlidersHorizontal, 
  FileText, 
  Inbox,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';

interface AssignmentsSectionProps {
  assignments: Assignment[];
  courses: Course[];
  onAddAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  onToggleAssignment: (id: string) => void;
  onDeleteAssignment: (id: string) => void;
  showAddFormOnLoad?: boolean;
}

export default function AssignmentsSection({
  assignments,
  courses,
  onAddAssignment,
  onToggleAssignment,
  onDeleteAssignment,
  showAddFormOnLoad = false
}: AssignmentsSectionProps) {
  // Expansion control
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters & sorting states
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('pending'); // default to pending for productivity
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');

  // New Assignment Form states
  const [showForm, setShowForm] = useState(showAddFormOnLoad);
  const [newTitle, setNewTitle] = useState('');
  const [newCourseId, setNewCourseId] = useState('');
  const [newDueDate, setNewDueDate] = useState('2026-05-28'); // relative to current local time 2026-05-26
  const [newPriority, setNewPriority] = useState<PriorityLevel>('medium');
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState('');

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Assignment title is required');
      return;
    }

    let finalCourseName = 'Independent Study / Other';
    if (newCourseId && newCourseId !== 'other') {
      const parent = courses.find(c => c.id === newCourseId);
      if (parent) {
        finalCourseName = `${parent.code}: ${parent.name}`;
      }
    }

    onAddAssignment({
      title: newTitle.trim(),
      courseId: newCourseId || 'other',
      courseName: finalCourseName,
      dueDate: newDueDate,
      priority: newPriority,
      completed: false,
      notes: newNotes.trim()
    });

    // Reset fields
    setNewTitle('');
    setNewCourseId('');
    setNewDueDate('2026-05-28');
    setNewPriority('medium');
    setNewNotes('');
    setFormError('');
    setShowForm(false);
  };

  // Due Date Countdown calculations (Static Relative reference: 2026-05-26)
  const getDueStatus = (dueDateStr: string) => {
    const today = new Date('2026-05-26'); 
    const due = new Date(dueDateStr);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Due Today', color: 'text-rose-400 bg-rose-950/40 border-rose-900/40 font-semibold' };
    if (diffDays === 1) return { text: 'Due Tomorrow', color: 'text-orange-400 bg-amber-950/40 border-amber-900/40 font-semibold' };
    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, color: 'text-red-400 bg-red-950/50 border-red-900 font-bold' };
    if (diffDays <= 3) return { text: `In ${diffDays} days`, color: 'text-rose-300 bg-rose-950/30 border-rose-900/30' };
    return { text: `In ${diffDays} days`, color: 'text-dark-text bg-dark-surface border-dark-border' };
  };

  const getPriorityClasses = (priority: PriorityLevel) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-950/40 text-rose-300 border-rose-900/50';
      case 'medium':
        return 'bg-amber-950/40 text-amber-300 border-amber-900/50';
      case 'low':
        return 'bg-dark-surface text-dark-text border-dark-border';
    }
  };

  // Filter & Sort Logic
  const filteredAssignments = assignments
    .filter(a => {
      // Course filter
      const matchCourse = filterCourse === 'all' || a.courseId === filterCourse;
      // Priority filter
      const matchPriority = filterPriority === 'all' || a.priority === filterPriority;
      // Status filter
      const matchStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'pending' && !a.completed) || 
        (filterStatus === 'completed' && a.completed);

      return matchCourse && matchPriority && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return a.dueDate.localeCompare(b.dueDate);
      } else {
        // Priority high -> low priority hierarchy
        const priorityScore = (p: PriorityLevel) => (p === 'high' ? 3 : p === 'medium' ? 2 : 1);
        return priorityScore(b.priority) - priorityScore(a.priority);
      }
    });

  return (
    <div className="space-y-6">

      {/* Title Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-dark-border">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Academic Workload Ledger</h2>
          <p className="text-xs text-dark-muted mt-0.5">Track class requirements, manage priority exams, and configure deadline tags.</p>
        </div>

        <button 
          onClick={() => {
            setShowForm(!showForm);
            setFormError('');
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:opacity-95 transition-colors rounded-lg shadow-sm self-start cursor-pointer"
          id="assignment-toggle-form"
        >
          <Plus className="w-4 h-4" />
          Add Assignment
        </button>
      </div>

      {/* Add Assignment Expandable Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleCreateAssignment}
              className="bg-dark-card p-5 rounded-xl border border-dark-border shadow-xs space-y-4"
              id="form-add-assignment"
            >
              <div className="flex items-center justify-between pb-2 border-b border-dark-border">
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Define Term Homework Requirements
                </h3>
              </div>

              {formError && (
                <p className="text-xs text-rose-300 font-medium p-2.5 bg-rose-950/40 border border-rose-900/50 rounded-lg">{formError}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Task Title *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g., Fourier Transform Problem Set 4"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs p-2 rounded-md border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Associated Course</label>
                  <select 
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(e.target.value)}
                    className="w-full text-xs p-2 rounded-md border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6] cursor-pointer"
                  >
                    <option value="other">Indy Study / Other Tasks</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.code}: {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Deadline Date *</label>
                  <input 
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-md border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Task Priorities</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as any).map(l => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setNewPriority(l)}
                        className={`py-1.5 px-3 border rounded text-xs capitalize transition-all cursor-pointer font-semibold ${newPriority === l ? 'bg-[#3B82F6] border-[#3B82F6] text-white shadow-xs' : 'bg-dark-surface text-dark-muted border-dark-border hover:bg-dark-border hover:text-white'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-muted mb-1">Work Description / Objectives Helper Notes</label>
                <textarea 
                  rows={2}
                  placeholder="Outline standard goals, team partner names, page scopes, or source links."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
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

      {/* Dynamic Filters panel */}
      <div className="bg-dark-card p-4 rounded-xl border border-dark-border shadow-xs space-y-3" id="filters-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-white font-sans border-b border-dark-border pb-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-dark-muted" />
            <span>Filter Workload Items</span>
          </div>
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-dark-muted" />
            <span>Sorting Options</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 flex-wrap">
          {/* Course Subject Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider font-mono text-dark-muted mb-1">Subject Course</label>
            <select 
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full text-xs p-2 rounded border border-dark-border bg-dark-surface text-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Subjects Enrolled</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code}</option>
              ))}
              <option value="other">Other / Independent</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider font-mono text-dark-muted mb-1">Critical Tier</label>
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full text-xs p-2 rounded border border-dark-border bg-dark-surface text-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">🌋 High urgencies</option>
              <option value="medium">⚡ Medium tasks</option>
              <option value="low">🌱 Low priorities</option>
            </select>
          </div>

          {/* Completion state filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider font-mono text-dark-muted mb-1">Status View</label>
            <div className="grid grid-cols-3 gap-1 bg-dark-surface p-1 rounded border border-dark-border text-center text-xs">
              {(['all', 'pending', 'completed'] as any).map(state => (
                <button
                  key={state}
                  onClick={() => setFilterStatus(state)}
                  className={`py-1 rounded font-semibold cursor-pointer text-[10px] capitalize ${filterStatus === state ? 'bg-dark-border text-white shadow-xs' : 'text-dark-muted hover:text-white'}`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          {/* Sort selection */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider font-mono text-dark-muted mb-1">Sort Items By</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs p-2 rounded border border-dark-border bg-dark-surface text-white focus:outline-none cursor-pointer"
            >
              <option value="dueDate">Due Date Chronology</option>
              <option value="priority">Intensity (High Priority first)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List items renderer */}
      <div className="space-y-3" id="assignments-collection">
        {filteredAssignments.length === 0 ? (
          <div className="bg-dark-card p-12 text-center rounded-xl border border-dark-border shadow-xs flex flex-col items-center">
            <Inbox className="w-12 h-12 text-dark-muted mb-2" />
            <p className="text-sm font-semibold text-white">No matching homework items found</p>
            <p className="text-xs text-dark-muted mt-1 max-w-sm">
              Adjust filters above, view completed grades, or create items to begin managing academic checklists.
            </p>
          </div>
        ) : (
          filteredAssignments.map(assignment => {
            const dueInfo = getDueStatus(assignment.dueDate);
            const priClasses = getPriorityClasses(assignment.priority);
            const isOpen = expandedId === assignment.id;

            return (
              <div 
                key={assignment.id}
                className={`bg-dark-card rounded-xl border ${assignment.completed ? 'border-dark-border/60 bg-dark-surface/20 opacity-75' : 'border-dark-border'} shadow-xs overflow-hidden transition-all`}
                id={`assignment-item-${assignment.id}`}
              >
                {/* Visual Card Header */}
                <div className="p-4 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                  
                  {/* Title & checkbox control */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button 
                      onClick={() => onToggleAssignment(assignment.id)}
                      className={`mt-0.5 pointer-events-auto transition text-dark-muted focus:outline-none cursor-pointer ${assignment.completed ? 'text-emerald-450' : 'hover:text-indigo-400'}`}
                    >
                      {assignment.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-450" />
                      ) : (
                        <Circle className="w-5 h-5 text-dark-border" />
                      )}
                    </button>

                    <div className="space-y-0.5 min-w-0">
                      <h4 
                        onClick={() => setExpandedId(isOpen ? null : assignment.id)}
                        className={`font-semibold text-sm cursor-pointer hover:text-indigo-400 transition ${assignment.completed ? 'line-through text-dark-muted font-normal' : 'text-white'}`}
                      >
                        {assignment.title}
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-dark-muted">
                        <span className="font-semibold text-dark-text font-sans">{assignment.courseName.split(':')[0]}</span>
                        <span>•</span>
                        <span className="font-mono">Due {assignment.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Badges */}
                  <div className="flex items-center gap-2.5 shrink-0 ml-8 sm:ml-0">
                    {!assignment.completed && (
                      <span className={`text-[10px] px-2.5 py-0.5 rounded border uppercase font-bold tracking-wider ${dueInfo.color}`}>
                        {dueInfo.text}
                      </span>
                    )}

                    <span className={`text-[10px] px-2.5 py-0.5 rounded border uppercase font-bold tracking-wider ${priClasses}`}>
                      {assignment.priority}
                    </span>

                    <button
                      onClick={() => setExpandedId(isOpen ? null : assignment.id)}
                      className="text-dark-muted hover:text-white p-1 rounded-md cursor-pointer"
                    >
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Details Panel */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-dark-border bg-dark-surface/40"
                    >
                      <div className="p-4.5 space-y-3.5 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-dark-muted block">Syllabus Details & Notes</span>
                          {assignment.notes ? (
                            <p className="text-dark-text bg-dark-surface p-3 rounded-lg border border-dark-border leading-relaxed whitespace-pre-line">
                              {assignment.notes}
                            </p>
                          ) : (
                            <p className="text-dark-muted italic">No syllabus instructions or custom notes configured for this assignment.</p>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-dark-muted border-t border-dark-border pt-3.5">
                          <span className="font-mono text-[10px]">ID: {assignment.id}</span>
                          
                          <button
                            onClick={() => {
                              if (confirm(`Remove this assignment permanently?`)) {
                                onDeleteAssignment(assignment.id);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2 py-1 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete assignment
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
