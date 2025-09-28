import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useOnboarding } from './datacollection';
import { useSystemTheme } from './theme';

const { width, height } = Dimensions.get('window');

const BudgetScreen = ({ onNext }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { isDarkMode, theme } = useSystemTheme();
  const [budget, setBudget] = useState(112);

  const getBudgetRecommendation = (budgetValue) => {
    if (budgetValue <= 50) return "Perfect for quick bites and casual dining";
    if (budgetValue <= 100) return "Great for regular meals and occasional treats";
    if (budgetValue <= 150) return "Excellent for diverse dining and premium options";
    return "Ultimate food experience with premium restaurants";
  };

  const handleContinue = () => {
    updateOnboardingData({
      budget: budget,
      currentStep: 'breakfast'
    });
    onNext('breakfast');
  };

  const handleSkip = () => {
    updateOnboardingData({
      budget: 75, // default budget
      currentStep: 'breakfast'
    });
    onNext('breakfast');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.appTitle, { color: theme.text }]}>FOOD RUNNER</Text>
      </View>

      <View style={styles.content}>
        {/* Page title */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: theme.textSecondary }]}>Budget</Text>
        </View>

        {/* Main question */}
        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { color: theme.text }]}>
            Great! Now, how much are you willing to spend a day on food?
          </Text>
        </View>

        {/* Budget slider section */}
        <View style={styles.sliderSection}>
          {/* Budget labels */}
          <View style={styles.budgetLabels}>
            <Text style={[styles.minMaxValue, { color: theme.text }]}>$25</Text>
            <Text style={[styles.currentValue, { color: theme.accent }]}>${budget}</Text>
            <Text style={[styles.minMaxValue, { color: theme.text }]}>$200</Text>
          </View>

          {/* Slider */}
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={25}
              maximumValue={200}
              value={budget}
              onValueChange={(value) => setBudget(Math.round(value))}
              minimumTrackTintColor={theme.accent}
              maximumTrackTintColor={theme.border}
              thumbStyle={[styles.sliderThumb, { backgroundColor: theme.accent }]}
              trackStyle={styles.sliderTrack}
            />
          </View>

          {/* Budget recommendation */}
          <View style={styles.recommendationContainer}>
            <Text style={[styles.recommendation, { color: theme.textSecondary }]}>
              {getBudgetRecommendation(budget)}
            </Text>
          </View>
        </View>
      </View>

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
  pageHeader: {
    marginTop: 20,
    marginBottom: 40,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  mainTitle: {
    fontSize: width > 400 ? 32 : 28,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: width > 400 ? 40 : 36,
  },
  sliderSection: {
    flex: 1,
    justifyContent: 'center',
  },
  budgetLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  minMaxValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  currentValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  sliderContainer: {
    marginHorizontal: 20,
    marginBottom: 60,
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

export default BudgetScreen;