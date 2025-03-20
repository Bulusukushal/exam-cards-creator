
export interface Exam {
  id: string;
  name: string;
  year: string;
  semester: string;
  status: 'pending' | 'active' | 'completed';
  questions: Question[];
  createdAt: Date;
  link?: string;
}

export interface Question {
  id: string;
  category: 'coding' | 'math' | 'aptitude' | 'communication';
  text: string;
  options: string[];
  answer: string;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  year: string;
  branch: string;
  section: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  examName: string;
  studentId: string;
  student: Student;
  totalMarks: number;
  codingMarks: number;
  mathMarks: number;
  aptitudeMarks: number;
  communicationMarks: number;
  completedAt: Date;
}

export interface RankData {
  overall: number;
  year: number;
  branch: number;
  section: number;
  category: {
    coding: number;
    math: number;
    aptitude: number;
    communication: number;
  };
}
