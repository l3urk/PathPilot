
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class SkillScore(BaseModel):
    name: str
    score: float
    source: str
    evidence: str

class UnifiedProfile(BaseModel):
    user_id: str
    name: Optional[str] = None
    skills: List[SkillScore] = []
    raw_sources: Dict[str, Any] = {}

class ProfileRequest(BaseModel):
    github_username: Optional[str] = None
    leetcode_username: Optional[str] = None
    hackerrank_username: Optional[str] = None
    htb_username: Optional[str] = None
    tryhackme_username: Optional[str] = None
    resume_text: Optional[str] = None
    linkedin_text: Optional[str] = None
    target_role: str

class DiagnosticQuestion(BaseModel):
    id: str
    domain: str
    question: str
    anchor: str

class DiagnosticSubmission(BaseModel):
    target_role: str
    answers: Dict[str, int]

class DiagnosticResult(BaseModel):
    skills: List[SkillScore]

class CourseModule(BaseModel):
    id: str
    title: str
    domain: str
    difficulty: str
    duration_hours: float
    description: str
    prerequisites: List[str] = []
    skills_taught: List[str] = []

class PathwayNode(BaseModel):
    module: CourseModule
    order: int
    reason: str
    gap_score: float
    estimated_completion_days: int

class LearningPathway(BaseModel):
    user_id: str
    target_role: str
    total_modules: int
    estimated_days: int
    nodes: List[PathwayNode]
    skill_gaps: List[Dict[str, Any]]
    reasoning_trace: str

class PathwayRequest(BaseModel):
    profile: UnifiedProfile
    target_role: str
    diagnostic_skills: Optional[List[SkillScore]] = None