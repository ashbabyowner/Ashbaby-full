from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db
from security import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=schemas.GoalResponse)
def create_goal(
    goal: schemas.GoalCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_goal = models.Goal(
        **goal.dict(),
        user_id=current_user.id,
        status="in_progress"
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.get("/", response_model=List[schemas.GoalResponse])
def get_goals(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Goal)\
        .filter(models.Goal.user_id == current_user.id)\
        .all()

@router.get("/{goal_id}", response_model=schemas.GoalResponse)
def get_goal(
    goal_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(models.Goal)\
        .filter(models.Goal.id == goal_id, models.Goal.user_id == current_user.id)\
        .first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal

@router.put("/{goal_id}", response_model=schemas.GoalResponse)
def update_goal(
    goal_id: int,
    goal_update: schemas.GoalUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(models.Goal)\
        .filter(models.Goal.id == goal_id, models.Goal.user_id == current_user.id)\
        .first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    for key, value in goal_update.dict(exclude_unset=True).items():
        setattr(goal, key, value)
    
    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(models.Goal)\
        .filter(models.Goal.id == goal_id, models.Goal.user_id == current_user.id)\
        .first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted successfully"}
