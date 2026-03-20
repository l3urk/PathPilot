import httpx
from bs4 import BeautifulSoup
from typing import Dict, Any


async def extract_hackthebox(username: str) -> Dict[str, Any]:
    if not username:
        return {}
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            r = await client.get(
                f"https://www.hackthebox.com/api/v4/profile/activity/{username}",
                headers={"User-Agent": "Mozilla/5.0"},
            )
            if r.status_code == 200:
                data = r.json()
                profile = data.get("profile", {})
                return {
                    "username": username,
                    "rank": profile.get("rank"),
                    "points": profile.get("points"),
                    "user_owns": profile.get("user_owns", 0),
                    "system_owns": profile.get("system_owns", 0),
                }
    except Exception:
        pass
    return {
        "username": username,
        "note": "Profile unavailable",
    }


async def extract_tryhackme(username: str) -> Dict[str, Any]:
    if not username:
        return {}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                f"https://tryhackme.com/api/user/rank/{username}",
                headers={"User-Agent": "Mozilla/5.0"},
            )
            if r.status_code == 200:
                data = r.json()
                return {
                    "username": username,
                    "points": data.get("points", 0),
                    "rank": data.get("userRank"),
                    "completed_rooms": data.get("completedRooms", 0),
                }
    except Exception:
        pass
    return {"username": username, "note": "Profile unavailable"}


async def extract_hackerrank(username: str) -> Dict[str, Any]:
    if not username:
        return {}
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            r = await client.get(
                f"https://www.hackerrank.com/{username}",
                headers={"User-Agent": "Mozilla/5.0"},
            )
            if r.status_code == 200:
                soup = BeautifulSoup(r.text, "html.parser")
                badges = []
                for badge in soup.select(".badge-title"):
                    badges.append(badge.get_text(strip=True))
                return {
                    "username": username,
                    "badges": badges[:10],
                }
    except Exception:
        pass
    return {"username": username, "note": "Profile unavailable"}