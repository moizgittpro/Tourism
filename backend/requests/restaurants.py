import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the Google Places API key from environment variables
google_places_api_key = os.getenv("google_places_api_key")

# Check if the API key is loaded correctly
if not google_places_api_key:
    print("Google Places API key not found! Please check your .env file.")
    exit()

# Function to search restaurants in a city
def search_restaurants_in_city(city_name):
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    
    # Parameters for the API request
    params = {
        'query': f'restaurants in {city_name}',  # Search term, i.e., "restaurants in Islamabad"
        'key': google_places_api_key,  # API key
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
            place_id = place.get('place_id', None)
            
            # Optionally: Fetch more details for each restaurant by place_id (get more details)
            if place_id:
                get_place_details(place_id)

            print(f"Name: {name}")
            print(f"Address: {address}")
            print(f"Rating: {rating}")
            print("-" * 30)
    else:
        print(f"No results found for restaurants in {city_name}, or an error occurred.")

# Function to get more detailed information for a restaurant
def get_place_details(place_id):
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    
    # Parameters for the API request
    params = {
        'place_id': place_id,  # Place ID from the previous search
        'key': google_places_api_key,  # API key
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if response.status_code == 200:
        place_details = data.get('result', {})
        name = place_details.get('name', 'N/A')
        address = place_details.get('formatted_address', 'N/A')
        phone_number = place_details.get('formatted_phone_number', 'N/A')
        website = place_details.get('website', 'N/A')
        
        print(f"Detailed Information for {name}:")
        print(f"Phone Number: {phone_number}")
        print(f"Website: {website}")
        print("-" * 30)
    else:
        print(f"Failed to get details for place ID: {place_id}")

# Example: search for restaurants in Islamabad
search_restaurants_in_city("Islamabad")
