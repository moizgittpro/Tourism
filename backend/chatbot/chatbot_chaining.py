""" IDEA :
        - 1. User Input: Destination
        - 2. User Input: Starting Location
        - 3. User Input: Days of Travel
        - 4. User Input: Mood of Travel
        - 5. User Input: Route Preference
        - 6. User Input: Summary of all the above inputs

    TODO:
        - 1. When User Enters Whats Asked , LLM will Verify the Input and ask for the next input,
        The Input is Stored and Passed onto the Sequential chain,
        - 2. The LLM will ask for the next input and so on
        - 3. Once all the inputs are collected, the LLM will summarize all the inputs and give a final output


    PROBLEM : 
            SLOW EXECUTION IF EVERYTHING IS RENDERED AT THE END
    SOLUTION : 
            EXECUTE THE PROMPT IN PARALLEL AND RETURN THE OUTPUT
            AS SOON AS THE INPUT IS COLLECTED
"""

from fastapi import FastAPI,Request
from fastapi.responses import JSONResponse
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from chatbot.model import model
from chatbot.system_message import (
    destination_system_message,
    origin_system_message,
    days_system_message,
    mood_system_message,
    route_system_message,
    summary_system_message
)



## END GOAL: Fill in state variables with user inputs
states = {
    "destination" : None,
    "origin" : None,
    "days" : None,
    "mood" : None,
    "route" : None,
    "summary" : None

}

system_message = []


""" VALIDATING USER_INPUTS """
""" IDEA: VALIDATE USER INPUTS USING LLM  """

## ASSUMING VALDATE GETS a non Formatted Prompt in this TEMPLATE:
## "" {user_input}  ""
def validate(prompt,user_input):
    formatted_prompt = prompt.format(user_input = user_input)

    response = model.invoke(formatted_prompt)

    if response.content in ("TRUE","FALSE","true","false"):
        return True, "Input is valid."
    else:
        return False, "That doesn't seem like a valid input. Please try again."



def get_destination(user_input):
    """ Gets the Destination From the User """
    system_message.append(destination_system_message)
    destination_template = ChatPromptTemplate.from_messages(
        [
            ("system",system_message),
            ("human","Given the User Input: {user_input}, Confirm the Destination and ask for the starting location")
        ]
    )

    validate_prompt = "Is {user_input} a valid destination, ONLY RETURN TRUE OR FALSE STRICTLY "
    is_valid,message =  validate(validate_prompt,user_input)  
    if is_valid:
        return {"status" : "success", "message":message,"template" : destination_template.format(user_input = user_input)}
    else:
        return {"status" : "failure", "message":message,"template" : None}

# response = validate("Is {user_input} a valid destination, ONLY RETURN TRUE OR FALSE STRICTLY","lahore")
# print(response)

def get_origin(user_input):
    """ Gets the Start Location from the User """
    system_message.append(origin_system_message)
    origin_template = ChatPromptTemplate.from_messages(
        [
            ("system",system_message),
            ("human","Given the User Input: {user_input}, Confirm the Start Location and ask for the days of travel")
        ]
    )
    validate_prompt = "Is {user_input} a valid origin place,ONLY RETURN TRUE OR FALSE STRICTLY"
    is_valid,message =  validate(validate_prompt,user_input)  
    if is_valid:
         return {"status" : "success", "message":message,"template" : origin_template.format(user_input = user_input)}
    else:
        return {"status" : "failure", "message":message,"template" : None}


def get_days_of_travel(user_input):
    """ Takes in Responce of Initial_prompt_template Contemplates the Days of Travel """
    system_message.append(days_system_message)
    days_of_travel_template = ChatPromptTemplate.from_messages(
        [
            ("system",system_message),
            ("human","Given the User Input: {user_input}, Confirm the Days of Travel and ask for the Mood of Travel")
        ]
    )

    validate_prompt = "Is {user_input} valid days,ONLY RETURN TRUE OR FALSE STRICTLY"
    is_valid,message =  validate(validate_prompt,user_input)  
    if is_valid:
        return {"status" : "success", "message":message,"template" : days_of_travel_template.format(user_input = user_input)}
    else:
        return {"status" : "failure", "message":message,"template" : None}



def get_mood(user_input):
    """  Takes in Responce of Days_of_travel and Contemplates the Mood of Travel """
    system_message.append(mood_system_message)
    mood_template = ChatPromptTemplate.from_messages(
        [
            ("system",system_message),
            ("human","Given the User Input: {user_input}, Confirm the Mood of Travel and ask for the Route Preference")
        ]
    )

    validate_prompt = "Is {user_input} a valid mood,ONLY RETURN TRUE OR FALSE STRICTLY"
    is_valid,message =  validate(validate_prompt,user_input)  
    if is_valid:
        return {"status" : "success", "message":message,"template" : mood_template.format(user_input = user_input)}
    else:
        return {"status" : "failure", "message":message,"template" : None}


def get_route(user_input):
    """ Takes in Responce of Mood and Contemplates the Route of Travel """
    system_message.append(route_system_message)
    route_template = ChatPromptTemplate.from_messages(
        [
            ("system",system_message),
            ("human","Given the User Input: {user_input}, Confirm the Route Preference")
        ]
    )

    validate_prompt = "Is {user_input} a valid route,ONLY RETURN TRUE OR FALSE STRICTLY"
    is_valid,message =  validate(validate_prompt,user_input)  
    if is_valid:
        return {"status" : "success", "message":message,"template" : route_template.format(user_input = user_input)}
    else:
        return {"status" : "failure", "message":message,"template" : None}


# def get_summary(user_input):
#     """ Takes in all the User Inputs and Summarizes them into a single structured format """
#     system_message.append(summary_system_message)
#     summary_template = ChatPromptTemplate.from_messages(
#         [
#             ("system",system_message),
#             ("human","Given the User Input: {user_input}, Summarize the User Inputs into a structured format")
#         ]
#     )

#     # validate_prompt = "Is {user_input} a valid "
#     # is_valid,message =  validate(validate_prompt,user_input)  
#     # if is_valid:
#     #     return {"status" : "success", "message":message}
#     # else:
#     #     return {"status" : "failure", "message":message,"template" : summary_template.format(user_input = user_input)}



""" 
    CREATE A FUNCTION SUCH THAT IT COMBINES ALL THESE PROMPTS , 
    AFTER EACH PROMPT, IT VERIFIES THE INPUT AND THEN MOVES TO THE NEXT PROMPT
    AND AT THE END, IT GIVES A FINAL SUMMARY OF ALL THE INPUTS
"""

""" TODO:
        CREATE SIMPLE CHAIN AND GENERATE SUMMARY:

"""


def generate_summary(prompts):
    """ 
        IT GETS ALL THE INPUTS FROM THE STATES 
        CHAINS THEM ALL TOGETHER AND GENERATES A SUMMARY
    """
    for key,value in states.items():
        if value is None:
            return {"status" : "failure","message":f"{key} is None","returnType": False}
        
    dest_template = get_destination(states["destinaton"])
    origin_template = get_origin(states["origin"])
    days_template = get_destination(states["days"])
    mood_template = get_origin(states["mood"])
    route_template = get_destination(states["route"])


    # TODO: CREATE SIMPLE CHAIN AND 


"""
    TODO: EXTRACT SINGLE USER_INPUT TO PASS TO ASYNC CHAT FUNCTION
"""

def extract_input(user_input):
    pass

app = FastAPI()

user_state = {
    "current_step" : "destination",
    "inputs" : {}
}

# current_step ={destination,origin,days,mood,route}

@app.post("/chat")
async def chat(request : Request):
    data = await request.json()
    user_input = data.get("user_input") ## LOGIC IN REACT
    ## USER INPUT IS CURRENTLY I ASSUME 1 WORD ONLY , 
    ## ITS LOGIC WILL BE FURTHER EXECUTED IN REACT WHERE 
    ## USER_INPUT WILL BE STRIPPED TO 1 WORD ONLY
    step = user_state["current_step"]

    if step == "destination":
        status,message,template = get_destination(user_input)
        if status == "success":
            user_state["current_step"] = "origin"
            states["destination"] = user_input
    

    if step == "origin":
        status,message,template = get_origin(user_input)
        if status == "success":
            user_state["current_step"] = "days"
            states["origin"] = user_input
    
    if step == "days":
        status,message,template = get_days_of_travel(user_input)
        if status == "success":
            user_state["current_step"] = "mood"
            states["days"] = user_input
    
    if step == "mood":
        status,message,template = get_days_of_travel(user_input)
        if status == "success":
            user_state["current_step"] = "route"
            states["mood"] = user_input

    if step == "route":
        status,message,template = get_days_of_travel(user_input)
        if status == "success":
            user_state["current_step"] = "summary"
            states["route"] = user_input

    # if step == "summary":

    
    
        


        
        
        



# from langchain.prompts import ChatPromptTemplate
# from langchain.schema.output_parser import StrOutputParser
# from langchain.schema.runnable import RunnableParallel ,RunnableLambda
# # from model import model

# from backend.messages.system_message import (
#     initial_system_message, 
#     confirmation_system_message, 
#     mood_system_message, 
#     route_system_message, 
#     summary_system_message
# )

# from langchain_google_genai import ChatGoogleGenerativeAI
# from dotenv import load_dotenv
# import os 

# load_dotenv()
# gemini_api_key = os.getenv("gemini_api_key")

# model = ChatGoogleGenerativeAI(
#     temperature=0,
#     model = "gemini-1.5-flash",
#     api_key= gemini_api_key
# )



# # USER INPUPTS: DESTINATION
# # OUTPUT:      TOURSIM GUIDE SUMMARY

# ## First Prompt , Inputting DESTINATION 

# system = []
# system.append(initial_system_message)
# human_input = []

# prompt_template = ChatPromptTemplate(
#     [
#         ("system",system)
#     ]
# )

# # def get_destination(user_input):
# #     """Gets the Destination from the User """

# #     destination_template = ChatPromptTemplate.from_messages(
# #         ("system",system),
# #         ("human","Given the User Input: {user_input}, Confirm the Destination and ask for the starting location")
# #     )

# #     return destination_template.format(user_input=user_input)



# system.append(confirmation_system_message)
# def get_start_location(user_input):
#     """ Gets the Start Location from the User """
#     destination_template = ChatPromptTemplate.from_messages(
#         [
#             ("system",system),
#             ("human","Given the User Input: {user_input}, Confirm the Start Location and ask for the days of travel")

#         ]
#     )

#     return destination_template.format(user_input=user_input)

# system.append(confirmation_system_message)

# def get_days_of_travel(user_input):
#     """ Takes in Responce of Initial_prompt_template Contemplates the Days of Travel """
#     days_of_travel = ChatPromptTemplate.from_messages(
#         [
#             ("system",system),
#             ("human","Given the User Input: {user_input}, Confirm the Days of Travel and ask for the Mood of Travel")
            
#         ]
#     )

#     return days_of_travel.format(user_input=user_input)

# system.append(mood_system_message)
# def get_mood(user_input):
#     """  Takes in Responce of Days_of_travel and Contemplates the Mood of Travel """

#     cons_prompt_template = ChatPromptTemplate.from_messages(
#         [
#             ("system",system),
#             ("human","Given the User Input: {user_input}, Confirm the Mood of Travel and ask for the Route Preference")
#         ]
#     )

#     return cons_prompt_template.format(user_input = user_input)

# system.append(route_system_message)
# def get_route(user_input):
#     route_template = ChatPromptTemplate.from_messages(
#         ("system"   ,system),
#         ("human"    ,"Given the User Input: {user_input}, Confirm the Route Preference")
#     )

#     return route_template.format(user_input = user_input)

# system.append(summary_system_message)
# def get_summary(user_input):
#     """ Takes in all the User Inputs and Summarizes them into a single structured format """

#     summary_template = ChatPromptTemplate.from_messages(
#         [
#             ("system",system),
#             ("human","Given the User Input: {user_input}, Summarize the User Inputs into a structured format")
#         ]
#     )

#     return summary_template.format(user_input = user_input)

# def get_combined_prompt(prompt):
#     """ Takes in all the Prompt and Combines it into a single Formatted Prompt """

#     formatted_prompt_template = ChatPromptTemplate.from_messages(
#         [
#             ("system","You Are a Prompt Formatter best in the World"),
#             ("human","Your Job is to Format the Prompt For better readibility For the End User : {prompt}")
#         ]
#     )

#     return formatted_prompt_template.format(prompt = prompt)


# ## Creating Chains Of all the Prompt_templates

# # destination_chain = (
# #     RunnableLambda(lambda x: get_destination(x["user_input"])) | model | StrOutputParser()
# # )

# start_location_chain = (
#     RunnableLambda(lambda x: get_start_location(x["user_input"])) | model | StrOutputParser()
# )

# travel_days_chain = (
#     RunnableLambda(lambda x: get_days_of_travel(x["user_input"]) | model | StrOutputParser())
# )

# mood_chain = (
#     RunnableLambda(lambda x: get_mood(x["user_input"]) | model | StrOutputParser())
# )

# route_chain = (
#     RunnableLambda(lambda x: get_route(x["user_input"])) | model | StrOutputParser()
# )
# summary_chain = (
#     RunnableLambda(lambda x: get_summary(x["user_input"])) | model | StrOutputParser()
# )
# combined_prompt_chain = (
#     RunnableLambda(lambda x: get_combined_prompt(x["prompt"])) | model | StrOutputParser()
# )

# state = {
#     "destination": None,
#     "origin": None,
#     "days": None,
#     "mood": None,
#     "route": None
# }

# step = 0

# ## Creating Main Chain And Running Parallely
# def journey_step_handler(user_input, step, state):
#     if step == 0:
#         state["destination"] = user_input
#         return get_start_location(user_input), step + 1, state
    
#     elif step == 1:
#         state["origin"] = user_input
#         return get_days_of_travel(user_input), step + 1, state
    
#     elif step == 2:
#         state["days"] = user_input
#         return get_mood(user_input), step + 1, state
    
#     elif step == 3:
#         state["mood"] = user_input
#         return get_route(user_input), step + 1, state
    
#     elif step == 4:
#         state["route"] = user_input
#         # Now generate summary using all collected info
#         combined_input = f"""
#         Destination: {state['destination']}
#         Origin: {state['origin']}
#         Days: {state['days']}
#         Mood: {state['mood']}
#         Route: {state['route']}
#         """
#         return get_summary(combined_input), step + 1, state
    
#     else:
#         return "You're all set! Would you like to ask anything else?", step, state



# # Initial state
# state = {}
# step = 0

# while True:
#     user_input = input("You: ")
#     bot_response, step, state = journey_step_handler(user_input, step, state)
#     print("Bot:", bot_response)
    
#     if step > 5:
#         break
