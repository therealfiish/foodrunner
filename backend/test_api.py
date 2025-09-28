#!/usr/bin/env python3
"""
FoodRunner Backend API Test Suite
Tests all endpoints to verify the server is working correctly
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:3001"

def test_endpoint(name, method, url, data=None, expected_status=200):
    """Test an API endpoint"""
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{url}", timeout=5)
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{url}", json=data, timeout=5)
        
        if response.status_code == expected_status:
            print(f"✅ {name}: SUCCESS ({response.status_code})")
            if response.headers.get('content-type', '').startswith('application/json'):
                try:
                    result = response.json()
                    if isinstance(result, dict) and len(result) < 10:
                        print(f"   Response: {json.dumps(result, indent=2)}")
                    else:
                        print(f"   Response: Large JSON response ({len(str(result))} chars)")
                except:
                    print(f"   Response: {response.text[:100]}...")
            return True
        else:
            print(f"❌ {name}: FAILED ({response.status_code})")
            print(f"   Expected: {expected_status}, Got: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ {name}: CONNECTION FAILED - Server not running?")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ {name}: TIMEOUT - Server too slow")
        return False
    except Exception as e:
        print(f"❌ {name}: ERROR - {e}")
        return False

def main():
    print("🧪 FoodRunner Backend API Test Suite")
    print("=" * 50)
    
    # Wait for server to be ready
    print("⏳ Checking if server is running...")
    time.sleep(2)
    
    tests_passed = 0
    total_tests = 0
    
    # Test 1: Health Check
    total_tests += 1
    if test_endpoint("Health Check", "GET", "/health"):
        tests_passed += 1
    
    # Test 2: Restaurant Search
    total_tests += 1
    search_data = {
        "start_location": {"lat": 37.7749, "lng": -122.4194},
        "end_location": {"lat": 37.3382, "lng": -121.8863},
        "radius_miles": 5.0,
        "user_id": "test_user_123"
    }
    if test_endpoint("Restaurant Search", "POST", "/restaurants/search-along-route", search_data):
        tests_passed += 1
    
    # Test 3: AI Recommendations
    total_tests += 1
    rec_data = {
        "user_id": "test_user_123",
        "restaurants": [
            {
                "place_id": "test_place_1",
                "name": "Test Restaurant",
                "rating": 4.5,
                "cuisine_types": ["italian"],
                "distance_miles": 2.3,
                "price_level": 2
            }
        ]
    }
    if test_endpoint("AI Recommendations", "POST", "/recommendations/personalized", rec_data):
        tests_passed += 1
    
    # Test 4: Feedback Recording
    total_tests += 1
    feedback_data = {
        "user_id": "test_user_123",
        "restaurant": {
            "place_id": "test_place_1",
            "name": "Test Restaurant",
            "rating": 4.5,
            "cuisine_types": ["italian"],
            "distance_miles": 2.3
        },
        "action": "selected",
        "feedback": {"rating": 5, "comment": "Great food!"}
    }
    if test_endpoint("Feedback Recording", "POST", "/recommendations/feedback", feedback_data):
        tests_passed += 1
    
    # Test 5: Trip Creation
    total_tests += 1
    trip_data = {
        "user_id": "test_user_123",
        "name": "Weekend Trip",
        "start_location": {"lat": 37.7749, "lng": -122.4194, "address": "San Francisco, CA"},
        "end_location": {"lat": 37.3382, "lng": -121.8863, "address": "San Jose, CA"},
        "dietary_restrictions": ["vegetarian"]
    }
    if test_endpoint("Trip Creation", "POST", "/trips/create", trip_data):
        tests_passed += 1
    
    print("\n" + "=" * 50)
    print(f"🏁 Test Results: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 ALL TESTS PASSED! Your FoodRunner backend is working perfectly!")
        print("\n📍 Your server is ready at: http://localhost:3001")
        print("🔗 You can now connect your React Native app to this backend")
    else:
        print(f"⚠️  {total_tests - tests_passed} tests failed. Check server logs for errors.")
    
    return tests_passed == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)