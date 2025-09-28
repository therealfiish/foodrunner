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

const { width, height } = Dimensions.get('window');

const TransitionScreen = ({ 
  isDarkMode, 
  setIsDarkMode, 
  onGoogleSignUp, 
  onGoogleLogin 
}) => {
  const theme = getTheme(isDarkMode);

  // Animation values
  const titleMoveUpAnim = useRef(new Animated.Value(0)).current; // 0 = splash position, 1 = auth position
  const buttonsOpacityAnim = useRef(new Animated.Value(0)).current;
  const subtitleOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the transition sequence
    const startTransition = () => {
      // Step 1: Move title upward (duration: 1000ms)
      Animated.timing(titleMoveUpAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Step 2: Fade in subtitle (starts at 800ms)
      setTimeout(() => {
        Animated.timing(subtitleOpacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 800);

      // Step 3: Fade in buttons (starts at 1200ms)
      setTimeout(() => {
        Animated.timing(buttonsOpacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }, 1200);
    };

    startTransition();
  }, []);

  // Calculate the interpolated position for title movement
  const titleTranslateY = titleMoveUpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.1, -height * 0.15], // From center-ish to top
  });

  const titleScale = titleMoveUpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.75], // Slightly smaller in auth position
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
            AI-powered meal planning for busy students
          </Text>
        </Animated.View>

        {/* Animated Buttons */}
        <Animated.View style={[styles.authButtons, { opacity: buttonsOpacityAnim }]}>
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: theme.accent }]}
            onPress={onGoogleSignUp}
          >
            <Text style={[styles.authButtonText, { color: theme.accentText }]}>
              Sign Up with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authButton, styles.loginButton, { borderColor: theme.accent }]}
            onPress={onGoogleLogin}
          >
            <Text style={[styles.authButtonText, { color: theme.accent }]}>
              Login with Google
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Theme Toggle */}
        <TouchableOpacity 
          style={[styles.themeToggle, { backgroundColor: theme.cardBg }]}
          onPress={() => setIsDarkMode(!isDarkMode)}
        >
          <Text style={styles.themeToggleText}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
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
    top: height * 0.4, // Starting position (center of screen)
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  titleText: {
    fontSize: width > 400 ? 64 : 48,
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
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  authButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  themeToggle: {
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
    alignSelf: 'center',
    marginTop: 32,
  },
  themeToggleText: {
    fontSize: 24,
  },
});

export default TransitionScreen;