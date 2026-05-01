// src/App.js
// This is the root of the app. It sets up:
//   - AuthProvider: makes login state available everywhere
//   - React Router: maps URLs to pages
//   - ProtectedRoute: redirects to /login if not logged in

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";
import UsersPage from "./pages/UsersPage";
import "./index.css";

// Wraps any page that requires login.
// If the user has no token, send them to /login instead.
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

// Layout wrapper for authenticated pages (sidebar + content)
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes — require login */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><DashboardPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <AppLayout><ProjectsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
              <AppLayout><TasksPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <AppLayout><UsersPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Default: redirect / to /dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
