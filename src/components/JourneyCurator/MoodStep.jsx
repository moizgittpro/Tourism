import React from 'react';

const MoodStep = ({ value, onChange }) => {
  const moods = [
    { id: 'adventure', emoji: '🎉', name: 'Adventure', color: 'bg-red-100' },
    { id: 'relaxation', emoji: '🌿', name: 'Relaxation', color: 'bg-green-100' },
    { id: 'sightseeing', emoji: '📸', name: 'Sightseeing', color: 'bg-blue-100' },
    { id: 'shopping', emoji: '🛍️', name: 'Shopping', color: 'bg-purple-100' },
    { id: 'historical', emoji: '📖', name: 'Historical', color: 'bg-amber-100' },
    { id: 'romantic', emoji: '💞', name: 'Romantic', color: 'bg-pink-100' },
    { id: 'nightlife', emoji: '🌃', name: 'Nightlife', color: 'bg-indigo-100' },
    { id: 'outdoor', emoji: '⛰️', name: 'Outdoor', color: 'bg-emerald-100' }
  ];

  return (
    <div className="text-center space-y-6 fade-in">
      <h2 className="text-2xl font-semibold text-gray-800">What's your vibe today?</h2>
      <p className="text-gray-600">We'll adjust recommendations based on your mood</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {moods.map((mood) => (
          <div 
            key={mood.id}
            className={`rounded-xl p-4 cursor-pointer transition-all duration-300 flex flex-col items-center ${
              value === mood.id 
                ? `${mood.color} border-2 border-blue-500 shadow-md transform scale-105` 
                : `${mood.color} hover:shadow-sm border-2 border-transparent`
            }`}
            onClick={() => onChange(mood.id)}
          >
            <span className="text-4xl mb-2">{mood.emoji}</span>
            <span className="text-sm font-medium">{mood.name}</span>
          </div>
        ))}
      </div>

      {value && (
        <div className="mt-6 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg inline-block">
          Great choice! We'll highlight {value}-focused experiences in your journey.
        </div>
      )}
    </div>
  );
};

export default MoodStep;