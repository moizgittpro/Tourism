import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Lazy load your pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const Chat = React.lazy(() => import('./pages/Chat'));
const Flight = React.lazy(() => import('./pages/Flight'));
const Restaurant = React.lazy(() => import('./pages/Restaurant'));


function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/flights" element={<Flight />} />
          <Route path="/restaurants" element={<Restaurant />} />
          
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;