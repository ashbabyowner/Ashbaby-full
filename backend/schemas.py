from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    target_date: datetime

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    target_date: Optional[datetime] = None
    progress: Optional[float] = None
    status: Optional[str] = None

class GoalResponse(GoalBase):
    id: int
    user_id: int
    progress: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class WellnessLogCreate(BaseModel):
    nutrition: Dict[str, Any]
    exercise: Dict[str, Any]
    sleep: Dict[str, Any]

class WellnessLogResponse(WellnessLogCreate):
    id: int
    user_id: int
    date: datetime

    class Config:
        from_attributes = True

class MoodEntryCreate(BaseModel):
    mood_score: int
    notes: Optional[str] = None

class MoodEntryResponse(MoodEntryCreate):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class JournalEntryCreate(BaseModel):
    title: str
    content: str
    category: Optional[str] = None

class JournalEntryResponse(JournalEntryCreate):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class ChatMessageCreate(BaseModel):
    content: str
    context: Optional[Dict[str, Any]] = None

class ChatMessageResponse(ChatMessageCreate):
    id: int
    user_id: int
    is_ai: bool
    timestamp: datetime

    class Config:
        from_attributes = True
