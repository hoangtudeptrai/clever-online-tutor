
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Documents from "./pages/Documents";
import Assignments from "./pages/Assignments";
import AssignmentDetail from "./pages/AssignmentDetail";
import Students from "./pages/Students";
import Grades from "./pages/Grades";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/courses" 
              element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/courses/:courseId" 
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/my-courses" 
              element={
                <ProtectedRoute role="student">
                  <Courses />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/my-courses/:courseId" 
              element={
                <ProtectedRoute role="student">
                  <CourseDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/documents" 
              element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/assignments" 
              element={
                <ProtectedRoute>
                  <Assignments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/assignments/:assignmentId" 
              element={
                <ProtectedRoute role="teacher">
                  <AssignmentDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/students" 
              element={
                <ProtectedRoute role="teacher">
                  <Students />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/grades" 
              element={
                <ProtectedRoute role="student">
                  <Grades />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/reports" 
              element={
                <ProtectedRoute role="teacher">
                  <Reports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/notifications" 
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/profile" 
              element={
                <ProtectedRoute role="student">
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
