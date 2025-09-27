import React, { useState, useEffect, useRef } from  const theme = isDarkMode ? colors.dark : colors.light;

  // Splash screen animation'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Animated,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert
} from 'react-native';

const { width, height } = Dimensions.get('window');

const FoodRunner = () => {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [animationStep, setAnimationStep] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Animation values
  const foodSlideAnim = useRef(new Animated.Value(-width)).current;
  const runnerSlideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Color theme
  const colors = {
    light: {
      bg: '#f9fafb',
      cardBg: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      accent: '#059669',
      accentHover: '#047857',
      accentText: '#ffffff',
      border: '#e5e7eb'
    },
    dark: {
      bg: '#111827',
      cardBg: '#1f2937',
      text: '#ffffff',
      textSecondary: '#d1d5db',
      accent: '#059669',
      accentHover: '#047857',
      accentText: '#ffffff',
      border: '#374151'
    }
  };

  const theme = isDarkMode ? colors.dark : colors.light;  // Splash screen animation
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer1 = setTimeout(() => setAnimationStep(1), 600); // "FOOD" slides in
      const timer2 = setTimeout(() => setAnimationStep(2), 1800); // "RUNNER" swooshes in
      const timer3 = setTimeout(() => setCurrentScreen('auth'), 4000); // Move to auth screen
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [currentScreen]);

  const handleGoogleSignUp = () => {
    // In production, this would integrate with Google OAuth
    console.log('Google Sign Up clicked');
    alert('Google Sign Up integration would go here');
    setCurrentScreen('main');
  };

  const handleGoogleLogin = () => {
    // In production, this would integrate with Google OAuth
    console.log('Google Login clicked');
    alert('Google Login integration would go here');
    setCurrentScreen('main');
  };

  const SplashScreen = () => (
    <div className={`min-h-screen flex items-center justify-center ${colors.bg} transition-colors duration-300 overflow-hidden`}>
      <div className="text-center w-full">
        {/* FOOD text - slides in slowly from left */}
        <div 
          className={`text-6xl md:text-8xl font-bold ${colors.text} mb-4`}
          style={{ 
            fontFamily: 'system-ui, -apple-system, sans-serif',
            transform: animationStep >= 1 ? 'translateX(0)' : 'translateX(-200vw)',
            opacity: animationStep >= 1 ? 1 : 0,
            transition: 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
        >
          FOOD
        </div>
        
        {/* RUNNER text - swooshes in fast from left with bounce */}
        <div 
          className="text-6xl md:text-8xl font-bold text-emerald-500 relative"
          style={{ 
            fontFamily: 'system-ui, -apple-system, sans-serif',
            transform: animationStep >= 2 
              ? 'translateX(0) scale(1)' 
              : 'translateX(-300vw) scale(0.8)',
            opacity: animationStep >= 2 ? 1 : 0,
            transition: animationStep >= 2 
              ? 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)' 
              : 'none'
          }}
        >
          RUNNER
          {/* Swoosh trail effect */}
          {animationStep >= 2 && (
            <>
              {/* Multiple trail elements for swoosh effect */}
              <div 
                className="absolute inset-0 text-emerald-300"
                style={{
                  transform: 'translateX(-20px)',
                  opacity: 0.3,
                  animation: 'swooshTrail1 0.6s ease-out forwards',
                  pointerEvents: 'none'
                }}
              >
                RUNNER
              </div>
              <div 
                className="absolute inset-0 text-emerald-200"
                style={{
                  transform: 'translateX(-40px)',
                  opacity: 0.2,
                  animation: 'swooshTrail2 0.7s ease-out forwards',
                  pointerEvents: 'none'
                }}
              >
                RUNNER
              </div>
              <div 
                className="absolute inset-0 text-emerald-100"
                style={{
                  transform: 'translateX(-60px)',
                  opacity: 0.1,
                  animation: 'swooshTrail3 0.8s ease-out forwards',
                  pointerEvents: 'none'
                }}
              >
                RUNNER
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Add custom CSS for swoosh animations */}
      <style jsx>{`
        @keyframes swooshTrail1 {
          0% { transform: translateX(-100px); opacity: 0.5; }
          50% { transform: translateX(-10px); opacity: 0.3; }
          100% { transform: translateX(0); opacity: 0; }
        }
        @keyframes swooshTrail2 {
          0% { transform: translateX(-120px); opacity: 0.4; }
          50% { transform: translateX(-20px); opacity: 0.2; }
          100% { transform: translateX(0); opacity: 0; }
        }
        @keyframes swooshTrail3 {
          0% { transform: translateX(-140px); opacity: 0.3; }
          50% { transform: translateX(-30px); opacity: 0.1; }
          100% { transform: translateX(0); opacity: 0; }
        }
      `}</style>
      
      {/* Theme toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-6 right-6 p-2 rounded-full ${colors.cardBg} ${colors.border} border shadow-sm`}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );

  const AuthScreen = () => (
    <div className={`min-h-screen flex items-center justify-center ${colors.bg} transition-colors duration-300 px-6`}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className={`text-4xl md:text-5xl font-bold ${colors.text} mb-2`}>
            FOOD
          </div>
          <div className="text-4xl md:text-5xl font-bold text-emerald-500">
            RUNNER
          </div>
          <p className={`mt-4 ${colors.textSecondary} text-lg`}>
            AI-powered meal planning for busy students
          </p>
        </div>

        {/* Auth buttons */}
        <div className="space-y-4">
          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignUp}
            className={`w-full py-4 px-6 ${colors.accent} hover:${colors.accentHover} ${colors.accentText} rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-3`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign Up with Google</span>
          </button>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className={`w-full py-4 px-6 ${colors.cardBg} hover:bg-gray-100 dark:hover:bg-gray-700 ${colors.text} ${colors.border} border-2 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-3`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Log In with Google</span>
          </button>
        </div>

        {/* Terms and Privacy */}
        <p className={`text-center mt-8 text-sm ${colors.textSecondary}`}>
          By continuing, you agree to our{' '}
          <span className="text-emerald-500 cursor-pointer hover:underline">Terms of Service</span>
          {' '}and{' '}
          <span className="text-emerald-500 cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-6 right-6 p-2 rounded-full ${colors.cardBg} ${colors.border} border shadow-sm`}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );

  const MainApp = () => {
    const [userPrefs, setUserPrefs] = useState({
      budget: 50,
      timeRanges: [{ start: '12:00', end: '13:00' }, { start: '18:00', end: '19:30' }],
      cuisines: [],
      dietaryRestrictions: [],
      locations: []
    });

    const [currentPlan, setCurrentPlan] = useState(null);
    const [learningData, setLearningData] = useState({
      previousChoices: [],
      preferenceScore: 0.5,
      adaptationLevel: 5
    });

    // Mock restaurant data
    const mockRestaurants = [
      {
        id: 1,
        name: "Panda Express",
        cuisine: "Chinese",
        rating: 4.2,
        priceRange: "$",
        location: { lat: 42.2780, lng: -83.7382 },
        currentDeal: "20% off bowls",
        estimatedTime: 15,
        address: "Central Campus"
      },
      {
        id: 2,
        name: "Chipotle",
        cuisine: "Mexican",
        rating: 4.1,
        priceRange: "$$",
        location: { lat: 42.2808, lng: -83.7430 },
        currentDeal: "Free guac with bowl",
        estimatedTime: 12,
        address: "State Street"
      },
      {
        id: 3,
        name: "Sweetgreen",
        cuisine: "Healthy",
        rating: 4.5,
        priceRange: "$$",
        location: { lat: 42.2795, lng: -83.7414 },
        currentDeal: null,
        estimatedTime: 10,
        address: "North Campus"
      }
    ];

    const handlePlanGeneration = () => {
      const paths = mockRestaurants.map((restaurant, index) => ({
        id: index + 1,
        restaurants: [restaurant],
        totalTime: restaurant.estimatedTime + Math.random() * 10,
        totalCost: Math.random() * userPrefs.budget,
        route: [
          { lat: 42.2780, lng: -83.7382, type: 'start' },
          { lat: restaurant.location.lat, lng: restaurant.location.lng, type: 'restaurant' },
          { lat: 42.2780 + 0.001, lng: -83.7382 + 0.001, type: 'end' }
        ]
      })).sort((a, b) => a.totalTime - b.totalTime).slice(0, 5);

      setCurrentPlan({
        paths,
        recommendations: mockRestaurants,
        generatedAt: new Date()
      });
    };

    const handleRestaurantChoice = (restaurant, rating) => {
      setLearningData(prev => ({
        ...prev,
        previousChoices: [...prev.previousChoices, { restaurant, rating, timestamp: Date.now() }],
        adaptationLevel: Math.max(2, prev.adaptationLevel - 0.1),
        preferenceScore: prev.preferenceScore + (rating > 3 ? 0.1 : -0.05)
      }));
      alert(`Thanks for the feedback! Rated ${restaurant.name}: ${rating}/5 stars`);
    };

    return (
      <div className={`min-h-screen ${colors.bg} transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className={`text-4xl font-bold ${colors.text} mb-2`}>
                <span className="text-emerald-500">Food</span> Runner
              </h1>
              <p className={`${colors.textSecondary}`}>AI-powered meal path planning for busy students</p>
              <div className={`text-sm ${colors.textSecondary} mt-2`}>
                Learning Level: {learningData.adaptationLevel.toFixed(1)}/5 | 
                Confidence: {(learningData.preferenceScore * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full ${colors.cardBg} ${colors.border} border shadow-sm`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={() => setCurrentScreen('auth')}
                className={`px-4 py-2 ${colors.textSecondary} hover:${colors.text} transition-colors`}
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Input Panel */}
          <div className={`${colors.cardBg} ${colors.border} border rounded-2xl shadow-lg p-6 mb-6`}>
            <h2 className={`text-xl font-semibold mb-4 ${colors.text} flex items-center`}>
              <span className="mr-2">⚙️</span>
              Your Preferences
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                  💰 Daily Budget: ${userPrefs.budget}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={userPrefs.budget}
                  onChange={(e) => setUserPrefs({...userPrefs, budget: parseInt(e.target.value)})}
                  className="w-full accent-emerald-500"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                  🕐 Preferred Meal Times
                </label>
                <div className="space-y-1">
                  {userPrefs.timeRanges.map((range, index) => (
                    <div key={index} className={`text-sm ${colors.cardBg} bg-opacity-50 p-2 rounded`}>
                      {range.start} - {range.end}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handlePlanGeneration}
              className={`mt-4 ${colors.accent} hover:${colors.accentHover} ${colors.accentText} px-6 py-2 rounded-xl transition flex items-center font-semibold`}
            >
              <span className="mr-2">🗺️</span>
              Generate Meal Plan
            </button>
          </div>

          {/* Results Panel */}
          {currentPlan && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top 5 Paths */}
              <div className={`${colors.cardBg} ${colors.border} border rounded-2xl shadow-lg p-6`}>
                <h2 className={`text-xl font-semibold mb-4 ${colors.text} flex items-center`}>
                  <span className="mr-2">📍</span>
                  Optimized Routes (Top 5)
                </h2>
                
                <div className="space-y-3">
                  {currentPlan.paths.map((path) => (
                    <div key={path.id} className={`${colors.border} border rounded-lg p-3 hover:bg-opacity-50 hover:${colors.bg} cursor-pointer transition-all`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-medium ${colors.text}`}>{path.restaurants[0].name}</h3>
                          <p className={`text-sm ${colors.textSecondary}`}>{path.restaurants[0].cuisine} • {path.restaurants[0].address}</p>
                          {path.restaurants[0].currentDeal && (
                            <p className="text-sm text-emerald-500">🎉 {path.restaurants[0].currentDeal}</p>
                          )}
                        </div>
                        <div className={`text-right text-sm ${colors.textSecondary}`}>
                          <div>⏱️ {path.totalTime.toFixed(0)} min</div>
                          <div>💰 ${path.totalCost.toFixed(2)}</div>
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">⭐</span>
                            {path.restaurants[0].rating}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex space-x-2">
                        {[1,2,3,4,5].map(rating => (
                          <button
                            key={rating}
                            onClick={() => handleRestaurantChoice(path.restaurants[0], rating)}
                            className={`text-xs px-2 py-1 ${colors.bg} hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded transition-colors`}
                          >
                            {rating}⭐
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent Email Preview */}
              <div className={`${colors.cardBg} ${colors.border} border rounded-2xl shadow-lg p-6`}>
                <h2 className={`text-xl font-semibold mb-4 ${colors.text} flex items-center`}>
                  <span className="mr-2">📧</span>
                  Tomorrow's AgentMail Preview
                </h2>
                
                <div className={`${colors.bg} bg-opacity-50 rounded-lg p-4`}>
                  <div className={`text-sm font-medium mb-2 ${colors.text}`}>
                    📧 🍽️ Your Optimized Food Plan for {new Date().toLocaleDateString()}
                  </div>
                  <div className={`text-xs ${colors.textSecondary} leading-relaxed`}>
                    Good morning! Based on your preferences and schedule, here are your personalized recommendations for today...
                    
                    {currentPlan.recommendations.slice(0, 2).map((rec, idx) => (
                      <div key={idx} className="mt-2">
                        📍 {rec.name} - {rec.cuisine}<br/>
                        ⏱️ Est. time: {rec.estimatedTime} min<br/>
                        {rec.currentDeal && `🎉 Deal: ${rec.currentDeal}`}
                      </div>
                    ))}
                    
                    <div className="mt-2">Have a delicious day! - Your Food Runner AI</div>
                  </div>
                </div>

                <div className={`mt-4 text-sm ${colors.textSecondary}`}>
                  <div className="flex items-center justify-between">
                    <span>📊 Learning Progress:</span>
                    <div className={`w-32 ${colors.bg} bg-opacity-30 rounded-full h-2`}>
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${learningData.preferenceScore * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs">
                    Previous choices: {learningData.previousChoices.length} | 
                    Options will reduce to {Math.max(2, Math.ceil(learningData.adaptationLevel - 1))} as you use the app
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render appropriate screen
  if (currentScreen === 'splash') {
    return <SplashScreen />;
  } else if (currentScreen === 'auth') {
    return <AuthScreen />;
  } else {
    return <MainApp />;
  }
};

export default FoodRunner;