#!/usr/bin/env python3
"""
FOW Crawler API Runner with WebSocket Support
Simple script to start the Flask API server with SocketIO
"""

import os
import sys
from app import app, socketio

if __name__ == '__main__':
    print("🚀 Starting FOW Crawler API with WebSocket support...")
    print("📡 API will be available at: http://localhost:5001")
    print("🔍 Health check: http://localhost:5001/api/health")
    print("📊 Ranking endpoint: http://localhost:5001/api/ranking")
    print("📈 Multi-page crawling: http://localhost:5001/api/ranking/multi")
    print("📊 Progress tracking: http://localhost:5001/api/progress")
    print("🔌 WebSocket events: connect, start_crawl, progress_update, etc.")
    print("💾 Export endpoint: http://localhost:5001/api/ranking/export")
    print("\n" + "="*50)
    
    # Run the SocketIO app (which includes Flask)
    socketio.run(
        app,
        debug=True,
        host='0.0.0.0',
        port=5001,
        allow_unsafe_werkzeug=True
    ) 