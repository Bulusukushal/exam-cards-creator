import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Exam, 
  Question, 
  ExamResult, 
  Student 
} from "@/types";
import { 
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  startExam,
  endExam,
  isExamActive,
  getExamResults,
  submitExamResult,
  parseQuestionDocument,
  getStudentResults,
  calculateRank,
  getExamTopPerformers,
  getTopPerformersByCategory,
  addSampleData
} from "@/lib/utils";

type ExamContextType = {
  exams: Exam[];
  loadExams: () => void;
  getExam: (id: string) => Exam | undefined;
  createNewExam: (
    year: string, 
    semester: string, 
    documents: {
      coding: string;
      math: string;
      aptitude: string;
      communication: string;
    }
  ) => Exam;
  updateExamQuestions: (examId: string, questions: Question[]) => Exam | undefined;
  activateExam: (examId: string) => string;
  deactivateExam: (examId: string) => void;
  checkExamStatus: (examId: string) => boolean;
  getResults: (examId: string) => ExamResult[];
  submitResult: (
    examId: string,
    student: Student,
    categoryMarks: {
      coding: number;
      math: number;
      aptitude: number;
      communication: number;
    }
  ) => ExamResult;
  getStudentExams: (rollNo: string) => ExamResult[];
  getStudentResults: (rollNo: string) => ExamResult[];
  getStudentRank: (examId: string, rollNo: string) => any;
  getTopPerformers: (examId: string, limit?: number) => ExamResult[];
  getCategoryTopPerformers: (examId: string, category: string, limit?: number) => ExamResult[];
  loading: boolean;
};

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Add some sample data for demonstration
    addSampleData();
    loadExams();
  }, []);

  const loadExams = () => {
    setLoading(true);
    try {
      const allExams = getAllExams();
      setExams(allExams);
    } catch (error) {
      console.error("Error loading exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const getExam = (id: string): Exam | undefined => {
    return getExamById(id);
  };

  const createNewExam = (
    year: string, 
    semester: string, 
    documents: {
      coding: string;
      math: string;
      aptitude: string;
      communication: string;
    }
  ): Exam => {
    // Parse questions from each document with appropriate category
    const codingQuestions = parseQuestionDocument(documents.coding, 'coding');
    const mathQuestions = parseQuestionDocument(documents.math, 'math');
    const aptitudeQuestions = parseQuestionDocument(documents.aptitude, 'aptitude');
    const communicationQuestions = parseQuestionDocument(documents.communication, 'communication');
    
    // Combine all questions
    const allQuestions = [
      ...codingQuestions,
      ...mathQuestions,
      ...aptitudeQuestions,
      ...communicationQuestions
    ];
    
    const exam = createExam(year, semester, allQuestions);
    loadExams(); // Refresh exams list
    return exam;
  };

  const updateExamQuestions = (examId: string, questions: Question[]): Exam | undefined => {
    const updated = updateExam(examId, { questions });
    loadExams(); // Refresh exams list
    return updated;
  };

  const activateExam = (examId: string): string => {
    const link = startExam(examId);
    loadExams(); // Refresh exams list
    return link;
  };

  const deactivateExam = (examId: string): void => {
    endExam(examId);
    loadExams(); // Refresh exams list
  };

  const checkExamStatus = (examId: string): boolean => {
    return isExamActive(examId);
  };

  const getResults = (examId: string): ExamResult[] => {
    return getExamResults(examId);
  };

  const submitResult = (
    examId: string,
    student: Student,
    categoryMarks: {
      coding: number;
      math: number;
      aptitude: number;
      communication: number;
    }
  ): ExamResult => {
    return submitExamResult(examId, student, categoryMarks);
  };

  const getStudentExams = (rollNo: string): ExamResult[] => {
    return getStudentResults(rollNo);
  };

  const getStudentRank = (examId: string, rollNo: string) => {
    return calculateRank(examId, rollNo);
  };

  const getTopPerformers = (examId: string, limit: number = 10): ExamResult[] => {
    return getExamTopPerformers(examId, limit);
  };

  const getCategoryTopPerformers = (examId: string, category: string, limit: number = 10): ExamResult[] => {
    return getTopPerformersByCategory(examId, category, limit);
  };

  return (
    <ExamContext.Provider
      value={{
        exams,
        loadExams,
        getExam,
        createNewExam,
        updateExamQuestions,
        activateExam,
        deactivateExam,
        checkExamStatus,
        getResults,
        submitResult,
        getStudentExams,
        getStudentResults: getStudentExams,
        getStudentRank,
        getTopPerformers,
        getCategoryTopPerformers,
        loading,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error("useExam must be used within an ExamProvider");
  }
  return context;
};
