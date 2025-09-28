import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
  Switch
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useOnboarding } from './datacollection';
import { useSystemTheme } from './theme';
import ScrollableTimePicker from './ScrollableTimePicker';

const { width, height } = Dimensions.get('window');

const LunchScreen = ({ onNext }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { isDarkMode, theme, colorScheme } = useSystemTheme();
  
  // Local state
  const [lunchTime, setLunchTime] = useState({ hour: 12, minute: 0, period: 'PM' });
  const [radius, setRadius] = useState(5);
  const [importFromBreakfast, setImportFromBreakfast] = useState(false);

  const handleTimeChange = (type, value) => {
    setLunchTime(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const getRadiusRecommendation = (radiusValue) => {
    if (radiusValue <= 2) return "Perfect for nearby lunch spots within walking distance";
    if (radiusValue <= 10) return "Great range for local lunch favorites";
    return "Exploring lunch options across the wider area";
  };

  const handleContinue = () => {
    const timeString = `${lunchTime.hour}:${lunchTime.minute.toString().padStart(2, '0')} ${lunchTime.period}`;
    updateOnboardingData({
      lunchTime: timeString,
      lunchRadius: radius,
      lunchImportSettings: importFromBreakfast,
      currentStep: 'dinner'
    });
    onNext('dinner');
  };

  const handleSkip = () => {
    updateOnboardingData({
      lunchTime: '12:00 PM', // default
      lunchRadius: 5, // default
      lunchImportSettings: true, // default
      currentStep: 'dinner'
    });
    onNext('dinner');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.appTitle, { color: theme.text, textAlign: 'center', flex: 1 }]}>FOOD RUNNER</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page title */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: theme.textSecondary }]}>Lunch</Text>
        </View>

        {/* Main question */}
        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { color: theme.text }]}>
            Now for lunch!
          </Text>
        </View>

        {/* Import Settings Toggle */}
        <View style={styles.importSection}>
          <View style={styles.importContainer}>
            <Text style={[styles.importLabel, { color: theme.text }]}>
              Import settings from before?
            </Text>
            <Switch
              value={importFromBreakfast}
              onValueChange={setImportFromBreakfast}
              trackColor={{ false: theme.border, true: theme.accent }}
              thumbColor={importFromBreakfast ? theme.accentText : theme.textSecondary}
            />
          </View>
          <Text style={[styles.importDescription, { color: theme.textSecondary }]}>
            Use your breakfast preferences for lunch as well
          </Text>
        </View>

        {/* Time Section */}
        {!importFromBreakfast && (
          <View style={styles.timeSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Time</Text>
            
            {/* Scrollable Time Picker */}
            <ScrollableTimePicker
              selectedTime={lunchTime}
              onTimeChange={handleTimeChange}
              theme={theme}
            />
          </View>
        )}

        {/* Radius Section */}
        {!importFromBreakfast && (
          <View style={styles.radiusSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Radius</Text>

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
        )}

        {/* Import Message */}
        {importFromBreakfast && (
          <View style={styles.importMessage}>
            <Text style={[styles.importMessageText, { color: theme.textSecondary }]}>
              Great! We'll use your breakfast settings for lunch too.
            </Text>
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontSize: width > 400 ? 42 : 36,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: width > 400 ? 50 : 44,
  },
  importSection: {
    marginBottom: 30,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  importContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  importLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
  importDescription: {
    fontSize: 14,
    lineHeight: 20,
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
  importMessage: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  importMessageText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
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

export default LunchScreen;