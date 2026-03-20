
from typing import List, Dict
from app.models.schemas import CourseModule

COURSE_CATALOG: List[Dict] = [
    # Software Engineering
    {"id":"se-001","title":"Python Fundamentals","domain":"programming","difficulty":"beginner","duration_hours":8,"description":"Variables, loops, functions, OOP basics.","prerequisites":[],"skills_taught":["python","programming basics"]},
    {"id":"se-002","title":"Python Advanced Patterns","domain":"programming","difficulty":"intermediate","duration_hours":10,"description":"Decorators, generators, async/await, type hints.","prerequisites":["se-001"],"skills_taught":["python","async programming"]},
    {"id":"se-003","title":"Data Structures & Algorithms","domain":"dsa","difficulty":"intermediate","duration_hours":20,"description":"Arrays, trees, graphs, dynamic programming.","prerequisites":["se-001"],"skills_taught":["dsa","problem solving","algorithms"]},
    {"id":"se-004","title":"System Design Fundamentals","domain":"system design","difficulty":"intermediate","duration_hours":15,"description":"Scalability, CAP theorem, load balancing, caching.","prerequisites":["se-001"],"skills_taught":["system design","distributed systems"]},
    {"id":"se-005","title":"Advanced System Design","domain":"system design","difficulty":"advanced","duration_hours":20,"description":"Microservices, event-driven architecture.","prerequisites":["se-004"],"skills_taught":["microservices","system design"]},
    {"id":"se-006","title":"Git & Version Control","domain":"devops","difficulty":"beginner","duration_hours":4,"description":"Branching, PRs, rebasing, CI workflows.","prerequisites":[],"skills_taught":["git","version control"]},
    {"id":"se-007","title":"Docker & Containerization","domain":"devops","difficulty":"intermediate","duration_hours":8,"description":"Images, containers, volumes, networking.","prerequisites":["se-006"],"skills_taught":["docker","containerization"]},
    {"id":"se-008","title":"Kubernetes Orchestration","domain":"devops","difficulty":"advanced","duration_hours":15,"description":"Pods, services, deployments, Helm.","prerequisites":["se-007"],"skills_taught":["kubernetes","cloud native"]},
    {"id":"se-009","title":"REST API Design","domain":"backend","difficulty":"beginner","duration_hours":6,"description":"HTTP verbs, status codes, authentication, OpenAPI.","prerequisites":["se-001"],"skills_taught":["api design","rest","backend"]},
    {"id":"se-010","title":"SQL & Database Design","domain":"databases","difficulty":"beginner","duration_hours":10,"description":"Joins, indexes, normalization, transactions.","prerequisites":[],"skills_taught":["sql","databases","data modeling"]},
    {"id":"se-011","title":"NoSQL Databases","domain":"databases","difficulty":"intermediate","duration_hours":8,"description":"MongoDB, Redis, Cassandra.","prerequisites":["se-010"],"skills_taught":["nosql","mongodb","redis"]},
    {"id":"se-012","title":"JavaScript & TypeScript","domain":"frontend","difficulty":"beginner","duration_hours":12,"description":"ES6+, async/promises, TypeScript types.","prerequisites":[],"skills_taught":["javascript","typescript","frontend"]},
    {"id":"se-013","title":"React Fundamentals","domain":"frontend","difficulty":"beginner","duration_hours":10,"description":"Components, hooks, state management.","prerequisites":["se-012"],"skills_taught":["react","frontend","spa"]},
    {"id":"se-014","title":"Next.js Development","domain":"frontend","difficulty":"intermediate","duration_hours":12,"description":"App router, SSR, SSG, API routes.","prerequisites":["se-013"],"skills_taught":["nextjs","react","frontend"]},

    # Data Science / ML
    {"id":"ds-001","title":"Statistics & Probability","domain":"data science","difficulty":"beginner","duration_hours":12,"description":"Distributions, hypothesis testing, Bayesian thinking.","prerequisites":[],"skills_taught":["statistics","probability","data analysis"]},
    {"id":"ds-002","title":"Data Analysis with Pandas","domain":"data science","difficulty":"beginner","duration_hours":8,"description":"DataFrames, cleaning, merging, visualization.","prerequisites":["se-001"],"skills_taught":["pandas","data analysis","python"]},
    {"id":"ds-003","title":"Machine Learning Fundamentals","domain":"machine learning","difficulty":"intermediate","duration_hours":20,"description":"Supervised/unsupervised learning, scikit-learn.","prerequisites":["ds-001","ds-002"],"skills_taught":["machine learning","scikit-learn","model evaluation"]},
    {"id":"ds-004","title":"Deep Learning with PyTorch","domain":"machine learning","difficulty":"advanced","duration_hours":25,"description":"Neural networks, CNNs, RNNs, training loops.","prerequisites":["ds-003"],"skills_taught":["deep learning","pytorch","neural networks"]},
    {"id":"ds-005","title":"NLP & Large Language Models","domain":"machine learning","difficulty":"advanced","duration_hours":20,"description":"Transformers, embeddings, fine-tuning, RAG.","prerequisites":["ds-004"],"skills_taught":["nlp","llm","transformers"]},

    # Cybersecurity
    {"id":"cy-001","title":"Networking Fundamentals","domain":"cybersecurity","difficulty":"beginner","duration_hours":10,"description":"TCP/IP, DNS, HTTP/S, OSI model, Wireshark.","prerequisites":[],"skills_taught":["networking","tcp/ip","protocols"]},
    {"id":"cy-002","title":"Linux for Security","domain":"cybersecurity","difficulty":"beginner","duration_hours":8,"description":"CLI, permissions, processes, bash scripting.","prerequisites":[],"skills_taught":["linux","bash","system administration"]},
    {"id":"cy-003","title":"Web Application Security","domain":"cybersecurity","difficulty":"intermediate","duration_hours":15,"description":"OWASP Top 10, SQLi, XSS, CSRF, Burp Suite.","prerequisites":["cy-001","cy-002"],"skills_taught":["web security","owasp","penetration testing"]},
    {"id":"cy-004","title":"Network Penetration Testing","domain":"cybersecurity","difficulty":"intermediate","duration_hours":20,"description":"Recon, scanning, exploitation, Metasploit.","prerequisites":["cy-001","cy-002"],"skills_taught":["pentest","metasploit","network security"]},
    {"id":"cy-005","title":"Cryptography Essentials","domain":"cybersecurity","difficulty":"intermediate","duration_hours":10,"description":"Symmetric/asymmetric crypto, hashing, PKI, TLS.","prerequisites":["cy-001"],"skills_taught":["cryptography","pki","tls"]},
    {"id":"cy-006","title":"Malware Analysis & Reverse Engineering","domain":"cybersecurity","difficulty":"advanced","duration_hours":25,"description":"Static/dynamic analysis, Ghidra, assembly basics.","prerequisites":["cy-002","cy-005"],"skills_taught":["malware analysis","reverse engineering"]},
    {"id":"cy-007","title":"Cloud Security","domain":"cybersecurity","difficulty":"advanced","duration_hours":15,"description":"IAM, S3 misconfigs, container security, AWS.","prerequisites":["cy-003","se-007"],"skills_taught":["cloud security","aws security","iam"]},
    {"id":"cy-008","title":"SOC & Incident Response","domain":"cybersecurity","difficulty":"intermediate","duration_hours":15,"description":"SIEM tools, threat hunting, IR playbooks.","prerequisites":["cy-001","cy-002"],"skills_taught":["soc","incident response","threat hunting"]},

    # DevOps / Data Engineering
    {"id":"pm-001","title":"Agile & Scrum","domain":"project management","difficulty":"beginner","duration_hours":6,"description":"Sprints, ceremonies, backlogs, retrospectives.","prerequisites":[],"skills_taught":["agile","scrum","project management"]},
    {"id":"de-001","title":"Data Pipelines & ETL","domain":"data engineering","difficulty":"intermediate","duration_hours":15,"description":"Airflow, dbt, pipeline design, data quality.","prerequisites":["se-010","ds-002"],"skills_taught":["data engineering","etl","airflow"]},
    {"id":"de-002","title":"Spark & Big Data","domain":"data engineering","difficulty":"advanced","duration_hours":20,"description":"PySpark, distributed computing, streaming.","prerequisites":["de-001"],"skills_taught":["spark","big data","distributed computing"]},
]

ROLE_REQUIREMENTS: Dict[str, Dict] = {
    "software_engineer_backend": {
        "display": "Backend Software Engineer",
        "required_skills": {
            "python": 0.8, "api design": 0.7, "sql": 0.7,
            "system design": 0.6, "git": 0.7, "dsa": 0.6, "docker": 0.5,
        },
        "recommended_modules": ["se-001","se-002","se-003","se-009","se-010","se-006","se-007","se-004"]
    },
    "software_engineer_frontend": {
        "display": "Frontend Software Engineer",
        "required_skills": {
            "javascript": 0.8, "typescript": 0.6, "react": 0.8,
            "git": 0.7, "api design": 0.5, "nextjs": 0.6,
        },
        "recommended_modules": ["se-012","se-013","se-014","se-006","se-009"]
    },
    "fullstack_engineer": {
        "display": "Full Stack Engineer",
        "required_skills": {
            "python": 0.7, "javascript": 0.8, "react": 0.7,
            "sql": 0.6, "api design": 0.7, "git": 0.7, "docker": 0.5,
        },
        "recommended_modules": ["se-001","se-012","se-013","se-009","se-010","se-006","se-007"]
    },
    "data_scientist": {
        "display": "Data Scientist",
        "required_skills": {
            "python": 0.8, "statistics": 0.8, "machine learning": 0.8,
            "pandas": 0.7, "data analysis": 0.7, "sql": 0.6,
        },
        "recommended_modules": ["se-001","ds-001","ds-002","ds-003","se-010"]
    },
    "ml_engineer": {
        "display": "ML Engineer",
        "required_skills": {
            "python": 0.9, "machine learning": 0.8, "deep learning": 0.7,
            "system design": 0.6, "docker": 0.6, "dsa": 0.6,
        },
        "recommended_modules": ["se-001","se-002","ds-001","ds-002","ds-003","ds-004","se-007"]
    },
    "cybersecurity_analyst": {
        "display": "Cybersecurity Analyst",
        "required_skills": {
            "networking": 0.8, "linux": 0.8, "web security": 0.7,
            "cryptography": 0.6, "soc": 0.7, "incident response": 0.6,
        },
        "recommended_modules": ["cy-001","cy-002","cy-003","cy-005","cy-008"]
    },
    "penetration_tester": {
        "display": "Penetration Tester",
        "required_skills": {
            "networking": 0.8, "linux": 0.9, "web security": 0.9,
            "pentest": 0.9, "cryptography": 0.6,
        },
        "recommended_modules": ["cy-001","cy-002","cy-003","cy-004","cy-005","cy-006"]
    },
    "devops_engineer": {
        "display": "DevOps Engineer",
        "required_skills": {
            "docker": 0.9, "kubernetes": 0.8, "git": 0.8,
            "linux": 0.7, "python": 0.6, "system design": 0.6,
        },
        "recommended_modules": ["se-006","se-007","se-008","cy-002","se-001"]
    },
    "data_engineer": {
        "display": "Data Engineer",
        "required_skills": {
            "python": 0.8, "sql": 0.9, "data engineering": 0.8,
            "distributed computing": 0.6, "docker": 0.5,
        },
        "recommended_modules": ["se-001","se-010","se-011","ds-002","de-001","de-002"]
    }
}

def get_catalog() -> List[CourseModule]:
    return [CourseModule(**c) for c in COURSE_CATALOG]

def get_role_requirements(role: str) -> Dict:
    return ROLE_REQUIREMENTS.get(role, ROLE_REQUIREMENTS["software_engineer_backend"])

def get_all_roles() -> Dict:
    return {k: v["display"] for k, v in ROLE_REQUIREMENTS.items()}