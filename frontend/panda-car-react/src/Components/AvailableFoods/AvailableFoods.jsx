// src/Components/AvailableFoods/AvailableFoods.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import './AvailableFoods.css';

const AvailableFoods = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [drinkItems, setDrinkItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFoodData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://do4ef5aifl.execute-api.us-east-1.amazonaws.com/Prod/food-drinks');
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Data:', data);
        
        // Check the structure of the data
        if (data.food && Array.isArray(data.food)) {
          setFoodItems(data.food);
        } else if (data.foods && Array.isArray(data.foods)) {
          setFoodItems(data.foods);
        }
        
        if (data.drinks && Array.isArray(data.drinks)) {
          setDrinkItems(data.drinks);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching food data:', err);
        setError('Failed to load food items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFoodData();
  }, []);

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="content-container">
        <h1>Available Foods & Drinks</h1>
        
        {loading && <div className="loading-message">Loading...</div>}
        
        {error && <div className="error-message">{error}</div>}
        
        {/* Foods Section */}
        {foodItems.length > 0 && (
          <div className="section">
            <h2>Foods</h2>
            <div className="items-grid">
              {foodItems.map((food, index) => (
                <div key={index} className="item-card">
                  <h3>{food.name}</h3>
                  <p>{food.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Drinks Section */}
        {drinkItems.length > 0 && (
          <div className="section">
            <h2>Drinks</h2>
            <div className="items-grid">
              {drinkItems.map((drink, index) => (
                <div key={index} className="item-card">
                  <h3>{drink.name}</h3>
                  <p>{drink.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableFoods;