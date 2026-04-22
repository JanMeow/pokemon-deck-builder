from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import cards, decks, meta

app = FastAPI(title="Pokemon Deck Builder API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cards.router)
app.include_router(decks.router)
app.include_router(meta.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
