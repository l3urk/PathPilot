import uuid
from fastapi import APIRouter, HTTPException
from app.models.schemas import ProfileRequest, UnifiedProfile
from app.extractors.github_extractor import extract_github
from app.extractors.leetcode_extractor import extract_leetcode
from app.extractors.platform_extractors import extract_hackthebox, extract_tryhackme, extract_hackerrank
from app.services.llm_service import fuse_profile

router = APIRouter()


@router.post("/extract", response_model=UnifiedProfile)
async def extract_profile(req: ProfileRequest):
    raw_sources = {}

    if req.github_username:
        raw_sources["github"] = await extract_github(req.github_username)

    if req.leetcode_username:
        raw_sources["leetcode"] = await extract_leetcode(req.leetcode_username)

    if req.hackerrank_username:
        raw_sources["hackerrank"] = await extract_hackerrank(req.hackerrank_username)

    if req.htb_username:
        raw_sources["hackthebox"] = await extract_hackthebox(req.htb_username)

    if req.tryhackme_username:
        raw_sources["tryhackme"] = await extract_tryhackme(req.tryhackme_username)

    if req.resume_text:
        raw_sources["resume"] = {"text": req.resume_text[:4000]}

    if req.linkedin_text:
        raw_sources["linkedin"] = {"text": req.linkedin_text[:2000]}

    if not raw_sources:
        raise HTTPException(status_code=400, detail="At least one profile source is required")

    user_id = str(uuid.uuid4())
    profile = await fuse_profile(raw_sources, req.target_role, user_id)
    return profile