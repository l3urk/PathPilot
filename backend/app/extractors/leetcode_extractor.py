import httpx
from typing import Dict, Any

LEETCODE_GQL = "https://leetcode.com/graphql"

QUERY = """
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    submitStats: submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
    tagProblemCounts {
      advanced { tagName problemsSolved }
      intermediate { tagName problemsSolved }
      fundamental { tagName problemsSolved }
    }
  }
  userContestRanking(username: $username) {
    rating
    globalRanking
  }
}
"""

async def extract_leetcode(username: str) -> Dict[str, Any]:
    if not username:
        return {}

    headers = {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
        "User-Agent": "Mozilla/5.0",
    }

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            r = await client.post(
                LEETCODE_GQL,
                json={"query": QUERY, "variables": {"username": username}},
                headers=headers,
            )
            if r.status_code != 200:
                return {"error": f"HTTP {r.status_code}"}

            data = r.json().get("data", {})
            user = data.get("matchedUser")
            if not user:
                return {"error": "User not found"}

            submission_stats = {}
            for item in (user.get("submitStats", {}).get("acSubmissionNum") or []):
                submission_stats[item["difficulty"]] = item["count"]

            top_tags = []
            tag_counts = user.get("tagProblemCounts", {}) or {}
            for level in ["advanced", "intermediate", "fundamental"]:
                for tag in (tag_counts.get(level) or [])[:5]:
                    top_tags.append({
                        "tag": tag["tagName"],
                        "solved": tag["problemsSolved"]
                    })

            contest = data.get("userContestRanking") or {}

            return {
                "username": username,
                "solved": {
                    "easy": submission_stats.get("Easy", 0),
                    "medium": submission_stats.get("Medium", 0),
                    "hard": submission_stats.get("Hard", 0),
                    "total": submission_stats.get("All", 0),
                },
                "top_tags": sorted(top_tags, key=lambda x: x["solved"], reverse=True)[:10],
                "contest_rating": contest.get("rating"),
            }

        except Exception as e:
            return {"error": str(e)}