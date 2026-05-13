from contextlib import asynccontextmanager
import logging
import time
import uuid

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from chatbot.chatbot_chaining import chat, init_chat, reset_conversation
from logging_config import setup_logging
from routes.connection import ensure_indexes
from routes.flight_routes import options_flight, flight
from routes.hotel_search import get_airbnb_data_for_location, get_hotel_data_for_location
from routes.nearby_search import get_data
from routes.restaurant_api import place_photo, random_photo, restaurant


setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting backend application")
    ensure_indexes()
    yield
    logger.info("Shutting down backend application")

app = FastAPI(lifespan=lifespan)

# Middleware for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start = time.perf_counter()
    logger.info(
        "[%s] Incoming %s %s",
        request_id,
        request.method,
        request.url.path,
    )

    try:
        response = await call_next(request)
    except Exception:
        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.exception(
            "[%s] Unhandled error on %s %s after %sms",
            request_id,
            request.method,
            request.url.path,
            duration_ms,
        )
        raise

    duration_ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info(
        "[%s] Completed %s %s with %s in %sms",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    response.headers["X-Request-ID"] = request_id
    return response


## FLIGHT_ROUTES ROUTERS
app.add_api_route("/flight",endpoint=flight,methods=["POST"])

## RESTAURANT_API ROUTERS
app.add_api_route("/place-photo",endpoint=place_photo,methods = ["GET"])
app.add_api_route("/random-photo",endpoint=random_photo,methods=["GET"])
app.add_api_route("/restaurant",endpoint=restaurant,methods=["POST"])

## NEARBY SEARCH
app.add_api_route("/get-data",endpoint=get_data,methods=["POST","GET"])

## CHATBOT_CHAINING ROUTERS
app.add_api_route("/chat/init",endpoint=init_chat,methods=["POST"])
app.add_api_route("/chat",endpoint=chat,methods=["POST"])
app.add_api_route("/reset",endpoint=reset_conversation,methods=["POST"])

## HOTELS
app.add_api_route("/get-hotels",endpoint=get_hotel_data_for_location,methods=["GET"])
app.add_api_route("/get-airbnbs",endpoint=get_airbnb_data_for_location,methods=["GET"])


if __name__ == "__main__":
    uvicorn.run(app,host = "0.0.0.0",port = 8000)
