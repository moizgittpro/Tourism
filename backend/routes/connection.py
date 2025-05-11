from pymongo import MongoClient
import redis

# MongoDB connection with pooling
mongo_client = MongoClient(
    "mongodb://localhost:27017/",
    maxPoolSize=100,
    minPoolSize=10,
    serverSelectionTimeoutMS=5000
)
mongo_db = mongo_client['tourism']
# Create collections with indexes
airbnb_collection = mongo_db["air_bnb"]
hotel_collection = mongo_db["hotel"]


def ensure_indexes():
    if "location_2dsphere" not in hotel_collection.index_information():
        hotel_collection.create_index([("location", "2dsphere")], name="location_2dsphere")
    if "location_2dsphere" not in airbnb_collection.index_information():
        airbnb_collection.create_index([("location", "2dsphere")], name="location_2dsphere")
    if "price_1" not in airbnb_collection.index_information():
        airbnb_collection.create_index([("price", 1)], name="price_1")
    if "price_1" not in hotel_collection.index_information():
        hotel_collection.create_index([("price", 1)], name="price_1")

    

# Redis connection with pooling
redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True,  # To get string responses
    socket_connect_timeout=5,
    socket_timeout=5,
    max_connections=50
)