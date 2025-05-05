from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.flight_routes import options_flight,flight
from backend.routes.restaurant_api import place_photo,random_photo,restaurant
from backend.chatbot.chatbot_chaining import chat,reset_conversation

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


## FLIGHT_ROUTES ROUTERS
app.add_api_route("/flight",endpoint=flight,methods=["POST"])
app.add_api_route("/flight",endpoint=options_flight,methods=["Options"])

## RESTAURANT_API ROUTERS
app.add_api_route("/place-photo",endpoint=place_photo,methods = ["GET"])
app.add_api_route("/random-photo",endpoint=random_photo,methods=["GET"])
app.add_api_route("/restaurant",endpoint=restaurant,methods=["POST"])

## CHATBOT_CHAINING ROUTERS
app.add_api_route("/chat",endpoint=chat,methods=["POST"])
app.add_api_route("/reset",endpoint=reset_conversation,methods=["POST"])