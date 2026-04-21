from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from app.database import engine
from app.schemas.session import SessionCreate, SessionUpdate, SessionStatusUpdate, SessionOut

router = APIRouter(prefix="/sessions", tags=["sessions"])


def row_to_dict(row):
    # row is RowMapping from SQLAlchemy; convert to plain dict for JSON
    return dict(row) if row else None


@router.get("/", response_model=dict)
def list_sessions():
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT id, title, session_time, venue, capacity, status, created_at
                FROM sessions
                ORDER BY session_time DESC, id DESC
            """)
        )
        sessions = [dict(r) for r in result.mappings().all()]
    return {"sessions": sessions}


@router.get("/{session_id}", response_model=SessionOut)
def get_session(session_id: int):
    with engine.connect() as connection:
        row = connection.execute(
            text("""
                SELECT id, title, session_time, venue, capacity, status, created_at
                FROM sessions
                WHERE id = :id
            """),
            {"id": session_id},
        ).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="Session not found")

    return row_to_dict(row)


@router.post("/", response_model=SessionOut)
def create_session(payload: SessionCreate):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                INSERT INTO sessions (title, session_time, venue, capacity, status)
                VALUES (:title, :session_time, :venue, :capacity, :status)
                RETURNING id, title, session_time, venue, capacity, status, created_at
            """),
            {
                "title": payload.title,
                "session_time": payload.session_time,
                "venue": payload.venue,
                "capacity": payload.capacity,
                "status": payload.status,
            },
        )
        connection.commit()
        new_session = result.mappings().first()

    return row_to_dict(new_session)


@router.put("/{session_id}", response_model=SessionOut)
def update_session(session_id: int, payload: SessionUpdate):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                UPDATE sessions
                SET title = :title,
                    session_time = :session_time,
                    venue = :venue,
                    capacity = :capacity,
                    status = :status
                WHERE id = :id
                RETURNING id, title, session_time, venue, capacity, status, created_at
            """),
            {
                "id": session_id,
                "title": payload.title,
                "session_time": payload.session_time,
                "venue": payload.venue,
                "capacity": payload.capacity,
                "status": payload.status,
            },
        )
        connection.commit()
        updated = result.mappings().first()

    if not updated:
        raise HTTPException(status_code=404, detail="Session not found")

    return row_to_dict(updated)


@router.patch("/{session_id}/status", response_model=SessionOut)
def update_session_status(session_id: int, payload: SessionStatusUpdate):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                UPDATE sessions
                SET status = :status
                WHERE id = :id
                RETURNING id, title, session_time, venue, capacity, status, created_at
            """),
            {"id": session_id, "status": payload.status},
        )
        connection.commit()
        updated = result.mappings().first()

    if not updated:
        raise HTTPException(status_code=404, detail="Session not found")

    return row_to_dict(updated)