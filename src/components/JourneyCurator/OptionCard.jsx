import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const OptionCard = ({ 
  icon, 
  title, 
  description, 
  selected, 
  color = 'bg-blue-50 border-blue-200',
  activeColor = 'bg-blue-100 border-blue-500',
  onClick,
  recommended = false
}) => {
  return (
    <div 
      className={`relative rounded-xl p-5 border-2 transition-all duration-300 cursor-pointer hover:shadow-md ${selected ? activeColor : color}`}
      onClick={onClick}
    >
      {selected && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={20} className="text-blue-500" />
        </div>
      )}

      {recommended && !selected && (
        <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
          Recommended
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        <div className="mb-3">
          {icon}
        </div>
        <h3 className="font-medium text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default OptionCard;