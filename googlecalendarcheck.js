import React, { useState } from 'react';

const CalendarScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false); // Starting with light mode
  const [hasUpdatedCalendar, setHasUpdatedCalendar] = useState(null);
  const [showUpdateMessage, setShowUpdateMessage] = useState(false);

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
      button: 'bg-emerald-600 hover:bg-emerald-700',
      buttonSecondary: 'bg-gray-600 hover:bg-gray-700'
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
      button: 'bg-emerald-600 hover:bg-emerald-700',
      buttonSecondary: 'bg-gray-600 hover:bg-gray-700'
    }
  };

  const colors = isDarkMode ? theme.dark : theme.light;

  const handleYes = () => {
    setHasUpdatedCalendar(true);
    setShowUpdateMessage(false);
    console.log('Calendar is updated');
    // Navigate to next screen after short delay
    setTimeout(() => {
      alert('Great! Your calendar is ready.');
    }, 500);
  };

  const handleNo = () => {
    setHasUpdatedCalendar(false);
    setShowUpdateMessage(true);
  };

  const handleContinue = () => {
    if (hasUpdatedCalendar !== null) {
      alert(`Calendar status: ${hasUpdatedCalendar ? 'Updated' : 'Not updated'}`);
      // Navigate to next screen
    } else {
      alert('Please select an option');
    }
  };

  return (
    <div className={`min-h-screen ${colors.bg} transition-colors duration-300 px-6 py-8`}>
      
      {/* Header */}
      <div className="max-w-md mx-auto">
        
        {/* Page title at top */}
        <div className="text-left mb-12">
          <h3 className={`text-lg ${colors.textSecondary} mb-8`}>
            User Onboarding
          </h3>
        </div>

        {/* Main question */}
        <div className="text-center mb-16">
          <h1 className={`text-4xl md:text-5xl font-light ${colors.brandGreen} leading-tight`}>
            Is Your Google Calendar updated with locations?
          </h1>
        </div>

        {/* Yes/No buttons */}
        <div className="mb-8 space-y-4">
          <button
            onClick={handleYes}
            className={`w-full py-4 px-6 ${colors.button} text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
              hasUpdatedCalendar === true ? 'ring-4 ring-emerald-300' : ''
            }`}
          >
            Yes
          </button>

          <button
            onClick={handleNo}
            className={`w-full py-4 px-6 ${colors.buttonSecondary} text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
              hasUpdatedCalendar === false ? 'ring-4 ring-gray-300' : ''
            }`}
          >
            No
          </button>
        </div>

        {/* Conditional update message */}
        {showUpdateMessage && (
          <div className="mb-8 text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm font-medium`}>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Please Update your Calendar!
            </div>
          </div>
        )}

        {/* Continue button - only show if an option is selected */}
        {hasUpdatedCalendar !== null && (
          <button
            onClick={handleContinue}
            className={`w-full py-4 px-6 ${colors.accent} hover:${colors.accentHover} ${colors.accentText} rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 mt-8`}
          >
            Continue
          </button>
        )}
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
      </div>

      {/* Helpful tip */}
      <div className="absolute bottom-20 left-6 right-6">
        <div className="max-w-md mx-auto">
          <div className={`text-center text-sm ${colors.textSecondary}`}>
            We use your calendar locations to optimize meal planning around your schedule
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarScreen;