
import { useState } from "react";
import { useExam } from "@/context/ExamContext";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminSidebar } from "@/components/AdminSidebar";
import { FileUp, Check, AlertCircle } from "lucide-react";

const CreateTestPage = () => {
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const { createNewExam } = useExam();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFileUploaded(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setDocumentText(event.target.result as string);
        setFileUploaded(true);
        toast.success("File uploaded successfully");
      }
    };
    reader.onerror = () => {
      toast.error("Error reading file");
    };
    reader.onloadend = () => {
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  const handleCreateTest = async () => {
    if (!year || !semester) {
      toast.error("Please enter year and semester");
      return;
    }

    if (!documentText) {
      toast.error("Please upload a document with questions");
      return;
    }

    setIsProcessing(true);
    try {
      const exam = createNewExam(year, semester, documentText);
      toast.success(`Test "${exam.name}" created successfully`);
      // Reset form
      setYear("");
      setSemester("");
      setDocumentText("");
      setFileUploaded(false);
    } catch (error) {
      console.error("Error creating test:", error);
      toast.error("Failed to create test. Please check your document format.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-medium text-gray-900 mb-2">Create New Test</h1>
            <p className="text-gray-500">
              Upload a document with questions and answers to create a new test
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                      Year
                    </label>
                    <Input
                      id="year"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="e.g. 2023"
                      className="input-focus"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                      Semester
                    </label>
                    <Input
                      id="semester"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      placeholder="e.g. Fall"
                      className="input-focus"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Questions Document
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                      fileUploaded ? "border-green-300 bg-green-50" : "border-gray-300 hover:border-gray-400"
                    } transition-colors duration-200`}
                  >
                    <div className="space-y-4">
                      {fileUploaded ? (
                        <div className="flex flex-col items-center">
                          <Check className="h-12 w-12 text-green-500 mb-2" />
                          <p className="text-green-600 font-medium">Document uploaded successfully</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {documentText.length} characters • ~{Math.round(documentText.length / 50)} words
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <FileUp className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-gray-600 font-medium">Drop your file here, or click to browse</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Support for .txt or .docx files with the required format
                          </p>
                        </div>
                      )}

                      <input
                        type="file"
                        id="fileUpload"
                        className="hidden"
                        accept=".txt,.docx"
                        onChange={handleFileUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("fileUpload")?.click()}
                        disabled={isUploading}
                        className="mt-4"
                      >
                        {isUploading ? "Uploading..." : fileUploaded ? "Replace File" : "Select File"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="documentText" className="block text-sm font-medium text-gray-700">
                    Document Content
                  </label>
                  <Textarea
                    id="documentText"
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    placeholder="Paste your document content here or upload a file..."
                    className="input-focus min-h-[200px]"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Document Format</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Ensure your document follows this format:
                      <br />
                      <code className="block bg-white p-2 rounded mt-2 text-xs">
                        Category: aptitude<br />
                        Question: What is the capital of France?<br />
                        A) London B) Paris C) Berlin D) Madrid<br />
                        Answer: Paris
                      </code>
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleCreateTest}
                    disabled={isProcessing || !year || !semester || !documentText}
                    className="button-scale"
                  >
                    {isProcessing ? "Creating..." : "Create Test"}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateTestPage;
