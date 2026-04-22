from pydantic import BaseModel, field_validator
from typing import Optional


class DeckCard(BaseModel):
    card_id: str
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_range(cls, v: int) -> int:
        if not 1 <= v <= 4:
            raise ValueError("quantity must be between 1 and 4")
        return v


class Deck(BaseModel):
    id: Optional[str] = None
    name: str
    cards: list[DeckCard] = []

    @field_validator("cards")
    @classmethod
    def deck_size(cls, v: list[DeckCard]) -> list[DeckCard]:
        total = sum(c.quantity for c in v)
        if total > 60:
            raise ValueError(f"deck has {total} cards; maximum is 60")
        return v


class DeckCreate(BaseModel):
    name: str
    cards: list[DeckCard] = []
