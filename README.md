# 🍽️ FoodRunner

**A Smart Route Planning App with Restaurant Discovery**

*Built for MHacks - University of Michigan's Premier Hackathon*

---

## 🏆 About the Project

FoodRunner is an intelligent travel companion that revolutionizes the way you plan road trips by seamlessly integrating route planning with restaurant discovery. Instead of making separate stops to search for food, FoodRunner finds the best restaurants along your route based on your dietary preferences, cuisine choices, and meal timing.

### 🎯 The Problem We Solved

Traditional travel planning involves:
- Planning your route separately from meal stops
- Random searches for restaurants at unknown locations
- No consideration for dietary restrictions or preferences
- Inefficient detours that add unnecessary time and distance

### 💡 Our Solution

FoodRunner combines route optimization with AI-powered restaurant discovery to:
- **Plan your entire journey** with meal stops integrated into the route
- **Discover restaurants** that match your dietary needs and cuisine preferences  
- **Optimize timing** by suggesting meal stops at appropriate travel intervals
- **Learn from your choices** to provide better recommendations over time

---

## ✨ Key Features

### 🗺️ **Smart Route Planning**
- Interactive map visualization with route polylines
- Real-time distance and duration calculations
- Waypoint optimization for efficient travel

### 🍕 **Intelligent Restaurant Discovery**
- **60+ restaurants** found along each route using OpenStreetMap data
- **Dietary filtering**: Vegan, vegetarian, gluten-free, kosher, halal, and more
- **Cuisine preferences**: Italian, Mexican, Chinese, Indian, Thai, and 10+ others
- **Meal timing**: Breakfast, lunch, and dinner recommendations based on travel schedule

### 📱 **Intuitive Mobile Experience**
- **Seamless onboarding** with personalized preferences setup
- **Dual view modes**: Interactive map view and detailed list view
- **Color-coded markers**: Green (breakfast), yellow (lunch), red (dinner)
- **Restaurant selection**: Tap to select/deselect restaurants for your trip

### 🤖 **AI Learning System**
- Tracks your restaurant selections and preferences
- Learns from your choices to improve future recommendations
- Adapts to your travel and dining patterns over time

### 🎨 **Beautiful UI/UX**
- **Adaptive theming**: Automatic dark/light mode based on system preferences
- **Smooth animations**: Polished transitions between screens
- **Accessibility**: Built with React Native best practices

---

## 🛠️ Technical Architecture

### **Frontend** (React Native + Expo)
```
📱 Mobile App
├── React Native 0.81.4
├── Expo ~54.0.10  
├── React Native Maps (route visualization)
├── AsyncStorage (data persistence)
└── Custom UI components
```

### **Backend** (Python Flask)
```
🖥️ API Server
├── Flask 3.0.0 (REST API)
├── OpenRouteService API (route calculation)  
├── Overpass API (restaurant discovery)
├── Geopy (geocoding & distance calculations)
└── CORS support for mobile app
```

### **Key APIs & Services**
- **OpenRouteService**: Professional routing with 9 waypoints for long-distance trips
- **Overpass API**: Access to OpenStreetMap's restaurant database
- **Custom AI**: Learning algorithms for personalized recommendations

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.8+
- **Expo CLI**: `npm install -g @expo/cli`
- **iOS Simulator** or **Android Emulator** (or Expo Go app)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/therealfiish/foodrunner.git
cd foodrunner
```

### 2️⃣ Setup Frontend
```bash
# Install dependencies
npm install

# Start the development server
npm start
```

### 3️⃣ Setup Backend
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the Flask server
python server.py
```

### 4️⃣ Run the App
- **iOS**: Press `i` in the Expo CLI or scan QR code with Camera app
- **Android**: Press `a` in the Expo CLI or scan QR code with Expo Go
- **Web**: Press `w` in the Expo CLI

---

## 📱 User Journey

### 1. **Personalized Onboarding**
- Set dietary restrictions and preferences
- Choose favorite cuisines
- Configure meal timing and radius preferences
- Set daily food budget

### 2. **Trip Planning**
- Enter departure and destination locations
- Select departure time
- App calculates optimal route with meal stops

### 3. **Restaurant Discovery**
- Browse 60+ restaurants along your route
- Filter by meal type (breakfast, lunch, dinner)
- View detailed restaurant information (rating, price, distance)

### 4. **Route Visualization**
- Interactive map with route polyline
- Color-coded restaurant markers
- Tap to select restaurants for your trip

### 5. **AI Learning**
- App learns from your selections
- Future trips get better, personalized recommendations

---

## 🏗️ Project Structure

```
foodrunner/
├── 📱 Frontend (React Native)
│   ├── App.js                 # Main navigation
│   ├── RouteScreen.js         # Route planning & map
│   ├── *_rn.js               # Onboarding screens
│   ├── theme.js              # Dark/light theme system
│   └── datacollection.js     # Data management
│
├── 🖥️ Backend (Python Flask)  
│   ├── server.py             # Main Flask application
│   ├── app/routes/           # API endpoints
│   ├── app/services/         # OpenRoute & Overpass integration
│   └── data/                 # User data storage
│
└── 📦 Configuration
    ├── package.json          # Node.js dependencies
    ├── requirements.txt      # Python dependencies
    └── app.json             # Expo configuration
```

---

## 🎨 Design Highlights

### **Adaptive Theming**
- Automatically switches between light and dark modes
- Consistent color palette across all screens
- Map styles adapt to theme preference

### **Interactive Maps**
- Real-time route rendering with polylines
- Custom restaurant markers with meal-type indicators
- Smooth zoom and pan interactions

### **Intuitive Navigation**
- Progressive onboarding flow
- Clear visual hierarchy and typography
- Smooth animations between screens

---

## 🔮 Future Enhancements

- **🔗 Google Calendar Integration**: Auto-import travel plans
- **⛽ Gas Station Discovery**: Find fuel stops along the route
- **👥 Group Trip Planning**: Collaborative trip planning for multiple users
- **🎵 Spotify Integration**: Travel playlists based on trip duration
- **📊 Trip Analytics**: Track your travel patterns and spending
- **🌟 Advanced AI**: More sophisticated recommendation algorithms

---

## 🏆 MHacks Achievement

This project was built during **MHacks** - University of Michigan's flagship hackathon. In just 48 hours, our team created a full-stack mobile application that combines:

- **Complex route optimization algorithms**
- **Real-time restaurant discovery from OpenStreetMap**
- **Machine learning for personalized recommendations**  
- **Polished mobile UI with native performance**
- **Scalable backend architecture**

The app demonstrates technical excellence, practical utility, and strong potential for real-world impact.

---

## 👥 Team

Built with ❤️ by passionate developers who love both coding and great food!

---

## 📄 License

This project was created for educational and hackathon purposes. 

---

## 🙏 Acknowledgments

- **MHacks** for providing the platform and inspiration
- **OpenStreetMap** community for restaurant data
- **OpenRouteService** for professional routing capabilities
- **React Native** and **Expo** teams for excellent mobile development tools

---

*Ready to revolutionize your road trips? Let FoodRunner guide you to your next great meal! 🚗🍕*