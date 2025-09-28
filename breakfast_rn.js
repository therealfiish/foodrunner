import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useOnboarding } from './datacollection';
import { useSystemTheme } from './theme';
import ScrollableTimePicker from './ScrollableTimePicker';

const { width, height } = Dimensions.get('window');

const BreakfastScreen = ({ onNext }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { isDarkMode, theme } = useSystemTheme();
  const [selectedTime, setSelectedTime] = useState({ hour: 8, minute: 0, period: 'AM' });
  const [radius, setRadius] = useState(5);

  const handleTimeChange = (type, value) => {
    setSelectedTime(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const getRadiusRecommendation = (radiusValue) => {
    if (radiusValue <= 2) return "Perfect for nearby breakfast spots within walking distance";
    if (radiusValue <= 10) return "Great range for local breakfast favorites";
    return "Exploring breakfast options across the wider area";
  };

  const handleContinue = () => {
    const timeString = `${selectedTime.hour}:${selectedTime.minute.toString().padStart(2, '0')} ${selectedTime.period}`;
    updateOnboardingData({
      breakfastTime: timeString,
      breakfastRadius: radius,
      currentStep: 'lunch'
    });
    onNext('lunch');
  };

  const handleSkip = () => {
    updateOnboardingData({
      breakfastTime: '8:00 AM', // default
      breakfastRadius: 5, // default
      currentStep: 'lunch'
    });
    onNext('lunch');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.appTitle, { color: theme.text }]}>FOOD RUNNER</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page title */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: theme.textSecondary }]}>Breakfast</Text>
        </View>

        {/* Main question */}
        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { color: theme.text }]}>
            Time to plan Breakfast! Fill out the questions below...
          </Text>
        </View>

        {/* Time Section */}
        <View style={styles.timeSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>time</Text>
          
          {/* Scrollable Time Picker */}
          <ScrollableTimePicker
            selectedTime={selectedTime}
            onTimeChange={handleTimeChange}
            theme={theme}
          />
        </View>

        {/* Radius Section */}
        <View style={styles.radiusSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>radius</Text>

          {/* Radius labels */}
          <View style={styles.radiusLabels}>
            <Text style={[styles.minMaxValue, { color: theme.text }]}>0.5mi</Text>
            <Text style={[styles.currentValue, { color: theme.accent }]}>{radius}mi</Text>
            <Text style={[styles.minMaxValue, { color: theme.text }]}>20mi</Text>
          </View>

          {/* Slider */}
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={20}
              step={0.5}
              value={radius}
              onValueChange={(value) => setRadius(value)}
              minimumTrackTintColor={theme.accent}
              maximumTrackTintColor={theme.border}
              thumbStyle={[styles.sliderThumb, { backgroundColor: theme.accent }]}
              trackStyle={styles.sliderTrack}
            />
          </View>

          {/* Radius recommendation */}
          <View style={styles.recommendationContainer}>
            <Text style={[styles.recommendation, { color: theme.textSecondary }]}>
              {getRadiusRecommendation(radius)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: theme.bg }]}>
        <TouchableOpacity
          onPress={handleContinue}
          style={[styles.continueButton, { backgroundColor: theme.accent }]}
        >
          <Text style={[styles.continueButtonText, { color: theme.accentText }]}>
            Continue
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  appTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  pageHeader: {
    marginTop: 20,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: width > 400 ? 32 : 28,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: width > 400 ? 40 : 36,
  },
  timeSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '300',
    marginBottom: 20,
  },
  radiusSection: {
    marginBottom: 40,
  },
  radiusLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  minMaxValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  currentValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  sliderContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
  },
  sliderThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  recommendationContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  recommendation: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomActions: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BreakfastScreen;