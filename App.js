import React, { useState } from 'react';
import { OnboardingProvider } from './datacollection';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import SplashScreen from './SplashScreen';
import AuthScreen from './AuthScreen';
import TransitionScreen from './TransitionScreen';
import { getTheme } from './theme';
import WelcomeOnboardingScreen from './onboarding';
import HomeAddressScreen from './homelocation';
import DietaryRestrictionsScreen from './dietary';
import CuisinesScreen from './cuisines';
import BudgetScreen from './budget';
import BreakfastScreen from './breakfast';
import LunchScreen from './lunch';
import DinnerScreen from './dinner';
import SummaryScreen from './summary';

const FoodRunner = () => {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [animationStep, setAnimationStep] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userTokens, setUserTokens] = useState(null);

  const theme = getTheme(isDarkMode);

  const handleSplashComplete = () => {
    setIsTransitioning(true);
    setCurrentScreen('transition');
  };

  const handleGoogleSignUp = (user, tokens) => {
    setUserData(user);
    setUserTokens(tokens);
    setCurrentScreen('main');
  };

  const handleGoogleLogin = (user, tokens) => {
    setUserData(user);
    setUserTokens(tokens);
    setCurrentScreen('main');
  };

  const MainApp = () => (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.mainContent}>
        <Text style={[styles.mainTitle, { color: theme.text }]}>
          Welcome to Food Runner!
        </Text>
        
        {userData && (
          <View style={styles.userInfoContainer}>
            <Text style={[styles.welcomeText, { color: theme.text }]}>
              Hello, {userData.fullName}! 👋
            </Text>
            <Text style={[styles.userDetail, { color: theme.textSecondary }]}>
              📧 {userData.email}
            </Text>
            {userData.verifiedEmail && (
              <Text style={[styles.verifiedBadge, { color: theme.accent }]}>
                ✅ Verified Account
              </Text>
            )}
            <Text style={[styles.accessGranted, { color: theme.textSecondary }]}>
              🔑 Google Calendar Access Granted
            </Text>
          </View>
        )}
        
        <Text style={[styles.mainSubtitle, { color: theme.textSecondary }]}>
          Your AI-powered meal planning assistant
        </Text>
        
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.accent }]}
          onPress={() => setCurrentScreen('transition')}
        >
          <Text style={[styles.backButtonText, { color: theme.accentText }]}>
            Back to Auth
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  if (currentScreen === 'splash') {
    return (
      <SplashScreen 
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        animationStep={animationStep}
        setAnimationStep={setAnimationStep}
        onAnimationComplete={handleSplashComplete}
      />
    );
  } else if (currentScreen === 'transition') {
    return (
      <TransitionScreen 
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onGoogleSignUp={handleGoogleSignUp}
        onGoogleLogin={handleGoogleLogin}
      />
    );
  } else if (currentScreen === 'auth') {
    return (
      <AuthScreen 
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onGoogleSignUp={handleGoogleSignUp}
        onGoogleLogin={handleGoogleLogin}
      />
    );
  } else {
    return <MainApp />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  userInfoContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  userDetail: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  verifiedBadge: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  accessGranted: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  mainSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FoodRunner;