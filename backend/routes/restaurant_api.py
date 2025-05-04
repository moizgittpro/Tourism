from fastapi import FastAPI,Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient

Client = MongoClient("mongodb://localhost:27017/")

db = Client['tourism']
collection = db['restaurants']


"""
    TODO:
        GET THE RESTAURENTS DATA FROM MONGODB tourism/restaurant
        GET RESTAURANT BY CITY
        GET USER INPUT AS CITY 
        RETURN JSON RESPONSE

    """

def get_restaurant_by_city(city):
    restaurants = collection.find({"city": city})
    return restaurants

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  
    allow_headers=["*"],
)

@app.post("/restaurant")
async def restaurant(request : Request):
    data = request.json()
    response = data["city"]

    output_response = get_restaurant_by_city(response)
    return JSONResponse(content=output_response)
