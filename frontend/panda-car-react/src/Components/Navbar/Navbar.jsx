// src/Components/Navbar/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { FaHome, FaCar, FaUser, FaFilm, FaUtensils } from 'react-icons/fa';

const Navbar = () => {
  return (
    <header className="navbar-container">
      <div className="navbar-brand">
        <Link to="/home">Street Movie Car Booking</Link>
      </div>
      <nav className="navbar-links">
        <Link to="/home">
          <FaHome className="nav-icon" />
          <span>Home</span>
        </Link>
        <Link to="/cars">
          <FaCar className="nav-icon" />
          <span>Cars</span>
        </Link>
        <Link to="/movies">
          <FaFilm className="nav-icon" />
          <span>Available Movies</span>
        </Link>
        <Link to="/foods">
          <FaUtensils className="nav-icon" />
          <span>Available Foods</span>
        </Link>
        <Link to="/account">
          <FaUser className="nav-icon" />
          <span>Account</span>
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;