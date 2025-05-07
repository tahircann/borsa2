import requests, time, os, random, json, logging
from flask import Flask, render_template, request, redirect
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# disable warnings until you install a certificate
from requests.packages.urllib3.exceptions import InsecureRequestWarning
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

BASE_API_URL = "https://localhost:5055/v1/api"
ACCOUNT_ID = os.environ.get('IBKR_ACCOUNT_ID', '')

logger.info(f"Starting with ACCOUNT_ID: {ACCOUNT_ID}")
logger.info(f"BASE_API_URL: {BASE_API_URL}")

os.environ['PYTHONHTTPSVERIFY'] = '0'

app = Flask(__name__)

# Güvenli API istekleri için yardımcı fonksiyon
def safe_api_request(url, method='get', **kwargs):
    """API isteklerini güvenli şekilde yap ve hataları yönet"""
    try:
        logger.info(f"Making {method.upper()} request to: {url}")
        
        if method.lower() == 'get':
            response = requests.get(url, verify=False, **kwargs)
        elif method.lower() == 'post':
            response = requests.post(url, verify=False, **kwargs)
        elif method.lower() == 'delete':
            response = requests.delete(url, verify=False, **kwargs)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        # Yanıt durumunu kontrol et
        if response.status_code == 401:
            logger.warning(f"Unauthorized access to {url} - Status: 401")
            return None, "unauthorized"
        
        # Yanıt içeriğini kontrol et ve JSON'a dönüştür
        if response.content:
            try:
                return response.json(), None
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error for {url}: {e}")
                return None, "json_decode_error"
        else:
            logger.warning(f"Empty response from {url}")
            return None, "empty_response"
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error for {url}: {e}")
        return None, str(e)

@app.template_filter('ctime')
def timectime(s):
    return time.ctime(s/1000)

@app.template_filter('tojson')
def format_json(value, indent=None):
    """Convert a value to JSON with indentation option"""
    return json.dumps(value, indent=indent)

@app.route("/")
def dashboard():
    try:
        logger.info("Getting accounts...")
        
        # Güvenli API isteği yap
        accounts, error = safe_api_request(f"{BASE_API_URL}/portfolio/accounts")
        
        if error:
            # Yetkilendirme hatası
            if error == "unauthorized":
                return render_template("auth_required.html", message="Please log in to Interactive Brokers Gateway first.")
            # Diğer hatalar
            return render_template("error.html", error=f"Failed to get accounts: {error}")
            
        if not accounts:
            return render_template("auth_required.html", message="No accounts found. Please log in to Interactive Brokers Gateway.")
        
        logger.info(f"Accounts response: {accounts}")
        
        # Try the second account if available, otherwise use the first one
        account = accounts[1] if len(accounts) > 1 else accounts[0]
        logger.info(f"Using account: {account}")

        account_id = account["id"]
        logger.info(f"Getting summary for account {account_id}...")
        
        # Güvenli API isteği yap
        summary, error = safe_api_request(f"{BASE_API_URL}/portfolio/{account_id}/summary")
        
        if error:
            return render_template("error.html", error=f"Failed to get account summary: {error}")
            
        logger.info(f"Summary response: {json.dumps(summary, indent=2)}")
        
        # Process the summary data to extract cash values
        if isinstance(summary, dict):
            # Check for nested cash values in the response
            if 'settledcash' in summary and isinstance(summary['settledcash'], dict) and 'amount' in summary['settledcash']:
                summary['totalCashValue'] = float(summary['settledcash']['amount'])
            elif 'settledcash-s' in summary and isinstance(summary['settledcash-s'], dict) and 'amount' in summary['settledcash-s']:
                summary['totalCashValue'] = float(summary['settledcash-s']['amount'])
            # Check traditional format
            elif 'totalcashvalue' in summary and isinstance(summary['totalcashvalue'], dict) and 'amount' in summary['totalcashvalue']:
                summary['totalCashValue'] = float(summary['totalcashvalue']['amount'])
            elif 'totalCashValue' not in summary:
                logger.warning("Could not find cash value in summary response")
                if 'AvailableFunds' in summary:
                    summary['totalCashValue'] = summary['AvailableFunds']
                else:
                    summary['totalCashValue'] = 0
        else:
            logger.error(f"Unexpected summary format: {type(summary)}")
            summary = {'totalCashValue': 0}
        
        return render_template("dashboard.html", account=account, summary=summary)
        
    except Exception as e:
        logger.exception("Error in dashboard route")
        return render_template("error.html", error=str(e))


@app.route("/lookup")
def lookup():
    symbol = request.args.get('symbol', None)
    stocks = []

    if symbol is not None:
        stocks, error = safe_api_request(f"{BASE_API_URL}/iserver/secdef/search?symbol={symbol}&name=true")
        
        if error:
            return render_template("error.html", error=f"Failed to lookup symbol: {error}")

    return render_template("lookup.html", stocks=stocks or [])


@app.route("/contract/<contract_id>/<period>")
def contract(contract_id, period='5d', bar='1d'):
    data = {
        "conids": [
            contract_id
        ]
    }
    
    # Güvenli API isteği
    contract_data, error = safe_api_request(f"{BASE_API_URL}/trsrv/secdef", method='post', json=data)
    
    if error:
        return render_template("error.html", error=f"Failed to get contract details: {error}")
        
    if not contract_data or 'secdef' not in contract_data or not contract_data['secdef']:
        return render_template("error.html", error="Invalid contract data response")
        
    contract = contract_data['secdef'][0]

    # Güvenli API isteği
    price_history, error = safe_api_request(f"{BASE_API_URL}/iserver/marketdata/history?conid={contract_id}&period={period}&bar={bar}")
    
    if error:
        return render_template("error.html", error=f"Failed to get price history: {error}")

    return render_template("contract.html", price_history=price_history or {}, contract=contract)


@app.route("/orders")
def orders():
    try:
        # Güvenli API isteği
        accounts, error = safe_api_request(f"{BASE_API_URL}/portfolio/accounts")
        
        if error:
            if error == "unauthorized":
                return render_template("auth_required.html", message="Please log in to Interactive Brokers Gateway first to view orders.")
            return render_template("error.html", error=f"Failed to get accounts: {error}")
        
        if not accounts:
            return render_template("auth_required.html", message="No accounts found. Please log in to Interactive Brokers Gateway.")
        
        # Güvenli API isteği
        response_data, error = safe_api_request(f"{BASE_API_URL}/iserver/account/orders")
        
        if error:
            if error == "json_decode_error" or error == "empty_response":
                # API bazen boş bir yanıt döndürebilir, bu durumda boş bir liste kullan
                logger.warning("Empty or invalid orders response, using empty list")
                response_data = []
            else:
                return render_template("error.html", error=f"Failed to get orders: {error}")
        
        # Yanıt içeriğini logla
        logger.info(f"Orders API response: {response_data}")
        
        # 'orders' anahtarı var mı kontrol et, yoksa boş liste kullan
        orders = []
        if isinstance(response_data, dict) and 'orders' in response_data:
            orders = response_data['orders']
        elif isinstance(response_data, list):
            # Bazı durumlarda API doğrudan emirleri liste olarak döndürebilir
            orders = response_data
        
        return render_template("orders.html", orders=orders)
    except Exception as e:
        logger.exception("Error fetching orders")
        return render_template("error.html", error=str(e))


@app.route("/order", methods=['POST'])
def place_order():
    try:
        print("== placing order ==")

        # Güvenli API isteği
        accounts, error = safe_api_request(f"{BASE_API_URL}/portfolio/accounts")
        
        if error:
            return render_template("error.html", error=f"Failed to get accounts: {error}")
        
        if not accounts:
            return render_template("auth_required.html", message="No accounts found. Please log in to Interactive Brokers Gateway.")
        
        # Try the second account if available, otherwise use the first one
        account = accounts[1] if len(accounts) > 1 else accounts[0]
        account_id = account["id"]

        data = {
            "orders": [
                {
                    "conid": int(request.form.get('contract_id')),
                    "orderType": "LMT",
                    "price": float(request.form.get('price')),
                    "quantity": int(request.form.get('quantity')),
                    "side": request.form.get('side'),
                    "tif": "GTC"
                }
            ]
        }

        # Güvenli API isteği
        result, error = safe_api_request(f"{BASE_API_URL}/iserver/account/{account_id}/orders", method='post', json=data)
        
        if error:
            return render_template("error.html", error=f"Failed to place order: {error}")

        return redirect("/orders")
    except Exception as e:
        logger.exception("Error placing order")
        return render_template("error.html", error=f"Error placing order: {str(e)}")

@app.route("/orders/<order_id>/cancel")
def cancel_order(order_id):
    try:
        # Güvenli API isteği
        accounts, error = safe_api_request(f"{BASE_API_URL}/portfolio/accounts")
        
        if error:
            return render_template("error.html", error=f"Failed to get accounts: {error}")
        
        if not accounts:
            return render_template("auth_required.html", message="No accounts found. Please log in to Interactive Brokers Gateway.")
        
        # Try the second account if available, otherwise use the first one
        account = accounts[1] if len(accounts) > 1 else accounts[0]
        account_id = account["id"]
        
        cancel_url = f"{BASE_API_URL}/iserver/account/{account_id}/order/{order_id}" 
        
        # Güvenli API isteği
        result, error = safe_api_request(cancel_url, method='delete')
        
        if error:
            return render_template("error.html", error=f"Failed to cancel order: {error}")

        return redirect("/orders")
    except Exception as e:
        logger.exception("Error canceling order")
        return render_template("error.html", error=f"Error canceling order: {str(e)}")


@app.route("/portfolio")
def portfolio():
    try:
        # Güvenli API isteği
        accounts, error = safe_api_request(f"{BASE_API_URL}/portfolio/accounts")
        
        if error:
            if error == "unauthorized":
                return render_template("auth_required.html", message="Please log in to Interactive Brokers Gateway first to view portfolio.")
            return render_template("error.html", error=f"Failed to get accounts: {error}")
        
        if not accounts:
            return render_template("auth_required.html", message="No accounts found. Please log in to Interactive Brokers Gateway.")
        
        # Try the second account if available, otherwise use the first one
        account = accounts[1] if len(accounts) > 1 else accounts[0]
        account_id = account["id"]
        
        # Güvenli API isteği
        positions, error = safe_api_request(f"{BASE_API_URL}/portfolio/{account_id}/positions/0")
        
        if error:
            if error == "unauthorized":
                return render_template("auth_required.html", message="Authentication error. Please log in to Interactive Brokers Gateway.")
            return render_template("error.html", error=f"Failed to get positions: {error}")

        # return my positions, how much cash i have in this account
        return render_template("portfolio.html", positions=positions or [])
    except Exception as e:
        logger.exception("Error in portfolio route")
        return render_template("error.html", error=f"Error retrieving portfolio: {str(e)}")

@app.route("/watchlists")
def watchlists():
    try:
        # Güvenli API isteği
        watchlist_response, error = safe_api_request(f"{BASE_API_URL}/iserver/watchlists")
        
        if error:
            if error == "unauthorized":
                return render_template("auth_required.html", message="Please log in to Interactive Brokers Gateway first to view watchlists.")
            return render_template("error.html", error=f"Failed to get watchlists: {error}")
            
        if not watchlist_response or 'data' not in watchlist_response:
            return render_template("error.html", error="Invalid watchlists response format")

        watchlist_data = watchlist_response["data"]
        watchlists = []
        if "user_lists" in watchlist_data:
            watchlists = watchlist_data["user_lists"]
            
        return render_template("watchlists.html", watchlists=watchlists)
    except Exception as e:
        logger.exception("Error in watchlists route")
        return render_template("error.html", error=f"Error retrieving watchlists: {str(e)}")


@app.route("/watchlists/<int:id>")
def watchlist_detail(id):
    try:
        # Güvenli API isteği
        watchlist, error = safe_api_request(f"{BASE_API_URL}/iserver/watchlist?id={id}")
        
        if error:
            return render_template("error.html", error=f"Failed to get watchlist details: {error}")

        return render_template("watchlist.html", watchlist=watchlist or {})
    except Exception as e:
        logger.exception("Error in watchlist_detail route")
        return render_template("error.html", error=f"Error retrieving watchlist details: {str(e)}")


@app.route("/watchlists/<int:id>/delete")
def watchlist_delete(id):
    try:
        # Güvenli API isteği
        result, error = safe_api_request(f"{BASE_API_URL}/iserver/watchlist?id={id}", method='delete')
        
        if error:
            return render_template("error.html", error=f"Failed to delete watchlist: {error}")

        return redirect("/watchlists")
    except Exception as e:
        logger.exception("Error in watchlist_delete route")
        return render_template("error.html", error=f"Error deleting watchlist: {str(e)}")

@app.route("/watchlists/create", methods=['POST'])
def create_watchlist():
    try:
        data = request.get_json()
        name = data['name']

        rows = []
        symbols = data['symbols'].split(",")
        
        # Her sembol için güvenli API isteği
        for symbol in symbols:
            symbol = symbol.strip()
            if symbol:
                contract_response, error = safe_api_request(f"{BASE_API_URL}/iserver/secdef/search?symbol={symbol}&name=true&secType=STK")
                
                if error:
                    return render_template("error.html", error=f"Failed to get contract ID for {symbol}: {error}")
                    
                if not contract_response or not contract_response[0] or 'conid' not in contract_response[0]:
                    return render_template("error.html", error=f"Invalid contract response for {symbol}")
                    
                contract_id = contract_response[0]['conid']
                rows.append({"C": contract_id})

        watchlist_data = {
            "id": int(time.time()),
            "name": name,
            "rows": rows
        }

        # Güvenli API isteği
        result, error = safe_api_request(f"{BASE_API_URL}/iserver/watchlist", method='post', json=watchlist_data)
        
        if error:
            return render_template("error.html", error=f"Failed to create watchlist: {error}")

        return redirect("/watchlists")
    except Exception as e:
        logger.exception("Error in create_watchlist route")
        return render_template("error.html", error=f"Error creating watchlist: {str(e)}")

@app.route("/scanner")
def scanner():
    try:
        # Güvenli API isteği
        params_response, error = safe_api_request(f"{BASE_API_URL}/iserver/scanner/params")
        
        if error:
            if error == "unauthorized":
                return render_template("auth_required.html", message="Please log in to Interactive Brokers Gateway first to use scanner.")
            return render_template("error.html", error=f"Failed to get scanner parameters: {error}")
            
        params = params_response

        scanner_map = {}
        filter_map = {}

        for item in params['instrument_list']:
            scanner_map[item['type']] = {
                "display_name": item['display_name'],
                "filters": item['filters'],
                "sorts": []
            }

        for item in params['filter_list']:
            filter_map[item['group']] = {
                "display_name": item['display_name'],
                "type": item['type'],
                "code": item['code']
            }

        for item in params['scan_type_list']:
            for instrument in item['instruments']:
                scanner_map[instrument]['sorts'].append({
                    "name": item['display_name'],
                    "code": item['code']
                })

        for item in params['location_tree']:
            scanner_map[item['type']]['locations'] = item['locations']


        submitted = request.args.get("submitted", "")
        selected_instrument = request.args.get("instrument", "")
        location = request.args.get("location", "")
        sort = request.args.get("sort", "")
        scan_results = []
        filter_code = request.args.get("filter", "")
        filter_value = request.args.get("filter_value", "")

        if submitted:
            data = {
                "instrument": selected_instrument,
                "location": location,
                "type": sort,
                "filter": [
                    {
                        "code": filter_code,
                        "value": filter_value
                    }
                ]
            }
                
            # Güvenli API isteği
            scan_response, error = safe_api_request(f"{BASE_API_URL}/iserver/scanner/run", method='post', json=data)
            
            if error:
                return render_template("error.html", error=f"Failed to run scanner: {error}")
                
            scan_results = scan_response

        return render_template("scanner.html", params=params, scanner_map=scanner_map, filter_map=filter_map, scan_results=scan_results or [])
    except Exception as e:
        logger.exception("Error in scanner route")
        return render_template("error.html", error=f"Error using scanner: {str(e)}")

# Yetkilendirme sayfası
@app.route("/auth")
def auth():
    return render_template("auth_required.html", message="Please log in to Interactive Brokers Gateway at https://localhost:5055")

# Hata sayfası
@app.route("/error")
def error():
    error_message = request.args.get('message', 'An unknown error occurred')
    return render_template("error.html", error=error_message)

# Performans bilgileri
@app.route("/performance")
def performance():
    try:
        period = request.args.get('period', '1m')
        
        # Hesapları kontrol et
        accounts, error = safe_api_request(f"{BASE_API_URL}/portfolio/accounts")
        
        if error:
            if error == "unauthorized":
                return render_template("auth_required.html", message="Please log in to Interactive Brokers Gateway first to view performance.")
            return render_template("error.html", error=f"Failed to get accounts: {error}")
        
        if not accounts:
            return render_template("auth_required.html", message="No accounts found. Please log in to Interactive Brokers Gateway.")
        
        # Try the second account if available, otherwise use the first one
        account = accounts[1] if len(accounts) > 1 else accounts[0]
        account_id = account["id"]
        
        # Period mapping for API
        period_map = {
            '1d': '1D',
            '1w': '1W',
            '1m': '1M',
            '3m': '3M',
            '6m': '6M',
            '1y': '1Y',
            'all': 'YTD'
        }
        
        api_period = period_map.get(period, '1M')  # Default to monthly if period not recognized
        
        # New performance API endpoint
        request_url = f"{BASE_API_URL}/pa/performance"
        
        # Prepare request JSON payload
        json_content = {
            "acctIds": [account_id],
            "period": api_period
        }
        
        # Make POST request to get performance data
        logger.info(f"Getting performance data from {request_url} with payload: {json_content}")
        performance_data, error = safe_api_request(request_url, method='post', json=json_content)
        
        if error:
            logger.error(f"Failed to get performance data: {error}")
            # Return mock data as fallback
            return json.dumps(generate_mock_performance_data(period, 10000))
        
        logger.info(f"Performance data response: {json.dumps(performance_data, indent=2)}")
        
        # Process the performance data
        processed_data = {
            "data": [],
            "startValue": 0,
            "endValue": 0,
            "percentChange": 0
        }
        
        # Check if we have valid nav data
        if (isinstance(performance_data, dict) and 'nav' in performance_data and 
            'data' in performance_data['nav'] and performance_data['nav']['data'] and
            'dates' in performance_data['nav'] and performance_data['nav']['dates']):
            
            nav_data = performance_data['nav']['data'][0]
            dates = performance_data['nav']['dates']
            navs = nav_data.get('navs', [])
            
            # Create data points from dates and navs
            for i, (date, nav) in enumerate(zip(dates, navs)):
                processed_data['data'].append({
                    "date": date,
                    "value": float(nav)
                })
            
            # Set start and end values
            if processed_data['data']:
                processed_data['startValue'] = processed_data['data'][0]['value']
                processed_data['endValue'] = processed_data['data'][-1]['value']
                
                # Calculate percent change
                if processed_data['startValue'] > 0:
                    processed_data['percentChange'] = round(
                        ((processed_data['endValue'] - processed_data['startValue']) / 
                         processed_data['startValue']) * 100, 
                        2
                    )
                
                # Add percentage returns if available
                if 'cps' in performance_data and 'data' in performance_data['cps'] and performance_data['cps']['data']:
                    returns = performance_data['cps']['data'][0].get('returns', [])
                    for i, ret in enumerate(returns):
                        if i < len(processed_data['data']):
                            processed_data['data'][i]['return'] = float(ret)
        else:
            logger.warning("Invalid performance data response format, using mock data")
            return json.dumps(generate_mock_performance_data(period, 10000))
        
        return json.dumps(processed_data)
    except Exception as e:
        logger.exception("Error in performance route")
        return json.dumps({
            "error": str(e),
            "data": [],
            "startValue": 0,
            "endValue": 0,
            "percentChange": 0
        })

def generate_mock_performance_data(period, current_value):
    """Generate mock performance data for a given period and current value"""
    # Current date
    today_date = datetime.now().strftime("%Y-%m-%d")
    
    # Determine number of days based on period
    days = 30
    match period:
        case '1d': days = 1
        case '1w': days = 7
        case '1m': days = 30
        case '3m': days = 90
        case '6m': days = 180
        case '1y': days = 365
        case 'all': days = 730
    
    # Create sample portfolio growth
    start_value = current_value * 0.9  # 10% less than current
    
    # Generate mock data points
    mock_data = []
    for i in range(days):
        # Calculate date by subtracting days
        date = datetime.now() - timedelta(days=(days-i-1))
        date_str = date.strftime("%Y-%m-%d")
        
        # Create value based on progress with a small fluctuation
        progress = i / (days - 1) if days > 1 else 1
        fluctuation = 1 + (random.random() - 0.5) * 0.02  # ±1% random fluctuation
        value = start_value + (current_value - start_value) * progress * fluctuation
        
        mock_data.append({
            "date": date_str,
            "value": round(value, 2)
        })
    
    # Make sure last value is exactly the current value
    if mock_data:
        mock_data[-1]["date"] = today_date
        mock_data[-1]["value"] = current_value
    
    return {
        "data": mock_data,
        "startValue": round(start_value, 2),
        "endValue": current_value,
        "percentChange": round(((current_value - start_value) / start_value) * 100, 2),
        "source": "mock_data",
        "system_date": today_date
    }

@app.route("/summary")
def account_summary():
    try:
        # Get accounts
        accounts, error = safe_api_request(f"{BASE_API_URL}/portfolio/accounts")
        
        if error:
            if error == "unauthorized":
                return render_template("auth_required.html", message="Please log in to Interactive Brokers Gateway first to view account summary.")
            return render_template("error.html", error=f"Failed to get accounts: {error}")
        
        if not accounts:
            return render_template("auth_required.html", message="No accounts found. Please log in to Interactive Brokers Gateway.")
        
        # Try the second account if available, otherwise use the first one
        account = accounts[1] if len(accounts) > 1 else accounts[0]
        account_id = account["id"]
        
        # Fetch account summary from IBKR API
        summary_data, error = safe_api_request(f"{BASE_API_URL}/portfolio/{account_id}/summary")
        
        if error:
            return render_template("error.html", error=f"Failed to get account summary: {error}")
            
        logger.info(f"Summary data response: {json.dumps(summary_data, indent=2)}")
        
        # Process the summary data to organized format
        processed_summary = {
            "account_info": {},
            "balance_info": {},
            "security_values": {},
            "commodity_values": {}
        }
        
        # Categorize the summary items
        for key, value in summary_data.items():
            if key.endswith("-c"):
                # Commodity values
                base_key = key[:-2]
                processed_summary["commodity_values"][base_key] = value
            elif key.endswith("-s"):
                # Security values
                base_key = key[:-2]
                processed_summary["security_values"][base_key] = value
            elif "cash" in key or "value" in key or "margin" in key or "fund" in key:
                # Balance related info
                processed_summary["balance_info"][key] = value
            else:
                # Other account info
                processed_summary["account_info"][key] = value
        
        return render_template("summary.html", summary=summary_data, processed=processed_summary, account=account)
    except Exception as e:
        logger.exception("Error in account summary route")
        return render_template("error.html", error=f"Error retrieving account summary: {str(e)}")

@app.route("/ledger")
def portfolio_ledger():
    try:
        # Get accounts
        accounts, error = safe_api_request(f"{BASE_API_URL}/portfolio/accounts")
        
        if error:
            if error == "unauthorized":
                return render_template("auth_required.html", message="Please log in to Interactive Brokers Gateway first to view ledger information.")
            return render_template("error.html", error=f"Failed to get accounts: {error}")
        
        if not accounts:
            return render_template("auth_required.html", message="No accounts found. Please log in to Interactive Brokers Gateway.")
        
        # Try the second account if available, otherwise use the first one
        account = accounts[1] if len(accounts) > 1 else accounts[0]
        account_id = account["id"]
        
        # Fetch ledger data from IBKR API
        ledger_data, error = safe_api_request(f"{BASE_API_URL}/portfolio/{account_id}/ledger")
        
        if error:
            return render_template("error.html", error=f"Failed to get ledger data: {error}")
            
        logger.info(f"Ledger data response: {json.dumps(ledger_data, indent=2)}")
        
        return render_template("ledger.html", ledger=ledger_data, account=account)
    except Exception as e:
        logger.exception("Error in portfolio ledger route")
        return render_template("error.html", error=f"Error retrieving portfolio ledger: {str(e)}")

@app.route("/positions")
def positions():
    try:
        # Get accounts
        accounts, error = safe_api_request(f"{BASE_API_URL}/portfolio/accounts")
        
        if error:
            if error == "unauthorized":
                return render_template("auth_required.html", message="Please log in to Interactive Brokers Gateway first to view positions.")
            return render_template("error.html", error=f"Failed to get accounts: {error}")
        
        if not accounts:
            return render_template("auth_required.html", message="No accounts found. Please log in to Interactive Brokers Gateway.")
        
        # Try the second account if available, otherwise use the first one
        account = accounts[1] if len(accounts) > 1 else accounts[0]
        account_id = account["id"]
        
        # Fetch positions data from IBKR API using portfolio2 endpoint
        # Sort by position and display in ascending order
        positions_data, error = safe_api_request(f"{BASE_API_URL}/portfolio2/{account_id}/positions?direction=a&sort=position")
        
        if error:
            return render_template("error.html", error=f"Failed to get positions data: {error}")
            
        logger.info(f"Positions data response: {json.dumps(positions_data, indent=2)}")
        
        # Process positions data
        positions_list = []
        total_market_value = 0
        total_cost_basis = 0
        total_unrealized_pnl = 0
        
        # Check if positions_data is a list of positions or a single position object
        if isinstance(positions_data, list):
            positions_list = positions_data
        elif isinstance(positions_data, dict) and 'conid' in positions_data:
            # Single position returned as an object
            positions_list = [positions_data]
        
        # Calculate totals
        for position in positions_list:
            if 'marketValue' in position:
                total_market_value += float(position.get('marketValue', 0))
            
            if 'avgCost' in position and 'position' in position:
                position_cost = float(position.get('avgCost', 0)) * float(position.get('position', 0))
                total_cost_basis += position_cost
            
            if 'unrealizedPnl' in position:
                total_unrealized_pnl += float(position.get('unrealizedPnl', 0))
        
        # Prepare summary data
        summary = {
            'totalMarketValue': total_market_value,
            'totalCostBasis': total_cost_basis,
            'totalUnrealizedPnl': total_unrealized_pnl,
            'totalPositions': len(positions_list)
        }
        
        return render_template("positions.html", positions=positions_list, account=account, summary=summary)
    except Exception as e:
        logger.exception("Error in positions route")
        return render_template("error.html", error=f"Error retrieving positions: {str(e)}")

@app.route("/allocation")
def portfolio_allocation():
    try:
        # Get accounts
        accounts, error = safe_api_request(f"{BASE_API_URL}/portfolio/accounts")
        
        if error:
            if error == "unauthorized":
                return render_template("auth_required.html", message="Please log in to Interactive Brokers Gateway first to view portfolio allocation.")
            return render_template("error.html", error=f"Failed to get accounts: {error}")
        
        if not accounts:
            return render_template("auth_required.html", message="No accounts found. Please log in to Interactive Brokers Gateway.")
        
        # Try the second account if available, otherwise use the first one
        account = accounts[1] if len(accounts) > 1 else accounts[0]
        account_id = account["id"]
        
        # Fetch allocation data from IBKR API
        allocation_data, error = safe_api_request(f"{BASE_API_URL}/portfolio/{account_id}/allocation")
        
        if error:
            return render_template("error.html", error=f"Failed to get allocation data: {error}")
            
        logger.info(f"Allocation data response: {json.dumps(allocation_data, indent=2)}")
        
        # Process allocation data for visualization
        # Extract asset class data
        asset_class_data = {
            'labels': [],
            'long_values': [],
            'short_values': [],
            'total_long': 0,
            'total_short': 0
        }
        
        if 'assetClass' in allocation_data:
            # Process long positions
            if 'long' in allocation_data['assetClass']:
                for asset_class, value in allocation_data['assetClass']['long'].items():
                    asset_class_data['labels'].append(asset_class)
                    asset_class_data['long_values'].append(float(value))
                    asset_class_data['total_long'] += float(value)
                    
            # Process short positions
            if 'short' in allocation_data['assetClass']:
                # For short positions, ensure we have matching labels with longs
                for asset_class, value in allocation_data['assetClass']['short'].items():
                    if asset_class not in asset_class_data['labels']:
                        asset_class_data['labels'].append(asset_class)
                        # Add 0 for long position if this asset class doesn't exist there
                        asset_class_data['long_values'].append(0)
                    
                    # Find the index of this asset class
                    idx = asset_class_data['labels'].index(asset_class)
                    
                    # Extend short_values list if needed
                    while len(asset_class_data['short_values']) <= idx:
                        asset_class_data['short_values'].append(0)
                    
                    # Set the short value (convert to positive for visualization)
                    asset_class_data['short_values'][idx] = abs(float(value))
                    asset_class_data['total_short'] += abs(float(value))
        
        # Extract sector data
        sector_data = {
            'labels': [],
            'long_values': [],
            'short_values': [],
            'total_long': 0,
            'total_short': 0
        }
        
        if 'sector' in allocation_data:
            # Process long positions
            if 'long' in allocation_data['sector']:
                for sector, value in allocation_data['sector']['long'].items():
                    sector_data['labels'].append(sector)
                    sector_data['long_values'].append(float(value))
                    sector_data['total_long'] += float(value)
                    
            # Process short positions
            if 'short' in allocation_data['sector']:
                # For short positions, ensure we have matching labels with longs
                for sector, value in allocation_data['sector']['short'].items():
                    if sector not in sector_data['labels']:
                        sector_data['labels'].append(sector)
                        # Add 0 for long position if this sector doesn't exist there
                        sector_data['long_values'].append(0)
                    
                    # Find the index of this sector
                    idx = sector_data['labels'].index(sector)
                    
                    # Extend short_values list if needed
                    while len(sector_data['short_values']) <= idx:
                        sector_data['short_values'].append(0)
                    
                    # Set the short value (convert to positive for visualization)
                    sector_data['short_values'][idx] = abs(float(value))
                    sector_data['total_short'] += abs(float(value))
        
        # Extract group data
        group_data = {
            'labels': [],
            'long_values': [],
            'short_values': [],
            'total_long': 0,
            'total_short': 0
        }
        
        if 'group' in allocation_data:
            # Process long positions
            if 'long' in allocation_data['group']:
                for group, value in allocation_data['group']['long'].items():
                    group_data['labels'].append(group)
                    group_data['long_values'].append(float(value))
                    group_data['total_long'] += float(value)
                    
            # Process short positions
            if 'short' in allocation_data['group']:
                # For short positions, ensure we have matching labels with longs
                for group, value in allocation_data['group']['short'].items():
                    if group not in group_data['labels']:
                        group_data['labels'].append(group)
                        # Add 0 for long position if this group doesn't exist there
                        group_data['long_values'].append(0)
                    
                    # Find the index of this group
                    idx = group_data['labels'].index(group)
                    
                    # Extend short_values list if needed
                    while len(group_data['short_values']) <= idx:
                        group_data['short_values'].append(0)
                    
                    # Set the short value (convert to positive for visualization)
                    group_data['short_values'][idx] = abs(float(value))
                    group_data['total_short'] += abs(float(value))
        
        return render_template(
            "allocation.html", 
            allocation=allocation_data,
            asset_class_data=asset_class_data,
            sector_data=sector_data,
            group_data=group_data,
            account=account
        )
    except Exception as e:
        logger.exception("Error in portfolio allocation route")
        return render_template("error.html", error=f"Error retrieving portfolio allocation: {str(e)}")

@app.route("/real-market")
def real_market():
    try:
        # Get query parameters for contract IDs and fields
        conids = request.args.get('conids', '265598,8314')  # Default contracts if none provided
        fields = request.args.get('fields', '31,84,86')     # Default fields if none provided
        
        # Fetch market data snapshot from IBKR API
        market_data_url = f"{BASE_API_URL}/iserver/marketdata/snapshot?conids={conids}&fields={fields}"
        
        # Güvenli API isteği
        market_data, error = safe_api_request(market_data_url)
        
        if error:
            if error == "unauthorized":
                return render_template("auth_required.html", message="Please log in to Interactive Brokers Gateway first to view market data.")
            return render_template("error.html", error=f"Failed to get market data: {error}")
        
        logger.info(f"Market data response: {json.dumps(market_data, indent=2)}")
        
        # Field descriptions for better readability
        field_descriptions = {
            '31': 'Last Price',
            '84': 'Bid Price', 
            '86': 'Ask Price',
            '85': 'Bid Size',
            '87': 'Ask Size',
            '7295': 'Open',
            '7296': 'High',
            '7297': 'Low',
            '7999': 'Close',
            '6119': 'Server ID'
        }
        
        # Return the market data with the field descriptions
        return render_template("real_market.html", 
                              market_data=market_data, 
                              field_descriptions=field_descriptions,
                              conids=conids,
                              fields=fields)
    except Exception as e:
        logger.exception("Error in real-market route")
        return render_template("error.html", error=f"Error retrieving market data: {str(e)}")
