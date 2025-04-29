import React from 'react';
import { Timer, Trees as Tree, Compass } from 'lucide-react';
import OptionCard from './OptionCard';

const RouteStyleStep = ({ value, onChange, travelerType }) => {
  const routeStyles = [
    {
      id: 'fastest',
      title: 'Fastest Route',
      description: 'Get to your destination in the shortest time possible',
      icon: <Timer size={24} className="text-blue-500" />,
      color: 'bg-blue-50 border-blue-200',
      activeColor: 'bg-blue-100 border-blue-500',
    },
    {
      id: 'scenic',
      title: 'Scenic Route',
      description: 'Enjoy beautiful landscapes and viewpoints along the way',
      icon: <Tree size={24} className="text-green-500" />,
      color: 'bg-green-50 border-green-200',
      activeColor: 'bg-green-100 border-green-500',
    },
    {
      id: 'adventurous',
      title: 'Adventurous Route',
      description: 'Discover hidden gems and unexpected experiences',
      icon: <Compass size={24} className="text-purple-500" />,
      color: 'bg-purple-50 border-purple-200',
      activeColor: 'bg-purple-100 border-purple-500',
    }
  ];
  
  // Customize recommendation based on traveler type
  let recommendation = null;
  
  if (travelerType) {
    switch(travelerType) {
      case 'foodie':
        recommendation = 'scenic';
        break;
      case 'adventure':
        recommendation = 'adventurous';
        break;
      case 'history':
        recommendation = 'scenic';
        break;
      case 'relaxing':
        recommendation = 'scenic';
        break;
      case 'photography':
        recommendation = 'scenic';
        break;
      default:
        recommendation = 'fastest';
    }
  }

  return (
    <div className="text-center space-y-6 fade-in">
      <h2 className="text-2xl font-semibold text-gray-800">Preferred route style?</h2>
      <p className="text-gray-600">Choose how you'd like to experience your journey</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {routeStyles.map((style) => (
          <OptionCard
            key={style.id}
            icon={style.icon}
            title={style.title}
            description={style.description}
            selected={value === style.id}
            color={style.color}
            activeColor={style.activeColor}
            onClick={() => onChange(style.id)}
            recommended={recommendation === style.id}
          />
        ))}
      </div>

      {travelerType && recommendation && !value && (
        <div className="mt-4 text-sm text-indigo-700 bg-indigo-50 p-3 rounded-lg inline-block">
          <span className="font-medium">Recommended:</span> Based on your travel style, we suggest the {routeStyles.find(s => s.id === recommendation)?.title.toLowerCase()}!
        </div>
      )}
    </div>
  );
};

export default RouteStyleStep;