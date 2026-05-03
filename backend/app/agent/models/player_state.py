from typing import TypedDict, Dict, List

# For player nodes
class Card(TypedDict):
    name: str
    type: str
    weakness: str
    resistance: str
    maximum_hp: int
    abilities: List[Dict]

class CardOnField(Card):
    current_hp: int
    current_status: str
    used_abilities: bool
    attached_items: List[Card]
    attached_energy: List[Card]


class PlayerState(TypedDict):
    hand: List[Card]
    deck: List[Card]          # full deck list (they're aware of it)
    discard: List[Card]
    active_pokemon: CardOnField
    bench: List[CardOnField]
    prize_cards: list[Card]         # how many prizes remaining (not which cards)
    messages: List[str]           # isolated context window

# For reviewer nodes
class GameState(TypedDict):
    player1: PlayerState
    player2: PlayerState
    stadium: Card #Share state
    actions: Dict[str, List[Dict]]       # only the previous player's public action — visible to current player
    turn_number: int
    winner: str | None
    turn_logs: List[Dict]    # accumulated reasoning from both players → fed to reviewer