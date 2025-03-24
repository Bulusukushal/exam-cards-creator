
import { useState } from "react";
import { useExam } from "@/context/ExamContext";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminSidebar } from "@/components/AdminSidebar";
import { FileUp, Check, AlertCircle, Code, Book, BrainCircuit, MessageSquare } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Question } from "@/types";

interface CategoryUploadProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  isUploading: boolean;
  fileUploaded: boolean;
}

const CategoryUpload = ({
  icon,
  title,
  description,
  value,
  onChange,
  isUploading,
  fileUploaded,
}: CategoryUploadProps) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange(event.target.result as string);
        toast.success(`${title} document uploaded successfully`);
      }
    };
    reader.onerror = () => {
      toast.error(`Error reading ${title} file`);
    };
    reader.readAsText(file);
  };

  const fileInputId = `fileUpload-${title.toLowerCase()}`;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      
      <p className="text-sm text-gray-500">{description}</p>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          fileUploaded ? "border-green-300 bg-green-50" : "border-gray-300 hover:border-gray-400"
        } transition-colors duration-200`}
      >
        <div className="space-y-3">
          {value ? (
            <div className="flex flex-col items-center">
              <Check className="h-10 w-10 text-green-500 mb-2" />
              <p className="text-green-600 font-medium">Document uploaded successfully</p>
              <p className="text-sm text-gray-500 mt-1">
                {value.length} characters • ~{Math.round(value.length / 50)} words
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FileUp className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium">Drop your file here, or click to browse</p>
              <p className="text-sm text-gray-500 mt-1">
                Support for .txt or .docx files with the required format
              </p>
            </div>
          )}

          <input
            type="file"
            id={fileInputId}
            className="hidden"
            accept=".txt,.docx"
            onChange={handleFileUpload}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById(fileInputId)?.click()}
            disabled={isUploading}
            className="mt-3"
          >
            {isUploading ? "Uploading..." : value ? "Replace File" : "Select File"}
          </Button>
        </div>
      </div>
      
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Paste your ${title.toLowerCase()} document content here or upload a file...`}
        className="min-h-[150px]"
      />
    </div>
  );
};

const CreateTestPage = () => {
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { createNewExam } = useExam();
  
  // Separate state for each category document
  const [codingDocument, setCodingDocument] = useState("");
  const [mathDocument, setMathDocument] = useState("");
  const [aptitudeDocument, setAptitudeDocument] = useState("");
  const [communicationDocument, setCommunicationDocument] = useState("");

  const handleCreateTest = async () => {
    if (!year || !semester) {
      toast.error("Please enter year and semester");
      return;
    }

    if (!codingDocument && !mathDocument && !aptitudeDocument && !communicationDocument) {
      toast.error("Please upload at least one document with questions");
      return;
    }

    setIsProcessing(true);
    try {
      const exam = createNewExam(year, semester, {
        coding: codingDocument,
        math: mathDocument,
        aptitude: aptitudeDocument,
        communication: communicationDocument,
      });
      toast.success(`Test "${exam.name}" created successfully`);
      // Reset form
      setYear("");
      setSemester("");
      setCodingDocument("");
      setMathDocument("");
      setAptitudeDocument("");
      setCommunicationDocument("");
    } catch (error) {
      console.error("Error creating test:", error);
      toast.error("Failed to create test. Please check your document format.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if any document has been uploaded
  const hasDocuments = codingDocument || mathDocument || aptitudeDocument || communicationDocument;
  // Check if all fields have been filled for any document
  const isCodingUploaded = !!codingDocument;
  const isMathUploaded = !!mathDocument;
  const isAptitudeUploaded = !!aptitudeDocument;
  const isCommunicationUploaded = !!communicationDocument;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-medium text-gray-900 mb-2">Create New Test</h1>
            <p className="text-gray-500">
              Upload separate documents for each category to create a comprehensive test
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6 mb-6">
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
              </div>
            </Card>

            <Card className="p-6">
              <Tabs defaultValue="coding" className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="coding" className="flex items-center gap-2">
                    <Code size={16} />
                    <span>Coding</span>
                    {isCodingUploaded && <Check size={12} className="text-green-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="math" className="flex items-center gap-2">
                    <Book size={16} />
                    <span>Math</span>
                    {isMathUploaded && <Check size={12} className="text-green-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="aptitude" className="flex items-center gap-2">
                    <BrainCircuit size={16} />
                    <span>Aptitude</span>
                    {isAptitudeUploaded && <Check size={12} className="text-green-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="communication" className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span>Communication</span>
                    {isCommunicationUploaded && <Check size={12} className="text-green-500" />}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="coding">
                  <CategoryUpload
                    icon={<Code className="h-6 w-6 text-blue-500" />}
                    title="Coding"
                    description="Upload questions related to programming, algorithms, and software development."
                    value={codingDocument}
                    onChange={setCodingDocument}
                    isUploading={isUploading}
                    fileUploaded={isCodingUploaded}
                  />
                </TabsContent>

                <TabsContent value="math">
                  <CategoryUpload
                    icon={<Book className="h-6 w-6 text-purple-500" />}
                    title="Math"
                    description="Upload questions related to mathematics, calculations, and problem-solving."
                    value={mathDocument}
                    onChange={setMathDocument}
                    isUploading={isUploading}
                    fileUploaded={isMathUploaded}
                  />
                </TabsContent>

                <TabsContent value="aptitude">
                  <CategoryUpload
                    icon={<BrainCircuit className="h-6 w-6 text-amber-500" />}
                    title="Aptitude"
                    description="Upload questions related to logical reasoning, aptitude, and analytical skills."
                    value={aptitudeDocument}
                    onChange={setAptitudeDocument}
                    isUploading={isUploading}
                    fileUploaded={isAptitudeUploaded}
                  />
                </TabsContent>

                <TabsContent value="communication">
                  <CategoryUpload
                    icon={<MessageSquare className="h-6 w-6 text-green-500" />}
                    title="Communication"
                    description="Upload questions related to language, expression, and communication skills."
                    value={communicationDocument}
                    onChange={setCommunicationDocument}
                    isUploading={isUploading}
                    fileUploaded={isCommunicationUploaded}
                  />
                </TabsContent>
              </Tabs>

              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start mt-8">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Document Format</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Ensure your document follows this format:
                    <br />
                    <code className="block bg-white p-2 rounded mt-2 text-xs">
                      Question: What is the capital of France?<br />
                      A) London B) Paris C) Berlin D) Madrid<br />
                      Answer: Paris
                    </code>
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleCreateTest}
                  disabled={isProcessing || !year || !semester || !hasDocuments}
                  className="button-scale"
                >
                  {isProcessing ? "Creating..." : "Create Test"}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateTestPage;
