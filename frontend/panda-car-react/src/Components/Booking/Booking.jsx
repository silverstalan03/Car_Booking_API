// src/Components/Booking/Booking.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import './Booking.css';

const Booking = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [bookingTime, setBookingTime] = useState('5:00 PM');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [showServerErrorModal, setShowServerErrorModal] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/cars/${carId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch car details');
        }

        const data = await response.json();
        setCar(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching car details:', err);
        // Create fallback car data
        const fallbackCar = {
          id: carId,
          car_name: "Arteon",
          brand_name: "Volkswagen",
          car_type: "Medium",
          price_per_day: 15,
          capacity: 3,
          number_of_seats: 3,
          photo_url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
        };
        setCar(fallbackCar);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCar();
  }, [carId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!startDate) {
      alert('Please select a date');
      return;
    }
    
    try {
      // Format time for API
      const apiTime = bookingTime.replace(' PM', ':00').replace(' AM', ':00');
      
      const response = await fetch('http://localhost:8000/api/bookings/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          car_id: carId,
          start_date: startDate,
          end_date: startDate, // Same date for street movie car booking
          booking_time: apiTime
        }),
      });

      if (!response.ok) {
        setShowServerErrorModal(true);
        throw new Error('Failed to create booking');
      }

      const data = await response.json();
      setReceipt(data.receipt);
    } catch (err) {
      console.error('Error creating booking:', err);
      if (!showServerErrorModal) {
        setError(err.message);
      }
    }
  };

  const handleLocalBooking = () => {
    // Create a local booking without server connection
    const moviePrice = car.car_type === "Luxury" ? 20 : 
                      car.car_type === "Medium" ? 15 : 10;
                      
    const mockReceipt = {
      booking_id: Math.floor(1000 + Math.random() * 9000),
      car: car.car_name,
      category: car.car_type || "Medium",
      date: startDate,
      time: bookingTime,
      price: `€${moviePrice}`
    };
    
    // Store in local storage for history
    const existingBookings = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
    existingBookings.push(mockReceipt);
    localStorage.setItem('bookingHistory', JSON.stringify(existingBookings));
    
    setReceipt(mockReceipt);
    setShowServerErrorModal(false);
  };

  const closeServerErrorModal = () => {
    setShowServerErrorModal(false);
  };

  if (loading) return (
    <div>
      <Navbar />
      <div className="booking-container">
        <div className="loading-message">Loading car details...</div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      {showServerErrorModal && (
        <div className="server-error-modal">
          <div className="modal-content">
            <h3>localhost:5173</h3>
            <p>Server booking failed. Continue with local booking?</p>
            <div className="modal-buttons">
              <button onClick={closeServerErrorModal} className="cancel-button">Cancel</button>
              <button onClick={handleLocalBooking} className="ok-button">OK</button>
            </div>
          </div>
        </div>
      )}
      
      <div className="booking-container">
        <h1>Book Your Car</h1>
        
        {error && !showServerErrorModal && <div className="error-message">{error}</div>}
        
        {!receipt ? (
          <div className="booking-form-container">
            <div className="car-details">
              <img 
                src={car.photo_url} 
                alt={car.car_name} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80";
                }}
              />
              <h2>{car.car_name}</h2>
              <p>Category: {car.car_type || 'Medium'}</p>
              <p>Capacity: {car.capacity || car.number_of_seats} People</p>
              <p>Price: €{car.price_per_day}/day</p>
            </div>
            
            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="movie-experience-section">
                <h3>Movie Experience Details</h3>
                <p>Enjoy watching movies from the comfort of this {car.car_type || 'medium'} car. Perfect for {car.capacity || car.number_of_seats} people to experience cinema in a unique way.</p>
              </div>
              
              <h3>Book this car</h3>
              
              <div className="form-group">
                <label htmlFor="available-date">Available Date:</label>
                <input
                  type="date"
                  id="available-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="date-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="booking-time">Available Time:</label>
                <select
                  id="booking-time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  required
                  className="time-select"
                >
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="7:00 PM">7:00 PM</option>
                  <option value="9:00 PM">9:00 PM</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className="book-now-button"
                disabled={!startDate}
              >
                Book Now
              </button>
            </form>
          </div>
        ) : (
          <div className="booking-confirmation">
            <h2 className="confirmation-title">Booking Confirmed!</h2>
            <div className="receipt-wrapper">
              <table className="receipt-table">
                <thead>
                  <tr className="receipt-header">
                    <th>Receipt</th>
                    <th>Booking #{receipt.booking_id}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Car:</td>
                    <td>{receipt.car}</td>
                  </tr>
                  <tr>
                    <td>Category:</td>
                    <td>{receipt.category || "Medium"}</td>
                  </tr>
                  <tr>
                    <td>Date:</td>
                    <td>{receipt.date || receipt.start_date}</td>
                  </tr>
                  <tr>
                    <td>Time:</td>
                    <td>{receipt.time || receipt.booking_time || "5:00"}</td>
                  </tr>
                  <tr className="price-row">
                    <td>Price:</td>
                    <td>{receipt.price || `€${receipt.total_price}`}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="booking-message">
              Booking confirmation has been sent. Check your email for details!
            </p>
            <button className="book-another-button" onClick={() => navigate('/cars')}>
              Book Another Car
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Booking;