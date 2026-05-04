from app.agent.models.player_state import PlayerState
from app.agent.models.game_state import GameState
from app.agent.functions.deck import shuffle, draw, search, place
import random


def start_draw(player: PlayerState) -> None:
    # Draw 5 cards, and place a random pokemon card to hand to ensure no redraw needed
    draw(player, 5)
    idx =[random.choice(search(player, condition=lambda card: card.type == "Pokemon", target="deck"))]
    place(player, idx, source="deck", target="hand")

def start(player_A: PlayerState, player_B: PlayerState) -> GameState:
    # Shuffle the decks
    shuffle(player_A, target="deck")
    shuffle(player_B, target="deck")
    # Draw phrase
    start_draw(player_A)
    start_draw(player_B)
    # Put 6 cards to prize cards
    player_A.prize_cards = player_A.deck[:6]
    player_B.prize_cards = player_B.deck[:6]
    player_A.deck = player_A.deck[6:]
    player_B.deck = player_B.deck[6:]