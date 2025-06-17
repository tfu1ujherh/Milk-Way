import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import FarmerDashboard from './pages/farmer/FarmerDashboard'
import BuyerDashboard from './pages/buyer/BuyerDashboard'
import Profile from './pages/Profile'
import FarmDetails from './pages/FarmDetails'
import AddFarm from './pages/farmer/AddFarm'
import EditFarm from './pages/farmer/EditFarm'
import Wishlist from './pages/buyer/Wishlist'
import NotFound from './pages/NotFound'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark-transition">
          <Routes>
            {/* Public Landing Page */}
            <Route path="/landing" element={<Landing />} />
            
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes with Navbar */}
            <Route path="/*" element={
              <ProtectedRoute>
                <Navbar />
                <main className="pt-16">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    <Route path="/farmer/dashboard" element={
                      <ProtectedRoute requiredRole="farmer">
                        <FarmerDashboard />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/buyer/dashboard" element={
                      <ProtectedRoute requiredRole="buyer">
                        <BuyerDashboard />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/profile" element={<Profile />} />
                    
                    <Route path="/farm/:id" element={<FarmDetails />} />
                    
                    <Route path="/farmer/add-farm" element={
                      <ProtectedRoute requiredRole="farmer">
                        <AddFarm />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/farmer/edit-farm/:id" element={
                      <ProtectedRoute requiredRole="farmer">
                        <EditFarm />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/buyer/wishlist" element={
                      <ProtectedRoute requiredRole="buyer">
                        <Wishlist />
                      </ProtectedRoute>
                    } />
                    
                    {/* 404 Route */}
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </main>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App