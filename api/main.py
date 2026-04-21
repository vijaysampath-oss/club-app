from fastapi import FastAPI
app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware
from app.routers import players
from app.routers import sessions
from app.routers import votes
from fastapi import Header, HTTPException
import os

ADMIN_EMAILS = ["vijaysampath@gmail.com", "rosspiggott84@gmail.com"]

@app.post("/sessions")
def create_session(data: dict, x_user_email: str = Header(None)):
    if not x_user_email or x_user_email.lower() not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Not authorized")

    # your existing logic
    return {"message": "Session created"}

app = FastAPI(title="Badminton Club API")


app.include_router(players.router)
app.include_router(sessions.router)
app.include_router(votes.router)


@app.get("/")
def root():
    return {"message": "Badminton Club API Running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
