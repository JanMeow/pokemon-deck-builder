import uuid
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.models.deck import Deck, DeckCreate
from app.services.deck_import import import_ptcgl

router = APIRouter(prefix="/decks", tags=["decks"])

# In-memory store for now; swap for Postgres when ready
_store: dict[str, dict] = {}


@router.get("")
async def list_decks(
    q: str = Query(default=""),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    all_decks = list(_store.values())
    if q:
        all_decks = [d for d in all_decks if q.lower() in d["name"].lower()]
    total = len(all_decks)
    return {"data": all_decks[skip : skip + limit], "total": total}


@router.post("", status_code=201)
async def create_deck(payload: DeckCreate):
    deck = Deck(id=str(uuid.uuid4()), name=payload.name, cards=payload.cards)
    _store[deck.id] = deck.model_dump()
    return deck


@router.get("/{deck_id}")
async def get_deck(deck_id: str):
    deck = _store.get(deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="deck not found")
    return deck


@router.put("/{deck_id}")
async def update_deck(deck_id: str, payload: DeckCreate):
    if deck_id not in _store:
        raise HTTPException(status_code=404, detail="deck not found")
    deck = Deck(id=deck_id, name=payload.name, cards=payload.cards)
    _store[deck_id] = deck.model_dump()
    return deck


@router.delete("/{deck_id}", status_code=204)
async def delete_deck(deck_id: str):
    if deck_id not in _store:
        raise HTTPException(status_code=404, detail="deck not found")
    del _store[deck_id]


class ImportPayload(BaseModel):
    name: str
    ptcgl_text: str


@router.post("/import", status_code=201)
async def import_deck(payload: ImportPayload):
    try:
        cards = await import_ptcgl(payload.ptcgl_text)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
    if not cards:
        raise HTTPException(status_code=422, detail="No cards could be resolved from the provided text.")
    deck = Deck(id=str(uuid.uuid4()), name=payload.name, cards=cards)
    _store[deck.id] = deck.model_dump()
    return {"deck": deck.model_dump(), "resolved": len(cards)}
