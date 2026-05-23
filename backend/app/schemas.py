from pydantic import BaseModel, Field, HttpUrl, field_validator, EmailStr
from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime
import re

class ReviewRequest(BaseModel):
    repo_url: str = Field(..., description="The public GitHub repository URL")

    @field_validator("repo_url")
    @classmethod
    def validate_github_url(cls, v: str) -> str:
        # Standardize and validate GitHub URLs
        cleaned = v.strip().rstrip("/")
        match = re.match(r"^https?://(?:www\.)?github\.com/([^/]+)/([^/&#\?]+)", cleaned)
        if not match:
            raise ValueError("Invalid GitHub repository URL. Must be like 'https://github.com/owner/repo'")
        
        owner = match.group(1)
        repo = match.group(2)
        if repo.endswith(".git"):
            repo = repo[:-4]
            
        return f"https://github.com/{owner}/{repo}"

# Sub-structures for structured LLM reviews
class CodeIssue(BaseModel):
    severity: str = Field(..., description="high|medium|low")
    line: Optional[int] = Field(None, description="Line number of the issue or null")
    issue: str = Field(..., description="Description of the issue")
    fix: str = Field(..., description="Actionable code fix or suggestion")

class BestPracticeIssue(BaseModel):
    severity: str = Field(..., description="high|medium|low")
    issue: str = Field(..., description="Description of the issue")
    fix: str = Field(..., description="Actionable recommendation")

class RefactorSuggestion(BaseModel):
    issue: str = Field(..., description="Code refactoring opportunity description")
    fix: str = Field(..., description="Proposed refactored structure or implementation details")

class SingleFileReview(BaseModel):
    filename: str
    overall_score: int = Field(..., ge=0, le=100)
    summary: str
    bugs: List[CodeIssue] = []
    performance: List[CodeIssue] = []
    security: List[CodeIssue] = []
    best_practices: List[BestPracticeIssue] = []
    refactor_suggestions: List[RefactorSuggestion] = []
    positive_highlights: List[str] = []

# Response definitions
class ReviewListItem(BaseModel):
    id: UUID
    repo_url: str
    repo_name: str
    overall_score: Optional[int] = None
    files_reviewed: int
    created_at: datetime
    user_id: Optional[UUID] = None

    class Config:
        from_attributes = True

class ReviewResponse(BaseModel):
    id: UUID
    repo_url: str
    repo_name: str
    overall_score: Optional[int] = None
    files_reviewed: int
    review_data: Any # Contains the SingleFileReview models nested
    created_at: datetime
    user_id: Optional[UUID] = None

    class Config:
        from_attributes = True

# --- USER AUTHENTICATION SCHEMAS ---

class UserRegister(BaseModel):
    email: str = Field(..., description="Valid user email address")
    password: str = Field(..., min_length=6, description="Password (minimum 6 characters)")
    name: str = Field(..., min_length=1, description="Full name or developer display name")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", cleaned):
            raise ValueError("Invalid email format")
        return cleaned

class UserLogin(BaseModel):
    email: str = Field(...)
    password: str = Field(...)

class GoogleAuthRequest(BaseModel):
    email: str = Field(..., description="Email address associated with the Google Account")
    name: str = Field(..., description="Google Profile Name")
    google_id: str = Field(..., description="Simulated Google Unique User ID")

class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
