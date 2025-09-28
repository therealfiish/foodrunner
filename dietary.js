import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions
} from 'react-native';
import { useOnboarding } from './datacollection';
import { getTheme } from './theme';

const { width, height } = Dimensions.get('window');

const DietaryRestrictionsScreen = ({ onNext }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedRestrictions, setSelectedRestrictions] = useState(
    onboardingData.dietaryRestrictions || []
  );

  const theme = getTheme(isDarkMode);

  // Dietary restrictions options
  const dietaryOptions = [
    'Gluten-free',
    'Dairy-free', 
    'Nut-free',
    'Egg-free',
    'Soy-free',
    'Vegetarian',
    'Vegan',
    'Halal',
    'Kosher',
    'Low-carb',
    'Keto',
    'Paleo'
  ];

  // Handle restriction toggle
  const toggleRestriction = (restriction) => {
    setSelectedRestrictions(prev => 
      prev.includes(restriction)
        ? prev.filter(item => item !== restriction)
        : [...prev, restriction]
    );
  };

  // Select all functionality
  const selectAll = () => {
    if (selectedRestrictions.length === dietaryOptions.length) {
      setSelectedRestrictions([]);
    } else {
      setSelectedRestrictions([...dietaryOptions]);
    }
  };

  const handleContinue = () => {
    updateOnboardingData({
      dietaryRestrictions: selectedRestrictions,
      currentStep: 'complete'
    });
    // For now, navigate back to main instead of cuisines to avoid HTML component errors
    onNext('main');
  };

  const handleSkip = () => {
    updateOnboardingData({
      dietaryRestrictions: [],
      currentStep: 'complete'
    });
    // For now, navigate back to main instead of cuisines to avoid HTML component errors
    onNext('main');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.appTitle, { color: theme.text }]}>FOOD RUNNER</Text>
        
        {/* Theme Toggle */}
        <TouchableOpacity 
          style={[styles.themeToggle, { backgroundColor: theme.cardBg }]}
          onPress={() => setIsDarkMode(!isDarkMode)}
        >
          <Text style={styles.themeToggleText}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { color: theme.text }]}>
            Dietary{'\n'}Restrictions
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Let us know about your dietary preferences so we can personalize your meal plans
          </Text>
        </View>

        {/* Select All Button */}
        <TouchableOpacity onPress={selectAll} style={styles.selectAllButton}>
          <Text style={[styles.selectAllText, { color: theme.accent }]}>
            {selectedRestrictions.length === dietaryOptions.length ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>

        {/* Dietary Options */}
        <View style={styles.optionsContainer}>
          {dietaryOptions.map((restriction) => {
            const isSelected = selectedRestrictions.includes(restriction);
            
            return (
              <TouchableOpacity
                key={restriction}
                onPress={() => toggleRestriction(restriction)}
                style={[
                  styles.optionItem,
                  { 
                    backgroundColor: theme.cardBg,
                    borderColor: isSelected ? theme.accent : theme.border
                  }
                ]}
              >
                <View style={[
                  styles.checkbox,
                  { 
                    backgroundColor: isSelected ? theme.accent : 'transparent',
                    borderColor: isSelected ? theme.accent : theme.border
                  }
                ]}>
                  {isSelected && (
                    <Text style={[styles.checkmark, { color: theme.accentText }]}>✓</Text>
                  )}
                </View>
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {restriction}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Count */}
        {selectedRestrictions.length > 0 && (
          <View style={[styles.selectedCount, { backgroundColor: theme.accent }]}>
            <Text style={[styles.selectedCountText, { color: theme.accentText }]}>
              {selectedRestrictions.length} selected
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
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themeToggleText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  titleSection: {
    alignItems: 'center',
    marginVertical: 32,
  },
  mainTitle: {
    fontSize: width > 400 ? 48 : 40,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: width > 400 ? 56 : 48,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  selectAllButton: {
    alignSelf: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  selectAllText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
  },
  selectedCount: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 24,
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: '600',
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

export default DietaryRestrictionsScreen;