from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from typing import Optional

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client['tourism']

# Valid collections list
COLLECTIONS = [
    "tourist_attraction",
    "zoo",
    "movie_theater",
    "museum",
    "park",
    "mosque",
    "shopping_mall",
    "church"
]

async def get_data(request: Request):
    try:
        # Parse request body
        data = await request.json()
        collection_name = data.get("collection")
        city = data.get("city")

        # Validate inputs
        if not collection_name or not city:
            return JSONResponse(
                status_code=400,
                content={"error": "Both collection and city are required"}
            )

        if collection_name not in COLLECTIONS:
            return JSONResponse(
                status_code=400,
                content={"error": f"Invalid collection: {collection_name}"}
            )

        # Get collection and query data
        collection = db[collection_name]
        query = {"city": {"$regex": f"^{city}$", "$options": "i"}}
        
        # Project only required fields
        projection = {
            "place_id": 1,
            "name": 1,
            "types": 1,
            "location": 1,
            "address": 1,
            "rating": 1,
            "user_ratings_total": 1,
            "open_now": 1,
            "photo_reference": 1,
            "icon": 1,
            "business_status": 1,
            "price_level": 1,
            "city": 1
        }

        # Find documents
        results = list(collection.find(query, projection))

        # Convert ObjectId to string
        for result in results:
            result["_id"] = str(result["_id"])

        return JSONResponse(content=results)

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Server error: {str(e)}"}
        )