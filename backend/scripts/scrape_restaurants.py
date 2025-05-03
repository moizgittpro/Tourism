import requests
import time
from dotenv import load_dotenv
import os
from store_restaurant import store_restaurant

# Load environment variables
load_dotenv()
google_places_api_key = os.getenv("google_places_api_key")


cities = [
    "Islamabad", "Karachi", "Lahore", "Peshawar", "Quetta", 
    "Multan", "Faisalabad", "Rawalpindi", "Sialkot", "Sukkur", 
    "Gujranwala", "Mardan", "Abbottabad", "Dera Ghazi Khan", 
    "Bahawalpur", "Sargodha", "Muzaffargarh", "Mirpur Khas", 
    "Hyderabad", "Bannu", "Chiniot", "Kotli", "Skardu", 
    "Gilgit", "Mingora", "Turbat", "Zhob", "Chakwal", 
    "Larkana", "Jhelum", "Gujrat", "Kasur", "Okara"
]

# Function to search for restaurants in a specific city
def search_restaurants_in_city(city_name):
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    
    # Parameters for the API request
    params = {
        'query': f'restaurants in {city_name}', 
        'key': google_places_api_key, 
    }
    
    while True:
        
        response = requests.get(url, params=params)
        data = response.json()

        if response.status_code == 200 and 'results' in data:
            print(f"Restaurants in {city_name}:\n")
            for place in data['results']:
                name = place.get('name', 'N/A')
                address = place.get('formatted_address', 'N/A')
                rating = place.get('rating', 'N/A')
                
                print(f"Name: {name}")
                print(f"Address: {address}")
                print(f"Rating: {rating}")
                print("-" * 30)

            # Check if there's a next page
            next_page_token = data.get('next_page_token', None)
            if next_page_token:
                params['pagetoken'] = next_page_token  
            else:
                break  # No more pages to fetch
        else:
            print(f"Error fetching restaurants for {city_name}.")
            break


for city in cities:
    search_restaurants_in_city(city)
    time.sleep(1)  # To avoid hitting API rate limits,
