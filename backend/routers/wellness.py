from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db
from security import get_current_user
from datetime import datetime, date

router = APIRouter()

# Wellness Logs
@router.post("/logs", response_model=schemas.WellnessLogResponse)
def create_wellness_log(
    log: schemas.WellnessLogCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_log = models.WellnessLog(
        **log.dict(),
        user_id=current_user.id
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/logs", response_model=List[schemas.WellnessLogResponse])
def get_wellness_logs(
    start_date: date = None,
    end_date: date = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.WellnessLog)\
        .filter(models.WellnessLog.user_id == current_user.id)
    
    if start_date:
        query = query.filter(models.WellnessLog.date >= start_date)
    if end_date:
        query = query.filter(models.WellnessLog.date <= end_date)
    
    return query.order_by(models.WellnessLog.date.desc()).all()

# Mood Entries
@router.post("/mood", response_model=schemas.MoodEntryResponse)
def create_mood_entry(
    mood: schemas.MoodEntryCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_mood = models.MoodEntry(
        **mood.dict(),
        user_id=current_user.id
    )
    db.add(db_mood)
    db.commit()
    db.refresh(db_mood)
    return db_mood

@router.get("/mood", response_model=List[schemas.MoodEntryResponse])
def get_mood_entries(
    limit: int = 30,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.MoodEntry)\
        .filter(models.MoodEntry.user_id == current_user.id)\
        .order_by(models.MoodEntry.timestamp.desc())\
        .limit(limit)\
        .all()

# Journal Entries
@router.post("/journal", response_model=schemas.JournalEntryResponse)
def create_journal_entry(
    entry: schemas.JournalEntryCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_entry = models.JournalEntry(
        **entry.dict(),
        user_id=current_user.id
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.get("/journal", response_model=List[schemas.JournalEntryResponse])
def get_journal_entries(
    category: str = None,
    limit: int = 50,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.JournalEntry)\
        .filter(models.JournalEntry.user_id == current_user.id)
    
    if category:
        query = query.filter(models.JournalEntry.category == category)
    
    return query.order_by(models.JournalEntry.timestamp.desc())\
        .limit(limit)\
        .all()
