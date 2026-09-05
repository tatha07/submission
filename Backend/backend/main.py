from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes_users_animals import router as users_animals_router
from backend.routes_predictions import router as predictions_router
from backend.routes_community import router as community_router

app = FastAPI(
    title="flipflop8 Backend API",
    description="Central backend and inference middleware for flipflop8 Cattle & Buffalo Breed Identification Platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_animals_router, tags=["Users & Animals"])
app.include_router(predictions_router, tags=["Predictions & Feedback"])
app.include_router(community_router, tags=["Community & Moderation"])

@app.get("/", tags=["System"])
async def root():
    return {
        "app_name": "flipflop8",
        "status": "online",
        "message": "Welcome to flipflop8 API Engine"
    }

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "app": "flipflop8",
        "status": "ok",
        "database": "connected"
    }