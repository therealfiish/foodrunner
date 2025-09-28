import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Animated,
  SafeAreaView,
  StatusBar,
  Easing
} from 'react-native';
import { useSystemTheme } from './theme';

const { width, height } = Dimensions.get('window');

const TransitionScreen = ({ 
  navigateToScreen 
}) => {
  const { isDarkMode, theme } = useSystemTheme();

  // Animation values
  const titleMoveUpAnim = useRef(new Animated.Value(0)).current; // 0 = splash position, 1 = auth position
  const buttonsOpacityAnim = useRef(new Animated.Value(0)).current;
  const subtitleOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the transition sequence immediately
    // Step 1: Move title upward and make smaller (duration: 1200ms, smoother)
    Animated.timing(titleMoveUpAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
      // Add easing for smoother movement
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    }).start();

    // Step 2: Fade in subtitle (starts at 600ms, earlier for smoother flow)
    setTimeout(() => {
      Animated.timing(subtitleOpacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 600);

    // Step 3: Fade in buttons (starts at 1000ms)
    setTimeout(() => {
      Animated.timing(buttonsOpacityAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }).start();
    }, 1000);
  }, []);

  // Navigate to dietary screen
  const handleGetMunching = () => {
    navigateToScreen('dietary');
  };

  // Calculate the interpolated position for title movement
  const titleTranslateY = titleMoveUpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height * 0.20], // Move up less (20% instead of 35%) - not too high
  });

  const titleScale = titleMoveUpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.75], // Make it less small (75% instead of 65%) - more readable
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Animated Title */}
      <Animated.View 
        style={[
          styles.titleContainer,
          { 
            transform: [
              { translateY: titleTranslateY },
              { scale: titleScale }
            ]
          }
        ]}
      >
        <Text style={[styles.titleText, { color: theme.text }]}>FOOD</Text>
        <View style={styles.runnerContainer}>
          {['R', 'U', 'N', 'N', 'E', 'R'].map((letter, index) => (
            <Text key={index} style={[styles.titleText, styles.accentText]}>{letter}</Text>
          ))}
        </View>
      </Animated.View>

      {/* Auth Content */}
      <View style={styles.authContent}>
        <View style={styles.spacer} />
        
        {/* Animated Subtitle */}
        <Animated.View style={{ opacity: subtitleOpacityAnim }}>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            AI-powered meal planning for busy families
          </Text>
        </Animated.View>

        {/* Animated Buttons */}
        <Animated.View style={[styles.authButtons, { opacity: buttonsOpacityAnim }]}>
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: theme.accent }]}
            onPress={handleGetMunching}
          >
            <Text style={[styles.authButtonText, { color: theme.accentText }]}>
              Get Munching!
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    position: 'absolute',
    top: '50%', // Perfect center like SplashScreen
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
    marginTop: -40, // Center adjustment for text height
  },
  titleText: {
    fontSize: width > 400 ? 80 : 48,
    fontWeight: 'bold',
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 16,
  },
  runnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentText: {
    color: '#10b981',
  },
  authContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  spacer: {
    height: 120, // Space for the moving title
  },
  subtitle: {
    marginTop: 16,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
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
  disabledButton: {
    opacity: 0.7,
  },
  authButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TransitionScreen;