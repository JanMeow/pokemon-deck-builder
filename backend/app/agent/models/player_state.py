from typing import Dict, List, Self
from pydantic import BaseModel, Field

# For player nodes
class Card(BaseModel):
    name: str
    type: str
    weakness: str
    resistance: str
    maximum_hp: int
    abilities: List[Dict]

    def to_field(self) -> "CardOnField":
        return CardOnField(
            **self.model_dump(),
            current_hp=self.maximum_hp,
            current_status="",
            used_abilities=False,
            attached_items=[],
            attached_energy=[],
        )

class CardOnField(Card):
    current_hp: int
    current_status: str 
    used_abilities: bool
    attached_items: List[Card]
    attached_energy: List[Card]

    def to_field(self) -> Self:
        return self

class PlayerState(BaseModel):
    hand: List[Card]
    deck: List[Card] = Field(default_factory=list, max_length=60)          # full deck list (they're aware of it)
    discard: List[Card]
    active_pokemon: CardOnField
    bench: List[CardOnField] = Field(default_factory=list, max_length=5)
    prize_cards: List[Card] = Field(default_factory=list, max_length=6)         # how many prizes remaining (not which cards)
    messages: List[str]           # isolated context window

