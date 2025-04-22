import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Register from './pages/Register';
import 'react-image-crop/dist/ReactCrop.css';


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <>
      <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route path="/gallery" element={
          <ProtectedRoute>
            <Gallery />
          </ProtectedRoute>
        } />
        
        {/* Redirect root to gallery page */}
        <Route path="/" element={<Navigate to="/gallery" replace />} />
        <Route path="/home" element={<Navigate to="/gallery" replace />} />
        
        {/* Redirect any unknown routes to gallery page */}
        <Route path="*" element={<Navigate to="/gallery" replace />} />
      </Routes>
    </Router>
    </>
  )
}

export default App