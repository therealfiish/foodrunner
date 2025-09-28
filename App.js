import React, { useState } from 'react';
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
import { getTheme } from './theme';

const FoodRunner = () => {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [animationStep, setAnimationStep] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = getTheme(isDarkMode);

  const handleSplashComplete = () => {
    setCurrentScreen('auth');
  };

  const handleGoogleSignUp = () => {
    setCurrentScreen('main');
  };

  const handleGoogleLogin = () => {
    setCurrentScreen('main');
  };

  const MainApp = () => (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.mainContent}>
        <Text style={[styles.mainTitle, { color: theme.text }]}>
          Welcome to Food Runner!
        </Text>
        <Text style={[styles.mainSubtitle, { color: theme.textSecondary }]}>
          Your AI-powered meal planning assistant
        </Text>
        
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.accent }]}
          onPress={() => setCurrentScreen('auth')}
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