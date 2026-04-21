from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

Status = Literal["active", "inactive", "guest"]

class PlayerCreate(BaseModel):
    name: str = Field(..., min_length=1)
    phone: Optional[str] = None
    skill_level: int = Field(3, ge=1, le=5)
    status: Status = "active"

class PlayerUpdate(BaseModel):
    name: str = Field(..., min_length=1)
    phone: Optional[str] = None
    skill_level: int = Field(3, ge=1, le=5)
    status: Status = "active"

class PlayerStatusUpdate(BaseModel):
    status: Status

class PlayerOut(BaseModel):
    id: int
    name: str
    phone: Optional[str]
    skill_level: int
    status: Status
    created_at: datetime
