import React, { useState, useEffect } from 'react';
import { useOnboarding } from './datacollection';

const WelcomeOnboardingScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Starting with dark mode to match your design
  const [isVisible, setIsVisible] = useState(false);
  const { onboardingData, setOnboardingData } = useOnboarding();

  // Color theme variables
  const theme = {
    light: {
      bg: 'bg-gray-50',
      cardBg: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      accent: 'bg-emerald-600',
      accentHover: 'bg-emerald-700',
      accentText: 'text-white',
      border: 'border-gray-200'
    },
    dark: {
      bg: 'bg-gray-900',
      cardBg: 'bg-gray-800',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      accent: 'bg-emerald-600',
      accentHover: 'bg-emerald-700',
      accentText: 'text-white',
      border: 'border-gray-700'
    }
  };

  const colors = isDarkMode ? theme.dark : theme.light;

  // Fade in animation on component mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    // This would navigate to the next onboarding step or main app
    console.log('Get Munching clicked!');
    alert('Moving to next step...');
    setOnboardingData({
      ...onboardingData,
      step: 'homeaddress.js',
      onNext: 'homeaddress.js'
    });
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-6 ${colors.bg} transition-all duration-500 relative overflow-hidden`}>
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400 rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className={`max-w-md w-full text-center relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Welcome heading */}
        <div className="mb-16">
          <h1 className={`text-4xl md:text-5xl font-bold ${colors.text} leading-tight mb-8`}>
            Welcome to{' '}
            <span className="block">
              <span className="text-emerald-500">Food</span>{' '}
              <span className={colors.text}>Runner!</span>
            </span>
          </h1>

          {/* Tagline */}
          <div className={`text-xl md:text-2xl ${colors.text} leading-relaxed font-light`}>
            <p className="mb-2"><span className="text-emerald-200">skip</span> the</p>
            <p className="mb-2">planning,</p>
            <p className="mb-2">
              <span className="text-emerald-500 font-medium">savor</span> the
            </p>
            <p>eating.</p>
          </div>
        </div>

        {/* Get Munching button */}
        <button
          onClick={handleGetStarted}
          className={`w-full py-4 px-8 ${colors.accent} hover:${colors.accentHover} ${colors.accentText} rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95`}
        >
          Get Munching
        </button>

        {/* Additional info */}
        <p className={`mt-8 text-sm ${colors.textSecondary} opacity-80`}>
          AI-powered meal planning made simple
        </p>
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

      {/* Bottom navigation dots (if this is part of a multi-step onboarding) */}
      <div className="absolute bottom-8 flex space-x-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
      </div>

      {/* Floating food emojis for decoration */}
      <div className="absolute top-20 left-8 text-2xl opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
        🍕
      </div>
      <div className="absolute top-32 right-12 text-2xl opacity-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>
        🍔
      </div>
      <div className="absolute bottom-32 left-12 text-2xl opacity-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3s' }}>
        🌮
      </div>
      <div className="absolute bottom-20 right-8 text-2xl opacity-20 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
        🍜
      </div>
    </div>
  );
};

// Alternative version with more minimal design
const MinimalWelcomeScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const colors = isDarkMode ? {
    bg: 'bg-gray-900',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    accent: 'bg-emerald-600',
    accentHover: 'bg-emerald-700',
  } : {
    bg: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    accent: 'bg-emerald-600',
    accentHover: 'bg-emerald-700',
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-8 ${colors.bg} transition-colors duration-300`}>
      <div className="max-w-sm w-full text-center">
        
        {/* Main heading - exactly like your design */}
        <div className="mb-20">
          <h1 className={`text-5xl font-light ${colors.text} leading-tight mb-16`}>
            Welcome to<br />
            <span className="text-emerald-500">Food Runner!</span>
          </h1>

          <div className={`text-3xl ${colors.text} leading-relaxed font-light space-y-1`}>
            <p>skip the</p>
            <p>planning,</p>
            <p><span className="text-emerald-500">savor</span> the</p>
            <p>eating.</p>
          </div>
        </div>

        {/* CTA Button */}
        <button className={`w-full py-4 px-6 ${colors.accent} hover:${colors.accentHover} text-white rounded-full text-lg font-medium transition-all duration-200 shadow-lg`}>
          Get Munching
        </button>
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-6 right-6 p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
};

// Export the main component (you can switch to MinimalWelcomeScreen if you prefer the cleaner version)
export default WelcomeOnboardingScreen;