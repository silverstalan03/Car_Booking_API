// Components/PopularCars/PopularCars.jsx
import React, { useState, useEffect } from 'react';
import './PopularCars.css';

const PopularCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularCars = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://ozado4x5ci.execute-api.us-east-1.amazonaws.com/Dev', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch popular cars: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        // Extract the available_cars array from the response
        if (data && data.available_cars) {
          setCars(data.available_cars);
        } else {
          throw new Error('No car data found in API response');
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching popular cars:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPopularCars();
  }, []);

  return (
    <div className="popular-cars-container">
      <h1>Popular Cars</h1>
      
      {loading ? (
        <div className="loading">Loading popular cars...</div>
      ) : error ? (
        <div className="error">
          <p>Error: {error}</p>
          <p>Could not fetch popular cars. Please try again later.</p>
        </div>
      ) : (
        <div className="popular-cars-grid">
          {cars && cars.length > 0 ? (
            cars.map((car, index) => (
              <div key={index} className="car-card">
                <h3>{car.car_name}</h3>
                <div className="car-details">
                  <p className="car-type">Fuel: {car.fuel_type}</p>
                  <p className="car-seats">Seats: {car.seats}</p>
                  <p className="car-price">Price: €{car.price_per_day}</p>
                  {/* Removed car-status line */}
                </div>
              </div>
            ))
          ) : (
            <div className="no-cars-message">
              <p>No popular cars available at the moment.</p>
              <p>Please check back later.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PopularCars;