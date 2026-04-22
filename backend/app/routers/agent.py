from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/agent", tags=["agent"])

@router.post("/simulate")
async def simulate_agent(payload: SimulateAgentPayload):
    return {"message": "Agent simulated"}

@router.post("/feedback")
async def feedback_agent(payload: FeedbackAgentPayload):
    return {"message": "Agent feedback"}