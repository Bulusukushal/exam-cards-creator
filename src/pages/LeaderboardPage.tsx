
import { useState, useEffect } from "react";
import { useExam } from "@/context/ExamContext";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ExamResult, RankData } from "@/types";
import { 
  Search, 
  Trophy, 
  Medal, 
  User, 
  BookOpen, 
  Code, 
  Calculator, 
  Brain, 
  MessageSquare,
  Download
} from "lucide-react";

const LeaderboardPage = () => {
  const { exams, getTopPerformers, getCategoryTopPerformers, getStudentResults, getStudentRank } = useExam();
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("overall");
  const [searchRollNo, setSearchRollNo] = useState("");
  const [searchResults, setSearchResults] = useState<ExamResult[]>([]);
  const [selectedStudentExam, setSelectedStudentExam] = useState("");
  const [studentRank, setStudentRank] = useState<RankData | null>(null);
  const [topPerformers, setTopPerformers] = useState<ExamResult[]>([]);
  const [activeTab, setActiveTab] = useState("leaderboard");

  useEffect(() => {
    if (selectedExamId) {
      loadTopPerformers();
    }
  }, [selectedExamId, selectedCategory]);

  const loadTopPerformers = () => {
    try {
      if (selectedCategory === "overall") {
        const performers = getTopPerformers(selectedExamId);
        setTopPerformers(performers);
      } else {
        const performers = getCategoryTopPerformers(selectedExamId, selectedCategory);
        setTopPerformers(performers);
      }
    } catch (error) {
      console.error("Error loading top performers:", error);
      toast.error("Failed to load leaderboard data");
    }
  };

  const handleExamChange = (value: string) => {
    setSelectedExamId(value);
    setSelectedCategory("overall");
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleSearch = () => {
    if (!searchRollNo.trim()) {
      toast.error("Please enter a roll number");
      return;
    }

    try {
      const results = getStudentResults(searchRollNo.trim());
      setSearchResults(results);
      setSelectedStudentExam("");
      setStudentRank(null);
      
      if (results.length === 0) {
        toast.error(`No exam results found for roll number: ${searchRollNo}`);
      }
    } catch (error) {
      console.error("Error searching student:", error);
      toast.error("Failed to search for student results");
    }
  };

  const handleStudentExamSelect = (examId: string) => {
    setSelectedStudentExam(examId);
    try {
      const rank = getStudentRank(examId, searchRollNo.trim());
      setStudentRank(rank);
    } catch (error) {
      console.error("Error getting student rank:", error);
      toast.error("Failed to load rank data");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "coding":
        return <Code className="h-4 w-4" />;
      case "math":
        return <Calculator className="h-4 w-4" />;
      case "aptitude":
        return <Brain className="h-4 w-4" />;
      case "communication":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  const getCategoryScore = (result: ExamResult, category: string) => {
    switch (category) {
      case "coding":
        return result.codingMarks;
      case "math":
        return result.mathMarks;
      case "aptitude":
        return result.aptitudeMarks;
      case "communication":
        return result.communicationMarks;
      default:
        return result.totalMarks;
    }
  };

  const exportToCSV = () => {
    if (!topPerformers.length) return;
    
    const headers = ["Rank", "Name", "Roll No", "Branch", "Year", "Section"];
    
    if (selectedCategory === "overall") {
      headers.push("Total", "Coding", "Math", "Aptitude", "Communication");
    } else {
      headers.push(selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1));
    }
    
    const csvRows = [headers.join(',')];
    
    topPerformers.forEach((performer, index) => {
      const rank = index + 1;
      const row = [
        rank,
        performer.student.name,
        performer.student.rollNo,
        performer.student.branch,
        performer.student.year,
        performer.student.section
      ];
      
      if (selectedCategory === "overall") {
        row.push(
          performer.totalMarks,
          performer.codingMarks,
          performer.mathMarks,
          performer.aptitudeMarks,
          performer.communicationMarks
        );
      } else {
        row.push(getCategoryScore(performer, selectedCategory));
      }
      
      csvRows.push(row.join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedExamId}_${selectedCategory}_leaderboard.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-medium text-gray-900 mb-2">Leaderboard</h1>
            <p className="text-gray-500">
              View top performers and search for individual student rankings
            </p>
          </motion.div>

          <Tabs defaultValue="leaderboard" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="leaderboard" className="text-sm">
                <Trophy className="h-4 w-4 mr-2" /> Leaderboard
              </TabsTrigger>
              <TabsTrigger value="student-search" className="text-sm">
                <Search className="h-4 w-4 mr-2" /> Student Search
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6"
              >
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Select Exam
                        </label>
                        <Select value={selectedExamId} onValueChange={handleExamChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an exam" />
                          </SelectTrigger>
                          <SelectContent>
                            {exams.map((exam) => (
                              <SelectItem key={exam.id} value={exam.id}>
                                {exam.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Select Category
                        </label>
                        <Select
                          value={selectedCategory}
                          onValueChange={handleCategoryChange}
                          disabled={!selectedExamId}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="overall">Overall Score</SelectItem>
                            <SelectItem value="coding">Coding</SelectItem>
                            <SelectItem value="math">Math</SelectItem>
                            <SelectItem value="aptitude">Aptitude</SelectItem>
                            <SelectItem value="communication">Communication</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {selectedExamId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium">
                          {selectedCategory === "overall"
                            ? "Top Performers"
                            : `Top Performers - ${
                                selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                              }`}
                        </h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={exportToCSV}
                          disabled={!topPerformers.length}
                        >
                          <Download className="h-4 w-4 mr-1" /> Export
                        </Button>
                      </div>

                      {topPerformers.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Rank</th>
                                <th className="text-left p-2">Student</th>
                                <th className="text-left p-2">Year</th>
                                <th className="text-left p-2">Branch</th>
                                <th className="text-left p-2">Section</th>
                                <th className="text-right p-2">
                                  {selectedCategory === "overall" ? "Total Score" : selectedCategory}
                                </th>
                                {selectedCategory === "overall" && (
                                  <>
                                    <th className="text-right p-2">Coding</th>
                                    <th className="text-right p-2">Math</th>
                                    <th className="text-right p-2">Aptitude</th>
                                    <th className="text-right p-2">Communication</th>
                                  </>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {topPerformers.map((performer, index) => (
                                <tr
                                  key={performer.id}
                                  className={`${
                                    index < 3 ? "bg-yellow-50" : index % 2 === 0 ? "bg-gray-50" : ""
                                  } hover:bg-gray-100`}
                                >
                                  <td className="p-2">
                                    <div className="flex items-center">
                                      {index < 3 ? (
                                        <span
                                          className={`flex items-center justify-center ${
                                            index === 0
                                              ? "text-yellow-600"
                                              : index === 1
                                              ? "text-gray-500"
                                              : "text-amber-700"
                                          }`}
                                        >
                                          <Medal className="h-5 w-5 mr-1" />
                                          {index + 1}
                                        </span>
                                      ) : (
                                        index + 1
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex items-center">
                                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                        <User className="h-5 w-5 text-gray-500" />
                                      </div>
                                      <div>
                                        <div className="font-medium">{performer.student.name}</div>
                                        <div className="text-xs text-gray-500">
                                          {performer.student.rollNo}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-2">{performer.student.year}</td>
                                  <td className="p-2">{performer.student.branch}</td>
                                  <td className="p-2">{performer.student.section}</td>
                                  <td className="p-2 text-right font-medium">
                                    {selectedCategory === "overall"
                                      ? performer.totalMarks
                                      : getCategoryScore(performer, selectedCategory)}
                                  </td>
                                  {selectedCategory === "overall" && (
                                    <>
                                      <td className="p-2 text-right">{performer.codingMarks}</td>
                                      <td className="p-2 text-right">{performer.mathMarks}</td>
                                      <td className="p-2 text-right">{performer.aptitudeMarks}</td>
                                      <td className="p-2 text-right">{performer.communicationMarks}</td>
                                    </>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No results available for this exam and category.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="student-search" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6"
              >
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Student Roll Number
                      </label>
                      <div className="flex">
                        <Input
                          value={searchRollNo}
                          onChange={(e) => setSearchRollNo(e.target.value)}
                          placeholder="Enter student roll number"
                          className="rounded-r-none focus:z-10"
                        />
                        <Button
                          onClick={handleSearch}
                          className="rounded-l-none"
                        >
                          <Search className="h-4 w-4 mr-1" /> Search
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mb-6"
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-medium mb-4">Exam History</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 mb-4">
                        Select an exam to view detailed performance and rankings:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {searchResults.map((result) => (
                          <div
                            key={result.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                              selectedStudentExam === result.examId
                                ? "border-blue-500 bg-blue-50"
                                : "hover:border-gray-300 hover:bg-gray-50"
                            }`}
                            onClick={() => handleStudentExamSelect(result.examId)}
                          >
                            <div className="flex items-center">
                              <BookOpen className="h-5 w-5 text-gray-500 mr-2" />
                              <div>
                                <div className="font-medium">{result.examName}</div>
                                <div className="text-xs text-gray-500">
                                  Completed on{" "}
                                  {new Date(result.completedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {studentRank && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-6">
                        <h3 className="text-lg font-medium">Student Rank Card</h3>
                        <p className="text-sm text-gray-500">
                          {searchResults.find(r => r.examId === selectedStudentExam)?.examName}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Student Information</h4>
                            {searchResults.find(r => r.examId === selectedStudentExam)?.student && (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Name:</span>
                                  <span className="font-medium">
                                    {searchResults.find(r => r.examId === selectedStudentExam)?.student.name}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Roll No:</span>
                                  <span className="font-medium">
                                    {searchResults.find(r => r.examId === selectedStudentExam)?.student.rollNo}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Year:</span>
                                  <span>
                                    {searchResults.find(r => r.examId === selectedStudentExam)?.student.year}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Branch:</span>
                                  <span>
                                    {searchResults.find(r => r.examId === selectedStudentExam)?.student.branch}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Section:</span>
                                  <span>
                                    {searchResults.find(r => r.examId === selectedStudentExam)?.student.section}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Score Summary</h4>
                            {searchResults.find(r => r.examId === selectedStudentExam) && (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Total Score:</span>
                                  <span className="font-medium">
                                    {searchResults.find(r => r.examId === selectedStudentExam)?.totalMarks}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <div className="flex items-center">
                                    <Code className="h-4 w-4 text-blue-500 mr-1" />
                                    <span className="text-gray-500">Coding:</span>
                                  </div>
                                  <span>
                                    {searchResults.find(r => r.examId === selectedStudentExam)?.codingMarks}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <div className="flex items-center">
                                    <Calculator className="h-4 w-4 text-green-500 mr-1" />
                                    <span className="text-gray-500">Math:</span>
                                  </div>
                                  <span>
                                    {searchResults.find(r => r.examId === selectedStudentExam)?.mathMarks}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <div className="flex items-center">
                                    <Brain className="h-4 w-4 text-yellow-500 mr-1" />
                                    <span className="text-gray-500">Aptitude:</span>
                                  </div>
                                  <span>
                                    {searchResults.find(r => r.examId === selectedStudentExam)?.aptitudeMarks}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <div className="flex items-center">
                                    <MessageSquare className="h-4 w-4 text-purple-500 mr-1" />
                                    <span className="text-gray-500">Communication:</span>
                                  </div>
                                  <span>
                                    {
                                      searchResults.find(r => r.examId === selectedStudentExam)
                                        ?.communicationMarks
                                    }
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="bg-blue-50 rounded-lg p-4 h-full">
                            <h4 className="text-sm font-medium text-blue-700 mb-4">Rankings</h4>
                            <div className="space-y-4">
                              <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                                <div className="text-center">
                                  <div className="text-3xl font-bold text-blue-600 mb-1">
                                    {getOrdinal(studentRank.overall)}
                                  </div>
                                  <div className="text-gray-500 text-sm">Overall Rank</div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                                  <div className="text-center">
                                    <div className="text-xl font-semibold text-blue-600 mb-1">
                                      {getOrdinal(studentRank.year)}
                                    </div>
                                    <div className="text-gray-500 text-xs">Year Rank</div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                                  <div className="text-center">
                                    <div className="text-xl font-semibold text-blue-600 mb-1">
                                      {getOrdinal(studentRank.branch)}
                                    </div>
                                    <div className="text-gray-500 text-xs">Branch Rank</div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                                  <div className="text-center">
                                    <div className="text-xl font-semibold text-blue-600 mb-1">
                                      {getOrdinal(studentRank.section)}
                                    </div>
                                    <div className="text-gray-500 text-xs">Section Rank</div>
                                  </div>
                                </div>
                              </div>

                              <h5 className="text-sm font-medium text-blue-700 mt-4 mb-2">
                                Category Rankings
                              </h5>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                                  <div className="flex items-center justify-center mb-1">
                                    <Code className="h-4 w-4 text-blue-500 mr-1" />
                                    <span className="text-xs font-medium">Coding</span>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-semibold text-blue-600">
                                      {getOrdinal(studentRank.category.coding)}
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                                  <div className="flex items-center justify-center mb-1">
                                    <Calculator className="h-4 w-4 text-green-500 mr-1" />
                                    <span className="text-xs font-medium">Math</span>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-semibold text-blue-600">
                                      {getOrdinal(studentRank.category.math)}
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                                  <div className="flex items-center justify-center mb-1">
                                    <Brain className="h-4 w-4 text-yellow-500 mr-1" />
                                    <span className="text-xs font-medium">Aptitude</span>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-semibold text-blue-600">
                                      {getOrdinal(studentRank.category.aptitude)}
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                                  <div className="flex items-center justify-center mb-1">
                                    <MessageSquare className="h-4 w-4 text-purple-500 mr-1" />
                                    <span className="text-xs font-medium">Communication</span>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-semibold text-blue-600">
                                      {getOrdinal(studentRank.category.communication)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {searchResults.length === 0 && searchRollNo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-gray-500">
                        No exam results found for roll number: {searchRollNo}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
