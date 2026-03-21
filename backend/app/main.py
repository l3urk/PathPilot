from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import profile, pathway, diagnostic, health, resume

app = FastAPI(title="PathPilot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(profile.router, prefix="/api/profile")
app.include_router(pathway.router, prefix="/api/pathway")
app.include_router(diagnostic.router, prefix="/api/diagnostic")
app.include_router(resume.router, prefix="/api/resume")