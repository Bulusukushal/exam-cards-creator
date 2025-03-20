
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "@/components/ui/sonner";
import { Exam, Question, ExamResult, Student, RankData } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock database functions
let exams: Exam[] = [];
let results: ExamResult[] = [];
let activeExams: Record<string, boolean> = {};

// Parse document text format
export function parseQuestionDocument(text: string): Question[] {
  const lines = text.split('\n').filter(line => line.trim());
  const questions: Question[] = [];
  
  let currentQuestion: Partial<Question> = {};
  let currentCategory = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('Category:')) {
      currentCategory = line.replace('Category:', '').trim().toLowerCase() as Question['category'];
    } else if (line.startsWith('Question:')) {
      // Save previous question if exists
      if (currentQuestion.text) {
        questions.push(currentQuestion as Question);
      }
      
      // Start new question
      currentQuestion = {
        id: crypto.randomUUID(),
        category: currentCategory as Question['category'],
        text: line.replace('Question:', '').trim(),
        options: [],
        answer: ''
      };
    } else if (line.startsWith('A)') || line.startsWith('A.') || line.includes('A)')) {
      const optionsLine = line;
      const options = [];
      
      // Extract options by looking for patterns like A), B), etc.
      const optionMatches = optionsLine.match(/[A-D][\)\.]\s+[^A-D\)\.]+/g) || [];
      
      for (const match of optionMatches) {
        const option = match.replace(/^[A-D][\)\.]\s+/, '').trim();
        options.push(option);
      }
      
      currentQuestion.options = options;
    } else if (line.startsWith('Answer:')) {
      currentQuestion.answer = line.replace('Answer:', '').trim();
    }
  }
  
  // Add the last question
  if (currentQuestion.text) {
    questions.push(currentQuestion as Question);
  }
  
  return questions;
}

// Create a new exam
export function createExam(year: string, semester: string, questions: Question[]): Exam {
  const exam: Exam = {
    id: crypto.randomUUID(),
    name: `${year}_${semester}`,
    year,
    semester,
    status: 'pending',
    questions,
    createdAt: new Date(),
  };
  
  exams.push(exam);
  return exam;
}

// Get all exams
export function getAllExams(): Exam[] {
  return [...exams].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Get exam by ID
export function getExamById(id: string): Exam | undefined {
  return exams.find(exam => exam.id === id);
}

// Update exam
export function updateExam(id: string, updates: Partial<Exam>): Exam | undefined {
  const index = exams.findIndex(exam => exam.id === id);
  if (index === -1) return undefined;
  
  exams[index] = { ...exams[index], ...updates };
  return exams[index];
}

// Start exam
export function startExam(id: string): string {
  const exam = getExamById(id);
  if (!exam) throw new Error('Exam not found');
  
  const link = `exam/${id}`;
  activeExams[id] = true;
  updateExam(id, { status: 'active', link });
  
  return link;
}

// End exam
export function endExam(id: string): void {
  const exam = getExamById(id);
  if (!exam) throw new Error('Exam not found');
  
  activeExams[id] = false;
  updateExam(id, { status: 'completed' });
}

// Check if exam is active
export function isExamActive(id: string): boolean {
  return !!activeExams[id];
}

// Submit exam result
export function submitExamResult(
  examId: string,
  student: Student,
  categoryMarks: {
    coding: number;
    math: number;
    aptitude: number;
    communication: number;
  }
): ExamResult {
  const exam = getExamById(examId);
  if (!exam) throw new Error('Exam not found');
  
  const totalMarks = Object.values(categoryMarks).reduce((sum, mark) => sum + mark, 0);
  
  const result: ExamResult = {
    id: crypto.randomUUID(),
    examId,
    examName: exam.name,
    studentId: student.id || crypto.randomUUID(),
    student,
    totalMarks,
    codingMarks: categoryMarks.coding,
    mathMarks: categoryMarks.math,
    aptitudeMarks: categoryMarks.aptitude,
    communicationMarks: categoryMarks.communication,
    completedAt: new Date(),
  };
  
  results.push(result);
  return result;
}

// Get exam results
export function getExamResults(examId: string): ExamResult[] {
  return results.filter(result => result.examId === examId)
    .sort((a, b) => b.totalMarks - a.totalMarks);
}

// Get student results
export function getStudentResults(rollNo: string): ExamResult[] {
  return results.filter(result => result.student.rollNo === rollNo)
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
}

// Calculate rank data for a student in an exam
export function calculateRank(examId: string, rollNo: string): RankData | null {
  const examResults = getExamResults(examId);
  const studentResult = examResults.find(result => result.student.rollNo === rollNo);
  
  if (!studentResult) return null;
  
  // Overall rank
  const overallRank = examResults.findIndex(result => result.student.rollNo === rollNo) + 1;
  
  // Year rank
  const yearResults = examResults.filter(result => result.student.year === studentResult.student.year);
  const yearRank = yearResults.findIndex(result => result.student.rollNo === rollNo) + 1;
  
  // Branch rank
  const branchResults = examResults.filter(result => result.student.branch === studentResult.student.branch);
  const branchRank = branchResults.findIndex(result => result.student.rollNo === rollNo) + 1;
  
  // Section rank
  const sectionResults = examResults.filter(
    result => result.student.section === studentResult.student.section &&
              result.student.branch === studentResult.student.branch &&
              result.student.year === studentResult.student.year
  );
  const sectionRank = sectionResults.findIndex(result => result.student.rollNo === rollNo) + 1;
  
  // Category ranks
  const codingResults = [...examResults].sort((a, b) => b.codingMarks - a.codingMarks);
  const mathResults = [...examResults].sort((a, b) => b.mathMarks - a.mathMarks);
  const aptitudeResults = [...examResults].sort((a, b) => b.aptitudeMarks - a.aptitudeMarks);
  const communicationResults = [...examResults].sort((a, b) => b.communicationMarks - a.communicationMarks);
  
  const codingRank = codingResults.findIndex(result => result.student.rollNo === rollNo) + 1;
  const mathRank = mathResults.findIndex(result => result.student.rollNo === rollNo) + 1;
  const aptitudeRank = aptitudeResults.findIndex(result => result.student.rollNo === rollNo) + 1;
  const communicationRank = communicationResults.findIndex(result => result.student.rollNo === rollNo) + 1;
  
  return {
    overall: overallRank,
    year: yearRank,
    branch: branchRank,
    section: sectionRank,
    category: {
      coding: codingRank,
      math: mathRank,
      aptitude: aptitudeRank,
      communication: communicationRank,
    },
  };
}

// Get the top performers in an exam
export function getExamTopPerformers(examId: string, limit: number = 10): ExamResult[] {
  return getExamResults(examId).slice(0, limit);
}

// Get the top performers by category
export function getTopPerformersByCategory(examId: string, category: string, limit: number = 10): ExamResult[] {
  const examResults = getExamResults(examId);
  
  switch (category) {
    case 'coding':
      return [...examResults].sort((a, b) => b.codingMarks - a.codingMarks).slice(0, limit);
    case 'math':
      return [...examResults].sort((a, b) => b.mathMarks - a.mathMarks).slice(0, limit);
    case 'aptitude':
      return [...examResults].sort((a, b) => b.aptitudeMarks - a.aptitudeMarks).slice(0, limit);
    case 'communication':
      return [...examResults].sort((a, b) => b.communicationMarks - a.communicationMarks).slice(0, limit);
    default:
      return examResults.slice(0, limit);
  }
}

// Authentication
export function authenticateAdmin(username: string, password: string): boolean {
  return username === 'Admin_Exam' && password === 'Vignan_iit';
}

// Helper function to show success notification
export function showSuccess(message: string) {
  toast.success(message);
}

// Helper function to show error notification
export function showError(message: string) {
  toast.error(message);
}

// Add sample data for testing
export function addSampleData() {
  if (exams.length === 0) {
    const sampleQuestions: Question[] = [
      {
        id: crypto.randomUUID(),
        category: 'aptitude',
        text: 'What is the capital of France?',
        options: ['London', 'Paris', 'Berlin', 'Madrid'],
        answer: 'Paris',
      },
      {
        id: crypto.randomUUID(),
        category: 'coding',
        text: 'What is the main use of CSS?',
        options: ['Styling', 'Logic', 'Database', 'Authentication'],
        answer: 'Styling',
      },
      {
        id: crypto.randomUUID(),
        category: 'coding',
        text: 'What does HTML stand for?',
        options: ['Hyper Text Markup Language', 'High Tech Multi Language', 'Hyper Transfer Markup Language', 'None of the above'],
        answer: 'Hyper Text Markup Language',
      },
      {
        id: crypto.randomUUID(),
        category: 'math',
        text: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        answer: '4',
      },
      {
        id: crypto.randomUUID(),
        category: 'communication',
        text: 'Which of the following is NOT a communication channel?',
        options: ['Email', 'Face-to-face', 'Telepathy', 'Video call'],
        answer: 'Telepathy',
      }
    ];

    const exam = createExam('2023', 'Fall', sampleQuestions);
    
    // Sample students and results
    const students = [
      { id: crypto.randomUUID(), name: 'John Doe', rollNo: '2023001', year: '2023', branch: 'CSE', section: 'A' },
      { id: crypto.randomUUID(), name: 'Jane Smith', rollNo: '2023002', year: '2023', branch: 'CSE', section: 'A' },
      { id: crypto.randomUUID(), name: 'Bob Johnson', rollNo: '2023003', year: '2023', branch: 'ECE', section: 'B' },
    ];
    
    submitExamResult(exam.id, students[0], { coding: 85, math: 90, aptitude: 75, communication: 80 });
    submitExamResult(exam.id, students[1], { coding: 90, math: 85, aptitude: 80, communication: 85 });
    submitExamResult(exam.id, students[2], { coding: 70, math: 95, aptitude: 85, communication: 75 });
    
    updateExam(exam.id, { status: 'completed' });
  }
}
