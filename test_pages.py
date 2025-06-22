#!/usr/bin/env python3

import requests
import json

def test_page(page_num):
    print(f"\n=== Testing Page {page_num} ===")
    try:
        response = requests.get(f"http://localhost:5001/api/ranking?region=kr&page={page_num}", timeout=30)
        data = response.json()
        
        if data.get('success'):
            players = data.get('data', [])
            print(f"✅ Page {page_num}: Found {len(players)} players")
            if players:
                first_player = players[0]
                print(f"   First player: {first_player.get('플레이어 이름', '')} - {first_player.get('승률', '')}")
        else:
            print(f"❌ Page {page_num}: {data.get('error', 'Unknown error')}")
            
    except requests.exceptions.Timeout:
        print(f"⏰ Page {page_num}: Request timed out")
    except Exception as e:
        print(f"❌ Page {page_num}: Error - {e}")

if __name__ == "__main__":
    # Test pages 1, 2, and 3 individually
    for page in [1, 2, 3]:
        test_page(page) 