from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import models
import schemas
from database import get_db
from security import get_current_user
from datetime import datetime

router = APIRouter()

# Models specific to community features
class PostCreate(BaseModel):
    title: str
    content: str
    is_anonymous: bool = False
    category: Optional[str] = None

class PostResponse(PostCreate):
    id: int
    user_id: Optional[int] = None
    author_name: Optional[str] = None
    created_at: datetime
    likes_count: int = 0

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content: str
    is_anonymous: bool = False

class CommentResponse(CommentCreate):
    id: int
    post_id: int
    user_id: Optional[int] = None
    author_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Posts
@router.post("/posts", response_model=PostResponse)
def create_post(
    post: PostCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_post = models.Post(
        **post.dict(),
        user_id=None if post.is_anonymous else current_user.id,
        author_name="Anonymous" if post.is_anonymous else current_user.full_name
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.get("/posts", response_model=List[PostResponse])
def get_posts(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(models.Post)
    if category:
        query = query.filter(models.Post.category == category)
    return query.order_by(models.Post.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

@router.post("/posts/{post_id}/like")
def like_post(
    post_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user already liked the post
    like = db.query(models.PostLike)\
        .filter(
            models.PostLike.post_id == post_id,
            models.PostLike.user_id == current_user.id
        ).first()
    
    if like:
        db.delete(like)
        post.likes_count -= 1
    else:
        like = models.PostLike(post_id=post_id, user_id=current_user.id)
        db.add(like)
        post.likes_count += 1
    
    db.commit()
    return {"likes_count": post.likes_count}

# Comments
@router.post("/posts/{post_id}/comments", response_model=CommentResponse)
def create_comment(
    post_id: int,
    comment: CommentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db_comment = models.Comment(
        **comment.dict(),
        post_id=post_id,
        user_id=None if comment.is_anonymous else current_user.id,
        author_name="Anonymous" if comment.is_anonymous else current_user.full_name
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(
    post_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    return db.query(models.Comment)\
        .filter(models.Comment.post_id == post_id)\
        .order_by(models.Comment.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
