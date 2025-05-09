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