import uuid
from sqlalchemy import Column, String, Integer, JSON, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_url = Column(String, nullable=False)
    repo_name = Column(String, nullable=False)
    overall_score = Column(Integer, nullable=True)
    files_reviewed = Column(Integer, default=0)
    review_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
