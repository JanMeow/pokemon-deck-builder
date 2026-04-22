from fastapi import APIRouter, HTTPException, Query
from app.services import limitless

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/decks")
async def list_meta_decks(format: str = Query(default="standard")):
    try:
        return {"data": await limitless.get_meta_decks(format)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/decks/{deck_id}")
async def get_meta_deck(deck_id: str):
    try:
        cards = await limitless.get_deck_cards(deck_id)
        if not cards:
            raise HTTPException(status_code=502, detail="Could not parse cards for this deck — the page structure may have changed.")
        return {"data": cards}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
