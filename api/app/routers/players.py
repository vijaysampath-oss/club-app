from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from app.database import engine
from app.schemas.player import PlayerCreate, PlayerUpdate, PlayerStatusUpdate, PlayerOut

router = APIRouter(prefix="/players", tags=["players"])


# ✅ GET /players  (List)
@router.get("/", response_model=dict)
def list_players():
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT id, name, phone, skill_level, status, created_at
                FROM players
                ORDER BY id
            """)
        )
        rows = result.mappings().all()

    # Convert RowMapping -> dict so FastAPI/Pydantic can serialize
    players = [dict(r) for r in rows]
    return {"players": players}


# ✅ GET /players/{player_id}  (Get one)
@router.get("/{player_id}", response_model=PlayerOut)
def get_player(player_id: int):
    with engine.connect() as connection:
        row = connection.execute(
            text("""
                SELECT id, name, phone, skill_level, status, created_at
                FROM players
                WHERE id = :id
            """),
            {"id": player_id},
        ).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="Player not found")

    return dict(row)


# ✅ POST /players  (Create)  <-- JSON BODY
@router.post("/", response_model=PlayerOut)
def create_player(payload: PlayerCreate):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                INSERT INTO players (name, phone, skill_level, status)
                VALUES (:name, :phone, :skill_level, :status)
                RETURNING id, name, phone, skill_level, status, created_at
            """),
            {
                "name": payload.name,
                "phone": payload.phone,
                "skill_level": payload.skill_level,
                "status": payload.status,
            },
        )
        connection.commit()
        new_player = result.mappings().first()

    if not new_player:
        raise HTTPException(status_code=500, detail="Failed to create player")

    return dict(new_player)


# ✅ PUT /players/{player_id}  (Update)  <-- JSON BODY
@router.put("/{player_id}", response_model=PlayerOut)
def update_player(player_id: int, payload: PlayerUpdate):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                UPDATE players
                SET name = :name,
                    phone = :phone,
                    skill_level = :skill_level,
                    status = :status
                WHERE id = :id
                RETURNING id, name, phone, skill_level, status, created_at
            """),
            {
                "id": player_id,
                "name": payload.name,
                "phone": payload.phone,
                "skill_level": payload.skill_level,
                "status": payload.status,
            },
        )
        connection.commit()
        updated = result.mappings().first()

    if not updated:
        raise HTTPException(status_code=404, detail="Player not found")

    return dict(updated)


# ✅ PATCH /players/{player_id}/status  (Status only)  <-- JSON BODY
@router.patch("/{player_id}/status", response_model=PlayerOut)
def update_status(player_id: int, payload: PlayerStatusUpdate):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                UPDATE players
                SET status = :status
                WHERE id = :id
                RETURNING id, name, phone, skill_level, status, created_at
            """),
            {"id": player_id, "status": payload.status},
        )
        connection.commit()
        updated = result.mappings().first()

    if not updated:
        raise HTTPException(status_code=404, detail="Player not found")

    return dict(updated)