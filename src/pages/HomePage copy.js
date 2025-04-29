import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample featured destinations
  const featuredDestinations = [
    {
      id: 1,
      name: 'Hunza Valley',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5',
      description: 'The paradise on earth with stunning mountain views'
    },
    {
      id: 2,
      name: 'Lahore Fort',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5',
      description: 'A UNESCO World Heritage Site with rich Mughal history'
    },
    {
      id: 3,
      name: 'Badshahi Mosque',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5',
      description: 'One of the largest mosques in the world'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1587474260584-136574528ed5"
            alt="Pakistan Landscape"
            className="w-full h-full object-cover"
          />
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

      {/* Featured Destinations */}
      <section className="py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Featured Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {featuredDestinations.map((destination) => (
            <motion.div
              key={destination.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg"
            >
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{destination.name}</h3>
                <p className="text-gray-600">{destination.description}</p>
                <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Explore More
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
