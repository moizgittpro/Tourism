import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Hero images for carousel
  const heroImages = [
    require('../images/hero-section-image.jpg'),
    require('../images/hero-section-image2.jpg'),
    require('../images/hero-section-image3.jpg'),
    require('../images/hero-section-image4.jpg'),
  ];
  const [currentHero, setCurrentHero] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 4000); // 4 seconds per image
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Regions and destinations
  const regions = [
    { name: 'Mountains', key: 'mountains' },
    { name: 'Deserts', key: 'deserts' },
    { name: 'Valleys', key: 'valleys' },
    { name: 'Cities', key: 'cities' },
    { name: 'Coastal', key: 'coastal' },
  ];
  const regionDestinations = {
    mountains: [
      { name: 'Fairy Meadows', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
      { name: 'Nanga Parbat', image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b' },
      { name: 'Rakaposhi', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429' },
      { name: 'Hunza Valley', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308' },
    ],
    deserts: [
      { name: 'Cholistan Desert', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
      { name: 'Thar Desert', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca' },
      { name: 'Derawar Fort', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3fd8' },
      { name: 'Rohtas Fort', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca' },
    ],
    valleys: [
      { name: 'Swat Valley', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
      { name: 'Neelum Valley', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9' },
      { name: 'Kaghan Valley', image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b' },
      { name: 'Kalash Valley', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308' },
    ],
    cities: [
      { name: 'Lahore', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470' },
      { name: 'Islamabad', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca' },
      { name: 'Karachi', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
      { name: 'Peshawar', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3fd8' },
    ],
    coastal: [
      { name: 'Gwadar', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
      { name: 'Ormara Beach', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9' },
      { name: 'Astola Island', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca' },
      { name: 'Kund Malir', image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b' },
    ],
  };
  const [selectedRegion, setSelectedRegion] = useState('mountains');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentHero}
              src={heroImages[currentHero]}
              alt="Hero Section"
              className="w-full h-full object-cover absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-center mb-6"
          >
            Discover the Hidden Beauty of Pakistan
          </motion.h1>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-2xl"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations, activities, or experiences..."
                className="w-full px-6 py-4 rounded-full bg-white bg-opacity-90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Search className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Explore Top Destinations by Region */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-4xl font-extrabold text-center mb-12 text-gray-800 dark:text-white">Explore Top Destinations by Region</h2>
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            {regions.map((region) => (
              <button
                key={region.key}
                onClick={() => setSelectedRegion(region.key)}
                className={`px-7 py-3 text-lg rounded-full font-semibold transition-colors border-2 ${selectedRegion === region.key ? 'bg-blue-500 text-white border-blue-500' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white border-gray-300 dark:border-gray-700'}`}
              >
                {region.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 w-full">
            {regionDestinations[selectedRegion].map((dest, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col items-center">
                <img src={dest.image} alt={dest.name} className="w-full h-56 object-cover" />
                <div className="p-6 w-full flex flex-col items-center">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{dest.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 