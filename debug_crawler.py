#!/usr/bin/env python3

import sys
import os
sys.path.append('python_api')

from app import FowCrawler
import logging

# Set up detailed logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_crawler():
    """Test the crawler with detailed debugging"""
    crawler = FowCrawler()
    
    # Test page 1 first
    print("="*50)
    print("Testing Page 1 (Ranks 1-50)")
    print("="*50)
    
    result = crawler.crawl_ranking_data(region='kr', page=1)
    
    if result and result.get('success'):
        data = result.get('data', [])
        print(f"✅ Page 1 Success: {len(data)} records found")
        print(f"URL used: {result.get('url_used')}")
        print(f"Rank range: {result.get('rank_range')}")
        
        if data:
            print("\nFirst 5 players:")
            for i, player in enumerate(data[:5]):
                print(f"  {i+1}. Rank {player['순위']}: {player['플레이어 이름']} ({player['티어']})")
            
            print("\nLast 5 players:")
            for i, player in enumerate(data[-5:]):
                print(f"  {len(data)-4+i}. Rank {player['순위']}: {player['플레이어 이름']} ({player['티어']})")
                
            # Check if ranks are sequential
            ranks = [int(player['순위']) for player in data if player['순위'].isdigit()]
            if ranks:
                print(f"\nRank analysis:")
                print(f"  Min rank: {min(ranks)}")
                print(f"  Max rank: {max(ranks)}")
                print(f"  Expected range: 1-50")
                print(f"  Sequential: {ranks == list(range(min(ranks), max(ranks) + 1))}")
    else:
        print(f"❌ Page 1 Failed: {result.get('error') if result else 'No result'}")
    
    print("\n" + "="*50)
    print("Testing Page 2 (Ranks 51-100)")
    print("="*50)
    
    result2 = crawler.crawl_ranking_data(region='kr', page=2)
    
    if result2 and result2.get('success'):
        data2 = result2.get('data', [])
        print(f"✅ Page 2 Success: {len(data2)} records found")
        print(f"URL used: {result2.get('url_used')}")
        print(f"Rank range: {result2.get('rank_range')}")
        
        if data2:
            print("\nFirst 5 players:")
            for i, player in enumerate(data2[:5]):
                print(f"  {i+1}. Rank {player['순위']}: {player['플레이어 이름']} ({player['티어']})")
            
            print("\nLast 5 players:")
            for i, player in enumerate(data2[-5:]):
                print(f"  {len(data2)-4+i}. Rank {player['순위']}: {player['플레이어 이름']} ({player['티어']})")
                
            # Check if ranks are sequential
            ranks2 = [int(player['순위']) for player in data2 if player['순위'].isdigit()]
            if ranks2:
                print(f"\nRank analysis:")
                print(f"  Min rank: {min(ranks2)}")
                print(f"  Max rank: {max(ranks2)}")
                print(f"  Expected range: 51-100")
                print(f"  Sequential: {ranks2 == list(range(min(ranks2), max(ranks2) + 1))}")
    else:
        print(f"❌ Page 2 Failed: {result2.get('error') if result2 else 'No result'}")

if __name__ == "__main__":
    test_crawler() 