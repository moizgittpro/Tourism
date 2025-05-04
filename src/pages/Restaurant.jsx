import React, { useState } from 'react';
import './restaurant.css';
import { Search, MapPin, Star, Coffee, Bookmark } from 'lucide-react';

function Restaurant() {
  const [city, setCity] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  
const API_KEY = process.env.google_places_api_key; // Ensure your .env file contains REACT_APP_GOOGLE_API_KEY

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    
    setLoading(true);
    setError('');
    setSearched(true);
    
    try {
      const response = await fetch('/restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city: city }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      
      const data = await response.json();
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const renderRestaurantType = (type) => {
    switch (type) {
      case 'restaurant':
        return <span className="tag">Restaurant</span>;
      case 'food':
        return <span className="tag">Food</span>;
      case 'point_of_interest':
        return <span className="tag">Point of Interest</span>;
      case 'establishment':
        return <span className="tag">Establishment</span>;
      default:
        return <span className="tag">{type}</span>;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <Coffee size={32} />
          <h1>CityDine</h1>
        </div>
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-container">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              className="search-input"
            />
            <button type="submit" className="search-button">
              <Search size={20} />
            </button>
          </div>
        </form>
      </header>

      <main className="main">
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : restaurants.length > 0 ? (
          <div className="city-heading">
            <h2>Restaurants in {city}</h2>
            <p>{restaurants.length} places found</p>
          </div>
        ) : searched ? (
          <div className="no-results">
            <h2>No restaurants found in {city}</h2>
            <p>Try another city or check your spelling</p>
          </div>
        ) : (
          <div className="welcome-message">
            <h2>Discover Top Restaurants</h2>
            <p>Search for a city to find great dining options</p>
          </div>
        )}

        <div className="restaurants-grid">
          {restaurants.map((restaurant) => (
            <div className="restaurant-card" key={restaurant._id}>
              <div className="card-header">
                <img 
                  src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${restaurant.image}&key=${API_KEY}`}
                  alt={restaurant.name}
                  className="restaurant-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/api/placeholder/400/300";
                  }}
                />
                <button className="bookmark-button">
                  <Bookmark size={20} />
                </button>
              </div>
              <div className="card-content">
                <h3>{restaurant.name}</h3>
                <div className="rating">
                  <Star size={16} fill="#FFD700" stroke="#FFD700" />
                  <span>{restaurant.rating}</span>
                </div>
                <div className="location">
                  <MapPin size={16} />
                  <span>{restaurant.address}</span>
                </div>
                <div className="types">
                  {restaurant.types && restaurant.types.slice(0, 3).map((type, index) => (
                    <React.Fragment key={index}>
                      {renderRestaurantType(type)}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} CityDine | Find the best restaurants in your city</p>
      </footer>
    </div>
  );
}

export default Restaurant;