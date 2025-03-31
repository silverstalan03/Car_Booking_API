// src/App.jsx
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Component imports
import LoginForm from './Components/LoginForm/LoginForm';
import SignupForm from './Components/SignupForm/SignupForm';
import AdminDashboard from './Components/AdminDashboard/AdminDashboard';
import HomePage from './Components/HomePage/HomePage';
import CarsPage from './Components/CarsPage/CarsPage';
import Account from './Components/Account/Account';
import AvailableMovies from './Components/AvailableMovies/AvailableMovies';
import AvailableFoods from './Components/AvailableFoods/AvailableFoods';
import Booking from './Components/Booking/Booking';

// Auth checking function
const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

const isAdmin = () => {
  return localStorage.getItem('userRole') === 'admin';
};

// Protected route component
const ProtectedRoute = ({ children, adminRequired = false }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" />;
  }
  
  if (adminRequired && !isAdmin()) {
    return <Navigate to="/home" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        
        {/* Protected routes */}
        <Route path="/admin" element={
          <ProtectedRoute adminRequired={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        
        <Route path="/cars" element={
          <ProtectedRoute>
            <CarsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/account" element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
        
        <Route path="/movies" element={
          <ProtectedRoute>
            <AvailableMovies />
          </ProtectedRoute>
        } />
        
        <Route path="/foods" element={
          <ProtectedRoute>
            <AvailableFoods />
          </ProtectedRoute>
        } />
        
        <Route path="/booking/:carId" element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        } />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;