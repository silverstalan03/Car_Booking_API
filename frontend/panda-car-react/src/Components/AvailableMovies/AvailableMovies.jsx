// src/Components/AvailableMovies/AvailableMovies.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import './AvailableMovies.css';

const AvailableMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://jd8ojhgd63.execute-api.us-east-1.amazonaws.com/dv');
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Movies API Data:', data);
        
        // Check the structure of the data
        if (data.movies && Array.isArray(data.movies)) {
          setMovies(data.movies);
        } else if (Array.isArray(data)) {
          setMovies(data);
        } else {
          // If data is an object with numeric keys (like {0: {...}, 1: {...}})
          const moviesArray = [];
          if (typeof data === 'object' && data !== null) {
            Object.keys(data).forEach(key => {
              if (!isNaN(Number(key)) && typeof data[key] === 'object') {
                moviesArray.push(data[key]);
              }
            });
            if (moviesArray.length > 0) {
              setMovies(moviesArray);
            }
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Helper function to format genre array or object
  const formatGenre = (genre) => {
    if (!genre) return '';
    
    if (typeof genre === 'string') return genre;
    
    if (Array.isArray(genre)) {
      return genre.join(', ');
    }
    
    // If genre is an object with numbered keys
    if (typeof genre === 'object' && genre !== null) {
      return Object.values(genre).join(', ');
    }
    
    return '';
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="content-container">
        <h1>Popular Movies</h1>
        
        {loading && <div className="loading-message">Loading movies...</div>}
        
        {error && <div className="error-message">{error}</div>}
        
        {!loading && !error && movies.length === 0 && (
          <div className="no-data-message">No movies available</div>
        )}
        
        <div className="movies-grid">
          {movies.map((movie, index) => (
            <div key={index} className="movie-card">
              <h2>{movie.name}</h2>
              <div className="movie-details">
                <p><strong>Year:</strong> {movie.year}</p>
                <p><strong>Director:</strong> {movie.director}</p>
                <p><strong>Genre:</strong> {formatGenre(movie.genre)}</p>
                {movie.plot && (
                  <div className="movie-plot">
                    <p><strong>Plot:</strong> {movie.plot}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvailableMovies;