import React from 'react';
import { Utensils, Mountain, BookOpen, Coffee, Camera, User } from 'lucide-react';
import OptionCard from './OptionCard';

const TravelerTypeStep = ({ value, onChange }) => {
  const travelerTypes = [
    {
      id: 'foodie',
      title: 'Foodie',
      description: 'Exploring local cuisines and food experiences',
      icon: <Utensils size={24} className="text-orange-500" />,
      color: 'bg-orange-50 border-orange-200',
      activeColor: 'bg-orange-100 border-orange-500',
    },
    {
      id: 'adventure',
      title: 'Adventure Seeker',
      description: 'Thrilling activities and natural wonders',
      icon: <Mountain size={24} className="text-emerald-500" />,
      color: 'bg-emerald-50 border-emerald-200',
      activeColor: 'bg-emerald-100 border-emerald-500',
    },
    {
      id: 'history',
      title: 'History Buff',
      description: 'Historical sites, museums, and cultural landmarks',
      icon: <BookOpen size={24} className="text-blue-500" />,
      color: 'bg-blue-50 border-blue-200',
      activeColor: 'bg-blue-100 border-blue-500',
    },
    {
      id: 'relaxing',
      title: 'Relaxation Seeker',
      description: 'Peaceful getaways and rejuvenating experiences',
      icon: <Coffee size={24} className="text-purple-500" />,
      color: 'bg-purple-50 border-purple-200',
      activeColor: 'bg-purple-100 border-purple-500',
    },
    {
      id: 'photography',
      title: 'Photography Enthusiast',
      description: 'Scenic views and picture-perfect moments',
      icon: <Camera size={24} className="text-red-500" />,
      color: 'bg-red-50 border-red-200',
      activeColor: 'bg-red-100 border-red-500',
    },
    {
      id: 'custom',
      title: 'Custom',
      description: 'Create your own unique travel style',
      icon: <User size={24} className="text-gray-500" />,
      color: 'bg-gray-50 border-gray-200',
      activeColor: 'bg-gray-100 border-gray-500',
    },
  ];

  return (
    <div className="text-center space-y-6 fade-in">
      <h2 className="text-2xl font-semibold text-gray-800">What kind of traveler are you?</h2>
      <p className="text-gray-600">This helps us tailor your journey recommendations</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {travelerTypes.map((type) => (
          <OptionCard
            key={type.id}
            icon={type.icon}
            title={type.title}
            description={type.description}
            selected={value === type.id}
            color={type.color}
            activeColor={type.activeColor}
            onClick={() => onChange(type.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TravelerTypeStep;