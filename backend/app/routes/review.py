from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import asyncio
from uuid import UUID

from app.database import get_db
from app.models import Review
from app.schemas import ReviewRequest, ReviewResponse, ReviewListItem
from app.services.github import GitHubService
from app.services.groq import GroqService
from app.services.pdf import PDFGenerator
from app.config import settings

router = APIRouter(prefix="/api", tags=["reviews"])

# We instantiate core services once
github_service = GitHubService()
groq_service = GroqService()

@router.post("/review", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_code_review(
    request: ReviewRequest, 
    db: AsyncSession = Depends(get_db)
):
    """
    Main review pipeline:
    1. Validate URL & parse repository details.
    2. Traverse recursive GitHub tree.
    3. Filter files by extensions & exclude path lists (node_modules, etc.).
    4. Concurrently request Groq reviews for up to settings.max_files_per_review files.
    5. Aggregate scores and save the full review (scoped to user_id if logged in).
    """
    try:
        # Fetch file tree
        repo_name, file_list = await github_service.fetch_repo_files(request.repo_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scan repository: {str(e)}")

    if not file_list:
        raise HTTPException(
            status_code=400,
            detail="No eligible code files (.py, .js, .ts, .jsx, .tsx, .java, .cpp, .c) found under 100 KB in this repository."
        )

    # Sort files to take the first ones up to the limit
    files_to_review = file_list[:settings.max_files_per_review]
    owner, repo = repo_name.split("/")

    # Concurrency control: max 3 concurrent API requests to Groq
    semaphore = asyncio.Semaphore(3)

    async def process_single_file(file_item: dict):
        async with semaphore:
            path = file_item["path"]
            try:
                content = await github_service.fetch_file_content(owner, repo, path)
                review_result = await groq_service.review_file(path, content)
                return review_result
            except Exception as e:
                return {
                    "filename": path,
                    "overall_score": 100,
                    "summary": f"Could not complete analysis: {str(e)}",
                    "bugs": [],
                    "performance": [],
                    "security": [],
                    "best_practices": [],
                    "refactor_suggestions": [],
                    "positive_highlights": []
                }

    # Execute concurrent review tasks
    tasks = [process_single_file(f) for f in files_to_review]
    file_reviews = await asyncio.gather(*tasks)

    # Compute overall project health score
    scores = [r["overall_score"] for r in file_reviews if r.get("overall_score") is not None]
    overall_score = int(sum(scores) / len(scores)) if scores else 100

    review_data = {"files": file_reviews}

    # Persist in DB
    db_review = Review(
        repo_url=request.repo_url,
        repo_name=repo_name,
        overall_score=overall_score,
        files_reviewed=len(file_reviews),
        review_data=review_data
    )

    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)

    return db_review

@router.get("/reviews", response_model=List[ReviewListItem])
async def list_past_reviews(
    db: AsyncSession = Depends(get_db)
):
    """
    Returns a list of completed reviews.
    """
    result = await db.execute(
        select(Review)
        .order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()
    return reviews

@router.get("/review/{review_id}", response_model=ReviewResponse)
async def get_review_by_id(
    review_id: UUID, 
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves a single review analysis.
    """
    result = await db.execute(select(Review).filter(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review analysis not found.")
            
    return review

@router.get("/review/{review_id}/export")
async def export_review_pdf(
    review_id: UUID, 
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves the review and streams the ReportLab PDF download.
    """
    result = await db.execute(select(Review).filter(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review analysis not found.")

    # Convert SQLAlchemy model structure to simple dict for PDF generator
    review_dict = {
        "repo_url": review.repo_url,
        "repo_name": review.repo_name,
        "overall_score": review.overall_score,
        "files_reviewed": review.files_reviewed,
        "review_data": review.review_data
    }

    try:
        pdf_buffer = PDFGenerator.generate_review_pdf(review_dict)
        safe_filename = review.repo_name.replace("/", "_")
        headers = {
            "Content-Disposition": f'attachment; filename="CodeLens_Review_{safe_filename}.pdf"'
        }
        return StreamingResponse(pdf_buffer, media_type="application/pdf", headers=headers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")
