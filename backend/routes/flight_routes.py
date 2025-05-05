from fast_flights import FlightData, Passengers, Result, get_flights
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse


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
    response = data.get("user_input")  # list of input format
    
    date = response["date"]
    from_airport = response["from_airport"]
    to_airport = response["to_airport"]
    
    result = get_flights(
            flight_data=[
            FlightData(date=date, from_airport=to_airport, to_airport=from_airport)
        ],
        trip="one-way",
        seat="economy",
        passengers=Passengers(adults=1, children=0, infants_in_seat=0, infants_on_lap=0),
        fetch_mode="fallback",

    )
    
    # it caused error in frontend before as get_flights did not return json
    # converting Flight objects to dictionaries
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
    
    return JSONResponse(content=flights_data)