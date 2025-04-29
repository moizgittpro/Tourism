import React from 'react';

const StepContainer = ({ children }) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center py-8">
      <div className="w-full max-w-3xl mx-auto transition-all duration-500 ease-in-out">
        {children}
      </div>
    </div>
  );
};

export default StepContainer;