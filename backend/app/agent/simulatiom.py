from langgraph.graph import StateGraph, MessagesState, START, END

def simulation_agent(state: MessagesState):
    return {"messages": [{"role": "ai", "content": "I am a pokemon simulation agent. I will simulate a pokemon match between two decks and return the result."}]}