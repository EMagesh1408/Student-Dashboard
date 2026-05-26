import React, { useState } from 'react';
import { Course, GradeItem } from '../types';
import { calculateCourseAverage, getGradeInfo, calculateGpa } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  User, 
  Target, 
  Award,
  AlertTriangle,
  FileSpreadsheet,
  Check
} from 'lucide-react';

interface GradesSectionProps {
  courses: Course[];
  onAddCourse: (course: Omit<Course, 'id' | 'gradeEntries'>) => void;
  onDeleteCourse: (courseId: string) => void;
  onAddGradeItem: (courseId: string, item: Omit<GradeItem, 'id'>) => void;
  onDeleteGradeItem: (courseId: string, itemId: string) => void;
}

export default function GradesSection({
  courses,
  onAddCourse,
  onDeleteCourse,
  onAddGradeItem,
  onDeleteGradeItem
}: GradesSectionProps) {
  // Expansion states
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // New Course state Form
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCredits, setNewCredits] = useState(3);
  const [newInstructor, setNewInstructor] = useState('');
  const [newTargetGrade, setNewTargetGrade] = useState(90);
  const [newColor, setNewColor] = useState('indigo');

  // New Grade Item inside Expanded Course
  const [newGradeName, setNewGradeName] = useState('');
  const [newGradeScore, setNewGradeScore] = useState<number | ''>('');
  const [newGradeMax, setNewGradeMax] = useState<number | ''>(100);
  const [newGradeWeight, setNewGradeWeight] = useState<number | ''>('');
  const [gradeFormError, setGradeFormError] = useState('');

  const toggleCourseExpand = (courseId: string) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
    } else {
      setExpandedCourseId(courseId);
      // Reset inline forms when shifting courses
      setNewGradeName('');
      setNewGradeScore('');
      setNewGradeMax(100);
      setNewGradeWeight('');
      setGradeFormError('');
    }
  };

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName || !newInstructor) return;

    onAddCourse({
      code: newCode.toUpperCase().trim(),
      name: newName.trim(),
      credits: Number(newCredits),
      instructor: newInstructor.trim(),
      targetGrade: Number(newTargetGrade),
      color: newColor
    });

    // Reset Form
    setNewCode('');
    setNewName('');
    setNewCredits(3);
    setNewInstructor('');
    setNewTargetGrade(90);
    setNewColor('indigo');
    setShowAddCourseForm(false);
  };

  const handleAddGradeSubmit = (courseId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradeName || newGradeScore === '' || newGradeMax === '' || newGradeWeight === '') {
      setGradeFormError('All grade fields are required');
      return;
    }

    const currentCourse = courses.find(c => c.id === courseId);
    if (!currentCourse) return;

    const existingWeight = currentCourse.gradeEntries.reduce((sum, item) => sum + item.weight, 0);
    const targetWeight = existingWeight + Number(newGradeWeight);

    if (targetWeight > 100) {
      setGradeFormError(`Weight exceeds limit. Current sum is ${existingWeight}%. You can add max ${100 - existingWeight}%.`);
      return;
    }

    onAddGradeItem(courseId, {
      name: newGradeName.trim(),
      score: Number(newGradeScore),
      maxScore: Number(newGradeMax),
      weight: Number(newGradeWeight)
    });

    // Reset inline forms
    setNewGradeName('');
    setNewGradeScore('');
    setNewGradeMax(100);
    setNewGradeWeight('');
    setGradeFormError('');
  };

  // Helper theme classes for course highlight colors matching Elegant Dark Theme
  const getColorClasses = (color: string) => {
    const map: Record<string, { bg: string; text: string; border: string; accent: string; ring: string }> = {
      indigo: { bg: 'bg-indigo-950/50', text: 'text-indigo-300', border: 'border-indigo-900/40', accent: 'bg-indigo-500', ring: 'ring-indigo-900' },
      emerald: { bg: 'bg-emerald-950/50', text: 'text-emerald-300', border: 'border-emerald-900/40', accent: 'bg-emerald-500', ring: 'ring-emerald-900' },
      amber: { bg: 'bg-amber-950/50', text: 'text-amber-300', border: 'border-amber-900/40', accent: 'bg-amber-500', ring: 'ring-amber-900' },
      rose: { bg: 'bg-rose-950/50', text: 'text-rose-300', border: 'border-rose-900/40', accent: 'bg-rose-500', ring: 'ring-rose-900' },
      violet: { bg: 'bg-violet-950/50', text: 'text-violet-300', border: 'border-violet-900/40', accent: 'bg-violet-500', ring: 'ring-violet-900' },
      sky: { bg: 'bg-sky-950/50', text: 'text-sky-300', border: 'border-sky-900/40', accent: 'bg-sky-500', ring: 'ring-sky-900' },
    };
    return map[color] || { bg: 'bg-dark-surface', text: 'text-dark-text', border: 'border-dark-border', accent: 'bg-indigo-500', ring: 'ring-dark-border' };
  };

  const colorsOption = ['indigo', 'emerald', 'amber', 'rose', 'violet', 'sky'];

  return (
    <div className="space-y-6">
      
      {/* GPA & Quick Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GPA Display Dashboard */}
        <div className="bg-dark-card p-6 rounded-xl border border-dark-border shadow-xs flex flex-col justify-between lg:col-span-1">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-dark-muted font-semibold font-mono">Academic Summary</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-white tracking-tight">
                {calculateGpa(courses).toFixed(2)}
              </span>
              <span className="text-dark-muted text-sm">/ 4.00 Cumulative GPA</span>
            </div>
            
            <p className="text-xs text-dark-muted mt-2">
              Calculated on a weighted credit-hour scale across {courses.length} listed courses.
            </p>
          </div>

          <div className="border-t border-dark-border pt-4 mt-6 space-y-3">
            <h4 className="text-xs font-semibold text-dark-text">GPA Distribution Ladder</h4>
            <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono">
              {['A', 'B', 'C', 'D', 'F'].map(letter => {
                const count = courses.filter(c => {
                  const avg = calculateCourseAverage(c);
                  const info = getGradeInfo(avg);
                  return info.letter.startsWith(letter);
                }).length;

                return (
                  <div key={letter} className="bg-dark-surface border border-dark-border hover:bg-dark-border p-1.5 rounded transition-all">
                    <span className="font-bold text-white text-[11px] block">{letter}</span>
                    <span className="text-dark-muted text-[10px] block mt-0.5">{count}x</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* GPA Sandbox Simulation details */}
        <div className="bg-dark-card p-6 rounded-xl border border-dark-border shadow-xs flex flex-col justify-between lg:col-span-2">
          <div>
            <div className="flex items-center gap-1.5 text-indigo-400">
              <Award className="w-4 h-4" />
              <h3 className="text-xs uppercase tracking-wider text-dark-muted font-semibold font-mono">What-If Grade Sandbox</h3>
            </div>
            <h2 className="text-lg font-semibold text-white mt-2">Interactive Syllabus Tracker</h2>
            <p className="text-sm text-dark-text mt-1">
              Select or register courses below, expand their cards, and click inside to enter grades. Watch your overall class average recalculate in real-time. Make sure that weight totals add up to 100% to finalize your semester grades!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-dark-border">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 p-1 bg-amber-955/50 border border-amber-900/40 rounded-md text-amber-300">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white block">Incomplete Syllabi</span>
                <span className="text-dark-muted">Listed courses with weighted items under 100% represent grades calculated dynamically on progress made so-far.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 p-1 bg-emerald-955/50 border border-emerald-900/40 rounded-md text-emerald-300">
                <Check className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white block">Weighted Norms</span>
                <span className="text-dark-muted">Weights are auto-balanced dynamically during calculations, giving you an accurate benchmark of your current grade stand at any time.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header action panel */}
      <div className="flex items-center justify-between pb-1 border-b border-dark-border">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Registered Academic Courses</h2>
          <p className="text-xs text-dark-muted mt-0.5">Manage classes, modify academic weights, and view instructor criteria.</p>
        </div>
        <button 
          onClick={() => setShowAddCourseForm(!showAddCourseForm)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#3B82F6] hover:opacity-95 transition-colors rounded-lg shadow-sm cursor-pointer"
          id="btn-toggle-course-form"
        >
          <Plus className="w-4 h-4" />
          Register Course
        </button>
      </div>

      {/* Add Course Collapsible Form */}
      <AnimatePresence>
        {showAddCourseForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleAddCourseSubmit}
              className="bg-dark-card p-5 rounded-xl border border-dark-border shadow-xs space-y-4"
              id="form-add-course"
            >
              <div className="flex items-center justify-between pb-2 border-b border-dark-border">
                <h3 className="text-sm font-semibold text-white flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  New Course Syllabus Setup
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Course Code *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g., CS-301"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full text-xs p-2 rounded-md border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Course Title *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g., Advanced Algorithm Theory"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs p-2 rounded-md border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Instructor Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g., Prof. Sarah Conner"
                    value={newInstructor}
                    onChange={(e) => setNewInstructor(e.target.value)}
                    className="w-full text-xs p-2 rounded-md border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Credit Hours *</label>
                  <select 
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-md border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6] cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5].map(cr => (
                      <option key={cr} value={cr}>{cr} Credits</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Target Grade Percentage (%)</label>
                  <input 
                    type="number"
                    min="50"
                    max="100"
                    placeholder="e.g., 90"
                    value={newTargetGrade}
                    onChange={(e) => setNewTargetGrade(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-md border border-dark-border bg-dark-surface text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="space-y-1">
                  <span className="block text-xs font-semibold text-dark-muted">Representational Theme Color</span>
                  <div className="flex gap-2">
                    {colorsOption.map(c => {
                      const sample = getColorClasses(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewColor(c)}
                          className={`w-6 h-6 rounded-full ${sample.accent} border-2 ${newColor === c ? 'border-white scale-110 shadow-sm' : 'border-dark-border'} transition-all cursor-pointer`}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 text-xs">
                  <button 
                    type="button" 
                    onClick={() => setShowAddCourseForm(false)}
                    className="px-3.5 py-1.5 font-semibold text-white bg-dark-surface hover:bg-dark-border transition-colors border border-dark-border rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-1.5 font-semibold text-white bg-[#3B82F6] hover:opacity-95 transition-colors rounded-lg shadow-sm cursor-pointer"
                  >
                    Register Syllabus
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Courses List Layout */}
      {courses.length === 0 ? (
        <div className="bg-dark-card rounded-xl border border-dashed border-dark-border py-12 px-6 flex flex-col items-center text-center">
          <BookOpen className="w-12 h-12 text-dark-muted mb-2" />
          <p className="text-sm font-semibold text-white">No registered courses found</p>
          <p className="text-xs text-dark-muted max-w-sm mt-1">
            Register your classes using the "Register Course" button to start tracking items and estimating GPA parameters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4" id="grades-course-list font-sans">
          {courses.map(course => {
            const courseAvg = calculateCourseAverage(course);
            const gradeInfo = getGradeInfo(courseAvg);
            const classes = getColorClasses(course.color);
            const isExpanded = expandedCourseId === course.id;

            // Total weight sums
            const totalAssignedWeight = course.gradeEntries.reduce((sum, item) => sum + item.weight, 0);

            return (
              <motion.div 
                key={course.id}
                layout="position"
                className="bg-dark-card rounded-xl border border-dark-border shadow-xs overflow-hidden transition-all text-dark-text"
                id={`course-card-${course.id}`}
              >
                {/* Course Block Main Info */}
                <div 
                  onClick={() => toggleCourseExpand(course.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none hover:bg-dark-surface/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${classes.bg} ${classes.text} border ${classes.border}`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${classes.bg} ${classes.text} border ${classes.border}`}>
                          {course.code}
                        </span>
                        <span className="text-xs font-semibold text-dark-muted font-mono">{course.credits} Credits</span>
                      </div>
                      <h3 className="font-semibold text-white text-base md:text-lg">{course.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-dark-muted">
                        <User className="w-3.5 h-3.5" />
                        <span>Instructor: {course.instructor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right hand values: Grades summary */}
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-dark-border">
                    <div className="flex items-center gap-4">
                      {/* Course target vs outcome */}
                      <div className="text-right space-y-0.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-dark-muted block">Syllabus Average</span>
                        <div className="flex items-baseline justify-end gap-1.5">
                          <span className="text-xl font-semibold text-white font-mono">{courseAvg}%</span>
                          <span className={`px-1.5 py-0.2 rounded text-[11px] font-extrabold font-mono border ${gradeInfo.tailwindBg} ${gradeInfo.tailwindText}`}>
                            {gradeInfo.letter}
                          </span>
                        </div>
                        <span className="text-[10px] text-dark-muted block">
                          Target: <span className="font-semibold text-white">{course.targetGrade}%</span>
                        </span>
                      </div>

                      {/* SVG Mini gauge */}
                      <div className="relative flex items-center justify-center">
                        <svg className="w-11 h-11 transform -rotate-90">
                          <circle cx="22" cy="22" r="18" className="stroke-dark-border fill-none" strokeWidth="3"></circle>
                          <circle 
                            cx="22" 
                            cy="22" 
                            r="18" 
                            className={`fill-none ${courseAvg >= course.targetGrade ? 'stroke-emerald-450' : 'stroke-amber-450'}`} 
                            strokeWidth="3"
                            strokeDasharray={`${2 * Math.PI * 18}`}
                            strokeDashoffset={`${2 * Math.PI * 18 * (1 - Math.min(courseAvg, 100) / 100)}`}
                          />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-dark-text font-mono">
                          {courseAvg >= course.targetGrade ? 'OK' : '!'}
                        </span>
                      </div>
                    </div>

                    <div className="text-dark-muted py-1.5 px-1 hover:text-white rounded transition-colors hidden sm:block">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Grade Ledger Details Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-dark-border bg-dark-surface/30"
                    >
                      <div className="p-5 space-y-6">
                        
                        {/* Grade analysis breakdown & interactive input split */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                          
                          {/* Left ledger of items (takes up 2 cols) */}
                          <div className="xl:col-span-2 space-y-3">
                            <div className="flex items-center justify-between pb-1">
                              <h4 className="text-xs uppercase font-bold tracking-wider text-dark-muted font-mono">Syllabus Breakdown ({course.gradeEntries.length} Items)</h4>
                              <div className="text-xs font-mono text-dark-muted">
                                Allocated Weight: <span className={`font-semibold ${totalAssignedWeight === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{totalAssignedWeight}% / 100%</span>
                              </div>
                            </div>

                            {course.gradeEntries.length === 0 ? (
                              <div className="p-6 bg-dark-surface rounded-lg border border-dark-border text-center text-dark-muted text-xs">
                                No grades logged yet. Enter one using the sandbox engine on the right.
                              </div>
                            ) : (
                              <div className="bg-dark-surface rounded-lg border border-dark-border divide-y divide-dark-border">
                                {course.gradeEntries.map(entry => {
                                  const contribution = ((entry.score / entry.maxScore) * entry.weight).toFixed(1);
                                  const percentage = Math.round((entry.score / entry.maxScore) * 100);
                                  const scoreText = `${entry.score} / ${entry.maxScore}`;

                                  return (
                                    <div key={entry.id} className="p-3 flex items-center justify-between gap-4 text-xs group hover:bg-dark-border/40 transition-colors">
                                      <div className="space-y-0.5">
                                        <p className="font-semibold text-white">{entry.name}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-dark-muted">
                                          <span>Syllabus Weight: <span className="font-semibold text-dark-text">{entry.weight}%</span></span>
                                          <span>•</span>
                                          <span>Contribution: <span className="font-semibold text-dark-text font-mono">{contribution}%</span></span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3">
                                        <div className="text-right">
                                          <span className="font-bold text-white block text-sm font-mono">{percentage}%</span>
                                          <span className="text-[10px] font-mono text-dark-muted block">{scoreText}</span>
                                        </div>

                                        <button
                                          onClick={() => onDeleteGradeItem(course.id, entry.id)}
                                          className="text-dark-muted hover:text-rose-400 p-1.5 hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                                          title="De-register grade item"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {totalAssignedWeight < 100 && (
                              <div className="p-3 bg-amber-950/30 rounded-lg border border-amber-900/40 flex items-start gap-2 text-xs text-amber-300">
                                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
                                <div>
                                  <span className="font-semibold block text-amber-200">Incomplete syllabus weight summation</span>
                                  Your logged grades sum up to <span className="font-bold">{totalAssignedWeight}%</span>. Standard sandbox projections normalize inputs dynamically to provide you a grade status of {courseAvg}%, but adding the final exams and missing works is needed to reach full certainty!
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Inline Sandbox Form */}
                          <div className="bg-dark-card p-4.5 rounded-lg border border-dark-border shadow-xs">
                            <h4 className="text-xs uppercase font-bold tracking-wider text-dark-muted font-mono pb-2 border-b border-dark-border mb-3 flex items-center gap-1.5">
                              <Plus className="w-4 h-4 text-indigo-400" />
                              Log Grade Item
                            </h4>
                            
                            <form onSubmit={(e) => handleAddGradeSubmit(course.id, e)} className="space-y-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-dark-muted mb-1">Assignment / Exam Name</label>
                                <input 
                                  type="text"
                                  required
                                  placeholder="e.g., Final Exam, Quiz 3"
                                  value={newGradeName}
                                  onChange={(e) => setNewGradeName(e.target.value)}
                                  className="w-full text-xs p-2 rounded border border-dark-border bg-dark-surface text-white font-sans focus:outline-none focus:border-[#3B82F6]"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[11px] font-semibold text-dark-muted mb-1">Your Score</label>
                                  <input 
                                    type="number"
                                    required
                                    min="0"
                                    max="200"
                                    placeholder="85"
                                    value={newGradeScore}
                                    onChange={(e) => setNewGradeScore(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full text-xs p-2 rounded border border-dark-border bg-dark-surface text-white font-mono focus:outline-none focus:border-[#3B82F6]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-dark-muted mb-1">Max Score</label>
                                  <input 
                                    type="number"
                                    required
                                    min="1"
                                    max="200"
                                    placeholder="100"
                                    value={newGradeMax}
                                    onChange={(e) => setNewGradeMax(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full text-xs p-2 rounded border border-dark-border bg-dark-surface text-white font-mono focus:outline-none focus:border-[#3B82F6]"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-dark-muted mb-1">Syllabus Weight % (e.g. 20)</label>
                                <input 
                                  type="number"
                                  required
                                  min="1"
                                  max={100 - totalAssignedWeight}
                                  placeholder={`Max: ${100 - totalAssignedWeight}%`}
                                  value={newGradeWeight}
                                  onChange={(e) => setNewGradeWeight(e.target.value === '' ? '' : Number(e.target.value))}
                                  className="w-full text-xs p-2 rounded border border-dark-border bg-dark-surface text-white font-mono focus:outline-none focus:border-[#3B82F6]"
                                />
                                <span className="text-[9px] text-dark-muted mt-0.5 block">Allocated weight budget left: {100 - totalAssignedWeight}%</span>
                              </div>

                              {gradeFormError && (
                                <p className="text-[10px] text-rose-450 font-semibold">{gradeFormError}</p>
                              )}

                              <button 
                                type="submit"
                                className="w-full text-xs font-semibold py-2 bg-[#3B82F6] hover:opacity-90 text-white font-sans rounded shadow-xs transition-colors cursor-pointer mt-1"
                              >
                                Add Sandbox Entry
                              </button>
                            </form>
                          </div>
                        </div>

                        {/* Danger zone footer of details */}
                        <div className="pt-4 border-t border-dark-border flex justify-between items-center text-xs">
                          <span className="text-dark-muted font-mono">ID: {course.id}</span>
                          <button
                            onClick={() => {
                              if (confirm(`Are you absolutely sure you want to drop course ${course.code}? This will delete all logged grade criteria for this class.`)) {
                                onDeleteCourse(course.id);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-350 font-medium px-2 py-1 rounded hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Drop Course
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
