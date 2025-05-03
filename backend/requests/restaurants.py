from dotenv import load_dotenv
import os 

load_dotenv()

google_places_api_key = os.getenv("google_places_api_key")

import requests

def search_restaurants_in_city(city_name):
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    
    # Parameters for the API request
    params = {
        'query': f'restaurants in {city_name}',  # Search term, i.e., "restaurants in Islamabad"
        'key': google_places_api_key, 
    }
    
    # Make the request to Google Places API
    response = requests.get(url, params=params)
    
    # Parse the response JSON
    data = response.json()

    if response.status_code == 200 and 'results' in data:
        print(f"Restaurants in {city_name}:\n")
        for place in data['results']:
            # Check if the place contains necessary info and display it
            name = place.get('name', 'N/A')
            address = place.get('formatted_address', 'N/A')
            rating = place.get('rating', 'N/A')
            
            print(f"Name: {name}")
            print(f"Address: {address}")
            print(f"Rating: {rating}")
            print("-" * 30)
    else:
        print(f"No results found for restaurants in {city_name}, or an error occurred.")

# Example: search for restaurants in Islamabad
search_restaurants_in_city("quetta")
