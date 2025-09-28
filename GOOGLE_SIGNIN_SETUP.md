# Google Sign-In Setup Instructions

## 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google+ API (for user profile)
   - Google Calendar API (for calendar access)
   - Google OAuth2 API

## 2. Create OAuth 2.0 Credentials

1. Go to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. For Application type, select "Web application"
4. Add these **EXACT** redirect URIs to "Authorized redirect URIs":
   - `https://auth.expo.io/@krrishk/foodrunner`
   - `foodrunner://redirect`
   - For development: `exp://127.0.0.1:19000/--/redirect`
   - For Expo Go: `exp://exp.host/@krrishk/foodrunner/--/redirect`

## 3. Configure Your App

1. Replace `YOUR_GOOGLE_CLIENT_ID` in `services/GoogleAuthService.js` with your actual client ID
2. Update your `app.json` with the scheme:

```json
{
  "expo": {
    "scheme": "foodrunner",
    "name": "Food Runner",
    // ... other config
  }
}
```

## 4. Permissions Granted

With the current configuration, your app will request:

✅ **Full Name** - `profile` scope provides complete user profile
✅ **Google Calendar Access** - `calendar` and `calendar.events` scopes
✅ **Account Integration** - Refresh tokens for persistent access

## 5. User Data Available

After successful sign-in, you'll have access to:

```javascript
{
  id: "user-google-id",
  email: "user@email.com", 
  fullName: "John Doe",
  firstName: "John",
  lastName: "Doe",
  profilePicture: "https://...",
  verifiedEmail: true
}
```

## 6. Calendar Integration Example

```javascript
// Get user's calendar events
const events = await GoogleAuthService.getCalendarEvents();
if (events.success) {
  console.log('User calendar events:', events.events);
}
```

## 7. Testing

- Use Expo Go app to test
- Sign in will open browser for Google OAuth
- After consent, returns to your app with user data
- Tokens are stored securely for future API calls