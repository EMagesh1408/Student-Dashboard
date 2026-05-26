import { Course, ScheduleEvent, Assignment, StudentProfile } from './types';

// Converts a percentage to letter grade and GPA points (standard 4.0 scale)
export function getGradeInfo(percentage: number): { letter: string; gpa: number; tailwindBg: string; tailwindText: string } {
  if (percentage >= 93) return { letter: 'A', gpa: 4.0, tailwindBg: 'bg-emerald-50', tailwindText: 'text-emerald-700' };
  if (percentage >= 90) return { letter: 'A-', gpa: 3.7, tailwindBg: 'bg-emerald-50/70', tailwindText: 'text-emerald-600' };
  if (percentage >= 87) return { letter: 'B+', gpa: 3.3, tailwindBg: 'bg-cyan-50', tailwindText: 'text-cyan-700' };
  if (percentage >= 83) return { letter: 'B', gpa: 3.0, tailwindBg: 'bg-cyan-50/70', tailwindText: 'text-cyan-600' };
  if (percentage >= 80) return { letter: 'B-', gpa: 2.7, tailwindBg: 'bg-blue-50', tailwindText: 'text-blue-700' };
  if (percentage >= 77) return { letter: 'C+', gpa: 2.3, tailwindBg: 'bg-amber-50', tailwindText: 'text-amber-700' };
  if (percentage >= 73) return { letter: 'C', gpa: 2.0, tailwindBg: 'bg-amber-50/70', tailwindText: 'text-amber-600' };
  if (percentage >= 70) return { letter: 'C-', gpa: 1.7, tailwindBg: 'bg-orange-50', tailwindText: 'text-orange-700' };
  if (percentage >= 60) return { letter: 'D', gpa: 1.0, tailwindBg: 'bg-rose-50', tailwindText: 'text-rose-600' };
  return { letter: 'F', gpa: 0.0, tailwindBg: 'bg-red-50', tailwindText: 'text-red-700' };
}

// Calculate the current course average based on the graded items
// Normalizes the weights if they don't sum up to 100% yet
export function calculateCourseAverage(course: Course): number {
  if (!course.gradeEntries || course.gradeEntries.length === 0) return 100; // default to a perfect 100 if no assignments graded yet

  let totalWeightedScore = 0;
  let totalWeight = 0;

  course.gradeEntries.forEach(entry => {
    const fraction = entry.score / entry.maxScore;
    totalWeightedScore += fraction * entry.weight;
    totalWeight += entry.weight;
  });

  if (totalWeight === 0) return 100;
  return Math.round((totalWeightedScore / totalWeight) * 100 * 10) / 10;
}

// Calculate Overall Semester GPA
export function calculateGpa(courses: Course[]): number {
  if (courses.length === 0) return 4.0;
  
  let totalPoints = 0;
  let totalCredits = 0;

  courses.forEach(course => {
    const avg = calculateCourseAverage(course);
    const { gpa } = getGradeInfo(avg);
    totalPoints += gpa * course.credits;
    totalCredits += course.credits;
  });

  if (totalCredits === 0) return 4.0;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

export const INITIAL_PROFILE: StudentProfile = {
  name: "Alex Mercer",
  major: "Computer Science & Data Science",
  semester: "Year 3, Semester 1",
  targetGpa: 3.8,
};

export const INITIAL_COURSES: Course[] = [
  {
    id: "cs-301",
    code: "CS-301",
    name: "Design & Analysis of Algorithms",
    credits: 4,
    instructor: "Dr. Evelyn Thomas",
    targetGrade: 92,
    color: "indigo",
    gradeEntries: [
      { id: "cs-g1", name: "Problem Set 1 (Divide & Conquer)", score: 92, maxScore: 100, weight: 15 },
      { id: "cs-g2", name: "Problem Set 2 (Dynamic Programming)", score: 88, maxScore: 100, weight: 15 },
      { id: "cs-g3", name: "Midterm Exam", score: 85, maxScore: 100, weight: 30 },
      { id: "cs-g4", name: "Greedy Algorithms Coding Quiz", score: 95, maxScore: 100, weight: 10 },
    ]
  },
  {
    id: "ds-320",
    code: "DS-320",
    name: "Machine Learning Foundations",
    credits: 4,
    instructor: "Prof. Kenneth Wright",
    targetGrade: 90,
    color: "emerald",
    gradeEntries: [
      { id: "ds-g1", name: "K-Means Claw Lab", score: 98, maxScore: 100, weight: 10 },
      { id: "ds-g2", name: "Linear Regression Homework", score: 94, maxScore: 100, weight: 15 },
      { id: "ds-g3", name: "Project Idea Proposal", score: 90, maxScore: 100, weight: 10 },
      { id: "ds-g4", name: "Midterm Exam MCQ", score: 89, maxScore: 100, weight: 25 },
    ]
  },
  {
    id: "mth-210",
    code: "MTH-210",
    name: "Linear Algebra & Applications",
    credits: 3,
    instructor: "Dr. Alan Vane",
    targetGrade: 85,
    color: "amber",
    gradeEntries: [
      { id: "m-g1", name: "Vector Spaces Quiz", score: 78, maxScore: 100, weight: 20 },
      { id: "m-g2", name: "Eigenvalues & Eigenvectors HW", score: 84, maxScore: 100, weight: 20 },
      { id: "m-g3", name: "Midterm Written Exam", score: 81, maxScore: 100, weight: 30 },
    ]
  },
  {
    id: "lit-150",
    code: "LIT-150",
    name: "Science Fiction Literature",
    credits: 3,
    instructor: "Prof. Sarah Jenkins",
    targetGrade: 95,
    color: "rose",
    gradeEntries: [
      { id: "l-g1", name: "Essay 1: Frankenstein's Legacy", score: 96, maxScore: 100, weight: 25 },
      { id: "l-g2", name: "Introductory Quiz", score: 100, maxScore: 100, weight: 10 },
      { id: "l-g3", name: "Short Presentation (Solaris)", score: 94, maxScore: 100, weight: 15 },
    ]
  }
];

export const INITIAL_SCHEDULE: ScheduleEvent[] = [
  // Monday
  {
    id: "s1",
    courseId: "cs-301",
    courseCode: "CS-301",
    courseName: "Algorithms",
    dayOfWeek: "Monday",
    startTime: "09:30",
    endTime: "11:00",
    room: "Engineering Building, Room 204",
    color: "indigo"
  },
  {
    id: "s2",
    courseId: "ds-320",
    courseCode: "DS-320",
    courseName: "Machine Learning",
    dayOfWeek: "Monday",
    startTime: "13:00",
    endTime: "14:30",
    room: "Tech Center, Lab 3",
    color: "emerald"
  },
  // Tuesday
  {
    id: "s3",
    courseId: "mth-210",
    courseCode: "MTH-210",
    courseName: "Linear Algebra",
    dayOfWeek: "Tuesday",
    startTime: "10:30",
    endTime: "12:00",
    room: "Science Hall, Room 101",
    color: "amber"
  },
  {
    id: "s4",
    courseId: "lit-150",
    courseCode: "LIT-150",
    courseName: "Sci-Fi Literature",
    dayOfWeek: "Tuesday",
    startTime: "14:00",
    endTime: "15:30",
    room: "Liberal Arts Hall, Room 305",
    color: "rose"
  },
  // Wednesday
  {
    id: "s5",
    courseId: "cs-301",
    courseCode: "CS-301",
    courseName: "Algorithms",
    dayOfWeek: "Wednesday",
    startTime: "09:30",
    endTime: "11:00",
    room: "Engineering Building, Room 204",
    color: "indigo"
  },
  {
    id: "s6",
    courseId: "ds-320",
    courseCode: "DS-320",
    courseName: "Machine Learning",
    dayOfWeek: "Wednesday",
    startTime: "13:00",
    endTime: "14:30",
    room: "Tech Center, Lab 3",
    color: "emerald"
  },
  // Thursday
  {
    id: "s7",
    courseId: "mth-210",
    courseCode: "MTH-210",
    courseName: "Linear Algebra",
    dayOfWeek: "Thursday",
    startTime: "10:30",
    endTime: "12:00",
    room: "Science Hall, Room 101",
    color: "amber"
  },
  {
    id: "s8",
    courseId: "lit-150",
    courseCode: "LIT-150",
    courseName: "Sci-Fi Literature",
    dayOfWeek: "Thursday",
    startTime: "14:00",
    endTime: "15:30",
    room: "Liberal Arts Hall, Room 305",
    color: "rose"
  },
  // Friday
  {
    id: "s9",
    courseId: "ds-320",
    courseCode: "DS-320",
    courseName: "Machine Learning (Lab)",
    dayOfWeek: "Friday",
    startTime: "11:00",
    endTime: "12:30",
    room: "Computing Hub, G-12",
    color: "emerald"
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: "a1",
    title: "Graph Algorithms Problem Set",
    courseId: "cs-301",
    courseName: "CS-301: Design & Analysis of Algorithms",
    dueDate: "2026-05-28", // Thursday
    priority: "high",
    completed: false,
    notes: "Requires implementing Bellman-Ford and Floyd-Warshall with complete complexity analysis."
  },
  {
    id: "a2",
    title: "Gradient Descent Jupyter Notebook",
    courseId: "ds-320",
    courseName: "DS-320: Machine Learning Foundations",
    dueDate: "2026-05-29", // Friday
    priority: "high",
    completed: false,
    notes: "Code linear regression from scratch using numpy. Test with house price dataset."
  },
  {
    id: "a3",
    title: "Linear Transformations Worksheet",
    courseId: "mth-210",
    courseName: "MTH-210: Linear Algebra & Applications",
    dueDate: "2026-05-31", // Sunday
    priority: "medium",
    completed: true,
    notes: "Problems 1-15 on pages 140-142. Double-check kernel and range dimensions."
  },
  {
    id: "a4",
    title: "Read 'Neuromancer' & Write Response",
    courseId: "lit-150",
    courseName: "LIT-150: Science Fiction Literature",
    dueDate: "2026-06-03", // Next Wednesday
    priority: "low",
    completed: false,
    notes: "Analyze William Gibson's portrayal of cyberspace against modern AR/VR integrations. 500 words limit."
  },
  {
    id: "a5",
    title: "ML Term Project Proposal Draft",
    courseId: "ds-320",
    courseName: "DS-320: Machine Learning Foundations",
    dueDate: "2026-06-05", // Next Friday
    priority: "medium",
    completed: false,
    notes: "Submit teammate names, problem statement, and details of kaggle dataset to use."
  }
];
