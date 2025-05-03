import requests
import json

def search_flights():
    url = "https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights"

    querystring = {
        "fromId": "BOM.AIRPORT",
        "toId": "DEL.AIRPORT",
        "departDate": "2025-05-10",
        "stops": "none",
        "pageNo": "1",
        "adults": "1",
        "children": "0,17",
        "sort": "BEST",
        "cabinClass": "ECONOMY",
        "currency_code": "AED"
    }

    headers = {
        "x-rapidapi-host": "booking-com15.p.rapidapi.com",
        "x-rapidapi-key": "cec70aa7a0mshbd3bd064279c888p1e3adbjsn2c78c7925597"
    }

    response = requests.get(url, headers=headers, params=querystring)

    if response.status_code == 200:
        data = response.json()
        print("✅ Flights Found:\n")
        print(json.dumps(data, indent=2))  # ← print full JSON response

        # Check structure and adjust accordingly
    else:
        print("❌ Error:", response.status_code, response.text)

# Run it
search_flights()
