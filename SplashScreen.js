import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Animated,
  SafeAreaView,
  StatusBar 
} from 'react-native';
import { getTheme } from './theme';

const { width } = Dimensions.get('window');

const SplashScreen = ({ 
  isDarkMode, 
  setIsDarkMode, 
  animationStep, 
  setAnimationStep, 
  onAnimationComplete 
}) => {
  const theme = getTheme(isDarkMode);

  // Animation values
  const foodSlideAnim = useRef(new Animated.Value(-width)).current;
  const runnerSlideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

    // Move to next screen
    const timer3 = setTimeout(() => {
      onAnimationComplete();
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
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
});

export default SplashScreen;