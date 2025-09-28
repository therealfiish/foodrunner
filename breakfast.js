import React, { useState } from 'react';

const BreakfastPlanningScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false); // Starting with light mode
  const [selectedTime, setSelectedTime] = useState({ hour: 8, minute: 0, period: 'AM' });
  const [radius, setRadius] = useState(5); // Starting at 5 miles

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
      sliderThumb: 'bg-white border-emerald-500',
      timePicker: 'bg-gray-200'
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
      sliderThumb: 'bg-white border-[#A8CC8C]',
      timePicker: 'bg-gray-700'
    }
  };

  const colors = isDarkMode ? theme.dark : theme.light;

  const handleTimeChange = (type, value) => {
    setSelectedTime(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleContinue = () => {
    const timeData = {
      time: `${selectedTime.hour}:${selectedTime.minute.toString().padStart(2, '0')} ${selectedTime.period}`,
      radius: radius
    };
    console.log('Breakfast planning data:', timeData);
    alert(`Breakfast planned for ${timeData.time} within ${radius} miles`);
    // Navigate to next screen
  };

  return (
    <div className={`min-h-screen ${colors.bg} transition-colors duration-300 px-6 py-8`}>
      
      {/* Header */}
      <div className="max-w-md mx-auto">
        
        {/* Page title at top */}
        <div className="text-left mb-12">
          <h3 className={`text-lg ${colors.textSecondary} mb-8`}>
            Breakfast
          </h3>
        </div>

        {/* Main question */}
        <div className="text-center mb-16">
          <h1 className={`text-4xl md:text-5xl font-light ${colors.brandGreen} leading-tight`}>
            Time to plan breakfast! Fill out the questions below...
          </h1>
        </div>

        {/* Time section */}
        <div className="mb-12">
          <h2 className={`text-3xl font-light ${colors.text} mb-6`}>
            time
          </h2>
          
          {/* Time picker */}
          <div className={`${colors.timePicker} rounded-2xl p-6 flex justify-center items-center space-x-4`}>
            {/* Hour */}
            <div className="text-center">
              <button
                onClick={() => handleTimeChange('hour', selectedTime.hour < 12 ? selectedTime.hour + 1 : 1)}
                className={`text-sm ${colors.textSecondary} mb-2 block mx-auto hover:${colors.brandGreen} transition-colors`}
              >
                ▲
              </button>
              <div className={`text-4xl font-bold ${colors.text} w-16 text-center`}>
                {selectedTime.hour}
              </div>
              <button
                onClick={() => handleTimeChange('hour', selectedTime.hour > 1 ? selectedTime.hour - 1 : 12)}
                className={`text-sm ${colors.textSecondary} mt-2 block mx-auto hover:${colors.brandGreen} transition-colors`}
              >
                ▼
              </button>
            </div>

            {/* Separator */}
            <div className={`text-4xl font-bold ${colors.text}`}>:</div>

            {/* Minutes */}
            <div className="text-center">
              <button
                onClick={() => handleTimeChange('minute', selectedTime.minute < 45 ? selectedTime.minute + 15 : 0)}
                className={`text-sm ${colors.textSecondary} mb-2 block mx-auto hover:${colors.brandGreen} transition-colors`}
              >
                ▲
              </button>
              <div className={`text-4xl font-bold ${colors.text} w-16 text-center`}>
                {selectedTime.minute.toString().padStart(2, '0')}
              </div>
              <button
                onClick={() => handleTimeChange('minute', selectedTime.minute > 0 ? selectedTime.minute - 15 : 45)}
                className={`text-sm ${colors.textSecondary} mt-2 block mx-auto hover:${colors.brandGreen} transition-colors`}
              >
                ▼
              </button>
            </div>

            {/* AM/PM */}
            <div className="text-center">
              <button
                onClick={() => handleTimeChange('period', selectedTime.period === 'AM' ? 'PM' : 'AM')}
                className={`text-sm ${colors.textSecondary} mb-2 block mx-auto hover:${colors.brandGreen} transition-colors`}
              >
                ▲
              </button>
              <div className={`text-4xl font-bold ${colors.text} w-16 text-center`}>
                {selectedTime.period}
              </div>
              <button
                onClick={() => handleTimeChange('period', selectedTime.period === 'AM' ? 'PM' : 'AM')}
                className={`text-sm ${colors.textSecondary} mt-2 block mx-auto hover:${colors.brandGreen} transition-colors`}
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {/* Radius section */}
        <div className="mb-16">
          <h2 className={`text-3xl font-light ${colors.text} mb-8`}>
            radius
          </h2>

          {/* Radius slider */}
          <div className="relative mb-8">
            {/* Custom slider track */}
            <div className={`w-full h-3 ${colors.sliderTrack} rounded-full relative shadow-inner`}>
              {/* Filled portion */}
              <div 
                className={`h-3 ${colors.slider} rounded-full transition-all duration-300 shadow-sm`}
                style={{ width: `${((radius - 0.5) / (20 - 0.5)) * 100}%` }}
              ></div>
              
              {/* Slider thumb */}
              <div 
                className={`absolute top-1/2 transform -translate-y-1/2 w-8 h-8 ${colors.sliderThumb} border-4 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl`}
                style={{ left: `${((radius - 0.5) / (20 - 0.5)) * 100}%`, marginLeft: '-16px' }}
              ></div>
            </div>

            {/* Hidden range input for functionality */}
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Radius labels */}
          <div className="flex justify-between items-center">
            {/* Min value */}
            <div className="text-left">
              <div className={`text-3xl md:text-4xl font-bold ${colors.text}`}>
                0.5mi
              </div>
            </div>

            {/* Current value */}
            <div className="text-center">
              <div className={`text-2xl md:text-3xl font-bold ${colors.brandGreen}`}>
                {radius}mi
              </div>
            </div>

            {/* Max value */}
            <div className="text-right">
              <div className={`text-3xl md:text-4xl font-bold ${colors.text}`}>
                20mi
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
        <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
      </div>

      {/* Helpful tip */}
      <div className="absolute bottom-20 left-6 right-6">
        <div className="max-w-md mx-auto">
          <div className={`text-center text-sm ${colors.textSecondary}`}>
            {radius <= 2 && "Perfect for nearby breakfast spots within walking distance"}
            {radius > 2 && radius <= 10 && "Great range for local breakfast favorites"}
            {radius > 10 && "Exploring breakfast options across the wider area"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakfastPlanningScreen;