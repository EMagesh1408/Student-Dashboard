export interface GradeItem {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number; // Percentage, e.g., 20 for 20%
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  instructor: string;
  targetGrade: number; // e.g. 90
  color: string; // Tailwind class identifier like 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' | 'sky'
  gradeEntries: GradeItem[];
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface ScheduleEvent {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:MM" in 24h format
  endTime: string;   // "HH:MM" in 24h format
  room: string;
  color: string;
}

export type PriorityLevel = 'low' | 'medium' | 'high';

export interface Assignment {
  id: string;
  title: string;
  courseId: string; // Links to Course.id or 'other'
  courseName: string;
  dueDate: string; // "YYYY-MM-DD"
  priority: PriorityLevel;
  completed: boolean;
  notes?: string;
}

export interface StudentProfile {
  name: string;
  major: string;
  semester: string;
  avatarUrl?: string;
  targetGpa: number;
}
