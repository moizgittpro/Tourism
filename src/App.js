import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Navigation          = React.lazy(() => import('./components/Navigation'));
const HomePage            = React.lazy(() => import('./pages/HomePage'));
const DestinationExplorer = React.lazy(() => import('./pages/DestinationExplorer'));
const DetailedDestination = React.lazy(() => import('./pages/DetailedDestination'));
const About               = React.lazy(() => import('./pages/About'));
const Contact             = React.lazy(() => import('./pages/Contact'));
const Tours               = React.lazy(() => import('./pages/Tours'));
const Chat                = React.lazy(() => import('./pages/Chat'));
const FlightSearchApp     = React.lazy(() => import('./pages/Flight'));
const Restaurant          = React.lazy(() => import('./pages/Restaurant'));
const NearbySearch        = React.lazy(() => import('./pages/NearbySearch'));
const AccommodationSearch = React.lazy(() => import('./pages/AccomodationSearch'));

// Loading spinner component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Suspense fallback={<LoadingSpinner />}>
          <Navigation />
          <Routes>
            <Route path="/" element={
              <Suspense fallback={<LoadingSpinner />}>
                <HomePage />
              </Suspense>
            } />
            <Route path="/explore" element={
              <Suspense fallback={<LoadingSpinner />}>
                <DestinationExplorer />
              </Suspense>
            } />
            <Route path="/destination/:id" element={
              <Suspense fallback={<LoadingSpinner />}>
                <DetailedDestination />
              </Suspense>
            } />
            <Route path="/about" element={
              <Suspense fallback={<LoadingSpinner />}>
                <About />
              </Suspense>
            } />
            <Route path="/contact" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Contact />
              </Suspense>
            } />
            <Route path="/NearbySearch" element={
              <Suspense fallback={<LoadingSpinner />}>
                <NearbySearch />
              </Suspense>
            } />
            <Route path="/Chat" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Chat />
              </Suspense>
            } />
            <Route path="/Accomodations" element={
              <Suspense fallback={<LoadingSpinner />}>
                <AccommodationSearch />
              </Suspense>
            } />
            <Route path="/Flight" element={
              <Suspense fallback={<LoadingSpinner />}>
                <FlightSearchApp />
              </Suspense>
            } />
            <Route path="/Restaurant" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Restaurant />
              </Suspense>
            } />
            <Route path="/tours" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Tours />
              </Suspense>
            } />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;