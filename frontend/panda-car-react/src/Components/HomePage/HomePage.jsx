// src/Components/HomePage/HomePage.jsx
import React, { useState } from 'react';
import './HomePage.css';
import Navbar from '../Navbar/Navbar';
import PopularCars from '../PopularCars/PopularCars';

const HomePage = () => {
  const [showPopularCars, setShowPopularCars] = useState(false);

  const handleShowPopularCars = () => {
    setShowPopularCars(true);
  };

  return (
    <div>
      <Navbar />
      <div className="home-container">
        <div className="centered-content">
          <h1>Welcome to Street Movie Car Booking</h1>
          <p className="subtitle">Book a car to watch movies in comfort</p>
          
          {!showPopularCars ? (
            <div className="content-section">
              <div className="featured-cars">
                <h2>Featured Cars</h2>
                <p>Our best cars for your movie experience</p>
                <button 
                  className="show-popular-cars-btn"
                  onClick={handleShowPopularCars}
                >
                  Show Popular Cars
                </button>
              </div>
            </div>
          ) : (
            <div className="popular-cars-section">
              <PopularCars hideHeader={true} />
              <button 
                className="back-btn"
                onClick={() => setShowPopularCars(false)}
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;