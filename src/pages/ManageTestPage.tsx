
import { useState, useEffect } from "react";
import { useExam } from "@/context/ExamContext";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminSidebar } from "@/components/AdminSidebar";
import { PlayCircle, StopCircle, Link as LinkIcon, Copy, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ManageTestPage = () => {
  const { exams, activateExam, deactivateExam, checkExamStatus } = useExam();
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examLink, setExamLink] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (selectedExamId) {
      const status = checkExamStatus(selectedExamId);
      setIsActive(status);
      
      // If the exam is active, check if we have the link
      const exam = exams.find(e => e.id === selectedExamId);
      if (exam && exam.link) {
        const baseUrl = window.location.origin;
        setExamLink(`${baseUrl}/${exam.link}`);
      } else {
        setExamLink("");
      }
    } else {
      setIsActive(false);
      setExamLink("");
    }
  }, [selectedExamId, exams]);

  const handleExamChange = (value: string) => {
    setSelectedExamId(value);
    setLinkCopied(false);
  };

  const handleStartExam = async () => {
    if (!selectedExamId) return;

    setIsStarting(true);
    try {
      const link = activateExam(selectedExamId);
      const baseUrl = window.location.origin;
      setExamLink(`${baseUrl}/${link}`);
      setIsActive(true);
      toast.success("Exam started successfully");
    } catch (error) {
      console.error("Error starting exam:", error);
      toast.error("Failed to start exam");
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopExam = async () => {
    if (!selectedExamId) return;

    setIsStopping(true);
    try {
      deactivateExam(selectedExamId);
      setIsActive(false);
      toast.success("Exam stopped successfully");
    } catch (error) {
      console.error("Error stopping exam:", error);
      toast.error("Failed to stop exam");
    } finally {
      setIsStopping(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(examLink).then(
      () => {
        setLinkCopied(true);
        toast.success("Exam link copied to clipboard");
        setTimeout(() => setLinkCopied(false), 3000);
      },
      () => {
        toast.error("Failed to copy link");
      }
    );
  };

  const getActiveExamCount = () => {
    return exams.filter(exam => exam.status === 'active').length;
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
            <h1 className="text-3xl font-medium text-gray-900 mb-2">Start/Stop Exam</h1>
            <p className="text-gray-500">
              Manage active exams and generate links for students
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="col-span-1"
            >
              <Card className={cn("p-6 h-full", isActive ? "bg-green-50 border-green-200" : "")}>
                <div className="flex items-center justify-center h-20">
                  <div className="text-center">
                    <div className="font-medium text-xl mb-1">
                      {isActive ? "Exam is Running" : "Exam is Inactive"}
                    </div>
                    <p className="text-sm text-gray-500">
                      {isActive
                        ? "Students can access the exam"
                        : "Start an exam to generate a link"}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="col-span-1"
            >
              <Card className="p-6 h-full">
                <div className="flex items-center justify-center h-20">
                  <div className="text-center">
                    <div className="font-medium text-xl mb-1">{getActiveExamCount()}</div>
                    <p className="text-sm text-gray-500">Active Exams</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="col-span-1"
            >
              <Card className="p-6 h-full">
                <div className="flex items-center justify-center h-20">
                  <div className="text-center">
                    <div className="font-medium text-xl mb-1">{exams.length}</div>
                    <p className="text-sm text-gray-500">Total Exams</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6"
          >
            <Card className="p-6">
              <div className="space-y-6">
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
                          {exam.name} ({exam.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleStartExam}
                    disabled={isStarting || !selectedExamId || isActive}
                    variant={isActive ? "outline" : "default"}
                    className={cn(
                      "flex-1 h-12 button-scale",
                      isActive && "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    {isStarting ? "Starting..." : "Start Exam"}
                  </Button>

                  <Button
                    onClick={handleStopExam}
                    disabled={isStopping || !selectedExamId || !isActive}
                    variant="destructive"
                    className={cn(
                      "flex-1 h-12 button-scale",
                      !isActive && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <StopCircle className="h-5 w-5 mr-2" />
                    {isStopping ? "Stopping..." : "Stop Exam"}
                  </Button>
                </div>

                {isActive && examLink && (
                  <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <label className="block text-sm font-medium text-blue-700">
                      Exam Link
                    </label>
                    <div className="flex">
                      <Input
                        value={examLink}
                        readOnly
                        className="rounded-r-none focus:z-10 bg-white"
                      />
                      <Button
                        onClick={handleCopyLink}
                        className={`rounded-l-none ${
                          linkCopied ? "bg-green-600" : "bg-gray-900"
                        }`}
                      >
                        {linkCopied ? (
                          <>
                            <Check className="h-4 w-4 mr-1" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" /> Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center text-sm text-blue-600 mt-2">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      <span>Share this link with students to access the exam</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Active Exams</h3>

                {exams.filter(e => e.status === 'active').length > 0 ? (
                  <div className="divide-y">
                    {exams
                      .filter(e => e.status === 'active')
                      .map((exam) => (
                        <div key={exam.id} className="py-4 flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{exam.name}</h4>
                            <p className="text-sm text-gray-500">
                              {exam.questions.length} questions • Started{" "}
                              {new Date(exam.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">
                              <Clock className="h-3 w-3 mr-1" />
                              Active
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedExamId(exam.id);
                                handleStopExam();
                              }}
                              className="button-scale"
                            >
                              Stop
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No active exams. Start an exam to see it listed here.
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

export default ManageTestPage;
