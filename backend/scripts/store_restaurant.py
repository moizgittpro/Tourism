from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client['tourism']

collection = db['restaurants']


def store_restaurant(restaurants_data):
    for restaurant_data in restaurants_data:
        collection.insertOne(restaurant_data)