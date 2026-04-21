from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from app.database import engine

router = APIRouter(prefix="/votes", tags=["votes"])


@router.post("/")
def cast_vote(session_id: int, player_id: int, vote: str):
    vote = vote.lower().strip()
    if vote not in {"yes", "no", "maybe"}:
        raise HTTPException(status_code=400, detail="vote must be yes/no/maybe")

    with engine.connect() as connection:
        # ensure session exists
        s = connection.execute(
            text("SELECT 1 FROM sessions WHERE id = :id"),
            {"id": session_id},
        ).first()
        if not s:
            raise HTTPException(status_code=404, detail="Session not found")

        # ensure player exists
        p = connection.execute(
            text("SELECT 1 FROM players WHERE id = :id"),
            {"id": player_id},
        ).first()
        if not p:
            raise HTTPException(status_code=404, detail="Player not found")

        # upsert vote (insert or update)
        result = connection.execute(
            text("""
                INSERT INTO session_votes (session_id, player_id, vote)
                VALUES (:session_id, :player_id, :vote)
                ON CONFLICT (session_id, player_id)
                DO UPDATE SET vote = EXCLUDED.vote
                RETURNING session_id, player_id, vote, created_at
            """),
            {"session_id": session_id, "player_id": player_id, "vote": vote},
        )
        connection.commit()
        return result.mappings().first()


@router.get("/session/{session_id}")
def votes_for_session(session_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                  sv.session_id,
                  sv.player_id,
                  p.name,
                  sv.vote,
                  sv.created_at
                FROM session_votes sv
                JOIN players p ON p.id = sv.player_id
                WHERE sv.session_id = :session_id
                ORDER BY sv.created_at DESC
            """),
            {"session_id": session_id},
        )
        rows = result.mappings().all()
        return {"session_id": session_id, "votes": rows}


@router.get("/session/{session_id}/summary")
def vote_summary(session_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                  vote,
                  COUNT(*)::int AS count
                FROM session_votes
                WHERE session_id = :session_id
                GROUP BY vote
            """),
            {"session_id": session_id},
        )
        rows = result.mappings().all()

    summary = {"yes": 0, "no": 0, "maybe": 0}
    for r in rows:
        summary[r["vote"]] = r["count"]

    return {"session_id": session_id, "summary": summary}
