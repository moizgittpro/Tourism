import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import DestinationExplorer from './DestinationExplorer';
import DetailedDestination from './DetailedDestination';
import ItineraryPlanner from './ItineraryPlanner';
import HotelsRestaurants from './HotelsRestaurants';
import Blog from './Blog';
import UserAccount from './UserAccount';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<DestinationExplorer />} />
          <Route path="/destination/:id" element={<DetailedDestination />} />
          <Route path="/planner" element={<ItineraryPlanner />} />
          <Route path="/hotels-restaurants" element={<HotelsRestaurants />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/account" element={<UserAccount />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 