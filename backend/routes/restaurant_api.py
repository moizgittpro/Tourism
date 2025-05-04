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

        
    EXAMPLE OUTPUT ::

        _id     :  68161016efffecb8b140c675
        city    : "Islamabad"
        name    : "1969 Restaurant"
        address : "Garden Ave, Shakarpairan, 44000, Pakistan"
        rating  :  4.2
        types   : Array (4)  
        image   : "AeeoHcL4uxQOkOgtN28C4qU9xDIFYcdL057rcJZyGfVvOgiLBYVyV7cNuGDoC-radExhbP…"

    """

def get_restaurant_by_city(city):

    restaurants_cursor = collection.find({
       "city": { "$regex": f"^{city}$", "$options": "i" } ## ISLAMABAD , Islmamabad , islamabad ARE ALL GOOD
        })

    restaurants = []
    ## THE _id is in OBJECT NOT JSON FORMAT
    for res in restaurants_cursor:
        res["_id"] = str(res["_id"])
        restaurants.append(res)

    
    return restaurants

# print(get_restaurant_by_city("Islamabad")["image"][0])
print(get_restaurant_by_city("Islamabad")[0]) ## EXAMPLE OUTPUT::

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
    data = await request.json()
    response = data["city"]
    output_response = get_restaurant_by_city(response)
    return JSONResponse(content=output_response)


