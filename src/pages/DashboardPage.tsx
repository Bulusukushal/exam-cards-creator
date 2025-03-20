
import { useEffect } from "react";
import { useExam } from "@/context/ExamContext";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSidebar } from "@/components/AdminSidebar";
import { LayoutDashboard, PlusCircle, Edit, PlayCircle, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  const { exams, loadExams, loading } = useExam();

  useEffect(() => {
    loadExams();
  }, []);

  const dashboardItems = [
    {
      title: "Create Test",
      description: "Create a new test with questions and answers",
      icon: <PlusCircle className="h-10 w-10 text-gray-700" />,
      path: "/create-test",
      color: "bg-blue-50",
    },
    {
      title: "Update Questions",
      description: "Modify questions in existing tests",
      icon: <Edit className="h-10 w-10 text-gray-700" />,
      path: "/update-questions",
      color: "bg-green-50",
    },
    {
      title: "Start/Stop Test",
      description: "Manage active tests and create exam links",
      icon: <PlayCircle className="h-10 w-10 text-gray-700" />,
      path: "/manage-test",
      color: "bg-yellow-50",
    },
    {
      title: "Leaderboard",
      description: "View student performance and rankings",
      icon: <Trophy className="h-10 w-10 text-gray-700" />,
      path: "/leaderboard",
      color: "bg-purple-50",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center mb-2">
              <LayoutDashboard className="h-6 w-6 mr-2 text-gray-700" />
              <h1 className="text-3xl font-medium text-gray-900">Welcome to Exam Admin</h1>
            </div>
            <p className="text-gray-500">Manage your exams, questions, and view student performance</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={item.path} className="block h-full">
                  <Card className="hover:shadow-md transition-shadow duration-300 h-full">
                    <CardHeader className={`${item.color} rounded-t-lg p-6`}>
                      <div className="flex justify-center">{item.icon}</div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardTitle className="text-center mb-2">{item.title}</CardTitle>
                      <p className="text-gray-500 text-center text-sm">{item.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Exams</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse-slow">Loading exams...</div>
                  </div>
                ) : exams.length > 0 ? (
                  <div className="divide-y">
                    {exams.slice(0, 5).map((exam) => (
                      <div key={exam.id} className="py-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{exam.name}</h3>
                          <p className="text-sm text-gray-500">
                            {exam.questions.length} questions • Created{" "}
                            {new Date(exam.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              exam.status === "active"
                                ? "bg-green-100 text-green-800"
                                : exam.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No exams found. Create your first exam to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
