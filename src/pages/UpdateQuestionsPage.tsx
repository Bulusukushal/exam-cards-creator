
import { useState, useEffect } from "react";
import { useExam } from "@/context/ExamContext";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Question } from "@/types";
import { Pencil, Save, Plus, Trash2 } from "lucide-react";

const UpdateQuestionsPage = () => {
  const { exams, getExam, updateExamQuestions } = useExam();
  const [selectedExamId, setSelectedExamId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedExamId) {
      const exam = getExam(selectedExamId);
      if (exam) {
        setQuestions(exam.questions);
        setIsEditing({});
      }
    } else {
      setQuestions([]);
    }
  }, [selectedExamId]);

  const handleExamChange = (value: string) => {
    setSelectedExamId(value);
  };

  const toggleEditQuestion = (questionId: string) => {
    setIsEditing((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleQuestionChange = (questionId: string, field: keyof Question, value: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              [field]: field === "options" ? value.split("\n") : value,
            }
          : q
      )
    );
  };

  const handleCategoryChange = (questionId: string, category: Question["category"]) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, category } : q))
    );
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      category: "coding",
      text: "",
      options: ["", "", "", ""],
      answer: "",
    };
    setQuestions((prev) => [...prev, newQuestion]);
    setIsEditing((prev) => ({ ...prev, [newQuestion.id]: true }));
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const handleSaveQuestions = async () => {
    if (!selectedExamId) return;

    setIsSaving(true);
    try {
      const updated = updateExamQuestions(selectedExamId, questions);
      if (updated) {
        toast.success("Questions updated successfully");
        setIsEditing({});
      } else {
        toast.error("Failed to update questions");
      }
    } catch (error) {
      console.error("Error updating questions:", error);
      toast.error("An error occurred while updating questions");
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "coding":
        return "bg-blue-100 text-blue-800";
      case "math":
        return "bg-green-100 text-green-800";
      case "aptitude":
        return "bg-yellow-100 text-yellow-800";
      case "communication":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-medium text-gray-900 mb-2">Update Questions</h1>
            <p className="text-gray-500">
              Select an exam and modify its questions and answers
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <Card className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="examSelect" className="block text-sm font-medium text-gray-700">
                    Select Exam
                  </label>
                  <Select value={selectedExamId} onValueChange={handleExamChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.name} ({exam.questions.length} questions)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </motion.div>

          {selectedExamId && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-800">
                  Questions ({questions.length})
                </h2>
                <div className="space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddQuestion}
                    className="button-scale"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Question
                  </Button>
                  <Button
                    onClick={handleSaveQuestions}
                    disabled={isSaving}
                    size="sm"
                    className="button-scale"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {isSaving ? "Saving..." : "Save All Changes"}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((question) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4"
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(
                                question.category
                              )}`}
                            >
                              {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
                            </span>
                            <span className="text-gray-500 text-sm">{`Question ID: ${question.id.slice(
                              0,
                              8
                            )}...`}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleEditQuestion(question.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {isEditing[question.id] ? "Cancel" : <Pencil className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {isEditing[question.id] ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Category
                              </label>
                              <Select
                                value={question.category}
                                onValueChange={(value) =>
                                  handleCategoryChange(question.id, value as Question["category"])
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="coding">Coding</SelectItem>
                                  <SelectItem value="math">Math</SelectItem>
                                  <SelectItem value="aptitude">Aptitude</SelectItem>
                                  <SelectItem value="communication">Communication</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Question Text
                              </label>
                              <Textarea
                                value={question.text}
                                onChange={(e) =>
                                  handleQuestionChange(question.id, "text", e.target.value)
                                }
                                className="input-focus"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Options (one per line)
                              </label>
                              <Textarea
                                value={question.options.join("\n")}
                                onChange={(e) =>
                                  handleQuestionChange(question.id, "options", e.target.value)
                                }
                                className="input-focus"
                                placeholder="Enter each option on a new line"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Correct Answer
                              </label>
                              <Input
                                value={question.answer}
                                onChange={(e) =>
                                  handleQuestionChange(question.id, "answer", e.target.value)
                                }
                                className="input-focus"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h3 className="font-medium mb-2">{question.text}</h3>
                            <div className="space-y-2 mb-4">
                              {question.options.map((option, index) => (
                                <div
                                  key={index}
                                  className={`p-2 rounded ${
                                    option === question.answer
                                      ? "bg-green-50 border border-green-200"
                                      : "bg-gray-50"
                                  }`}
                                >
                                  <span className="font-medium mr-2">{String.fromCharCode(65 + index)})</span>
                                  {option}
                                  {option === question.answer && (
                                    <span className="ml-2 text-green-600 text-sm font-medium">
                                      (Correct)
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {questions.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">No questions available for this exam.</p>
                    <Button
                      variant="outline"
                      onClick={handleAddQuestion}
                      className="mt-4 button-scale"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add First Question
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateQuestionsPage;
