from fastapi import APIRouter, HTTPException, Query

from app.services import pokemon_tcg

router = APIRouter(prefix="/cards", tags=["cards"])


VALID_ORDER_BY = {
    "-set.releaseDate", "set.releaseDate",
    "name", "-name",
    "hp", "-hp",
}

@router.get("")
async def search_cards(
    q: str = Query(default="", description="pokemontcg.io query string e.g. 'name:Pikachu'"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=250, alias="pageSize"),
    order_by: str = Query(default="-set.releaseDate", alias="orderBy"),
):
    if order_by not in VALID_ORDER_BY:
        order_by = "-set.releaseDate"
    try:
        return await pokemon_tcg.search_cards(q, page, page_size, order_by)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/sets")
async def get_sets():
    try:
        return await pokemon_tcg.get_sets()
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/{card_id}")
async def get_card(card_id: str):
    try:
        return await pokemon_tcg.get_card(card_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
