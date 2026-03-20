import httpx
from typing import Dict, Any

async def extract_github(username: str) -> Dict[str, Any]:
    if not username:
        return {}
    
    base = "https://api.github.com"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "PathPilot/1.0"
    }
    result = {
        "username": username,
        "repos": [],
        "languages": {},
        "topics": [],
        "stats": {}
    }

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            # Get user info
            r = await client.get(f"{base}/users/{username}", headers=headers)
            if r.status_code == 200:
                user = r.json()
                result["stats"] = {
                    "public_repos": user.get("public_repos", 0),
                    "followers": user.get("followers", 0),
                    "name": user.get("name", username),
                }

            # Get repos
            r = await client.get(
                f"{base}/users/{username}/repos?per_page=50&sort=updated",
                headers=headers
            )
            if r.status_code == 200:
                repos = r.json()
                lang_bytes: Dict[str, int] = {}
                all_topics = []

                for repo in repos[:20]:
                    if repo.get("fork"):
                        continue
                    result["repos"].append({
                        "name": repo["name"],
                        "description": repo.get("description", ""),
                        "language": repo.get("language"),
                        "stars": repo.get("stargazers_count", 0),
                        "topics": repo.get("topics", []),
                    })
                    if repo.get("language"):
                        lang_bytes[repo["language"]] = lang_bytes.get(repo["language"], 0) + repo.get("size", 1)
                    all_topics.extend(repo.get("topics", []))

                result["languages"] = lang_bytes
                result["topics"] = list(set(all_topics))

        except Exception as e:
            result["error"] = str(e)

    return result