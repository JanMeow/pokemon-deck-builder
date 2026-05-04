from typing import Dict, List, Optional
from pydantic import BaseModel
from app.agent.models.player_state import Card, PlayerState


class GameState(BaseModel):
    player_A: PlayerState
    player_B: PlayerState
    stadium: Optional[Card] = None
    actions: Dict[str, List[Dict]]
    turn_number: int
    winner: Optional[str] = None
    turn_logs: List[Dict]