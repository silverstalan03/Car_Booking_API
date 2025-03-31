import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import './Account.css';

const Account = () => {
  const navigate = useNavigate();
  
  // Get email from localStorage
  const email = localStorage.getItem('userEmail') || 'Not available';

  const handleLogout = () => {
    // Clear localStorage and redirect to login
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="account-page">
      <Navbar />
      <div className="account-container">
        <h1 className="account-title">My Account</h1>
        
        <div className="account-profile">
          <div className="profile-info">
            <p><strong>Email:</strong> {email}</p>
            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
        <hr className="account-divider" />
      </div>
    </div>
  );
};

export default Account;