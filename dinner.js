import React, { useState } from 'react';

const DinnerPlanningScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false); // Starting with light mode
  const [selectedTime, setSelectedTime] = useState({ hour: 7, minute: 0, period: 'PM' });
  const [radius, setRadius] = useState(5); // Starting at 5 miles
  const [importFromBefore, setImportFromBefore] = useState(true);

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
      timePicker: 'bg-gray-200',
      toggle: 'bg-emerald-500',
      toggleOff: 'bg-gray-300'
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
      timePicker: 'bg-gray-700',
      toggle: 'bg-[#A8CC8C]',
      toggleOff: 'bg-gray-600'
    }
  };

  const colors = isDarkMode ? theme.dark : theme.light;

  const handleTimeChange = (type, value) => {
    setSelectedTime(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const toggleImport = () => {
    setImportFromBefore(!importFromBefore);
  };

  const handleContinue = () => {
    const timeData = {
      time: `${selectedTime.hour}:${selectedTime.minute.toString().padStart(2, '0')} ${selectedTime.period}`,
      radius: radius,
      importFromBefore: importFromBefore
    };
    console.log('Dinner planning data:', timeData);
    alert(`Dinner planned for ${timeData.time} within ${radius} miles. Import settings: ${importFromBefore ? 'Yes' : 'No'}`);
    // Navigate to next screen
  };

  return (
    <div className={`min-h-screen ${colors.bg} transition-colors duration-300 px-6 py-8`}>
      
      {/* Header */}
      <div className="max-w-md mx-auto">
        
        {/* Page title at top */}
        <div className="text-left mb-12">
          <h3 className={`text-lg ${colors.textSecondary} mb-8`}>
            Dinner
          </h3>
        </div>

        {/* Main question */}
        <div className="text-center mb-16">
          <h1 className={`text-4xl md:text-5xl font-light ${colors.brandGreen} leading-tight`}>
            Finally, dinner!
          </h1>
        </div>

        {/* Time section */}
        <div className="mb-8">
          <h2 className={`text-3xl font-light ${colors.text} mb-6`}>
            time
          </h2>
          
          {/* Time picker - True iOS style scroll wheel */}
          <div className={`${colors.timePicker} rounded-2xl p-6 flex justify-center items-center space-x-4`}>
            {/* Hour picker */}
            <div className="flex flex-col items-center">
              <div className="h-40 w-20 overflow-hidden relative">
                {/* Selection highlight */}
                <div className="absolute top-1/2 left-0 right-0 h-10 -mt-5 border-t border-b border-gray-400 border-opacity-30 pointer-events-none z-10"></div>
                
                {/* Scrollable hours */}
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-start pt-16 cursor-grab active:cursor-grabbing"
                  style={{
                    transform: `translateY(${(12 - selectedTime.hour) * -40}px)`,
                    transition: 'transform 0.3s ease-out'
                  }}
                  onWheel={(e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? 1 : -1;
                    const newHour = selectedTime.hour + delta;
                    if (newHour >= 1 && newHour <= 12) {
                      handleTimeChange('hour', newHour);
                    } else if (newHour < 1) {
                      handleTimeChange('hour', 12);
                    } else if (newHour > 12) {
                      handleTimeChange('hour', 1);
                    }
                  }}
                >
                  {/* Generate hours 1-12 multiple times for continuous scroll */}
                  {Array.from({length: 36}, (_, i) => {
                    const hour = (i % 12) + 1;
                    const isSelected = hour === selectedTime.hour && Math.floor(i/12) === 1;
                    return (
                      <div
                        key={i}
                        className={`h-10 flex items-center justify-center text-2xl font-bold w-full ${
                          isSelected ? colors.text : colors.textSecondary
                        } ${isSelected ? 'opacity-100' : 'opacity-50'}`}
                        onClick={() => handleTimeChange('hour', hour)}
                      >
                        {hour}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className={`text-3xl font-bold ${colors.text} px-2`}>:</div>

            {/* Minutes picker */}
            <div className="flex flex-col items-center">
              <div className="h-40 w-20 overflow-hidden relative">
                {/* Selection highlight */}
                <div className="absolute top-1/2 left-0 right-0 h-10 -mt-5 border-t border-b border-gray-400 border-opacity-30 pointer-events-none z-10"></div>
                
                {/* Scrollable minutes */}
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-start pt-16 cursor-grab active:cursor-grabbing"
                  style={{
                    transform: `translateY(${(3 - selectedTime.minute/15) * -40}px)`,
                    transition: 'transform 0.3s ease-out'
                  }}
                  onWheel={(e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? 15 : -15;
                    const newMinute = selectedTime.minute + delta;
                    if (newMinute >= 0 && newMinute <= 45) {
                      handleTimeChange('minute', newMinute);
                    } else if (newMinute < 0) {
                      handleTimeChange('minute', 45);
                    } else if (newMinute > 45) {
                      handleTimeChange('minute', 0);
                    }
                  }}
                >
                  {/* Generate minutes 0,15,30,45 multiple times for continuous scroll */}
                  {Array.from({length: 12}, (_, i) => {
                    const minute = (i % 4) * 15;
                    const isSelected = minute === selectedTime.minute && Math.floor(i/4) === 1;
                    return (
                      <div
                        key={i}
                        className={`h-10 flex items-center justify-center text-2xl font-bold w-full ${
                          isSelected ? colors.text : colors.textSecondary
                        } ${isSelected ? 'opacity-100' : 'opacity-50'}`}
                        onClick={() => handleTimeChange('minute', minute)}
                      >
                        {minute.toString().padStart(2, '0')}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AM/PM picker */}
            <div className="flex flex-col items-center">
              <div className="h-40 w-20 overflow-hidden relative">
                {/* Selection highlight */}
                <div className="absolute top-1/2 left-0 right-0 h-10 -mt-5 border-t border-b border-gray-400 border-opacity-30 pointer-events-none z-10"></div>
                
                {/* Scrollable AM/PM */}
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-start pt-16 cursor-grab active:cursor-grabbing"
                  style={{
                    transform: `translateY(${selectedTime.period === 'AM' ? 0 : -40}px)`,
                    transition: 'transform 0.3s ease-out'
                  }}
                  onWheel={(e) => {
                    e.preventDefault();
                    handleTimeChange('period', selectedTime.period === 'AM' ? 'PM' : 'AM');
                  }}
                >
                  {/* AM/PM options */}
                  {['AM', 'PM', 'AM', 'PM'].map((period, i) => {
                    const isSelected = period === selectedTime.period && (i === 0 || i === 1);
                    return (
                      <div
                        key={i}
                        className={`h-10 flex items-center justify-center text-2xl font-bold w-full ${
                          isSelected ? colors.text : colors.textSecondary
                        } ${isSelected ? 'opacity-100' : 'opacity-50'}`}
                        onClick={() => handleTimeChange('period', period)}
                      >
                        {period}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Import from before section */}
        <div className="mb-8 flex items-center justify-between">
          <span className={`text-lg ${colors.text}`}>
            import travel radius from before?
          </span>
          
          {/* Yes/No toggle */}
          <div className="flex items-center space-x-3">
            <span className={`text-sm ${!importFromBefore ? colors.text : colors.textSecondary}`}>
              No
            </span>
            <button
              onClick={toggleImport}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                importFromBefore ? colors.toggle : colors.toggleOff
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  importFromBefore ? 'transform translate-x-6' : 'transform translate-x-0.5'
                }`}
              ></div>
            </button>
            <span className={`text-sm ${importFromBefore ? colors.text : colors.textSecondary}`}>
              Yes
            </span>
          </div>
        </div>

        {/* Radius section - conditionally hidden */}
        {!importFromBefore && (
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
        )}

        {importFromBefore && (
          <div className="mb-16">
            <div className={`text-center text-lg ${colors.textSecondary} italic`}>
              Using previous travel radius...
            </div>
          </div>
        )}

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
        <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
      </div>

      {/* Helpful tip - only show when not importing */}
      {!importFromBefore && (
        <div className="absolute bottom-20 left-6 right-6">
          <div className="max-w-md mx-auto">
            <div className={`text-center text-sm ${colors.textSecondary}`}>
              {radius <= 2 && "Perfect for nearby dinner spots within walking distance"}
              {radius > 2 && radius <= 10 && "Great range for local dinner favorites"}
              {radius > 10 && "Exploring dinner options across the wider area"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DinnerPlanningScreen;