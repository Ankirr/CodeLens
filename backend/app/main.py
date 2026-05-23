from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routes.review import router as review_router

app = FastAPI(
    title="CodeLens API",
    description="Backend API for AI-powered code reviews of public GitHub repositories.",
    version="1.0.0"
)

# Configure CORS Middleware
# Allows the React frontend to communicate smoothly with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, define specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to ensure database tables are created automatically
@app.on_event("startup")
async def on_startup():
    await init_db()

@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": "CodeLens API",
        "details": "Ready to perform code reviews. Send POST requests to /api/review"
    }

# Register the routes
app.include_router(review_router)
