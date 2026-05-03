# Pokemon Simulation Agent Architecture

## Graph Flow

```
START
  └─► game_init        shuffle decks, deal 7 cards, set 6 hidden prize cards per player
        └─► player1_turn (nodeA)
              └─► player2_turn (nodeB)
                    └─► [conditional edge: winner? → END, else → player1_turn]
                          └─► reviewer
                                └─► END
```

## Nodes

| Node | File | Responsibility |
|------|------|----------------|
| `game_init` | `state/start.py` | Shuffle decks, deal opening hands, assign hidden prize cards, decide first player |
| `player1_turn` | `nodes/nodeA.py` | Player 1 agent — plans and plays their turn using `play_card` tool |
| `player2_turn` | `nodes/nodeB.py` | Player 2 agent — same as above, isolated context window |
| `reviewer` | `nodes/reviewer.py` | Receives all turn logs, outputs deck improvement suggestions and strategy notes |

## State Schema

`GameState` is the **reviewer's view** — full fidelity, accumulated over the whole game.
Player nodes never receive `GameState` directly; they receive a masked `PlayerContext` built by `functions/mask.py`.

```
GameState
├── player1: PlayerState
│     ├── hand: list[Card]          ← actual cards (masked from opponent)
│     ├── deck: list[Card]          ← full deck list
│     ├── discard: list[Card]
│     ├── active_pokemon: CardOnField
│     ├── bench: list[CardOnField]  ← max 5
│     ├── prize_cards: list[Card]   ← hidden from both agents during play; reviewer sees all
│     └── messages: list[str]       ← isolated context window for this player
├── player2: PlayerState            ← same structure, separate context
├── stadium: Card | None            ← shared field, one active at a time (lives at GameState level)
├── actions: list[dict]             ← full action history across all turns
├── turn_number: int
├── current_player: "player1" | "player2"
├── winner: str | None
└── turn_logs: list[dict]           ← accumulated reasoning per turn → fed to reviewer
```

Each `turn_log` entry:
```
{
  player:          "player1" | "player2",
  turn_number:     int,
  hand_at_start:   list[str],
  reasoning:       str,           ← agent's chain-of-thought for the turn
  actions_taken:   list[str]      ← cards played, attacks declared, retreats
  inferred_prizes: list[str]      ← agent's deduced prize cards (emergent, not injected)
}
```

### Prize Card Deduction
Prize cards are masked from both agents, but are **logically deducible** via set subtraction:
`prized = full_deck_list − hand − drawn_so_far − discard − cards_on_field`

Agents have perfect recall unlike humans, so by mid-game they can often identify all 6 prized cards exactly.
Position within the 6 slots remains unknown unless a search card explicitly interacts with prizes.
This deduction is **emergent from the agent's reasoning** — it is not injected into state.
The reviewer should evaluate prize-tracking accuracy as a signal of play quality.

## Information Flow (`functions/`)

Before a player node runs, `functions/mask.py` builds that player's context from `GameState`.
It exposes the player's own full state and a **masked view** of the opponent — stripping private info.

```
GameState
  └─► mask_opponent_state(opponent: PlayerState) → OpponentView
  └─► build_player_context(game_state, player) → PlayerContext
        ├── self: PlayerState          (full — hand, deck, messages, etc.)
        ├── opponent: OpponentView     (masked — see table below)
        ├── stadium: str | None        (public)
        ├── last_action: dict          (public — what opponent did last turn)
        └── turn_number: int
```

| Field | Own state | Opponent view |
|-------|-----------|---------------|
| `hand` | Full list | Hidden — count only |
| `deck` | Full list | Hidden — count only |
| `prize_cards` | Hidden (even from self) | Hidden |
| `prize_count` | Yes | Yes |
| `discard` | Full list | Full list (public) |
| `active_pokemon` | Full | Full (public) |
| `bench` | Full | Full (public) |
| `messages` | Own context | Never exposed |

## Tools

### `play_card` (`tools/play_card.py`)
Called by a player agent during their turn.

```
play_card(card_name: str, target: str | None) → ActionResult
```

- Validates the action is legal under current rules
- Mutates `GameState` (moves card from hand, applies effect)
- Returns a public `ActionResult` that gets written to `last_action`
- Checks win condition after each KO

## Models (`models/`)

| Model | Description |
|-------|-------------|
| `Card` | Static card data: name, type, weakness, resistance, max HP, abilities |
| `CardOnField` | `Card` + runtime state: current HP, status condition, attached energy/items, ability used flag |

## Prompts (`prompt.py`)

| Variable | Used by |
|----------|---------|
| `pokemon_rule_prompt` | Injected into both player system prompts |
| `player1_system` | `nodeA` system message |
| `player2_system` | `nodeB` system message |
| `pokemon_simulation_prompt` | `game_init` / orchestrator |

## File Layout

```
agent/
├── ARCHITECTURE.md
├── graph.py              ← LangGraph graph definition and compilation
├── prompt.py             ← all prompts and system messages
├── simulatiom.py         ← (TODO: rename to simulation.py)
├── functions/
│   └── mask.py           ← mask_opponent_state(), build_player_context()
├── models/
│   ├── player_state.py   ← Card, CardOnField (TODO: split out state types)
│   └── __init__.py
├── nodes/
│   ├── nodeA.py          ← player1_turn node (calls build_player_context before invoking LLM)
│   ├── nodeB.py          ← player2_turn node (same)
│   └── reviewer.py       ← reviewer node
├── state/
│   ├── start.py          ← game_init logic + GameState / PlayerState definitions
│   ├── turn.py           ← turn transition helpers
│   └── end.py            ← win condition checks
└── tools/
    └── play_card.py      ← play_card tool
```

## Known TODOs

- [ ] Rename `simulatiom.py` → `simulation.py`
- [ ] Move `stadium` from inside `PlayerState` to `GameState` level — it's shared, one active at a time
- [ ] Replace `MessagesState` in `graph.py` with `GameState`
- [ ] Decide draw size: standard TCG is 7 cards, not 6
