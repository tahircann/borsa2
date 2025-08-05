import requests
import re
import json

def get_web_data():
    try:
        # Get dashboard data
        dashboard_response = requests.get('http://localhost:8080/', timeout=10)
        dashboard_content = dashboard_response.text
        
        # Extract cash value
        cash_match = re.search(r'\$([0-9,]+\.[0-9]+)', dashboard_content)
        cash_value = float(cash_match.group(1).replace(',', '')) if cash_match else 0.0
        
        # Get positions data
        positions_response = requests.get('http://localhost:8080/positions', timeout=10)
        positions_content = positions_response.text
        
        # Extract JSON from script tag
        json_match = re.search(r'<pre[^>]*>(.*?)</pre>', positions_content, re.DOTALL)
        if json_match:
            positions_json = json_match.group(1).strip()
            positions_data = json.loads(positions_json)
        else:
            positions_data = []
        
        # Calculate summary
        total_market_value = sum(float(pos.get('marketValue', 0)) for pos in positions_data)
        total_unrealized_pnl = sum(float(pos.get('unrealizedPnl', 0)) for pos in positions_data)
        
        return {
            'cash': cash_value,
            'positions': positions_data,
            'total_market_value': total_market_value,
            'total_unrealized_pnl': total_unrealized_pnl,
            'net_liquidation': cash_value + total_market_value
        }
    except Exception as e:
        print("Web scraping error:", str(e))
        return None

if __name__ == "__main__":
    data = get_web_data()
    print(json.dumps(data, indent=2))
