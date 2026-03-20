from fastapi import APIRouter
from app.models.schemas import DiagnosticQuestion, DiagnosticSubmission, DiagnosticResult, SkillScore

router = APIRouter()

ROLE_QUESTIONS = {
    "software_engineer_backend": [
        DiagnosticQuestion(id="be-1", domain="python", question="Can you write a Python decorator that measures function execution time?", anchor="Anchor: Have you used functools.wraps before?"),
        DiagnosticQuestion(id="be-2", domain="python", question="How comfortable are you with async/await in Python?", anchor="Anchor: Have you used asyncio or FastAPI?"),
        DiagnosticQuestion(id="be-3", domain="dsa", question="Can you implement BFS/DFS on a graph from scratch?", anchor="Anchor: Have you solved graph problems on LeetCode?"),
        DiagnosticQuestion(id="be-4", domain="dsa", question="Do you understand time/space complexity (Big-O)?", anchor="Anchor: Can you analyze O(n log n) vs O(n²)?"),
        DiagnosticQuestion(id="be-5", domain="sql", question="Can you write SQL queries with JOINs, subqueries, and window functions?", anchor="Anchor: Have you used GROUP BY with HAVING?"),
        DiagnosticQuestion(id="be-6", domain="system design", question="Can you design a URL shortener system at scale?", anchor="Anchor: Do you know what consistent hashing is?"),
        DiagnosticQuestion(id="be-7", domain="docker", question="Can you write a Dockerfile and docker-compose for a multi-service app?", anchor="Anchor: Have you used named volumes or networks?"),
    ],
    "software_engineer_frontend": [
        DiagnosticQuestion(id="fe-1", domain="javascript", question="Can you explain closures and the event loop in JavaScript?", anchor="Anchor: Have you debugged async callback issues?"),
        DiagnosticQuestion(id="fe-2", domain="react", question="How comfortable are you with React hooks like useEffect and useCallback?", anchor="Anchor: Have you fixed infinite re-render bugs?"),
        DiagnosticQuestion(id="fe-3", domain="nextjs", question="Do you understand the difference between SSR, SSG, and CSR in Next.js?", anchor="Anchor: Have you used getServerSideProps or App Router?"),
        DiagnosticQuestion(id="fe-4", domain="typescript", question="Can you write TypeScript generics and utility types?", anchor="Anchor: Have you used Partial<T> or Record<K,V>?"),
        DiagnosticQuestion(id="fe-5", domain="api design", question="Can you fetch data, handle loading/error states, and cache results?", anchor="Anchor: Have you used React Query or SWR?"),
    ],
    "cybersecurity_analyst": [
        DiagnosticQuestion(id="cy-1", domain="networking", question="Can you explain the TCP 3-way handshake and why it matters for security?", anchor="Anchor: Do you know what a SYN flood is?"),
        DiagnosticQuestion(id="cy-2", domain="linux", question="How comfortable are you with Linux CLI for security tasks?", anchor="Anchor: Have you used netstat, ps, or lsof?"),
        DiagnosticQuestion(id="cy-3", domain="web security", question="Can you explain and identify a SQL injection vulnerability?", anchor="Anchor: Have you used SQLMap or Burp Suite?"),
        DiagnosticQuestion(id="cy-4", domain="cryptography", question="Do you understand symmetric vs asymmetric encryption?", anchor="Anchor: Can you explain how TLS handshake works?"),
        DiagnosticQuestion(id="cy-5", domain="soc", question="How familiar are you with SIEM tools and reading security logs?", anchor="Anchor: Have you used Splunk or ELK stack?"),
    ],
    "data_scientist": [
        DiagnosticQuestion(id="ds-1", domain="statistics", question="Can you explain p-values and confidence intervals?", anchor="Anchor: Have you run A/B tests or chi-square tests?"),
        DiagnosticQuestion(id="ds-2", domain="machine learning", question="Can you explain the bias-variance tradeoff?", anchor="Anchor: Have you used regularization like L1/L2?"),
        DiagnosticQuestion(id="ds-3", domain="pandas", question="How comfortable are you with data cleaning in Pandas?", anchor="Anchor: Have you dealt with missing data and encoding?"),
        DiagnosticQuestion(id="ds-4", domain="machine learning", question="Can you implement and evaluate a classification pipeline?", anchor="Anchor: Do you know precision vs recall vs F1?"),
        DiagnosticQuestion(id="ds-5", domain="sql", question="Can you query and aggregate data using SQL?", anchor="Anchor: Have you used CTEs or window functions?"),
    ],
    "penetration_tester": [
        DiagnosticQuestion(id="pt-1", domain="networking", question="Can you perform network reconnaissance and port scanning?", anchor="Anchor: Have you used nmap or masscan?"),
        DiagnosticQuestion(id="pt-2", domain="linux", question="How comfortable are you with privilege escalation on Linux?", anchor="Anchor: Have you exploited SUID binaries?"),
        DiagnosticQuestion(id="pt-3", domain="web security", question="Can you exploit OWASP Top 10 vulnerabilities?", anchor="Anchor: Have you done CTF web challenges?"),
        DiagnosticQuestion(id="pt-4", domain="pentest", question="Have you used Metasploit for exploitation?", anchor="Anchor: Can you set up a listener and catch a reverse shell?"),
        DiagnosticQuestion(id="pt-5", domain="cryptography", question="Can you identify and exploit weak cryptographic implementations?", anchor="Anchor: Have you cracked hashes with Hashcat?"),
    ],
    "devops_engineer": [
        DiagnosticQuestion(id="do-1", domain="docker", question="Can you build optimized Docker images and write compose files?", anchor="Anchor: Have you used multi-stage builds?"),
        DiagnosticQuestion(id="do-2", domain="kubernetes", question="How comfortable are you with Kubernetes deployments and services?", anchor="Anchor: Have you configured ingress or HPA?"),
        DiagnosticQuestion(id="do-3", domain="git", question="Can you manage CI/CD pipelines with Git workflows?", anchor="Anchor: Have you used GitHub Actions or GitLab CI?"),
        DiagnosticQuestion(id="do-4", domain="linux", question="How comfortable are you with Linux system administration?", anchor="Anchor: Have you managed services with systemd?"),
        DiagnosticQuestion(id="do-5", domain="system design", question="Can you design a highly available infrastructure?", anchor="Anchor: Do you understand load balancers and health checks?"),
    ],
}

DEFAULT_QUESTIONS = ROLE_QUESTIONS["software_engineer_backend"]

SKILL_MAPPING = {
    "python": "python", "dsa": "dsa", "sql": "sql",
    "system design": "system design", "docker": "docker",
    "networking": "networking", "linux": "linux",
    "web security": "web security", "cryptography": "cryptography",
    "soc": "soc", "statistics": "statistics",
    "machine learning": "machine learning", "pandas": "pandas",
    "javascript": "javascript", "react": "react",
    "nextjs": "nextjs", "typescript": "typescript",
    "api design": "api design", "pentest": "pentest",
    "kubernetes": "kubernetes", "git": "git",
}


@router.get("/questions/{target_role}")
async def get_questions(target_role: str):
    questions = ROLE_QUESTIONS.get(target_role, DEFAULT_QUESTIONS)
    return [q.dict() for q in questions]


@router.post("/submit", response_model=DiagnosticResult)
async def submit_diagnostic(submission: DiagnosticSubmission):
    domain_scores: dict = {}
    questions = ROLE_QUESTIONS.get(submission.target_role, DEFAULT_QUESTIONS)
    q_map = {q.id: q for q in questions}

    for q_id, rating in submission.answers.items():
        if q_id not in q_map:
            continue
        domain = q_map[q_id].domain
        normalized = rating / 5.0
        if domain in domain_scores:
            domain_scores[domain] = max(domain_scores[domain], normalized)
        else:
            domain_scores[domain] = normalized

    skills = []
    for domain, score in domain_scores.items():
        skills.append(SkillScore(
            name=SKILL_MAPPING.get(domain, domain),
            score=score,
            source="quiz",
            evidence=f"Self-assessed {int(score * 5)}/5 on the diagnostic quiz",
        ))

    return DiagnosticResult(skills=skills)