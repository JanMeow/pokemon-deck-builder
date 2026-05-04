from app.agent.models.player_state import PlayerState
from app.agent.models.game_state import GameState
from app.agent.functions.deck import shuffle, draw, search, place
import random


def start_draw(player: PlayerState) -> None:
    # Draw 5 cards, and place a random pokemon card to hand to ensure no redraw needed
    draw(player, 5)
    idx =[random.choice(search(player, condition=lambda card: card.type == "Pokemon", target="deck"))]
    place(player, idx, source="deck", target="hand")
def set_prize_cards(player: PlayerState) -> None:
    player.prize_cards = player.deck[:6]
    player.deck = player.deck[6:]
def start(player_A: PlayerState, player_B: PlayerState) -> GameState:
    # Shuffle the decks
    shuffle(player_A, target="deck")
    shuffle(player_B, target="deck")
    # Draw phrase
    start_draw(player_A)
    start_draw(player_B)
    # Put 6 cards to prize cards
    set_prize_cards(player_A)
    set_prize_cards(player_B)
    return GameState(player_A=player_A, player_B=player_B, stadium=None, actions={}, turn_number=0, turn_logs=[])