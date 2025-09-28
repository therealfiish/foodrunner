import React, { useState } from 'react';

const DietaryRestrictionsScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Starting with dark mode to match your design
  const [selectedRestrictions, setSelectedRestrictions] = useState([]);

  // Color theme variables
  const theme = {
    light: {
      bg: 'bg-gray-50',
      cardBg: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      brandGreen: 'text-emerald-500',
      accent: 'bg-emerald-600',
      accentHover: 'bg-emerald-700',
      accentText: 'text-white',
      border: 'border-gray-200',
      checkbox: 'border-gray-300',
      checkboxChecked: 'bg-emerald-500 border-emerald-500',
      hoverGreen: 'hover:text-emerald-500'
    },
    dark: {
      bg: 'bg-gray-900',
      cardBg: 'bg-gray-800',
      text: 'text-white',
      textSecondary: 'text-gray-400',
      brandGreen: 'text-[#B1D39F]',
      accent: 'bg-emerald-600',
      accentHover: 'bg-emerald-700',
      accentText: 'text-white',
      border: 'border-gray-700',
      checkbox: 'border-gray-500',
      checkboxChecked: 'bg-emerald-500 border-emerald-500',
      hoverGreen: 'hover:text-[#B1D39F]'
    }
  };

  const colors = isDarkMode ? theme.dark : theme.light;

  // Dietary restrictions options
  const dietaryOptions = [
    'Gluten-free',
    'Dairy-free',
    'Nut-free',
    'Egg-free',
    'Soy-free',
    'Vegetarian',
    'Vegan',
    'Halal',
    'Kosher'
  ];

  // Handle checkbox toggle
  const toggleRestriction = (restriction) => {
    setSelectedRestrictions(prev => 
      prev.includes(restriction)
        ? prev.filter(item => item !== restriction)
        : [...prev, restriction]
    );
  };

  const handleContinue = () => {
    console.log('Selected restrictions:', selectedRestrictions);
    alert(`Selected: ${selectedRestrictions.join(', ') || 'None'}`);
    // Navigate to next screen
  };

  return (
    <div className={`min-h-screen ${colors.bg} transition-colors duration-300 px-6 py-8`}>
      
      {/* Header */}
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12">
          {/* App title */}
          <h1 className={`text-2xl font-medium ${colors.brandGreen} mb-8`}>
            Food Runner
          </h1>

          {/* Page title */}
          <h2 className={`text-4xl md:text-5xl font-light ${colors.brandGreen} leading-tight mb-4`}>
            Dietary<br />
            Restrictions
          </h2>
        </div>

        {/* Checkbox list */}
        <div className="space-y-6 mb-12">
          {dietaryOptions.map((restriction) => {
            const isSelected = selectedRestrictions.includes(restriction);
            
            return (
              <div
                key={restriction}
                onClick={() => toggleRestriction(restriction)}
                className="flex items-center space-x-4 cursor-pointer group"
              >
                {/* Custom checkbox */}
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                  isSelected 
                    ? colors.checkboxChecked 
                    : `${colors.checkbox} group-hover:border-emerald-400`
                }`}>
                  {isSelected && (
                    <svg 
                      className="w-4 h-4 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={3} 
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                {/* Restriction label */}
                <label className={`text-xl ${colors.text} cursor-pointer ${colors.hoverGreen} transition-colors duration-200`}>
                  {restriction}
                </label>
              </div>
            );
          })}
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          className={`w-full py-4 px-6 ${colors.accent} hover:${colors.accentHover} ${colors.accentText} rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95`}
        >
          Continue
        </button>

        {/* Skip option */}
        <button className={`w-full mt-4 py-2 text-lg ${colors.textSecondary} ${colors.hoverGreen} transition-colors duration-200`}>
          Skip for now
        </button>
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-6 right-6 p-3 rounded-full ${colors.cardBg} ${colors.border} border shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110`}
      >
        {isDarkMode ? (
          <span className="text-xl">☀️</span>
        ) : (
          <span className="text-xl">🌙</span>
        )}
      </button>

      {/* Progress indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
      </div>

      {/* Selected count indicator */}
      {selectedRestrictions.length > 0 && (
        <div className="absolute top-20 left-6">
          <div className={`px-3 py-1 rounded-full ${colors.accent} ${colors.accentText} text-sm font-medium`}>
            {selectedRestrictions.length} selected
          </div>
        </div>
      )}
    </div>
  );
};

export default DietaryRestrictionsScreen;