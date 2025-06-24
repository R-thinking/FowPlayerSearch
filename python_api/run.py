#!/usr/bin/env python3
"""
FOW Crawler API Runner
Simple script to start the Flask API server
"""

import os
import sys
from app import app

if __name__ == '__main__':
    print("[INFO] Starting FOW Crawler API...")
    print("[INFO] API will be available at: http://localhost:5002")
    print("[INFO] Health check: http://localhost:5002/api/health")
    print("[INFO] Ranking endpoint: http://localhost:5002/api/ranking")
    print("[INFO] Multi-page crawling: http://localhost:5002/api/ranking/multi")
    print("[INFO] Progress tracking: http://localhost:5002/api/progress")
    print("[INFO] Export endpoint: http://localhost:5002/api/ranking/export")
    print("\n" + "="*50)
    
    # Run the Flask app
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5002
    ) 