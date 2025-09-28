// SummaryScreen.js
import React, { useState } from 'react';
import { useOnboarding } from './DataManager';

const SummaryScreen = () => {
  const { 
    onboardingData, 
    exportToJSONFile, 
    copyDataToClipboard, 
    completeOnboarding 
  } = useOnboarding();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showFullJSON, setShowFullJSON] = useState(false);

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
      success: 'bg-green-600',
      successHover: 'bg-green-700',
      info: 'bg-blue-600',
      infoHover: 'bg-blue-700'
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
      success: 'bg-green-600',
      successHover: 'bg-green-700',
      info: 'bg-blue-600',
      infoHover: 'bg-blue-700'
    }
  };

  const colors = isDarkMode ? theme.dark : theme.light;

  const handleDownload = () => {
    exportToJSONFile();
    alert('Data file downloaded successfully!');
  };

  const handleCopy = async () => {
    const success = await copyDataToClipboard();
    if (success) {
      alert('Data copied to clipboard!');
    } else {
      alert('Failed to copy data');
    }
  };

  const handleComplete = () => {
    completeOnboarding();
    alert('Onboarding completed! Welcome to Food Runner.');
  };

  // Helper function to format time
  const formatTime = (timeObj) => {
    if (!timeObj.hour || !timeObj.period) return 'Not set';
    return `${timeObj.hour}:${timeObj.minute.toString().padStart(2, '0')} ${timeObj.period}`;
  };

  return (
    <div className={`min-h-screen ${colors.bg} transition-colors duration-300 px-6 py-8`}>
      
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        
        {/* Page title */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-light ${colors.brandGreen} leading-tight mb-4`}>
            Onboarding<br />
            Complete!
          </h1>
          <p className={`text-lg ${colors.textSecondary}`}>
            Your Food Runner profile is ready
          </p>
        </div>

        {/* Data Summary Card */}
        <div className={`${colors.cardBg} ${colors.border} border rounded-2xl shadow-lg p-6 mb-8`}>
          <h2 className={`text-xl font-semibold mb-6 ${colors.text}`}>
            Your Profile Summary
          </h2>
          
          <div className="space-y-4">
            {/* Home Address */}
            <div className="flex justify-between items-start">
              <span className={`font-medium ${colors.text}`}>Home Address:</span>
              <span className={`${colors.textSecondary} text-right max-w-xs`}>
                {onboardingData.homeAddress || 'Not provided'}
              </span>
            </div>

            {/* Calendar Status */}
            <div className="flex justify-between items-center">
              <span className={`font-medium ${colors.text}`}>Google Calendar:</span>
              <span className={colors.textSecondary}>
                {onboardingData.hasGoogleCalendarWithLocations === null 
                  ? 'Not answered'
                  : onboardingData.hasGoogleCalendarWithLocations ? 'Updated' : 'Not updated'
                }
              </span>
            </div>

            {/* Budget */}
            <div className="flex justify-between items-center">
              <span className={`font-medium ${colors.text}`}>Daily Budget:</span>
              <span className={colors.textSecondary}>
                {onboardingData.dailyBudget ? `$${onboardingData.dailyBudget}` : 'Not set'}
              </span>
            </div>

            {/* Dietary Restrictions */}
            <div className="flex justify-between items-start">
              <span className={`font-medium ${colors.text}`}>Dietary Restrictions:</span>
              <span className={`${colors.textSecondary} text-right max-w-xs`}>
                {onboardingData.dietaryRestrictions.length > 0 
                  ? onboardingData.dietaryRestrictions.join(', ')
                  : 'None selected'
                }
              </span>
            </div>

            {/* Meal Preferences */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className={`font-medium ${colors.text} mb-3`}>Meal Preferences:</h3>
              
              {['breakfast', 'lunch', 'dinner'].map((meal) => {
                const mealData = onboardingData.mealPreferences[meal];
                if (!mealData.enabled) return null;
                
                return (
                  <div key={meal} className="ml-4 mb-2">
                    <span className={`capitalize ${colors.text} font-medium`}>{meal}:</span>
                    <span className={`ml-2 ${colors.textSecondary}`}>
                      {formatTime(mealData.time)} ({mealData.radius}mi radius)
                    </span>
                  </div>
                );
              })}
              
              {!Object.values(onboardingData.mealPreferences).some(meal => meal.enabled) && (
                <div className={`ml-4 ${colors.textSecondary}`}>No meal preferences set</div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <button
            onClick={handleDownload}
            className={`w-full py-4 px-6 ${colors.info} hover:${colors.infoHover} text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95`}
          >
            Download Data as JSON File
          </button>
          
          <button
            onClick={handleCopy}
            className={`w-full py-4 px-6 ${colors.success} hover:${colors.successHover} text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95`}
          >
            Copy Data to Clipboard
          </button>
          
          <button
            onClick={handleComplete}
            className={`w-full py-4 px-6 ${colors.accent} hover:${colors.accentHover} ${colors.accentText} rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95`}
          >
            Complete Setup
          </button>
        </div>

        {/* Full JSON Toggle */}
        <div className={`${colors.cardBg} ${colors.border} border rounded-2xl shadow-lg p-6`}>
          <button
            onClick={() => setShowFullJSON(!showFullJSON)}
            className={`w-full text-left font-medium ${colors.text} hover:${colors.brandGreen} transition-colors duration-200 flex items-center justify-between`}
          >
            <span>View Full JSON Data</span>
            <span className={`transform transition-transform duration-200 ${showFullJSON ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {showFullJSON && (
            <div className="mt-4">
              <div className={`bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-96`}>
                <pre className={`text-xs ${colors.text} leading-relaxed`}>
                  {JSON.stringify(onboardingData, null, 2)}
                </pre>
              </div>
              <div className="mt-3 flex space-x-3">
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 text-sm ${colors.success} hover:${colors.successHover} text-white rounded-lg transition-colors duration-200`}
                >
                  Copy JSON
                </button>
                <button
                  onClick={handleDownload}
                  className={`px-4 py-2 text-sm ${colors.info} hover:${colors.infoHover} text-white rounded-lg transition-colors duration-200`}
                >
                  Download JSON
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Session Info */}
        <div className="mt-8 text-center">
          <div className={`text-sm ${colors.textSecondary}`}>
            Session ID: {onboardingData.sessionId}
          </div>
          <div className={`text-sm ${colors.textSecondary}`}>
            Started: {new Date(onboardingData.startedAt).toLocaleString()}
          </div>
        </div>
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

      {/* Completion indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
        <div className={`px-4 py-2 ${colors.accent} ${colors.accentText} rounded-full text-sm font-medium shadow-lg`}>
          Setup Complete ✓
        </div>
      </div>
    </div>
  );
};

export default SummaryScreen;