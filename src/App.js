import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import DestinationExplorer from './pages/DestinationExplorer';
import DetailedDestination from './pages/DetailedDestination';
import About from './pages/About';
import Contact from './pages/Contact';
import Tours from './pages/Tours';
import Chat from './pages/Chat';
import FlightSearchApp from './pages/Flight';
import Restaurant from './pages/Restaurant';
import NearbySearch from './pages/NearbySearch';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<DestinationExplorer />} />
          <Route path="/destination/:id" element={<DetailedDestination />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/NearbySearch" element={<NearbySearch />} />
          <Route path="/Chat" element={<Chat />} />
          <Route path="/Flight" element={<FlightSearchApp />} />
          <Route path="/Restaurant" element={<Restaurant />} />
          <Route path="/tours" element={<Tours />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 