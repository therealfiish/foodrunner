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

const { width } = Dimensions.get('window');

const SplashScreen = ({ 
  animationStep, 
  setAnimationStep, 
  onAnimationComplete 
}) => {
  const { isDarkMode, theme } = useSystemTheme();

  // Animation values
  const foodSlideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Individual letter animations for "RUNNER"
  const letterAnims = useRef([
    new Animated.Value(-width), // R
    new Animated.Value(-width), // U
    new Animated.Value(-width), // N
    new Animated.Value(-width), // N
    new Animated.Value(-width), // E
    new Animated.Value(-width), // R
  ]).current;

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

    // RUNNER letters run in one by one
    const timer2 = setTimeout(() => {
      setAnimationStep(2);
      // Animate each letter of "RUNNER" with staggered timing
      letterAnims.forEach((letterAnim, index) => {
        setTimeout(() => {
          Animated.spring(letterAnim, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }, index * 150); // 150ms delay between each letter
      });
    }, 1800);

    // Move to next screen (no fade out)
    const timer3 = setTimeout(() => {
      onAnimationComplete();
    }, 4200); 

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
          
          {/* RUNNER with individual letter animations */}
          <View style={styles.runnerContainer}>
            {['R', 'U', 'N', 'N', 'E', 'R'].map((letter, index) => (
              <Animated.View 
                key={index}
                style={{ 
                  transform: [{ translateX: letterAnims[index] }] 
                }}
              >
                <Text style={[styles.titleText, styles.accentText]}>{letter}</Text>
              </Animated.View>
            ))}
          </View>
        </View>
      </Animated.View>
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
  runnerContainer: {
    flexDirection: 'row',
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
});

export default SplashScreen;