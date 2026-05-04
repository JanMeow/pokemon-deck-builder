from typing import Dict, List
from pydantic import BaseModel
from app.agent.models.player_state import Card, PlayerState


class GameState(BaseModel):
    player1: PlayerState
    player2: PlayerState
    stadium: Card
    actions: Dict[str, List[Dict]]
    turn_number: int
    winner: str | None = None
    turn_logs: List[Dict]