/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import styles from './flight.module.css';
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
    <div className={styles.flightSearchContainer}>
      <div className={styles.appHeader}>
        <h1>
          <Plane className={styles.planeIcon} size={28} />
          SkySearch
        </h1>
        <p>Find the best flights for your journey</p>
      </div>

      <div className={styles.searchCard}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <label htmlFor="fromAirportCode">From Airport Code</label>
              <input 
                id="fromAirport"
                type="text"
                value={fromAirport}
                onChange={(e) => setFromAirport(e.target.value)}
                placeholder="Enter departure airport"
                className={styles.textInput}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="To Airport Code">To Airport Code</label>
              <input 
                id="toAirport"
                type="text"
                value={toAirport}
                onChange={(e) => setToAirport(e.target.value)}
                placeholder="Enter arrival airport"
                className={styles.textInput}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={styles.dateInput}
              />
            </div>
            
            <button type="submit" className={styles.searchButton}>
              <Search size={16} />
              Search Flights
            </button>
          </div>
        </form>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Finding the best flights for you...</p>
        </div>
      ) : flights.length > 0 ? (
        <div className={styles.resultsContainer}>
          <h2>Available Flights</h2>
          
          {Object.keys(groupedFlights).map(airline => (
            <div key={airline} className={styles.airlineGroup}>
              <div className={styles.airlineHeader}>
                <h3>{airline}</h3>
              </div>
              
              <div className={styles.flightsGrid}>
                {groupedFlights[airline].map((flight, index) => (
                  <div 
                    key={index} 
                    className={`${styles.flightCard} ${flight.is_best ? styles.bestFlight : ''}`}
                  >
                    {flight.is_best && (
                      <div className={styles.bestBadge}>
                        <Award size={14} />
                        Best Value
                      </div>
                    )}
                    
                    <div className={styles.flightHeader}>
                      <div className={styles.airlineLogo}>
                        {/* Logo placeholder - first letter of airline name */}
                        {flight.name.charAt(0)}
                      </div>
                      <div className={styles.airlineName}>{flight.name}</div>
                    </div>
                    
                    <div className={styles.flightTimeContainer}>
                      <div className={styles.departure}>
                        <div className={styles.time}>{flight.departure.split(' on ')[0]}</div>
                        <div className={styles.date}>{flight.departure.split(' on ')[1]}</div>
                      </div>
                      
                      <div className={styles.flightLine}>
                        <div className={styles.flightDuration}>
                          <Clock size={14} />
                          <span>{flight.duration}</span>
                        </div>
                        <div className={styles.line}></div>
                        <div className={styles.stops}>{flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}</div>
                      </div>
                      
                      <div className={styles.arrival}>
                        <div className={styles.time}>{flight.arrival.split(' on ')[0]}</div>
                        <div className={styles.date}>{flight.arrival.split(' on ')[1]}</div>
                      </div>
                    </div>
                    
                    <div className={styles.flightFooter}>
                      <div className={styles.price}>
                        <DollarSign size={14} />
                        <span>{formatPrice(flight.price)}</span>
                      </div>
                      <button className={styles.bookBtn}>Book Now</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      
      <footer className={styles.footer}>
        <p>© 2025 SkySearch - Find your perfect flight</p>
      </footer>
    </div>
  );
};

export default FlightSearchApp;