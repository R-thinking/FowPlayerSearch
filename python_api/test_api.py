#!/usr/bin/env python3
"""
Simple test script for FOW Crawler API
Tests basic functionality without requiring full browser setup
"""

import requests
import json
from app import app, crawler

def test_api_basic():
    """Test basic API functionality"""
    print("🧪 Testing FOW Crawler API...")
    
    # Test Flask app creation
    try:
        with app.test_client() as client:
            # Test health endpoint
            response = client.get('/api/health')
            print(f"✅ Health check: {response.status_code}")
            
            # Test home endpoint
            response = client.get('/')
            print(f"✅ Home endpoint: {response.status_code}")
            
            # Test crawler class instantiation
            test_crawler = crawler
            print(f"✅ Crawler class: {type(test_crawler).__name__}")
            
            print("\n🎉 Basic API tests passed!")
            return True
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_dependencies():
    """Test if all required dependencies are available"""
    print("\n🔍 Checking dependencies...")
    
    try:
        import flask
        print(f"✅ Flask: {flask.__version__}")
    except ImportError:
        print("❌ Flask not installed")
        return False
    
    try:
        import requests
        print(f"✅ Requests: {requests.__version__}")
    except ImportError:
        print("❌ Requests not installed")
        return False
    
    try:
        import bs4
        print(f"✅ BeautifulSoup: {bs4.__version__}")
    except ImportError:
        print("❌ BeautifulSoup4 not installed")
        return False
    
    try:
        import pandas as pd
        print(f"✅ Pandas: {pd.__version__}")
    except ImportError:
        print("❌ Pandas not installed")
        return False
    
    try:
        from selenium import webdriver
        print("✅ Selenium: Available")
    except ImportError:
        print("❌ Selenium not installed")
        return False
    
    print("✅ All dependencies available!")
    return True

def test_requests_method():
    """Test the requests-based crawling method"""
    print("\n🌐 Testing requests method...")
    
    try:
        # Test with a simple request to FOW.LOL
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        response = requests.get('https://www.fow.lol', headers=headers, timeout=10)
        
        if response.status_code == 200:
            print("✅ FOW.LOL is accessible")
            return True
        else:
            print(f"⚠️  FOW.LOL returned status: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"⚠️  Network test failed: {e}")
        return False

if __name__ == '__main__':
    print("=" * 50)
    print("FOW CRAWLER API TEST SUITE")
    print("=" * 50)
    
    # Run tests
    deps_ok = test_dependencies()
    api_ok = test_api_basic()
    network_ok = test_requests_method()
    
    print("\n" + "=" * 50)
    print("TEST RESULTS:")
    print(f"Dependencies: {'✅ PASS' if deps_ok else '❌ FAIL'}")
    print(f"API Basic: {'✅ PASS' if api_ok else '❌ FAIL'}")
    print(f"Network: {'✅ PASS' if network_ok else '❌ FAIL'}")
    
    if deps_ok and api_ok:
        print("\n🎉 Ready to run the crawler!")
        print("Start with: python run.py")
    else:
        print("\n⚠️  Please install missing dependencies:")
        print("pip install -r ../requirements.txt")
    
    print("=" * 50) 