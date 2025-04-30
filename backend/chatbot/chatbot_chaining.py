from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnableParallel ,RunnableLambda
# from model import model

from backend.messages.system_message import (
    initial_system_message, 
    confirmation_system_message, 
    mood_system_message, 
    route_system_message, 
    summary_system_message
)

from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os 

load_dotenv()
gemini_api_key = os.getenv("gemini_api_key")

model = ChatGoogleGenerativeAI(
    temperature=0,
    model = "gemini-1.5-flash",
    api_key= gemini_api_key
)



# USER INPUPTS: DESTINATION
# OUTPUT:      TOURSIM GUIDE SUMMARY

## First Prompt , Inputting DESTINATION 

system = []
system.append(initial_system_message)
human_input = []

prompt_template = ChatPromptTemplate(
    [
        ("system",system)
    ]
)

# def get_destination(user_input):
#     """Gets the Destination from the User """

#     destination_template = ChatPromptTemplate.from_messages(
#         ("system",system),
#         ("human","Given the User Input: {user_input}, Confirm the Destination and ask for the starting location")
#     )

#     return destination_template.format(user_input=user_input)



system.append(confirmation_system_message)
def get_start_location(user_input):
    """ Gets the Start Location from the User """
    destination_template = ChatPromptTemplate.from_messages(
        [
            ("system",system),
            ("human","Given the User Input: {user_input}, Confirm the Start Location and ask for the days of travel")

        ]
    )

    return destination_template.format(user_input=user_input)

system.append(confirmation_system_message)

def get_days_of_travel(user_input):
    """ Takes in Responce of Initial_prompt_template Contemplates the Days of Travel """
    days_of_travel = ChatPromptTemplate.from_messages(
        [
            ("system",system),
            ("human","Given the User Input: {user_input}, Confirm the Days of Travel and ask for the Mood of Travel")
            
        ]
    )

    return days_of_travel.format(user_input=user_input)

system.append(mood_system_message)
def get_mood(user_input):
    """  Takes in Responce of Days_of_travel and Contemplates the Mood of Travel """

    cons_prompt_template = ChatPromptTemplate.from_messages(
        [
            ("system",system),
            ("human","Given the User Input: {user_input}, Confirm the Mood of Travel and ask for the Route Preference")
        ]
    )

    return cons_prompt_template.format(user_input = user_input)

system.append(route_system_message)
def get_route(user_input):
    route_template = ChatPromptTemplate.from_messages(
        ("system"   ,system),
        ("human"    ,"Given the User Input: {user_input}, Confirm the Route Preference")
    )

    return route_template.format(user_input = user_input)

system.append(summary_system_message)
def get_summary(user_input):
    """ Takes in all the User Inputs and Summarizes them into a single structured format """

    summary_template = ChatPromptTemplate.from_messages(
        [
            ("system",system),
            ("human","Given the User Input: {user_input}, Summarize the User Inputs into a structured format")
        ]
    )

    return summary_template.format(user_input = user_input)

def get_combined_prompt(prompt):
    """ Takes in all the Prompt and Combines it into a single Formatted Prompt """

    formatted_prompt_template = ChatPromptTemplate.from_messages(
        [
            ("system","You Are a Prompt Formatter best in the World"),
            ("human","Your Job is to Format the Prompt For better readibility For the End User : {prompt}")
        ]
    )

    return formatted_prompt_template.format(prompt = prompt)


## Creating Chains Of all the Prompt_templates

# destination_chain = (
#     RunnableLambda(lambda x: get_destination(x["user_input"])) | model | StrOutputParser()
# )

start_location_chain = (
    RunnableLambda(lambda x: get_start_location(x["user_input"])) | model | StrOutputParser()
)

travel_days_chain = (
    RunnableLambda(lambda x: get_days_of_travel(x["user_input"]) | model | StrOutputParser())
)

mood_chain = (
    RunnableLambda(lambda x: get_mood(x["user_input"]) | model | StrOutputParser())
)

route_chain = (
    RunnableLambda(lambda x: get_route(x["user_input"])) | model | StrOutputParser()
)
summary_chain = (
    RunnableLambda(lambda x: get_summary(x["user_input"])) | model | StrOutputParser()
)
combined_prompt_chain = (
    RunnableLambda(lambda x: get_combined_prompt(x["prompt"])) | model | StrOutputParser()
)

state = {
    "destination": None,
    "origin": None,
    "days": None,
    "mood": None,
    "route": None
}

step = 0

## Creating Main Chain And Running Parallely
def journey_step_handler(user_input, step, state):
    if step == 0:
        state["destination"] = user_input
        return get_start_location(user_input), step + 1, state
    
    elif step == 1:
        state["origin"] = user_input
        return get_days_of_travel(user_input), step + 1, state
    
    elif step == 2:
        state["days"] = user_input
        return get_mood(user_input), step + 1, state
    
    elif step == 3:
        state["mood"] = user_input
        return get_route(user_input), step + 1, state
    
    elif step == 4:
        state["route"] = user_input
        # Now generate summary using all collected info
        combined_input = f"""
        Destination: {state['destination']}
        Origin: {state['origin']}
        Days: {state['days']}
        Mood: {state['mood']}
        Route: {state['route']}
        """
        return get_summary(combined_input), step + 1, state
    
    else:
        return "You're all set! Would you like to ask anything else?", step, state



# Initial state
state = {}
step = 0

while True:
    user_input = input("You: ")
    bot_response, step, state = journey_step_handler(user_input, step, state)
    print("Bot:", bot_response)
    
    if step > 5:
        break

