import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Complete the auth session for the browser
WebBrowser.maybeCompleteAuthSession();

class GoogleAuthService {
    constructor() {
    // Google OAuth Configuration
    this.clientId = '890609833427-fkb9ahn2vaed73v2ibjg3o7478ptns61.apps.googleusercontent.com';
    
    // Use the exact URI that matches your Google Console configuration
    this.redirectUri = 'https://auth.expo.io/@krrishk/foodrunner';
    
    console.log('Redirect URI:', this.redirectUri);
    
    // Scopes for the permissions you need
    this.scopes = [
        'openid',
        'profile', 
        'email',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
    ];
}

  // Create authorization request
  createAuthRequest = async () => {
    // Generate a random code verifier
    const codeVerifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Create code challenge using BASE64 encoding (not BASE64URL)
    const codeChallenge = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );

    const request = new AuthSession.AuthRequest({
      clientId: this.clientId,
      scopes: this.scopes,
      responseType: AuthSession.ResponseType.Code,
      redirectUri: this.redirectUri,
      codeChallenge,
      codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
      additionalParameters: {
        access_type: 'offline', // Get refresh token
        prompt: 'consent', // Force consent screen to ensure we get all permissions
      },
    });

    // Store the code verifier for later use
    request.codeVerifier = codeVerifier;
    
    return request;
  };

  // Sign in with Google
  signInWithGoogle = async () => {
    try {
      const request = await this.createAuthRequest();
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success') {
        // Exchange authorization code for tokens
        const tokenResult = await this.exchangeCodeForTokens(result.params.code, request.codeVerifier);
        
        // Get user info with the access token
        const userInfo = await this.getUserInfo(tokenResult.access_token);
        
        // Store tokens securely
        await this.storeTokens({
          accessToken: tokenResult.access_token,
          refreshToken: tokenResult.refresh_token,
          idToken: tokenResult.id_token,
          expiresIn: tokenResult.expires_in,
        });

        // Store user info
        await this.storeUserInfo(userInfo);

        return {
          success: true,
          user: userInfo,
          tokens: tokenResult,
        };
      }

      return { success: false, error: 'User cancelled' };
    } catch (error) {
      console.error('Google Sign In Error:', error);
      return { success: false, error: error.message };
    }
  };

  // Exchange authorization code for access tokens
  exchangeCodeForTokens = async (code, codeVerifier) => {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }).toString(),
    });

    return await response.json();
  };

  // Get user information from Google
  getUserInfo = async (accessToken) => {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userInfo = await response.json();
    
    return {
      id: userInfo.id,
      email: userInfo.email,
      fullName: userInfo.name, // Full name as requested
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      profilePicture: userInfo.picture,
      verifiedEmail: userInfo.verified_email,
    };
  };

  // Store tokens securely
  storeTokens = async (tokens) => {
    try {
      await AsyncStorage.setItem('@google_tokens', JSON.stringify({
        ...tokens,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  };

  // Store user information
  storeUserInfo = async (userInfo) => {
    try {
      await AsyncStorage.setItem('@user_info', JSON.stringify(userInfo));
    } catch (error) {
      console.error('Error storing user info:', error);
    }
  };

  // Get stored tokens
  getStoredTokens = async () => {
    try {
      const tokens = await AsyncStorage.getItem('@google_tokens');
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      console.error('Error getting tokens:', error);
      return null;
    }
  };

  // Get stored user info
  getStoredUserInfo = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('@user_info');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  };

  // Check if user is signed in
  isSignedIn = async () => {
    const tokens = await this.getStoredTokens();
    const userInfo = await this.getStoredUserInfo();
    
    if (tokens && userInfo) {
      // Check if token is still valid
      const now = Date.now();
      const tokenAge = now - tokens.timestamp;
      const tokenExpiry = tokens.expiresIn * 1000; // Convert to milliseconds
      
      if (tokenAge < tokenExpiry) {
        return { signedIn: true, user: userInfo, tokens };
      } else {
        // Try to refresh the token
        const refreshed = await this.refreshAccessToken(tokens.refreshToken);
        if (refreshed.success) {
          return { signedIn: true, user: userInfo, tokens: refreshed.tokens };
        }
      }
    }
    
    return { signedIn: false };
  };

  // Refresh access token
  refreshAccessToken = async (refreshToken) => {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }).toString(),
      });

      const result = await response.json();
      
      if (result.access_token) {
        const newTokens = {
          accessToken: result.access_token,
          refreshToken: refreshToken, // Keep the same refresh token
          expiresIn: result.expires_in,
        };
        
        await this.storeTokens(newTokens);
        return { success: true, tokens: newTokens };
      }
      
      return { success: false, error: 'Failed to refresh token' };
    } catch (error) {
      console.error('Error refreshing token:', error);
      return { success: false, error: error.message };
    }
  };

  // Sign out
  signOut = async () => {
    try {
      await AsyncStorage.removeItem('@google_tokens');
      await AsyncStorage.removeItem('@user_info');
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    }
  };

  // Get Calendar Events (example of using Calendar access)
  getCalendarEvents = async () => {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens) {
        throw new Error('No access token available');
      }

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      const data = await response.json();
      return { success: true, events: data.items || [] };
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return { success: false, error: error.message };
    }
  };
}

export default new GoogleAuthService();