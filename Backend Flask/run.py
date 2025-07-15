#!/usr/bin/env python3
"""
Main entry point for the Medical App Flask application.
This script ensures proper Python path setup and runs the Flask app.
"""

import sys
import os
from pathlib import Path

# Add the current directory to Python path so imports work correctly
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Now import and run the Flask app
from app.main import app

if __name__ == "__main__":
    print("🚀 Starting Medical App...")
    print("📱 API endpoints available at:")
    print("   - http://localhost:5000/extract-medical-tests")
    print("   - http://localhost:5000/extract-prescriptions")
    print("   - http://localhost:5000/medicines")
    print("   - http://localhost:5000/drug-interactions")
    print("   - http://localhost:5000/chat")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000) 