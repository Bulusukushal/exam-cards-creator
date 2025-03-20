
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExam } from "@/context/ExamContext";
import { Question, Student } from "@/types";
import { Check, Timer, AlertTriangle } from "lucide-react";

interface ExamFormData {
  name: string;
  rollNo: string;
  year: string;
  branch: string;
  section: string;
}

interface QuestionState {
  id: string;
  selectedAnswer: string;
}

const ExamPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { getExam, checkExamStatus, submitResult } = useExam();
  
  const [exam, setExam] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [studentUsername, setStudentUsername] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [formData, setFormData] = useState<ExamFormData>({
    name: "",
    rollNo: "",
    year: "",
    branch: "",
    section: "",
  });
  const [showExamForm, setShowExamForm] = useState(false);
  const [showExam, setShowExam] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, QuestionState[]>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [categoryScores, setCategoryScores] = useState({
    coding: 0,
    math: 0,
    aptitude: 0,
    communication: 0,
  });
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    if (!examId) {
      navigate("/not-found");
      return;
    }

    const exam = getExam(examId);
    if (!exam) {
      navigate("/not-found");
      return;
    }

    const isActive = checkExamStatus(examId);
    if (!isActive) {
      toast.error("This exam is not currently active");
      navigate("/");
      return;
    }

    // Extract unique categories from questions
    const categories = [...new Set(exam.questions.map((q: Question) => q.category))];
    const initAnswers: Record<string, QuestionState[]> = {};
    
    categories.forEach(category => {
      const categoryQuestions = exam.questions.filter((q: Question) => q.category === category);
      initAnswers[category] = categoryQuestions.map(q => ({
        id: q.id,
        selectedAnswer: "",
      }));
    });

    setExam(exam);
    setAnswers(initAnswers);
  }, [examId]);

  // Setup timer countdown
  useEffect(() => {
    if (!showExam) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timerId);
          handleSubmitExam();
          return 0;
        }
        
        // Show warning at 5 minutes
        if (prev === 300) {
          setShowTimeWarning(true);
          toast.warning("5 minutes remaining!", {
            duration: 10000,
          });
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [showExam]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple authentication - in a real app, this would be more secure
    if (studentUsername && studentPassword) {
      setIsAuthenticated(true);
      setShowExamForm(true);
    } else {
      toast.error("Please enter your username and password");
    }
  };

  const handleExamFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.rollNo || !formData.year || !formData.branch || !formData.section) {
      toast.error("Please fill in all fields");
      return;
    }

    setShowExam(true);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentQuestions(exam.questions.filter((q: Question) => q.category === category));
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (!selectedCategory) return;

    setAnswers(prev => {
      const categoryAnswers = [...prev[selectedCategory]];
      const questionIndex = categoryAnswers.findIndex(q => q.id === questionId);
      
      if (questionIndex !== -1) {
        categoryAnswers[questionIndex] = {
          ...categoryAnswers[questionIndex],
          selectedAnswer: answer,
        };
      }

      return {
        ...prev,
        [selectedCategory]: categoryAnswers,
      };
    });
  };

  const calculateCategoryScore = (category: string) => {
    if (!exam) return 0;
    
    const categoryQuestions = exam.questions.filter((q: Question) => q.category === category);
    const categoryAnswers = answers[category] || [];
    
    let score = 0;
    for (const answer of categoryAnswers) {
      const question = categoryQuestions.find(q => q.id === answer.id);
      if (question && answer.selectedAnswer === question.answer) {
        score++;
      }
    }
    
    return score;
  };

  const handleSubmitExam = () => {
    // Calculate scores
    const codingScore = calculateCategoryScore("coding");
    const mathScore = calculateCategoryScore("math");
    const aptitudeScore = calculateCategoryScore("aptitude");
    const communicationScore = calculateCategoryScore("communication");
    
    const total = codingScore + mathScore + aptitudeScore + communicationScore;
    
    setCategoryScores({
      coding: codingScore,
      math: mathScore,
      aptitude: aptitudeScore,
      communication: communicationScore,
    });
    
    setTotalScore(total);
    
    // Submit result
    try {
      const student: Student = {
        id: crypto.randomUUID(),
        name: formData.name,
        rollNo: formData.rollNo,
        year: formData.year,
        branch: formData.branch,
        section: formData.section,
      };
      
      submitResult(examId as string, student, {
        coding: codingScore,
        math: mathScore,
        aptitude: aptitudeScore,
        communication: communicationScore,
      });
      
      setExamCompleted(true);
      toast.success("Exam completed and results submitted!");
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Failed to submit exam results. Please try again.");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "coding":
        return "💻";
      case "math":
        return "🔢";
      case "aptitude":
        return "🧠";
      case "communication":
        return "💬";
      default:
        return "📝";
    }
  };

  const getCategoryCompletionPercentage = (category: string) => {
    if (!answers[category]) return 0;
    
    const answeredCount = answers[category].filter(q => q.selectedAnswer).length;
    const totalCount = answers[category].length;
    
    return Math.round((answeredCount / totalCount) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        {!isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-12"
          >
            <Card className="w-full max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-medium text-gray-900 mb-2">Student Login</h1>
                  <p className="text-gray-500">Please login to access the exam</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <Input
                      value={studentUsername}
                      onChange={(e) => setStudentUsername(e.target.value)}
                      className="input-focus"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      className="input-focus"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : showExamForm && !showExam ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-12"
          >
            <Card className="w-full max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-medium text-gray-900 mb-2">Student Information</h1>
                  <p className="text-gray-500">
                    Please fill in your details to start the exam
                  </p>
                </div>

                <form onSubmit={handleExamFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-focus"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Roll Number
                    </label>
                    <Input
                      value={formData.rollNo}
                      onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                      className="input-focus"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Year
                      </label>
                      <Input
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="input-focus"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Branch
                      </label>
                      <Input
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        className="input-focus"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Section
                    </label>
                    <Input
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="input-focus"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full">
                      Start Exam
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : showExam && !examCompleted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-medium text-gray-900">
                  {exam?.name} Examination
                </h1>
                <p className="text-gray-500">
                  {formData.name} ({formData.rollNo}) - {formData.branch} {formData.year}
                </p>
              </div>
              <div className={`flex items-center ${showTimeWarning ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                <Timer className="h-5 w-5 mr-1" />
                <span className="font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {!selectedCategory ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-medium text-gray-900 mb-3">
                        Select a Category to Begin
                      </h2>
                      <p className="text-gray-500">
                        Choose one of the following categories to start answering questions
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      {Object.keys(answers).map((category) => (
                        <motion.div
                          key={category}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="cursor-pointer"
                          onClick={() => handleCategorySelect(category)}
                        >
                          <Card className="hover:shadow-md transition-shadow duration-300 h-full">
                            <CardContent className="p-6">
                              <div className="flex flex-col items-center justify-center h-32">
                                <div className="text-3xl mb-4">{getCategoryIcon(category)}</div>
                                <h3 className="text-lg font-medium capitalize mb-1">
                                  {category}
                                </h3>
                                <div className="text-sm text-gray-500">
                                  {answers[category]?.length} questions
                                </div>
                                {getCategoryCompletionPercentage(category) > 0 && (
                                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                      className="bg-green-600 h-2.5 rounded-full"
                                      style={{ width: `${getCategoryCompletionPercentage(category)}%` }}
                                    ></div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-8 text-center">
                      <Button
                        onClick={handleSubmitExam}
                        size="lg"
                        className="px-8 button-scale"
                      >
                        Submit Exam
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium capitalize">{selectedCategory} Questions</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedCategory("")}
                    className="text-gray-500"
                  >
                    Back to Categories
                  </Button>
                </div>

                <div className="space-y-6 mb-8">
                  {currentQuestions.map((question, index) => (
                    <Card key={question.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-medium">
                            Question {index + 1}
                          </h3>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {selectedCategory}
                          </span>
                        </div>

                        <p className="mb-6">{question.text}</p>

                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                answers[selectedCategory].find(a => a.id === question.id)
                                  ?.selectedAnswer === option
                                  ? "border-blue-500 bg-blue-50"
                                  : "hover:border-gray-300"
                              }`}
                              onClick={() => handleAnswerSelect(question.id, option)}
                            >
                              <div className="flex items-center">
                                <div
                                  className={`flex items-center justify-center h-6 w-6 rounded-full mr-3 text-sm ${
                                    answers[selectedCategory].find(a => a.id === question.id)
                                      ?.selectedAnswer === option
                                      ? "bg-blue-500 text-white"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optionIndex)}
                                </div>
                                <span>{option}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCategory("")}
                  >
                    Back to Categories
                  </Button>
                  <Button onClick={handleSubmitExam} className="button-scale">
                    Submit Exam
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : examCompleted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="my-12"
          >
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
                    <Check className="h-8 w-8" />
                  </div>
                  <h1 className="text-2xl font-medium text-gray-900 mb-2">
                    Exam Completed
                  </h1>
                  <p className="text-gray-500">
                    Thank you for completing the {exam?.name} exam
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-medium mb-4">Your Score Summary</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="text-3xl font-bold text-blue-600 mb-1">{totalScore}</div>
                        <div className="text-sm text-gray-500">Total Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-center mb-1 text-blue-500">
                          <span className="text-xl mr-1">💻</span>
                          <span className="text-xs font-medium">Coding</span>
                        </div>
                        <div className="text-xl font-medium">{categoryScores.coding}</div>
                      </div>
                      
                      <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-center mb-1 text-green-500">
                          <span className="text-xl mr-1">🔢</span>
                          <span className="text-xs font-medium">Math</span>
                        </div>
                        <div className="text-xl font-medium">{categoryScores.math}</div>
                      </div>
                      
                      <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-center mb-1 text-yellow-500">
                          <span className="text-xl mr-1">🧠</span>
                          <span className="text-xs font-medium">Aptitude</span>
                        </div>
                        <div className="text-xl font-medium">{categoryScores.aptitude}</div>
                      </div>
                      
                      <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-center mb-1 text-purple-500">
                          <span className="text-xl mr-1">💬</span>
                          <span className="text-xs font-medium">Communication</span>
                        </div>
                        <div className="text-xl font-medium">{categoryScores.communication}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-yellow-800 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium mb-1">Important Information</h4>
                      <p className="text-sm">
                        Your results have been submitted. Your instructor will be able to provide you with your rank card and detailed performance analysis.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button onClick={() => navigate("/")} className="px-8">
                    Return to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default ExamPage;
