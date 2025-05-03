/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import './flight.css';
import { Search, Plane, Calendar, Clock, DollarSign, Award } from 'lucide-react';

const FlightSearchApp = () => {
  const [fromAirport, setFromAirport] = useState('');
  const [toAirport, setToAirport] = useState('');
  const [date, setDate] = useState('');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fromAirport || !toAirport || !date) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/flight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        mode: 'cors',
        body: JSON.stringify({
          user_input: {
            from_airport: fromAirport,
            to_airport: toAirport,
            date: date,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch flights');
      }

      const data = await response.json();
      setFlights(data);
    } catch (err) {
      setError('Error fetching flights. Please Enter Correct Airport Code.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Function to format currency
  const formatPrice = (price) => {
    if (price === 'Price unavailable') return price;
    return price.replace('PKR\xa0', 'PKR ');
  };

  // Group flights by airline for better organization
  const groupedFlights = flights.reduce((acc, flight) => {
    if (!acc[flight.name]) {
      acc[flight.name] = [];
    }
    // Only add unique flights (avoid duplicates)
    const isDuplicate = acc[flight.name].some(f => 
      f.departure === flight.departure && 
      f.arrival === flight.arrival && 
      f.price === flight.price
    );
    
    if (!isDuplicate) {
      acc[flight.name].push(flight);
    }
    return acc;
  }, {});

  return (
    <div className="flight-search-container">
      <div className="app-header">
        <h1>
          <Plane className="plane-icon" size={28} />
          SkySearch
        </h1>
        <p>Find the best flights for your journey</p>
      </div>

      <div className="search-card">
        <form onSubmit={handleSubmit}>
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="fromAirportCode">From Airport Code</label>
              <input 
                id="fromAirport"
                type="text"
                value={fromAirport}
                onChange={(e) => setFromAirport(e.target.value)}
                placeholder="Enter departure airport"
                className="text-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="To Airport Code">To Airpot Code</label>
              <input 
                id="toAirport"
                type="text"
                value={toAirport}
                onChange={(e) => setToAirport(e.target.value)}
                placeholder="Enter arrival airport"
                className="text-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="date-input"
              />
            </div>
            
            <button type="submit" className="search-button">
              <Search size={16} />
              Search Flights
            </button>
          </div>
        </form>
        
        {error && <div className="error-message">{error}</div>}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Finding the best flights for you...</p>
        </div>
      ) : flights.length > 0 ? (
        <div className="results-container">
          <h2>Available Flights</h2>
          
          {Object.keys(groupedFlights).map(airline => (
            <div key={airline} className="airline-group">
              <div className="airline-header">
                <h3>{airline}</h3>
              </div>
              
              <div className="flights-grid">
                {groupedFlights[airline].map((flight, index) => (
                  <div 
                    key={index} 
                    className={`flight-card ${flight.is_best ? 'best-flight' : ''}`}
                  >
                    {flight.is_best && (
                      <div className="best-badge">
                        <Award size={14} />
                        Best Value
                      </div>
                    )}
                    
                    <div className="flight-header">
                      <div className="airline-logo">
                        {/* Logo placeholder - first letter of airline name */}
                        {flight.name.charAt(0)}
                      </div>
                      <div className="airline-name">{flight.name}</div>
                    </div>
                    
                    <div className="flight-time-container">
                      <div className="departure">
                        <div className="time">{flight.departure.split(' on ')[0]}</div>
                        <div className="date">{flight.departure.split(' on ')[1]}</div>
                      </div>
                      
                      <div className="flight-line">
                        <div className="flight-duration">
                          <Clock size={14} />
                          <span>{flight.duration}</span>
                        </div>
                        <div className="line"></div>
                        <div className="stops">{flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}</div>
                      </div>
                      
                      <div className="arrival">
                        <div className="time">{flight.arrival.split(' on ')[0]}</div>
                        <div className="date">{flight.arrival.split(' on ')[1]}</div>
                      </div>
                    </div>
                    
                    <div className="flight-footer">
                      <div className="price">
                        <DollarSign size={14} />
                        <span>{formatPrice(flight.price)}</span>
                      </div>
                      <button className="book-btn">Book Now</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      
      <footer className="footer">
        <p>© 2025 SkySearch - Find your perfect flight</p>
      </footer>
    </div>
  );
};

export default FlightSearchApp;