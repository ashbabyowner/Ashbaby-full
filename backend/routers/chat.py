from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db
from security import get_current_user
import openai
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

@router.post("/message", response_model=schemas.ChatMessageResponse)
async def send_message(
    message: schemas.ChatMessageCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Save user message
    db_message = models.ChatMessage(
        user_id=current_user.id,
        content=message.content,
        is_ai=False,
        context=message.context
    )
    db.add(db_message)
    db.commit()

    try:
        # Generate AI response using OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a supportive AI assistant helping {current_user.full_name}. "
                              f"User age: {current_user.age}, Gender: {current_user.gender}"
                },
                {"role": "user", "content": message.content}
            ],
            max_tokens=150
        )

        ai_response = response.choices[0].message.content

        # Save AI response
        ai_message = models.ChatMessage(
            user_id=current_user.id,
            content=ai_response,
            is_ai=True,
            context=message.context
        )
        db.add(ai_message)
        db.commit()
        db.refresh(ai_message)
        return ai_message

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[schemas.ChatMessageResponse])
async def get_chat_history(
    limit: int = 50,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(models.ChatMessage)\
        .filter(models.ChatMessage.user_id == current_user.id)\
        .order_by(models.ChatMessage.timestamp.desc())\
        .limit(limit)\
        .all()
    return messages
