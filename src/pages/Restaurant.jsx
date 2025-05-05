import React, { useState } from 'react';
import './restaurant.css';
import { Search, MapPin, Star, Coffee, Utensils } from 'lucide-react';

// WORKS BUT API KEY IS LEAKED .. 

// FIX :: 
/*

*/
const Restaurant = () => {
  const [city, setCity] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);

  //const API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handleSearch = async () => {
    if (!city.trim()) return;
    
    setIsLoading(true);
    setIsSearched(true);
    
    try {
      const response = await fetch('http://localhost:8000/restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city }),
      });
      
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Function to get icon based on restaurant type
  const getTypeIcon = (type) => {
    if (type.toLowerCase().includes('cafe')) return <Coffee className="type-icon" />;
    return <Utensils className="type-icon" />;
  };

  return (
    <div className="restaurant-container">
      <div className="search-section">
        <h1>Discover Amazing Restaurants</h1>
        <p className="subtitle">Find the best dining experiences in your city</p>
        
        <div className="search-box">
          <input
            type="text"
            value={city}
            onChange={handleCityChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter city name..."
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            <Search size={20} />
            <span>Search</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Finding restaurants in {city}...</p>
        </div>
      )}

      {!isLoading && isSearched && restaurants.length === 0 && (
        <div className="no-results">
          <p>No restaurants found in {city}. Try another city!</p>
        </div>
      )}

      {!isLoading && restaurants.length > 0 && (
        <div className="results-container">
          <h2>Restaurants in {city}</h2>
          <p className="result-count">Found {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}</p>
          
          <div className="restaurants-grid">
            {restaurants.map((restaurant) => (
              <div key={restaurant._id} className="restaurant-card">
                <div className="card-image">
                  {restaurant.image ? (
                    <>
                    <img
                      src={`http://localhost:8000/place-photo?photo_reference=${restaurant.image}`}
                      alt={restaurant.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'http://localhost:8000/random-photo';
                      }}
                    />
                  </>
                  ) : (
                    <div className="placeholder-image">
                      <Utensils size={40} />
                    </div>
                  )}
                  <div className="rating">
                    <Star className="star-icon" size={16} />
                    <span>{restaurant.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="card-content">
                  <h3>{restaurant.name}</h3>
                  <div className="address">
                    <MapPin size={16} className="pin-icon" />
                    <p>{restaurant.address}</p>
                  </div>
                  
                  {restaurant.types && restaurant.types.length > 0 && (
                    <div className="types-container">
                      {restaurant.types.slice(0, 3).map((type, index) => (
                        <span key={index} className="type-badge">
                          {getTypeIcon(type)}
                          {type}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurant;
