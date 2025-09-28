import React, { useState } from 'react';
import { useOnboarding } from './datacollection';

const BudgetScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false); // Starting with light mode
  const [budget, setBudget] = useState(112); // Starting value in middle
    const { onboardingData, setOnboardingData } = useOnboarding();

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
      slider: 'bg-emerald-500',
      sliderTrack: 'bg-gray-300',
      sliderThumb: 'bg-white border-emerald-500'
    },
    dark: {
      bg: 'bg-gray-900',
      cardBg: 'bg-gray-800',
      text: 'text-white',
      textSecondary: 'text-gray-500',
      brandGreen: 'text-[#A8CC8C]',
      accent: 'bg-emerald-600',
      accentHover: 'bg-emerald-700',
      accentText: 'text-white',
      border: 'border-gray-700',
      slider: 'bg-[#A8CC8C]',
      sliderTrack: 'bg-gray-700',
      sliderThumb: 'bg-white border-[#A8CC8C]'
    }
  };

  const colors = isDarkMode ? theme.dark : theme.light;

  const handleContinue = () => {
    console.log('Selected budget:', budget);
    alert(`Budget set to: $${budget}`);
    // Navigate to next screen
    setOnboardingData({
      ...onboardingData,
      budget: budget,
      step: 'breakfast.js',
      onNext: 'breakfast.js'
    });
  };

  return (
    <div className={`min-h-screen ${colors.bg} transition-colors duration-300 px-6 py-8`}>
      
      {/* Header */}
      <div className="max-w-md mx-auto">
        
        {/* Page title at top */}
        <div className="text-left mb-16">
          <h3 className={`text-lg ${colors.textSecondary} mb-8`}>
            Budget
          </h3>
        </div>

        {/* Main question */}
        <div className="text-center mb-20">
          <h1 className={`text-4xl md:text-5xl font-light ${colors.brandGreen} leading-tight`}>
            Great! Now, how much are you willing to spend a day on food?
          </h1>
        </div>

        {/* Budget slider section */}
        <div className="mb-16">
          {/* Slider container */}
          <div className="relative mb-12">
            {/* Custom slider track */}
            <div className={`w-full h-3 ${colors.sliderTrack} rounded-full relative shadow-inner`}>
              {/* Filled portion */}
              <div 
                className={`h-3 ${colors.slider} rounded-full transition-all duration-300 shadow-sm`}
                style={{ width: `${((budget - 25) / (200 - 25)) * 100}%` }}
              ></div>
              
              {/* Slider thumb - more visible */}
              <div 
                className={`absolute top-1/2 transform -translate-y-1/2 w-8 h-8 ${colors.sliderThumb} border-4 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl`}
                style={{ left: `${((budget - 25) / (200 - 25)) * 100}%`, marginLeft: '-16px' }}
              ></div>
            </div>

            {/* Hidden range input for functionality */}
            <input
              type="range"
              min="25"
              max="200"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Budget labels */}
          <div className="flex justify-between items-center">
            {/* Min value */}
            <div className="text-left">
              <div className={`text-4xl md:text-5xl font-bold ${colors.text}`}>
                $25
              </div>
            </div>

            {/* Current value */}
            <div className="text-center">
              <div className={`text-3xl md:text-4xl font-bold ${colors.brandGreen}`}>
                ${budget}
              </div>
            </div>

            {/* Max value */}
            <div className="text-right">
              <div className={`text-4xl md:text-5xl font-bold ${colors.text}`}>
                $200
              </div>
            </div>
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          className={`w-full py-4 px-6 ${colors.accent} hover:${colors.accentHover} ${colors.accentText} rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95`}
        >
          Continue
        </button>

        {/* Skip option */}
        <button className={`w-full mt-4 py-2 text-lg ${colors.textSecondary} hover:${colors.brandGreen} transition-colors duration-200`}>
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
        <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
      </div>

      {/* Budget recommendations */}
      <div className="absolute bottom-20 left-6 right-6">
        <div className="max-w-md mx-auto">
          <div className={`text-center text-sm ${colors.textSecondary}`}>
            {budget <= 50 && "Perfect for quick bites and casual dining"}
            {budget > 50 && budget <= 100 && "Great for regular meals and occasional treats"}
            {budget > 100 && budget <= 150 && "Excellent for diverse dining and premium options"}
            {budget > 150 && "Ultimate food experience with premium restaurants"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetScreen;