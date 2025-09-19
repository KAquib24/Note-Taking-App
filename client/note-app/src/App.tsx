// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddNote from "./pages/AddNotes";
import StylusDashboard from "./pages/StylusDashboard";
import Handwriting from "./pages/Handwriting"; // <-- Use this wrapper instead of HandwritingCanvas directly

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");

  const handleSearch = (query: string, filter: string) => {
    setSearchQuery(query);
    setSearchFilter(filter);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Navbar always visible */}
        <Navbar onSearch={handleSearch} />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard searchQuery={searchQuery} searchFilter={searchFilter} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-note"
            element={
              <ProtectedRoute>
                <AddNote />
              </ProtectedRoute>
            }
          />

          {/* Stylus Notes */}
          <Route
            path="/stylus"
            element={
              <ProtectedRoute>
                <StylusDashboard />
              </ProtectedRoute>
            }
          />

          {/* Handwriting Canvas for Add / Edit */}
          <Route
            path="/handwriting"
            element={
              <ProtectedRoute>
                <Handwriting />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
