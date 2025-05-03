import requests
import time
from dotenv import load_dotenv
import os
from store_restaurant import store_restaurant
from pymongo import MongoClient

# Load environment variables
load_dotenv()
google_places_api_key = os.getenv("google_places_api_key")

# MongoDB connection
client = MongoClient("mongodb://localhost:27017")
db = client['tourism']
collection = db['restaurants']

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
    
    restaurants_data = []
    while True:
        try:
            response = requests.get(url, params=params)
            data = response.json()

            if response.status_code == 200 and 'results' in data:
                print(f"Restaurants in {city_name}:\n")
                for place in data['results']:
                    restaurant_data = {
                        "city" : city_name,
                        "name": place.get('name', 'N/A'),
                        "address": place.get('formatted_address', 'N/A'),
                        "rating": place.get('rating', 'N/A'),
                        "types": place.get('types', 'N/A'),
                    }
                    restaurants_data.append(restaurant_data)

                # Check for the next page of results
                next_page_token = data.get('next_page_token', None)
                if next_page_token:
                    params['pagetoken'] = next_page_token  
                else:
                    break  # No more pages to fetch

                time.sleep(2)  # To avoid rate-limiting

            else:
                return {"status": "failure", "restaurants": None}

        except requests.exceptions.RequestException as e:
            print(f"Error fetching data for {city_name}: {e}")
            break  # Stop trying on error

    return {"status": "success", "restaurants": restaurants_data}


# Function to store restaurant data in MongoDB
def store_restaurant(restaurants_data):
    for restaurant_data in restaurants_data:
        collection.insert_one(restaurant_data)
        print(f"Stored: {restaurant_data['name']}")

# Main Loop to process each city
for city in cities:
    restaurant_data = search_restaurants_in_city(city)
    if restaurant_data['status'] == "success" and restaurant_data['restaurants'] is not None:
        store_restaurant(restaurants_data=restaurant_data['restaurants'])
        time.sleep(1)  # To avoid hitting API rate limits

# Close MongoDB connection
client.close()
