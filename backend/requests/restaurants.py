import requests
from dotenv import load_dotenv
import os 

load_dotenv()

google_places_api_key = os.getenv("google_places_api_key")

def search_restaurants_in_islamabad():
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    
    # Define parameters for the API request
    params = {
        'query': 'restaurants in Islamabad',
        'location': '33.6844,73.0479',  
        'radius': 5,  # Search within 5km radius
        'key': 'google_places_api_key' 
    }
    
    # Make the request to the Google Places API
    response = requests.get(url, params=params)
    
    # Parse the response JSON
    data = response.json()

    if response.status_code == 200 and 'results' in data:
        print("Restaurants in Islamabad:\n")
        for place in data['results']:
            print(f"Name: {place['name']}")
            print(f"Address: {place['formatted_address']}")
            print(f"Rating: {place.get('rating', 'N/A')}")
            print("-" * 30)
    else:
        print("No results found or an error occurred.")

# Run the function to search restaurants in Islamabad
search_restaurants_in_islamabad()
