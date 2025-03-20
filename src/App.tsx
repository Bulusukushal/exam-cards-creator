
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ExamProvider } from "@/context/ExamContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CreateTestPage from "./pages/CreateTestPage";
import UpdateQuestionsPage from "./pages/UpdateQuestionsPage";
import ManageTestPage from "./pages/ManageTestPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ExamPage from "./pages/ExamPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ExamProvider>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-test"
                  element={
                    <ProtectedRoute>
                      <CreateTestPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/update-questions"
                  element={
                    <ProtectedRoute>
                      <UpdateQuestionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-test"
                  element={
                    <ProtectedRoute>
                      <ManageTestPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard"
                  element={
                    <ProtectedRoute>
                      <LeaderboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/exam/:examId" element={<ExamPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </ExamProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
