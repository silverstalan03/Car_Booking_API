// src/Components/CarsPage/CarsPage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import './CarsPage.css';

// AWS API URL
const AWS_API_URL = 'https://ozado4x5ci.execute-api.us-east-1.amazonaws.com/Dev';

const CarsPage = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState({
        luxury: [],
        medium: [],
        economy: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCar, setSelectedCar] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const [bookingHistory, setBookingHistory] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);
    const [awsEnabled, setAwsEnabled] = useState(true); // Enable AWS integration

    // Check if user is authenticated
    const checkAuth = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/myaccount/', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                setIsAuthenticated(true);
                setUserId(userData.id);
                console.log("User authenticated:", userData.email);
                return true;
            } else {
                setIsAuthenticated(false);
                setUserId(null);
                console.log("User not authenticated");
                return false;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setIsAuthenticated(false);
            setUserId(null);
            return false;
        }
    };

    // AWS Functions
    const createAWSBooking = async (bookingData) => {
        try {
            console.log("Sending booking to AWS:", bookingData);
            
            const response = await fetch(AWS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData),
            });
            
            if (!response.ok) {
                throw new Error(`AWS API responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("AWS booking response:", data);
            return data;
        } catch (error) {
            console.error('Error creating AWS booking:', error);
            throw error;
        }
    };

    // Get car image URL with guaranteed working images
    const getCarImageUrl = (car) => {
        // Hardcoded external URLs that will definitely work
        const carImages = {
            "Ferrari 488 GT": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            "Passat CC Facelift": "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            "Passat B6": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            "Mercedes Benz S-Class": "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1025&q=80",
            "BMW X5": "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            "Arteon": "https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            "Toyota Corolla": "https://images.unsplash.com/photo-1590510492745-c3d4cc710dd2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            "Honda Civic": "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
            "Ford Focus": "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80"
        };
        
        // Return from hardcoded images first, then try other sources
        if (carImages[car.car_name]) {
            return carImages[car.car_name];
        } else if (car.photo_url && car.photo_url.startsWith('/')) {
            return `http://127.0.0.1:8000${car.photo_url}`;
        } else if (car.photo_url) {
            return car.photo_url;
        } else {
            return "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80";
        }
    };

    // Fetch cars from the API or use mock data
    const fetchCars = async () => {
        setLoading(true);
        setError(null);
        try {
            // First try to get cars from the API
            const response = await fetch('http://127.0.0.1:8000/api/cars/', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Cars API response status:", response.status);

            if (response.ok) {
                const data = await response.json();
                
                // Sort and categorize cars
                const sortedCars = [...data].sort((a, b) => b.price_per_day - a.price_per_day);
                
                const categorizedCars = {
                    luxury: sortedCars.slice(0, 3),
                    medium: sortedCars.slice(3, 6),
                    economy: sortedCars.slice(6, 9)
                };
                
                setCars(categorizedCars);
            } else {
                // If API fails, use mock data
                console.log('Using mock data due to API error:', response.status);
                useMockCars();
            }
        } catch (error) {
            console.error('Error fetching cars:', error);
            useMockCars();
        }

        setLoading(false);
    };
    
    const useMockCars = () => {
        // Use mock data as fallback
        const mockCars = {
            luxury: [
                {
                    id: 1, 
                    car_name: "Ferrari 488 GT", 
                    number_of_seats: 2,
                    price_per_day: 100
                },
                {
                    id: 2, 
                    car_name: "Passat CC Facelift", 
                    number_of_seats: 5,
                    price_per_day: 80
                },
                {
                    id: 3, 
                    car_name: "Passat B6", 
                    number_of_seats: 5,
                    price_per_day: 75
                }
            ],
            medium: [
                {
                    id: 4, 
                    car_name: "Mercedes Benz S-Class", 
                    number_of_seats: 5,
                    price_per_day: 65
                },
                {
                    id: 5, 
                    car_name: "BMW X5", 
                    number_of_seats: 5,
                    price_per_day: 60
                },
                {
                    id: 6, 
                    car_name: "Arteon", 
                    number_of_seats: 5,
                    price_per_day: 55
                }
            ],
            economy: [
                {
                    id: 7, 
                    car_name: "Toyota Corolla", 
                    number_of_seats: 5,
                    price_per_day: 45
                },
                {
                    id: 8, 
                    car_name: "Honda Civic", 
                    number_of_seats: 5,
                    price_per_day: 40
                },
                {
                    id: 9, 
                    car_name: "Ford Focus", 
                    number_of_seats: 5,
                    price_per_day: 35
                }
            ]
        };
        
        setCars(mockCars);
    };

    // Fetch booking history
    const fetchBookingHistory = () => {
        // Get booking history from localStorage
        const storedBookings = localStorage.getItem('bookingHistory');
        if (storedBookings) {
            setBookingHistory(JSON.parse(storedBookings));
        }
    };

    useEffect(() => {
        // Check authentication status
        checkAuth().then(() => {
            fetchCars();
            fetchBookingHistory();
        });
    }, []);

    const handleViewDetails = (car, category) => {
        setSelectedCar({...car, category});
        // Reset booking form
        setBookingDate('');
        setBookingTime('');
        setBookingConfirmed(false);
        // Scroll to top
        window.scrollTo(0, 0);
    };

    const handleCloseDetails = () => {
        setSelectedCar(null);
        setBookingConfirmed(false);
        setReceipt(null);
        // Refresh booking history when closing details
        fetchBookingHistory();
    };

    // Separate function for client-side booking
    const createClientSideBooking = () => {
        // Generate movie price based on category
        let moviePrice;
        switch(selectedCar.category) {
            case 'luxury': 
                moviePrice = 20;
                break;
            case 'medium':
                moviePrice = 15;
                break;
            default:
                moviePrice = 10;
        }
        
        // Generate a random booking ID
        const bookingId = Math.floor(1000 + Math.random() * 9000);
        
        // Create receipt data
        const receiptData = {
            booking_id: bookingId,
            car: selectedCar.car_name,
            category: selectedCar.category,
            booking_date: bookingDate,
            booking_time: bookingTime,
            price: `€${moviePrice}`,
            created_at: new Date().toISOString(),
            user_id: userId || 'guest'
        };
        
        // Save to booking history in localStorage
        const existingBookings = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
        existingBookings.push(receiptData);
        localStorage.setItem('bookingHistory', JSON.stringify(existingBookings));
        
        // Update state
        setReceipt(receiptData);
        setBookingConfirmed(true);
    };

    const handleBookCar = async () => {
        if (!bookingDate) {
            alert('Please select a booking date');
            return;
        }

        if (!bookingTime) {
            alert('Please select a booking time');
            return;
        }
        
        try {
            // Try AWS booking first if enabled
            if (awsEnabled) {
                try {
                    // Generate numeric price without the € symbol
                    let numericPrice;
                    switch(selectedCar.category) {
                        case 'luxury': numericPrice = 20; break;
                        case 'medium': numericPrice = 15; break;
                        default: numericPrice = 10;
                    }
                    
                    const awsBookingData = {
                        car_name: selectedCar.car_name,
                        category: selectedCar.category,
                        booking_date: bookingDate,
                        booking_time: bookingTime,
                        price: numericPrice
                    };
                    
                    const awsResponse = await createAWSBooking(awsBookingData);
                    
                    if (awsResponse && awsResponse.receipt) {
                        // AWS booking successful
                        setReceipt(awsResponse.receipt);
                        
                        // Also save to local storage for history
                        const existingBookings = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
                        existingBookings.push(awsResponse.receipt);
                        localStorage.setItem('bookingHistory', JSON.stringify(existingBookings));
                        
                        setBookingConfirmed(true);
                        return;
                    }
                } catch (awsError) {
                    console.error('AWS booking error:', awsError);
                    // Continue with Django or client-side booking
                }
            }
            
            // For non-authenticated users, just use client-side booking
            if (!isAuthenticated) {
                if (window.confirm('You need to login for server-side booking. Continue with local booking?')) {
                    createClientSideBooking();
                } else {
                    navigate('/');
                }
                return;
            }
            
            // For authenticated users, try Django booking
            const djangoBookingData = {
                car_id: selectedCar.id,
                start_date: bookingDate,
                end_date: bookingDate, // Same date for a single day booking
                booking_time: bookingTime
            };
            console.log("Sending booking data to Django:", djangoBookingData);
                
            const response = await fetch('http://127.0.0.1:8000/api/bookings/create/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(djangoBookingData)
            });
            
            console.log("Django booking API response status:", response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log("Django booking success:", data);
                
                if (data.receipt) {
                    setReceipt(data.receipt);
                    // Also save to local storage for backup
                    const existingBookings = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
                    existingBookings.push(data.receipt);
                    localStorage.setItem('bookingHistory', JSON.stringify(existingBookings));
                    setBookingConfirmed(true);
                    return;
                }
            } else {
                // Handle error
                try {
                    const errorData = await response.json();
                    console.error("Django booking error:", errorData);
                    alert(`Booking failed: ${errorData.error || 'Unknown error'}`);
                } catch (e) {
                    console.error("Error parsing error response:", e);
                }
                
                if (window.confirm('Server booking failed. Continue with local booking?')) {
                    createClientSideBooking();
                }
            }
        } catch (error) {
            console.error('Error booking car:', error);
            if (window.confirm('All booking attempts failed. Continue with local booking?')) {
                createClientSideBooking();
            }
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            console.log("Cancelling booking:", bookingId);
            
            let serverCancelled = false;
            
            // Only try server cancellation if authenticated and booking ID is numeric (likely from server)
            if (isAuthenticated && !isNaN(bookingId) && bookingId < 1000) {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/bookings/cancel/${bookingId}/`, {
                        method: 'DELETE',
                        credentials: 'include',
                    });
                    
                    console.log("Cancel booking response status:", response.status);
                    
                    if (response.ok) {
                        console.log('Booking cancelled on server');
                        serverCancelled = true;
                    } else {
                        console.log('Server cancellation failed, proceeding with local cancellation');
                    }
                } catch (apiError) {
                    console.error('API cancellation error:', apiError);
                    // Continue with local cancellation even if API fails
                }
            }
            
            // Always update local storage
            const existingBookings = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
            const updatedBookings = existingBookings.filter(booking => booking.booking_id != bookingId);
            localStorage.setItem('bookingHistory', JSON.stringify(updatedBookings));
            
            // Update state
            setBookingHistory(updatedBookings);
            alert('Booking cancelled successfully');
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('An error occurred while cancelling the booking.');
        }
    };

    // Get viewing capacity based on category
    const getViewingCapacity = (category) => {
        switch(category) {
            case 'luxury': return '2 people';
            case 'medium': return '3 people';
            case 'economy': default: return '4 people';
        }
    };
    
    // Get movie price based on category
    const getMoviePrice = (category) => {
        switch(category) {
            case 'luxury': return '€20';
            case 'medium': return '€15';
            case 'economy': default: return '€10';
        }
    };

    return (
        <div className="page-wrapper">
            <Navbar />
            
            <div className="content-container">
                {selectedCar ? (
                    <div className="car-details-container">
                        {bookingConfirmed ? (
                            <div className="booking-confirmation">
                                <h2>Booking Confirmed!</h2>
                                <div className="receipt">
                                    <div className="receipt-header">
                                        <span>Receipt</span>
                                        <span>Booking #{receipt.booking_id}</span>
                                    </div>
                                    <div className="receipt-content">
                                        <div className="receipt-row">
                                            <span>Car:</span>
                                            <span>{receipt.car}</span>
                                        </div>
                                        <div className="receipt-row">
                                            <span>Category:</span>
                                            <span>{receipt.category.charAt(0).toUpperCase() + receipt.category.slice(1)}</span>
                                        </div>
                                        <div className="receipt-row">
                                            <span>Date:</span>
                                            <span>{receipt.booking_date || receipt.start_date}</span>
                                        </div>
                                        <div className="receipt-row">
                                            <span>Time:</span>
                                            <span>{receipt.booking_time}</span>
                                        </div>
                                        <div className="receipt-row price">
                                            <span>Price:</span>
                                            <span>{receipt.price || `€${receipt.total_price}`}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="notification-info">
                                    Booking confirmation has been sent. Check your email for notifications!
                                </p>
                                <button className="book-another-button" onClick={handleCloseDetails}>
                                    Book Another Car
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="car-details-image">
                                    <img 
                                        src={getCarImageUrl(selectedCar)} 
                                        alt={selectedCar.car_name} 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80";
                                        }}
                                    />
                                </div>
                                <div className="car-details-content">
                                    <h2>{selectedCar.car_name}</h2>
                                    <div className="car-details-info">
                                        <p>Price per day: {getMoviePrice(selectedCar.category)}</p>
                                        <p>Category: {selectedCar.category.charAt(0).toUpperCase() + selectedCar.category.slice(1)}</p>
                                        <p>Seats: {selectedCar.number_of_seats}</p>
                                        <p>Viewing capacity: {getViewingCapacity(selectedCar.category)}</p>
                                    </div>
                                    
                                    <div className="movie-experience">
                                        <h3>Movie Experience Details</h3>
                                        <p>Enjoy watching movies from the comfort of this {selectedCar.category} car. Perfect for {getViewingCapacity(selectedCar.category)} to experience cinema in a unique way.</p>
                                    </div>
                                    
                                    <div className="booking-section">
                                        <h3>Book this car</h3>
                                        {!isAuthenticated && (
                                            <div className="auth-warning">
                                                <p>You are not logged in. Login for server-side bookings or continue with local bookings.</p>
                                                <button 
                                                    className="login-button" 
                                                    onClick={() => navigate('/')}
                                                >
                                                    Go to Login
                                                </button>
                                            </div>
                                        )}
                                        <div className="booking-form">
                                            <div className="form-group">
                                                <label>Available Date:</label>
                                                <input
                                                    type="date"
                                                    value={bookingDate}
                                                    onChange={(e) => setBookingDate(e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            </div>
                                            
                                            <div className="form-group">
                                                <label>Available Time:</label>
                                                <select 
                                                    value={bookingTime} 
                                                    onChange={(e) => setBookingTime(e.target.value)}
                                                >
                                                    <option value="">Select time</option>
                                                    <option value="17:00">5:00 PM</option>
                                                    <option value="19:00">7:00 PM</option>
                                                    <option value="21:00">9:00 PM</option>
                                                </select>
                                            </div>
                                            
                                            <button 
                                                className="book-now-button" 
                                                onClick={handleBookCar}
                                                disabled={!bookingDate || !bookingTime}
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        
                        <button className="close-button" onClick={handleCloseDetails}>×</button>
                    </div>
                ) : (
                    <div className="cars-sections">
                        {/* Booking History Section with prominent heading */}
                        <h1 className="booking-history-heading">Booking History</h1>
                        
                        <div className="booking-history-section">
                            {bookingHistory.length > 0 ? (
                                <div className="booking-history-cards">
                                    {bookingHistory.map((booking) => (
                                        <div key={booking.booking_id} className="booking-card">
                                            <div className="booking-details">
                                                <div className="booking-info-row">
                                                    <strong>Car:</strong> {booking.car}
                                                </div>
                                                <div className="booking-info-row">
                                                    <strong>Date:</strong> {booking.booking_date || booking.start_date}
                                                </div>
                                                <div className="booking-info-row">
                                                    <strong>Time:</strong> {booking.booking_time}
                                                </div>
                                                <div className="booking-info-row">
                                                    <strong>Price:</strong> {booking.price || `€${booking.total_price}`}
                                                </div>
                                            </div>
                                            <button 
                                                className="cancel-booking-button"
                                                onClick={() => handleCancelBooking(booking.booking_id)}
                                            >
                                                Cancel Booking
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-bookings-message">No bookings found.</p>
                            )}
                        </div>

                        {loading ? (
                            <div className="loading-message">Loading cars...</div>
                        ) : error ? (
                            <div className="error-message">{error}</div>
                        ) : (
                            <>
                                {/* Luxury Cars Section */}
                                <div className="car-category-section">
                                    <h2>Luxury Cars</h2>
                                    <p className="category-description">Premium cars for 2 people - €20 per movie</p>
                                    
                                    <div className="cars-grid">
                                        {cars.luxury.map((car) => (
                                            <div key={car.id} className="car-card luxury">
                                                <h3>{car.car_name}</h3>
                                                <img 
                                                    src={getCarImageUrl(car)} 
                                                    alt={car.car_name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80";
                                                    }}
                                                />
                                                <div className="car-summary">
                                                    <p>Price: €20 per day</p>
                                                    <p>Capacity: 2 people</p>
                                                    <p>Seats: {car.number_of_seats}</p>
                                                </div>
                                                <button 
                                                    className="view-details-button" 
                                                    onClick={() => handleViewDetails(car, 'luxury')}
                                                >
                                                    View details
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Medium Cars Section */}
                                <div className="car-category-section">
                                    <h2>Medium Cars</h2>
                                    <p className="category-description">Comfortable cars for 3 people - €15 per movie</p>
                                    
                                    <div className="cars-grid">
                                        {cars.medium.map((car) => (
                                            <div key={car.id} className="car-card medium">
                                                <h3>{car.car_name}</h3>
                                                <img 
                                                    src={getCarImageUrl(car)} 
                                                    alt={car.car_name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80";
                                                    }}
                                                />
                                                <div className="car-summary">
                                                    <p>Price: €15 per day</p>
                                                    <p>Capacity: 3 people</p>
                                                    <p>Seats: {car.number_of_seats}</p>
                                               </div>
                                               <button 
                                                   className="view-details-button" 
                                                   onClick={() => handleViewDetails(car, 'medium')}
                                               >
                                                   View details
                                               </button>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                               
                               {/* Economy Cars Section */}
                               <div className="car-category-section">
                                   <h2>Economy Cars</h2>
                                   <p className="category-description">Affordable cars for 4 people - €10 per movie</p>
                                   
                                   <div className="cars-grid">
                                       {cars.economy.map((car) => (
                                           <div key={car.id} className="car-card economy">
                                               <h3>{car.car_name}</h3>
                                               <img 
                                                   src={getCarImageUrl(car)} 
                                                   alt={car.car_name}
                                                   onError={(e) => {
                                                       e.target.onerror = null;
                                                       e.target.src = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80";
                                                   }}
                                               />
                                               <div className="car-summary">
                                                   <p>Price: €10 per day</p>
                                                   <p>Capacity: 4 people</p>
                                                   <p>Seats: {car.number_of_seats}</p>
                                               </div>
                                               <button 
                                                   className="view-details-button" 
                                                   onClick={() => handleViewDetails(car, 'economy')}
                                               >
                                                   View details
                                               </button>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                           </>
                       )}
                   </div>
               )}
           </div>
       </div>
   );
};

export default CarsPage;