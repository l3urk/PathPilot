from fastapi import APIRouter
from app.models.schemas import PathwayRequest, LearningPathway, PathwayNode
from app.core.catalog import get_catalog, get_role_requirements, get_all_roles
from app.services.llm_service import generate_pathway

router = APIRouter()


@router.post("/generate", response_model=LearningPathway)
async def generate_learning_pathway(req: PathwayRequest):
    catalog = get_catalog()
    catalog_map = {m.id: m for m in catalog}
    role_reqs = get_role_requirements(req.target_role)

    profile = req.profile
    if req.diagnostic_skills:
        existing = {s.name for s in profile.skills}
        for s in req.diagnostic_skills:
            if s.name not in existing:
                profile.skills.append(s)

    result = await generate_pathway(profile, role_reqs, req.target_role, catalog)

    nodes = []
    for node_data in result.get("nodes", []):
        mid = node_data.get("module_id")
        if mid not in catalog_map:
            continue
        nodes.append(PathwayNode(
            module=catalog_map[mid],
            order=node_data.get("order", len(nodes) + 1),
            reason=node_data.get("reason", ""),
            gap_score=node_data.get("gap_score", 0.5),
            estimated_completion_days=node_data.get("estimated_completion_days", 7),
        ))

    nodes.sort(key=lambda x: x.order)
    total_days = sum(n.estimated_completion_days for n in nodes)

    return LearningPathway(
        user_id=profile.user_id,
        target_role=req.target_role,
        total_modules=len(nodes),
        estimated_days=total_days,
        nodes=nodes,
        skill_gaps=result.get("skill_gaps", []),
        reasoning_trace=result.get("reasoning_trace", ""),
    )


@router.get("/roles")
async def list_roles():
    return get_all_roles()