from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


# What client sends to CREATE a session
class SessionCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    session_time: datetime  # ISO format e.g. "2026-02-27T19:30:00"
    venue: Optional[str] = Field(default=None, max_length=200)
    capacity: int = Field(default=16, ge=1, le=100)
    status: Literal["open", "closed", "cancelled"] = "open"


# What client sends to UPDATE all fields (PUT)
class SessionUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    session_time: datetime
    venue: Optional[str] = Field(default=None, max_length=200)
    capacity: int = Field(default=16, ge=1, le=100)
    status: Literal["open", "closed", "cancelled"] = "open"


# What client sends to update ONLY status (PATCH)
class SessionStatusUpdate(BaseModel):
    status: Literal["open", "closed", "cancelled"]


# What API returns
class SessionOut(BaseModel):
    id: int
    title: str
    session_time: datetime
    venue: Optional[str] = None
    capacity: int
    status: str
    created_at: datetime