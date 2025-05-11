from pymongo import MongoClient
from upstash_redis import Redis


from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Print MONGO_URL and REDIS_URL to ensure they are being loaded correctly
MONGO_URL = os.getenv('MONGO_URL')
REDIS_URL = os.getenv('REDIS_URL')
# MongoDB connection
mongo_client = MongoClient(MONGO_URL, maxPoolSize=100, minPoolSize=10, serverSelectionTimeoutMS=5000)
mongo_db = mongo_client['tourism']

# Redis connection with pooling
if not REDIS_URL:
    raise ValueError("REDIS_URL is not set in your environment variables")

redis_client =Redis(url="https://welcome-zebra-29045.upstash.io", token="AXF1AAIjcDE0OTFiNTVkNjE5MzY0NTVhYjExODg0MTY5YWZmMTg2ZnAxMA")


