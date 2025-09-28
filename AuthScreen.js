import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert
} from 'react-native';
import { getTheme } from './theme';

const { width } = Dimensions.get('window');

const AuthScreen = ({ 
  isDarkMode, 
  setIsDarkMode, 
  onGoogleSignUp, 
  onGoogleLogin 
}) => {
  const theme = getTheme(isDarkMode);

  const handleGoogleSignUp = () => {
    console.log('Google Sign Up clicked');
    Alert.alert('Sign Up', 'Google Sign Up integration would go here');
    if (onGoogleSignUp) onGoogleSignUp();
  };

  const handleGoogleLogin = () => {
    console.log('Google Login clicked');
    Alert.alert('Login', 'Google Login integration would go here');
    if (onGoogleLogin) onGoogleLogin();
  };

  return (
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  accentText: {
    color: '#10b981',
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
  },
  authThemeToggle: {
    alignSelf: 'center',
    marginTop: 32,
  },
  themeToggleText: {
    fontSize: 24,
  },
});

export default AuthScreen;