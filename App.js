import React, { useState, useEffect, useRef } from 'react';
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

  const theme = isDarkMode ? colors.dark : colors.light;

  // Splash screen animation
  useEffect(() => {
    if (currentScreen === 'splash') {
      // Start fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();

      // FOOD slides in
      const timer1 = setTimeout(() => {
        setAnimationStep(1);
        Animated.timing(foodSlideAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }).start();
      }, 600);

      // RUNNER swooshes in
      const timer2 = setTimeout(() => {
        setAnimationStep(2);
        Animated.timing(runnerSlideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }, 1800);

      // Move to auth screen
      const timer3 = setTimeout(() => {
        setCurrentScreen('auth');
      }, 4000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [currentScreen]);

  const handleGoogleSignUp = () => {
    console.log('Google Sign Up clicked');
    Alert.alert('Sign Up', 'Google Sign Up integration would go here');
    setCurrentScreen('main');
  };

  const handleGoogleLogin = () => {
    console.log('Google Login clicked');
    Alert.alert('Login', 'Google Login integration would go here');
    setCurrentScreen('main');
  };

  const SplashScreen = () => (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Animated.View style={[styles.splashContent, { opacity: fadeAnim }]}>
        <View style={styles.textContainer}>
          <Animated.View style={{ transform: [{ translateX: foodSlideAnim }] }}>
            <Text style={[styles.titleText, { color: theme.text }]}>FOOD</Text>
          </Animated.View>
          
          <Animated.View style={{ transform: [{ translateX: runnerSlideAnim }] }}>
            <Text style={[styles.titleText, styles.accentText]}>RUNNER</Text>
          </Animated.View>
        </View>
      </Animated.View>

      <TouchableOpacity 
        style={[styles.themeToggle, { backgroundColor: theme.cardBg }]}
        onPress={() => setIsDarkMode(!isDarkMode)}
      >
        <Text style={styles.themeToggleText}>{isDarkMode ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const AuthScreen = () => (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.authContent}>
        <View style={styles.logoSection}>
          <Text style={[styles.authTitle, { color: theme.text }]}>FOOD</Text>
          <Text style={[styles.authTitle, styles.accentText]}>RUNNER</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            AI-powered meal planning for busy students
          </Text>
        </View>

        <View style={styles.authButtons}>
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: theme.accent }]}
            onPress={handleGoogleSignUp}
          >
            <Text style={[styles.authButtonText, { color: theme.accentText }]}>
              Sign Up with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authButton, styles.loginButton, { borderColor: theme.accent }]}
            onPress={handleGoogleLogin}
          >
            <Text style={[styles.authButtonText, { color: theme.accent }]}>
              Login with Google
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.themeToggle, styles.authThemeToggle, { backgroundColor: theme.cardBg }]}
          onPress={() => setIsDarkMode(!isDarkMode)}
        >
          <Text style={styles.themeToggleText}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

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
    return <SplashScreen />;
  } else if (currentScreen === 'auth') {
    return <AuthScreen />;
  } else {
    return <MainApp />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  titleText: {
    fontSize: width > 400 ? 64 : 48,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'System',
  },
  accentText: {
    color: '#10b981',
  },
  themeToggle: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themeToggleText: {
    fontSize: 24,
  },
  authContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  authTitle: {
    fontSize: width > 400 ? 48 : 36,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  subtitle: {
    marginTop: 16,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
  authButtons: {
    gap: 16,
  },
  authButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  authButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  authThemeToggle: {
    alignSelf: 'center',
    marginTop: 32,
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