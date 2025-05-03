from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client['tourism']

collection = db['restaurants']


def store_restaurant(restaurants_data):
    client = MongoClient("mongodb://localhost:27017")
    db = client['tourism']

    collection = db['restaurants']
    for restaurant_data in restaurants_data:
        collection.insert_one(restaurant_data)
        print(f"Stored: {restaurant_data['name']}")