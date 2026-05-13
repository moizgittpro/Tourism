import asyncio
import logging
from typing import Any

from fastapi import Request
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse

from routes.connection import mongo_db

from .model import model
from .session_manager import SessionManager
from .system_message import chat_system_message


logger = logging.getLogger(__name__)

MODEL_TIMEOUT_SECONDS = 20
SUMMARY_TIMEOUT_SECONDS = 25

STEP_ORDER = ["destination", "origin", "days", "mood", "route"]
NEXT_STEP = {
    "destination": "origin",
    "origin": "days",
    "days": "mood",
    "mood": "route",
    "route": "chat",
}
STEP_PROMPTS = {
    "destination": "Hello! I can help you plan your trip. Please tell me your destination.",
    "origin": "Nice choice. What city will you be traveling from?",
    "days": "How many days are you planning to travel for?",
    "mood": "What kind of trip are you in the mood for? For example: relaxing, historical, adventurous, or food-focused.",
    "route": "How would you prefer to travel? For example: car, bus, train, or flight.",
    "chat": "Your trip plan is ready. Ask me anything else about your destination.",
}

COLLECTIONS = [
    "tourist_attraction",
    "zoo",
    "movie_theater",
    "museum",
    "park",
    "mosque",
    "shopping_mall",
    "church",
]


def normalize_input(user_input: Any) -> str:
    return str(user_input or "").strip()


def validate_user_input(step: str, user_input: str) -> tuple[bool, str]:
    cleaned = normalize_input(user_input)
    if not cleaned:
        return False, "Please enter a value before sending your message."

    if len(cleaned) > 120:
        return False, "That message is too long for this step. Please keep it shorter."

    if step == "days":
        try:
            days = int(cleaned)
        except ValueError:
            return False, "Days of travel must be a whole number."

        if days < 1 or days > 30:
            return False, "Days of travel must be between 1 and 30."

        return True, str(days)

    return True, cleaned


async def invoke_model_text(prompt: str, timeout_seconds: int = MODEL_TIMEOUT_SECONDS) -> str:
    response = await asyncio.wait_for(
        run_in_threadpool(model.invoke, prompt),
        timeout=timeout_seconds,
    )
    return getattr(response, "content", str(response))


def build_summary_prompt(states: dict[str, str]) -> str:
    return f"""
You are a helpful travel assistant for trips in Pakistan.

Create a practical day-by-day plan using these details:
- Destination: {states["destination"]}
- Origin: {states["origin"]}
- Duration: {states["days"]} day(s)
- Mood or theme: {states["mood"]}
- Preferred route: {states["route"]}

Requirements:
- Structure the plan as Day 1, Day 2, and so on.
- Keep the tone warm and concise.
- Mention local food, sightseeing, and simple travel tips where useful.
- Do not invent live flight prices or hotel prices.
- End with 3 quick tips for the trip.
""".strip()


async def generate_summary(states: dict[str, str]) -> dict[str, Any]:
    for key in STEP_ORDER:
        if not states.get(key):
            return {"status": "failure", "message": f"{key} is missing"}

    summary_task = invoke_model_text(
        build_summary_prompt(states),
        timeout_seconds=SUMMARY_TIMEOUT_SECONDS,
    )
    restaurants_task = run_in_threadpool(get_restaurant_by_city, states["destination"])
    attractions_task = run_in_threadpool(get_data_sync, "tourist_attraction", states["destination"])

    summary_result, restaurants_result, attractions_result = await asyncio.gather(
        summary_task,
        restaurants_task,
        attractions_task,
        return_exceptions=True,
    )

    if isinstance(summary_result, Exception):
        logger.exception("Summary generation failed", exc_info=summary_result)
        trip_summary = (
            f"Your trip to {states['destination']} from {states['origin']} is shaping up well. "
            f"I could not generate the full AI summary right now, but I did save your trip details."
        )
    else:
        trip_summary = summary_result

    restaurants = []
    if isinstance(restaurants_result, Exception):
        logger.exception("Restaurant lookup failed", exc_info=restaurants_result)
    elif isinstance(restaurants_result, list):
        restaurants = restaurants_result

    attractions = []
    if isinstance(attractions_result, Exception):
        logger.exception("Attraction lookup failed", exc_info=attractions_result)
    elif isinstance(attractions_result, list):
        attractions = attractions_result

    return {
        "status": "success",
        "message": "Trip summary generated successfully",
        "trip_summary": trip_summary,
        "flights": [],
        "current_price": None,
        "restaurants": restaurants,
        "tourist_attractions": attractions,
    }


async def get_chat_response(user_input: str) -> dict[str, Any]:
    prompt = f"""
{chat_system_message}

Answer the user's tourism question briefly, clearly, and in a friendly tone.
Question: {user_input}
""".strip()

    try:
        response_text = await invoke_model_text(prompt)
        return {
            "status": "success",
            "message": "Response generated successfully",
            "output": response_text,
        }
    except asyncio.TimeoutError:
        return {
            "status": "failure",
            "message": "The chatbot took too long to respond. Please try again.",
            "output": None,
        }
    except Exception as exc:
        logger.exception("Chat response failed")
        return {
            "status": "failure",
            "message": f"Error occurred while generating the response: {exc}",
            "output": None,
        }


session_manager = SessionManager()


def _response_payload(message: str, step: str, session_id: str, **extra):
    payload = {
        "message": message,
        "step": step,
        "session_id": session_id,
        "sessionId": session_id,
    }
    payload.update(extra)
    return payload


async def _parse_json(request: Request) -> dict[str, Any]:
    try:
        data = await request.json()
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _extract_session_id(request: Request, data: dict[str, Any]) -> str | None:
    return (
        request.headers.get("X-Session-ID")
        or data.get("session_id")
        or data.get("sessionId")
    )


async def init_chat(request: Request):
    data = await _parse_json(request)
    session_id = _extract_session_id(request, data)
    session = session_manager.get_session(session_id) if session_id else None

    if not session:
        session_id = session_manager.create_session()
        session = session_manager.get_session(session_id)

    logger.info("Initialized chat session %s", session_id)
    return JSONResponse(
        content=_response_payload(
            STEP_PROMPTS[session["current_step"]],
            session["current_step"],
            session_id,
        )
    )


async def chat(request: Request):
    data = await _parse_json(request)
    session_id = _extract_session_id(request, data)
    user_input = normalize_input(data.get("user_input"))

    had_session_id = bool(session_id)
    session = session_manager.get_session(session_id) if session_id else None

    if had_session_id and not session:
        logger.warning("Chat session expired or missing: %s", session_id)
        new_session_id = session_manager.create_session()
        return JSONResponse(
            content=_response_payload(
                "Your previous session expired. Let's start a new trip plan.",
                "destination",
                new_session_id,
                session_expired=True,
            )
        )

    if not session:
        session_id = session_manager.create_session()
        session = session_manager.get_session(session_id)
        logger.info("Created fallback chat session %s during /chat request", session_id)

    if not user_input:
        return JSONResponse(
            content=_response_payload(
                STEP_PROMPTS[session["current_step"]],
                session["current_step"],
                session_id,
            )
        )

    step = session["current_step"]
    logger.info("Processing chat session %s at step %s", session_id, step)

    if step == "chat":
        response = await get_chat_response(user_input)
        message = response["output"] if response["status"] == "success" else f"Error: {response['message']}"
        return JSONResponse(
            content=_response_payload(message, "chat", session_id)
        )

    is_valid, value_or_message = validate_user_input(step, user_input)
    if not is_valid:
        return JSONResponse(
            content=_response_payload(
                f"Error: {value_or_message}",
                step,
                session_id,
            )
        )

    session["states"][step] = value_or_message
    session_manager.save_session(session_id, session)

    if step == "route":
        session["current_step"] = "chat"
        session_manager.save_session(session_id, session)
        summary_response = await generate_summary(session["states"])
        if summary_response["status"] != "success":
            return JSONResponse(
                content=_response_payload(
                    f"Error: {summary_response['message']}",
                    "route",
                    session_id,
                )
            )

        return JSONResponse(
            content=_response_payload(
                summary_response["trip_summary"],
                "chat",
                session_id,
                trip_summary=summary_response["trip_summary"],
                flights=summary_response["flights"],
                restaurants=summary_response["restaurants"],
                tourist_attractions=summary_response["tourist_attractions"],
            )
        )

    next_step = NEXT_STEP[step]
    session["current_step"] = next_step
    session_manager.save_session(session_id, session)

    return JSONResponse(
        content=_response_payload(
            STEP_PROMPTS[next_step],
            next_step,
            session_id,
        )
    )


def get_data_sync(collection_name: str, city: str):
    try:
        if not collection_name or not city:
            return {"error": "Both collection and city are required"}

        if collection_name not in COLLECTIONS:
            return {"error": f"Invalid collection: {collection_name}"}

        collection = mongo_db[collection_name]
        query = {"city": {"$regex": f"^{city}$", "$options": "i"}}
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
            "city": 1,
        }

        results = list(collection.find(query, projection))
        for result in results:
            result["_id"] = str(result["_id"])

        return results
    except Exception as exc:
        logger.exception("Attraction lookup error")
        return {"error": f"Server error: {exc}"}


async def reset_conversation(request: Request):
    data = await _parse_json(request)
    session_id = _extract_session_id(request, data)
    if session_id:
        session_manager.delete_session(session_id)

    new_session_id = session_manager.create_session()
    logger.info("Reset chat session %s -> %s", session_id, new_session_id)
    return JSONResponse(
        content=_response_payload(
            STEP_PROMPTS["destination"],
            "destination",
            new_session_id,
        )
    )


def get_restaurant_by_city(city: str):
    collection = mongo_db["restaurants"]
    restaurants_cursor = collection.find(
        {"city": {"$regex": f"^{city}$", "$options": "i"}}
    )

    restaurants = []
    for restaurant in restaurants_cursor:
        restaurant["_id"] = str(restaurant["_id"])
        restaurants.append(restaurant)

    return restaurants
