from flask import Flask, jsonify
import requests
import json
import re
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_web_interface_data(url):
    """Parse data from IBKR Gateway web interface"""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.text
        else:
            logger.error(f"Failed to fetch {url}: {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"Error fetching {url}: {e}")
        return None

def extract_positions_data():
    """Extract positions data from web interface"""
    html_content = parse_web_interface_data("http://145.223.80.133:8080/positions")
    if not html_content:
        return []
    
    # Extract JSON data from the HTML
    try:
        # Look for JSON data in pre tags
        start_marker = '<pre'
        end_marker = '</pre>'
        
        start_idx = html_content.find(start_marker)
        if start_idx != -1:
            start_idx = html_content.find('>', start_idx) + 1
            end_idx = html_content.find(end_marker, start_idx)
            if end_idx != -1:
                json_str = html_content[start_idx:end_idx]
                # Clean up HTML entities
                json_str = json_str.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&#34;', '"')
                positions = json.loads(json_str)
                return positions
        
        logger.error("Could not find JSON data in positions page")
        return []
    except Exception as e:
        logger.error(f"Error parsing positions data: {e}")
        return []

def extract_summary_data():
    """Extract account summary from web interface"""
    try:
        # Get dashboard content for basic metrics
        dashboard_content = parse_web_interface_data("http://145.223.80.133:8080/")
        if not dashboard_content:
            return {}
        
        summary_data = {}
        
        # Extract cash amount - look for dollar amounts
        cash_pattern = r'\$([0-9,]+\.?[0-9]*)'
        cash_matches = re.findall(cash_pattern, dashboard_content)
        if cash_matches:
            # Take the first significant cash amount
            for cash_str in cash_matches:
                try:
                    cash_value = float(cash_str.replace(',', ''))
                    if cash_value > 1:  # Ignore small amounts
                        summary_data['TotalCashValue'] = cash_value
                        break
                except:
                    continue
        
        return summary_data
    except Exception as e:
        logger.error(f"Error parsing summary data: {e}")
        return {}

@app.route('/api/positions')
def get_positions():
    """Get positions data"""
    logger.info("Fetching positions from web interface")
    positions = extract_positions_data()
    return jsonify(positions)

@app.route('/api/summary')
def get_summary():
    """Get account summary"""
    logger.info("Fetching summary from web interface")
    summary = extract_summary_data()
    return jsonify(summary)

@app.route('/api/allocation')
def get_allocation():
    """Get allocation data"""
    logger.info("Fetching allocation from positions data")
    positions = extract_positions_data()
    
    # Calculate allocation by sector
    sector_allocation = {}
    for position in positions:
        sector = position.get('sector', 'Unknown')
        if sector and sector != 'null' and sector != None:
            market_value = position.get('marketValue', 0)
            if sector in sector_allocation:
                sector_allocation[sector] += market_value
            else:
                sector_allocation[sector] = market_value
    
    # Convert to list format
    allocation_list = []
    for sector, value in sector_allocation.items():
        allocation_list.append({
            'sector': sector,
            'value': value
        })
    
    return jsonify(allocation_list)

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'source': 'web_interface'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081, debug=False)
