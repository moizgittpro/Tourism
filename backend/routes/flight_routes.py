from fast_flights import FlightData, Passengers, Result, get_flights
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
from routes.connection import mongo_db, redis_client


# app = FastAPI()


# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"], 
#     allow_credentials=True,
#     allow_methods=["GET", "POST", "OPTIONS"],  
#     allow_headers=["*"],
# )

async def options_flight():
    return JSONResponse(
        status_code=200,
        content={"message": "OK"}
    )

async def flight(request: Request):
    data = await request.json()
    response = data.get("user_input")
    date = response["date"]
    from_airport = response["from_airport"]
    to_airport = response["to_airport"]
    cache_key = f"flights:{from_airport}:{to_airport}:{date}"
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return JSONResponse(content=json.loads(cached_data))
    result = get_flights(
            flight_data=[
            FlightData(date=date, from_airport=from_airport, to_airport=to_airport)
        ],
        trip="one-way",
        seat="economy",
        passengers=Passengers(adults=1, children=0, infants_in_seat=0, infants_on_lap=0),
        fetch_mode="fallback",
    )
    flights_data = []
    for flight in result.flights:
        flights_data.append({
            "is_best": flight.is_best,
            "name": flight.name,
            "departure": flight.departure,
            "arrival": flight.arrival,
            "arrival_time_ahead": flight.arrival_time_ahead,
            "duration": flight.duration,
            "stops": flight.stops,
            "delay": flight.delay,
            "price": flight.price
        })
    redis_client.setex(cache_key, 3600, json.dumps(flights_data))
    return JSONResponse(content=flights_data)


def fetch_flight_details(from_airport: str, to_airport: str, date: str):
    result: Result = get_flights(
        flight_data=[
            FlightData(date=date, from_airport=from_airport, to_airport=to_airport)
        ],
        trip="one-way",
        seat="economy",
        passengers=Passengers(adults=2, children=1, infants_in_seat=0, infants_on_lap=0),
        fetch_mode="fallback",
    )
    return {
        "flights": result.flights,
        "current_price": result.current_price
    }