import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";
import Leave from "./pages/Leave";

import Notices from "./pages/Notices";
import Visitors from "./pages/Visitors";
import Attendance from "./pages/Attendance";
import Services from "./pages/Services";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        Loading...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="leave" element={<Leave />} />
            <Route path="notices" element={<Notices />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="services" element={<Services />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
