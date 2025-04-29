import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Info } from 'lucide-react';

const DetailedDestination = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const photos = [
    'https://images.unsplash.com/photo-1587474260584-136574528ed5',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5',
    // Add more photos
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'History & Culture' },
    { id: 'weather', label: 'Weather' },
    { id: 'tips', label: 'Travel Tips' },
    { id: 'nearby', label: 'Nearby Attractions' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[60vh]">
        <img
          src={photos[0]}
          alt="Destination"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">Lahore Fort</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              <span>Lahore, Punjab</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              <span>Best time to visit: October to March</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Photo Gallery */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Photo Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="overflow-hidden rounded-lg"
              >
                <img
                  src={photo}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-64 object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-4 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Overview</h3>
              <p className="text-gray-600">
                The Lahore Fort is a citadel in the city of Lahore, Pakistan. The fortress is located at the northern end of walled city Lahore, and spreads over an area greater than 20 hectares.
              </p>
            </div>
          )}
          
          {activeTab === 'history' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">History & Culture</h3>
              <p className="text-gray-600">
                The Lahore Fort was built in the 11th century and was destroyed and rebuilt several times. The present structure was built during the reign of Emperor Akbar in the 16th century.
              </p>
            </div>
          )}

          {/* Add other tab contents similarly */}
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6">Location</h2>
          <div className="h-96 bg-gray-200 rounded-lg">
            {/* This would be replaced with an actual map component */}
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Map Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedDestination; 