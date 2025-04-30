from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnableParallel ,RunnableLambda
from backend.chatbot.model import model


## TO CREATE:
# USER INPUPTS: DESTINATION
# OUTPUT:      TOURSIM GUIDE SUMMARY

## First Prompt , Inputting DESTINATION 

system = "You are a Tourist Guide , You JOB"
prompt_template = ChatPromptTemplate(
    [
        ("system",system),
        "human","Give me Review of {university_name}"
    ]
)


def get_admission_criteria(university_name):

    """ Admission Criteria (Eligibility,Test etc)"""
    admission_criteria_template = ChatPromptTemplate.from_messages(
        [
            ("system",system),
            ("human","Give me the admission Criteria For {university_name} . It includes: Eligibility,Test Name , Date of Test , Syllabus of Test , and so on of what you think fits the admission criteria")
        ]
    )

    return admission_criteria_template.format(university_name = university_name)

def get_pros(review):
    """ Takes in the Response of Initial_prompt_template and then List Pros of University """
    pros_template = ChatPromptTemplate.from_messages(
        [
            ("system",system),
            ("human","You have a List of Review:{review} Give the pros of these Reviews")
        ]
    )

    return pros_template.format(review = review)

def get_cons(review):
    """ Takes in The Responce of Initial_prompt_template and Returns List of Cons of the University """

    cons_prompt_template = ChatPromptTemplate.from_messages(
        [
            ("system",system),
            ("human","Given the Review of university:{review}, Give me Cons of this University")
        ]
    )

    return cons_prompt_template.format(review = review)


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

admission_criteria_chain = (
    RunnableLambda(lambda x: get_admission_criteria(x["university_name"])) | model | StrOutputParser()
)

pros_chain = (
    RunnableLambda(lambda x: get_pros(x["review"])) | model | StrOutputParser()
)

cons_chain = (
    RunnableLambda(lambda x: get_cons(x["review"])) | model | StrOutputParser()
)

combined_prompt_chain = (
    RunnableLambda(lambda x: get_combined_prompt(x["review"])) | model | StrOutputParser()
)

## Creating Main Chain And Running Parallely

# chain = (
#     prompt_template
#     | model 
#     | StrOutputParser()
#     |RunnableParallel(branches={
#            "admission_criteria_branch": admission_criteria_chain,
#            "pros_branch": pros_chain,
#            "cons_branch": cons_chain,
#            "combined_branch": combined_prompt_branch
#        })
# )

review_chain = (
    prompt_template
    | model 
    | StrOutputParser()
)

def get_university_details(name):
    """ Combines All The Prompts Into Single Structured One """

    review = review_chain.invoke({"university_name":name})

    context = {
        "university_name" : name,
        "review" : review
    }

    result = RunnableParallel(
        admission_criteria=admission_criteria_chain,
        pros=pros_chain,
        cons=cons_chain,
        combined=combined_prompt_chain
    ).invoke(context)

    return result



print(get_university_details("NUST"))