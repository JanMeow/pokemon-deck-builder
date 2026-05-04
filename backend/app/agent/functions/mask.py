from app.agent.models.player_state import PlayerState, CardOnField
from typing import Dict, TypedDict, List, Any

class MaskedState(TypedDict):
    hand_size: int
    deck_size: int
    discard_size: int
    active_pokemon: CardOnField
    bench: List[CardOnField]
    prize_card_size: int
# Masking the state of the game for the agents
def mask_state(state: PlayerState) -> MaskedState:

    return {
        "hand_size": len(state.hand),
        "deck_size": len(state.deck),
        "discard_size": len(state.discard),
        "active_pokemon": state.active_pokemon,
        "bench": state.bench,
        "prize_card_size": len(state.prize_cards),
    }