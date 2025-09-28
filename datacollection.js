// DataManager.js
import React, { useState, useContext, createContext } from 'react';

// Create context for global state management
const OnboardingContext = createContext();

// Custom hook to use the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

// OnboardingProvider component
export const OnboardingProvider = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState({
    // User identification
    userId: `user_${Date.now()}`,
    sessionId: `session_${Date.now()}`,
    startedAt: new Date().toISOString(),
    completedAt: null,
    
    // Google Auth data (populated after login)
    googleAuth: {
      userId: null,
      email: null,
      name: null,
      picture: null
    },
    
    // Basic info - starts empty
    homeAddress: '',
    hasGoogleCalendarWithLocations: null,
    
    // Preferences - starts empty
    dietaryRestrictions: [],
    dailyBudget: null,
    
    // Meal planning - starts empty
    mealPreferences: {
      breakfast: {
        time: { hour: null, minute: null, period: null },
        radius: null,
        enabled: false
      },
      lunch: {
        time: { hour: null, minute: null, period: null },
        radius: null,
        importFromBreakfast: false,
        enabled: false
      },
      dinner: {
        time: { hour: null, minute: null, period: null },
        radius: null,
        importFromPrevious: false,
        enabled: false
      }
    },
    
    // App preferences
    theme: 'light',
    notifications: true,
    
    // Tracking
    currentStep: 'welcome',
    completedSteps: [],
    skippedSteps: []
  });

  // Update function for any part of the data
  const updateOnboardingData = (updates) => {
    setOnboardingData(prev => ({
      ...prev,
      ...updates,
      lastUpdated: new Date().toISOString()
    }));
  };

  // Update specific meal preference
  const updateMealPreference = (meal, updates) => {
    setOnboardingData(prev => ({
      ...prev,
      mealPreferences: {
        ...prev.mealPreferences,
        [meal]: {
          ...prev.mealPreferences[meal],
          ...updates
        }
      },
      lastUpdated: new Date().toISOString()
    }));
  };

  // Toggle dietary restriction
  const toggleDietaryRestriction = (restriction) => {
    setOnboardingData(prev => {
      const exists = prev.dietaryRestrictions.includes(restriction);
      return {
        ...prev,
        dietaryRestrictions: exists 
          ? prev.dietaryRestrictions.filter(r => r !== restriction)
          : [...prev.dietaryRestrictions, restriction],
        lastUpdated: new Date().toISOString()
      };
    });
  };

  // Step management functions
  const updateStep = (step, data = {}) => {
    setOnboardingData(prev => ({
      ...prev,
      currentStep: step,
      completedSteps: [...prev.completedSteps.filter(s => s !== step), step],
      lastUpdated: new Date().toISOString(),
      ...data
    }));
  };

  const skipStep = (step) => {
    setOnboardingData(prev => ({
      ...prev,
      skippedSteps: [...prev.skippedSteps.filter(s => s !== step), step],
      lastUpdated: new Date().toISOString()
    }));
  };

  const completeOnboarding = () => {
    setOnboardingData(prev => ({
      ...prev,
      completedAt: new Date().toISOString(),
      currentStep: 'complete',
      lastUpdated: new Date().toISOString()
    }));
  };

  // Export function to download as JSON file
  const exportToJSONFile = () => {
    const dataStr = JSON.stringify(onboardingData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `food-runner-data-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy data to clipboard
  const copyDataToClipboard = async () => {
    try {
      const dataStr = JSON.stringify(onboardingData, null, 2);
      await navigator.clipboard.writeText(dataStr);
      return true;
    } catch (error) {
      console.error('Failed to copy data:', error);
      return false;
    }
  };

  const value = {
    // Data
    onboardingData,
    
    // Update functions
    updateOnboardingData,
    updateMealPreference,
    toggleDietaryRestriction,
    
    // Navigation functions
    updateStep,
    skipStep,
    completeOnboarding,
    
    // Export functions
    exportToJSONFile,
    copyDataToClipboard
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
