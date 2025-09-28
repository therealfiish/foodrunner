import React, { useState } from 'react';
import { useOnboarding } from './DataManager';

const HomeAddressScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false); // Starting with light mode
  const [address, setAddress] = useState('');
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
      input: 'bg-white border-gray-300',
      inputFocus: 'focus:border-emerald-500 focus:ring-emerald-500'
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
      input: 'bg-gray-700 border-gray-600 text-white',
      inputFocus: 'focus:border-[#A8CC8C] focus:ring-[#A8CC8C]'
    }
  };

  const colors = isDarkMode ? theme.dark : theme.light;

  const handleContinue = () => {
    if (address.trim()) {
      console.log('Home address:', address);
      alert(`Address saved: ${address}`);
      // Navigate to next screen
    } else {
      alert('Please enter your home address');
    }
    setOnboardingData({
      ...onboardingData,
      homeAddress: address,
      step: 'calendar.js',
      onNext: 'calendar.js'
    });
  };

  return (
    <div className={`min-h-screen ${colors.bg} transition-colors duration-300 px-6 py-8`}>
      
      {/* Header */}
      <div className="max-w-md mx-auto">
        
        {/* Page title at top */}
        <div className="text-left mb-12">
          <h3 className={`text-lg ${colors.brandGreen} mb-8`}>
            Home Address
          </h3>
        </div>

        {/* Main heading */}
        <div className="text-center mb-16">
          <h1 className={`text-4xl md:text-5xl font-light ${colors.brandGreen} leading-tight mb-8`}>
            START<br />
            AND END <br /> 
            OF PATH
          </h1>
          
          <p className={`text-lg ${colors.textSecondary} leading-relaxed`}>
            All roads lead to<br />
            home 🏠!
          </p>
        </div>

        {/* Address input section */}
        <div className="mb-16">          
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your home address..."
            rows={6}
            className={`w-full p-4 ${colors.input} ${colors.inputFocus} rounded-2xl border-2 transition-colors duration-200 resize-none text-lg leading-relaxed`}
          />
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
        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
      </div>

      {/* Helpful tip */}
      <div className="absolute bottom-20 left-6 right-6">
        <div className="max-w-md mx-auto">
          <div className={`text-center text-sm ${colors.textSecondary}`}>
            We'll use this to calculate optimal routes and travel times
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeAddressScreen;