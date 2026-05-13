import json
import logging
import os

from fastapi import HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse
from fast_flights import FlightData, Passengers, Result, get_flights
from routes.connection import redis_client

logger = logging.getLogger(__name__)


def _get_fetch_modes():
    raw_modes = os.getenv("FAST_FLIGHTS_FETCH_MODES", "common,fallback,force-fallback")
    modes = []
    for mode in (part.strip() for part in raw_modes.split(",")):
        if mode and mode not in modes:
            modes.append(mode)
    return modes or ["fallback"]


async def _fetch_flights(date: str, from_airport: str, to_airport: str):
    last_error = None

    for fetch_mode in _get_fetch_modes():
        try:
            return await run_in_threadpool(
                get_flights,
                flight_data=[
                    FlightData(
                        date=date,
                        from_airport=from_airport,
                        to_airport=to_airport,
                    )
                ],
                trip="one-way",
                seat="economy",
                passengers=Passengers(
                    adults=1,
                    children=0,
                    infants_in_seat=0,
                    infants_on_lap=0,
                ),
                fetch_mode=fetch_mode,
            )
        except Exception as exc:
            last_error = exc
            logger.warning(
                "Flight lookup failed for %s -> %s on %s using mode '%s': %s",
                from_airport,
                to_airport,
                date,
                fetch_mode,
                exc,
            )

    raise RuntimeError(
        "Flight provider lookup failed in all configured modes."
    ) from last_error

async def options_flight():
    return JSONResponse(
        status_code=200,
        content={"message": "OK"}
    )

async def flight(request: Request):
    try:
        data = await request.json()
        response = data.get("user_input") if isinstance(data.get("user_input"), dict) else data
        if response is None:
            raise HTTPException(status_code=400, detail="Missing 'user_input' in request.")

        date = str(response.get("date", "")).strip()
        from_airport = str(response.get("from_airport", "")).strip().upper()
        to_airport = str(response.get("to_airport", "")).strip().upper()

        if not all([date, from_airport, to_airport]):
            raise HTTPException(status_code=400, detail="Incomplete flight data.")
        if (
            len(from_airport) != 3
            or len(to_airport) != 3
            or not from_airport.isalpha()
            or not to_airport.isalpha()
        ):
            raise HTTPException(
                status_code=400,
                detail="Airport codes must be valid 3-letter IATA codes.",
            )

        cache_key = f"flights:{from_airport}:{to_airport}:{date}"
        try:
            cached_data = redis_client.get(cache_key)
        except Exception:
            cached_data = None

        if cached_data:
            return JSONResponse(content=json.loads(cached_data))

        result = await _fetch_flights(date, from_airport, to_airport)

        flights_data = [
            {
                "is_best": f.is_best,
                "name": f.name,
                "departure": f.departure,
                "arrival": f.arrival,
                "arrival_time_ahead": f.arrival_time_ahead,
                "duration": f.duration,
                "stops": f.stops,
                "delay": f.delay,
                "price": f.price,
            }
            for f in result.flights
        ]
        try:
            if flights_data:
                redis_client.setex(cache_key, 3600, json.dumps(flights_data))
        except Exception:
            pass
        return JSONResponse(content=flights_data)

    except HTTPException:
        raise
    except RuntimeError as e:
        logger.exception("Flight provider failure for %s -> %s on %s", from_airport, to_airport, date)
        raise HTTPException(
            status_code=503,
            detail=(
                "Flight search is temporarily unavailable in this deployment. "
                "The upstream provider blocked or failed the lookup."
            ),
        ) from e
    except Exception as e:
        logger.exception("Unexpected flight API error")
        raise HTTPException(status_code=500, detail="Unexpected server error while searching flights.") from e


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
