import random
from typing import Callable, Literal
from app.agent.models.player_state import Card
from app.agent.models.player_state import PlayerState


type SourceType = Literal["deck", "hand", "bench", "active", "discard", "prize_cards"]

def shuffle(player_state: PlayerState, target: SourceType) -> None:
    to_shuffle = getattr(player_state, target)
    random.shuffle(to_shuffle)

def draw(player_state: PlayerState, number_of_cards: int) -> None:
    n = min(number_of_cards, len(player_state.deck))
    drawn = player_state.deck[:n]
    player_state.deck = player_state.deck[n:]
    player_state.hand = player_state.hand + drawn
    return 

def search(
    player_state: PlayerState,
    condition: Callable[[Card], bool],
    target: SourceType,
) -> list[int]:
    # Intentionaly iterate through the whole deck to find the card
    to_search = getattr(player_state, target)
    idxs = [i for i, card in enumerate(to_search) if condition(card)]
    return idxs

def place(
    player_state: PlayerState,
    idxs: list[int],
    source: SourceType,
    target: SourceType,
    ) -> None:
    # Remove cards from source
    to_remove = getattr(player_state, source)
    cards =[to_remove.pop(idx) for idx in idxs]
    to_place = getattr(player_state, target)
    if target in ["deck", "hand", "discard", "prize_cards"]:
        setattr(player_state, target, to_place + cards)
    else:
        # For active and bench, we need to convert the cards to the field model
        setattr(player_state, target, to_place + [card.to_field() for card in cards])
    shuffle(player_state, source)
