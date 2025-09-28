#!/usr/bin/env python3
import os
import sys

# Add the backend directory to Python path
sys.path.insert(0, '/Users/krrishk/foodrunner/backend')

# Change to the backend directory
os.chdir('/Users/krrishk/foodrunner/backend')

print("Current directory:", os.getcwd())
print("Python path includes:", sys.path[0])

# Now try to import and run
try:
    from app import create_app
    
    app = create_app()
    print("✅ Flask app created successfully!")
    
    # Test import of our services
    from app.services.ai_recommendations import ai_engine
    from app.services.google_places import google_places
    print("✅ AI engine and Google Places imported successfully!")
    
    # Start the server
    print("🚀 Starting server on http://localhost:3001...")
    app.run(host='0.0.0.0', port=3001, debug=True)
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()