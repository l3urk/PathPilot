import json
from openai import AsyncOpenAI
from typing import Dict, Any, List
from app.models.schemas import SkillScore, UnifiedProfile
from app.core.config import settings

client = AsyncOpenAI(
    api_key=settings.groq_api_key,
    base_url="https://api.groq.com/openai/v1"
)


def _build_fusion_prompt(raw_sources: Dict[str, Any], target_role: str) -> str:
    return f"""You are a skill extraction engine. Analyze the following multi-source profile data and extract a unified skill profile.

TARGET ROLE: {target_role}

RAW PROFILE DATA:
{json.dumps(raw_sources, indent=2)}

Extract skills relevant to the target role. For each skill assign a confidence score 0.0-1.0 based on evidence strength.

Return ONLY valid JSON, no markdown, no explanation:
{{
  "name": "string or null",
  "skills": [
    {{
      "name": "skill name lowercase",
      "score": 0.0,
      "source": "github|leetcode|hackerrank|htb|tryhackme|resume|linkedin|quiz",
      "evidence": "one sentence explaining the score"
    }}
  ]
}}

Rules:
- Include 8-20 skills
- Only include skills with score >= 0.1
- Use normalized names: python, react, sql, docker, machine learning, networking, web security, linux, dsa, etc.
- Do not hallucinate skills with no evidence
"""


def _build_pathway_prompt(profile: UnifiedProfile, role_requirements: Dict, target_role: str, catalog_summary: str) -> str:
    skill_map = {s.name: s.score for s in profile.skills}
    gaps = []
    for skill, required_score in role_requirements["required_skills"].items():
        current = skill_map.get(skill, 0.0)
        if current < required_score:
            gaps.append({
                "skill": skill,
                "current": round(current, 2),
                "required": round(required_score, 2),
                "gap": round(required_score - current, 2)
            })
    gaps.sort(key=lambda x: x["gap"], reverse=True)

    return f"""You are an adaptive learning pathway engine. Generate a personalized training pathway.

TARGET ROLE: {role_requirements.get('display', target_role)}

LEARNER SKILL PROFILE:
{json.dumps([s.dict() for s in profile.skills], indent=2)}

SKILL GAPS (sorted by priority):
{json.dumps(gaps, indent=2)}

AVAILABLE COURSE CATALOG:
{catalog_summary}

RECOMMENDED MODULE IDs FOR THIS ROLE: {role_requirements.get('recommended_modules', [])}

Generate an optimized learning pathway. Rules:
1. Only include modules from the catalog
2. Respect prerequisites
3. Skip modules where learner score >= 0.8
4. Order by critical gap first then prerequisites

Return ONLY valid JSON:
{{
  "nodes": [
    {{
      "module_id": "string",
      "order": 1,
      "reason": "why this module for this learner",
      "gap_score": 0.0,
      "estimated_completion_days": 7
    }}
  ],
  "skill_gaps": {json.dumps(gaps)},
  "reasoning_trace": "2-3 sentence explanation of the curation strategy"
}}
"""


async def fuse_profile(raw_sources: Dict[str, Any], target_role: str, user_id: str) -> UnifiedProfile:
    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=1500,
        messages=[{"role": "user", "content": _build_fusion_prompt(raw_sources, target_role)}]
    )

    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    parsed = json.loads(text)
    skills = [SkillScore(**s) for s in parsed.get("skills", [])]
    return UnifiedProfile(
        user_id=user_id,
        name=parsed.get("name"),
        skills=skills,
        raw_sources=raw_sources,
    )


async def generate_pathway(profile: UnifiedProfile, role_requirements: Dict, target_role: str, catalog) -> Dict[str, Any]:
    catalog_summary = json.dumps([
        {
            "id": m.id,
            "title": m.title,
            "domain": m.domain,
            "difficulty": m.difficulty,
            "skills_taught": m.skills_taught,
            "prerequisites": m.prerequisites
        }
        for m in catalog
    ], indent=1)

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=2000,
        messages=[{"role": "user", "content": _build_pathway_prompt(profile, role_requirements, target_role, catalog_summary)}]
    )

    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    return json.loads(text)