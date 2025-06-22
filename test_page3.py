#!/usr/bin/env python3

import requests
import json

try:
    print("Testing page 3...")
    response = requests.get("http://localhost:5001/api/ranking?region=kr&page=3", timeout=60)
    data = response.json()
    
    print("Response:")
    print(json.dumps(data, indent=2, ensure_ascii=False))
    
except Exception as e:
    print(f"Error: {e}") 