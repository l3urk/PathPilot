from fastapi import APIRouter
from app.models.schemas import DiagnosticSubmission, DiagnosticResult, SkillScore
from pydantic import BaseModel
from typing import List, Dict, Optional

router = APIRouter()

# Stage 1: What do you know? (multi-select options per role)
ROLE_SKILLS_MAP = {
    "software_engineer_backend": {
        "languages": ["Python", "Java", "Go", "Node.js", "Ruby", "C#", "Rust"],
        "databases": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Cassandra"],
        "tools": ["Docker", "Git", "Linux", "REST APIs", "GraphQL", "Kafka", "RabbitMQ"],
    },
    "software_engineer_frontend": {
        "languages": ["JavaScript", "TypeScript", "HTML/CSS"],
        "frameworks": ["React", "Next.js", "Vue", "Angular", "Svelte"],
        "tools": ["Git", "Webpack/Vite", "Tailwind CSS", "REST APIs", "GraphQL"],
    },
    "fullstack_engineer": {
        "languages": ["JavaScript", "TypeScript", "Python", "Java", "Go"],
        "frameworks": ["React", "Next.js", "Vue", "Express", "FastAPI", "Django"],
        "tools": ["Docker", "Git", "PostgreSQL", "MongoDB", "Redis", "REST APIs"],
    },
    "data_scientist": {
        "languages": ["Python", "R", "SQL", "Julia"],
        "libraries": ["Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Keras"],
        "tools": ["Jupyter", "Tableau", "Power BI", "Spark", "Airflow"],
    },
    "ml_engineer": {
        "languages": ["Python", "C++", "Rust", "Julia"],
        "frameworks": ["PyTorch", "TensorFlow", "JAX", "Scikit-learn", "HuggingFace"],
        "tools": ["Docker", "Kubernetes", "MLflow", "Weights & Biases", "Ray", "CUDA"],
    },
    "cybersecurity_analyst": {
        "domains": ["Network Security", "Web Security", "SIEM/SOC", "Incident Response", "Threat Hunting"],
        "tools": ["Wireshark", "Splunk", "ELK Stack", "Nmap", "Burp Suite", "Metasploit"],
        "concepts": ["TCP/IP", "Firewalls/IDS", "OWASP Top 10", "Cryptography", "Malware Analysis"],
    },
    "penetration_tester": {
        "domains": ["Web App Pentesting", "Network Pentesting", "Privilege Escalation", "Reverse Engineering", "Social Engineering"],
        "tools": ["Burp Suite", "Metasploit", "Nmap", "Ghidra", "SQLMap", "Hashcat", "Cobalt Strike"],
        "concepts": ["OWASP Top 10", "CVE Exploitation", "Post Exploitation", "Active Directory", "Buffer Overflow"],
    },
    "devops_engineer": {
        "tools": ["Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "ArgoCD"],
        "cloud": ["AWS", "GCP", "Azure", "DigitalOcean"],
        "concepts": ["CI/CD", "Infrastructure as Code", "Service Mesh", "Monitoring/Observability", "Linux Administration"],
    },
    "data_engineer": {
        "languages": ["Python", "SQL", "Scala", "Java"],
        "tools": ["Apache Spark", "Airflow", "dbt", "Kafka", "Flink", "Hadoop"],
        "platforms": ["Snowflake", "BigQuery", "Redshift", "Databricks", "AWS Glue"],
    },
}

# Stage 2: Technique questions per skill
TECHNIQUE_QUESTIONS = {
    # Languages
    "Python": [
        {"id": "py-1", "question": "Can you write async functions and use asyncio?", "weight": 0.3},
        {"id": "py-2", "question": "Do you understand decorators and context managers?", "weight": 0.3},
        {"id": "py-3", "question": "Have you built REST APIs with FastAPI or Django?", "weight": 0.4},
    ],
    "JavaScript": [
        {"id": "js-1", "question": "Do you understand closures, promises, and async/await?", "weight": 0.4},
        {"id": "js-2", "question": "Can you work with the DOM and browser APIs?", "weight": 0.3},
        {"id": "js-3", "question": "Do you know how the event loop works?", "weight": 0.3},
    ],
    "TypeScript": [
        {"id": "ts-1", "question": "Can you write generics and utility types?", "weight": 0.5},
        {"id": "ts-2", "question": "Do you understand interfaces vs types?", "weight": 0.5},
    ],
    "Java": [
        {"id": "java-1", "question": "Do you understand OOP principles and design patterns?", "weight": 0.4},
        {"id": "java-2", "question": "Have you used Spring Boot for building services?", "weight": 0.6},
    ],
    "Go": [
        {"id": "go-1", "question": "Do you understand goroutines and channels?", "weight": 0.5},
        {"id": "go-2", "question": "Have you built HTTP services with Go?", "weight": 0.5},
    ],
    "Node.js": [
        {"id": "node-1", "question": "Do you understand the Node.js event loop and non-blocking I/O?", "weight": 0.5},
        {"id": "node-2", "question": "Have you built REST APIs with Express or Fastify?", "weight": 0.5},
    ],
    "Ruby": [
        {"id": "ruby-1", "question": "Have you built web apps with Ruby on Rails?", "weight": 0.6},
        {"id": "ruby-2", "question": "Do you understand Ruby blocks, procs, and lambdas?", "weight": 0.4},
    ],
    "C#": [
        {"id": "csharp-1", "question": "Have you built applications with .NET or ASP.NET Core?", "weight": 0.6},
        {"id": "csharp-2", "question": "Do you understand LINQ and async/await in C#?", "weight": 0.4},
    ],
    "Rust": [
        {"id": "rust-1", "question": "Do you understand ownership, borrowing, and lifetimes?", "weight": 0.6},
        {"id": "rust-2", "question": "Have you built a project using Rust's standard library?", "weight": 0.4},
    ],
    "R": [
        {"id": "rlang-1", "question": "Can you perform statistical analysis and visualization in R?", "weight": 0.5},
        {"id": "rlang-2", "question": "Have you used tidyverse packages like dplyr and ggplot2?", "weight": 0.5},
    ],
    "SQL": [
        {"id": "sql-1", "question": "Can you write JOINs, subqueries, and CTEs?", "weight": 0.4},
        {"id": "sql-2", "question": "Do you understand window functions like ROW_NUMBER?", "weight": 0.3},
        {"id": "sql-3", "question": "Have you optimized slow queries using indexes?", "weight": 0.3},
    ],
    "Scala": [
        {"id": "scala-1", "question": "Do you understand functional programming concepts in Scala?", "weight": 0.5},
        {"id": "scala-2", "question": "Have you used Scala with Apache Spark?", "weight": 0.5},
    ],
    "Julia": [
        {"id": "julia-1", "question": "Have you used Julia for numerical computing or data science?", "weight": 0.6},
        {"id": "julia-2", "question": "Do you understand Julia's type system and multiple dispatch?", "weight": 0.4},
    ],
    "HTML/CSS": [
        {"id": "html-1", "question": "Can you build responsive layouts using Flexbox and Grid?", "weight": 0.5},
        {"id": "html-2", "question": "Do you understand CSS specificity, animations, and variables?", "weight": 0.5},
    ],

    # Frameworks
    "React": [
        {"id": "react-1", "question": "Do you understand hooks like useEffect and useCallback?", "weight": 0.4},
        {"id": "react-2", "question": "Can you manage complex state with Context or Redux?", "weight": 0.3},
        {"id": "react-3", "question": "Have you optimized React performance (memoization, lazy loading)?", "weight": 0.3},
    ],
    "Next.js": [
        {"id": "next-1", "question": "Do you understand SSR vs SSG vs ISR?", "weight": 0.5},
        {"id": "next-2", "question": "Have you used App Router and server components?", "weight": 0.5},
    ],
    "Vue": [
        {"id": "vue-1", "question": "Do you understand Vue's reactivity system and Composition API?", "weight": 0.5},
        {"id": "vue-2", "question": "Have you used Vuex or Pinia for state management?", "weight": 0.5},
    ],
    "Angular": [
        {"id": "ang-1", "question": "Do you understand Angular modules, services, and dependency injection?", "weight": 0.5},
        {"id": "ang-2", "question": "Have you used RxJS observables in Angular?", "weight": 0.5},
    ],
    "Svelte": [
        {"id": "svelte-1", "question": "Do you understand Svelte's reactive declarations and stores?", "weight": 0.6},
        {"id": "svelte-2", "question": "Have you built a production app with SvelteKit?", "weight": 0.4},
    ],
    "FastAPI": [
        {"id": "fastapi-1", "question": "Have you built async REST APIs with FastAPI and Pydantic?", "weight": 0.6},
        {"id": "fastapi-2", "question": "Do you understand dependency injection in FastAPI?", "weight": 0.4},
    ],
    "Django": [
        {"id": "django-1", "question": "Have you built web apps with Django and Django REST Framework?", "weight": 0.6},
        {"id": "django-2", "question": "Do you understand Django's ORM and migrations?", "weight": 0.4},
    ],
    "Express": [
        {"id": "express-1", "question": "Have you built REST APIs with Express.js middleware?", "weight": 0.6},
        {"id": "express-2", "question": "Do you understand error handling and authentication in Express?", "weight": 0.4},
    ],
    "PyTorch": [
        {"id": "pytorch-1", "question": "Can you build and train a neural network from scratch?", "weight": 0.5},
        {"id": "pytorch-2", "question": "Do you understand autograd and backpropagation?", "weight": 0.5},
    ],
    "TensorFlow": [
        {"id": "tflow-1", "question": "Have you built and deployed TensorFlow models?", "weight": 0.5},
        {"id": "tflow-2", "question": "Do you know Keras API and custom training loops?", "weight": 0.5},
    ],
    "HuggingFace": [
        {"id": "hf-1", "question": "Have you fine-tuned or used pretrained models from HuggingFace?", "weight": 0.6},
        {"id": "hf-2", "question": "Do you understand tokenizers, pipelines, and the Trainer API?", "weight": 0.4},
    ],
    "Scikit-learn": [
        {"id": "sklearn-1", "question": "Can you build and evaluate classification/regression pipelines?", "weight": 0.5},
        {"id": "sklearn-2", "question": "Do you understand cross-validation and hyperparameter tuning?", "weight": 0.5},
    ],

    # Databases
    "PostgreSQL": [
        {"id": "pg-1", "question": "Can you write complex queries with JOINs and window functions?", "weight": 0.4},
        {"id": "pg-2", "question": "Do you understand indexing and query optimization?", "weight": 0.3},
        {"id": "pg-3", "question": "Have you designed normalized database schemas?", "weight": 0.3},
    ],
    "MySQL": [
        {"id": "mysql-1", "question": "Can you write complex SQL queries and stored procedures?", "weight": 0.5},
        {"id": "mysql-2", "question": "Do you understand MySQL replication and performance tuning?", "weight": 0.5},
    ],
    "MongoDB": [
        {"id": "mongo-1", "question": "Do you understand MongoDB's document model and aggregation pipeline?", "weight": 0.5},
        {"id": "mongo-2", "question": "Have you designed schemas and indexes for MongoDB?", "weight": 0.5},
    ],
    "Redis": [
        {"id": "redis-1", "question": "Have you used Redis for caching, pub/sub, or sessions?", "weight": 0.5},
        {"id": "redis-2", "question": "Do you understand Redis data structures and TTL?", "weight": 0.5},
    ],
    "Cassandra": [
        {"id": "cass-1", "question": "Do you understand Cassandra's partition key and clustering columns?", "weight": 0.5},
        {"id": "cass-2", "question": "Have you designed wide-column schemas for Cassandra?", "weight": 0.5},
    ],
    "SQLite": [
        {"id": "sqlite-1", "question": "Have you used SQLite for embedded or lightweight applications?", "weight": 0.6},
        {"id": "sqlite-2", "question": "Do you understand SQLite's limitations vs full database servers?", "weight": 0.4},
    ],

    # DevOps Tools
    "Docker": [
        {"id": "docker-1", "question": "Can you write multi-stage Dockerfiles?", "weight": 0.4},
        {"id": "docker-2", "question": "Have you used Docker Compose for multi-service apps?", "weight": 0.3},
        {"id": "docker-3", "question": "Do you understand networking and volumes in Docker?", "weight": 0.3},
    ],
    "Kubernetes": [
        {"id": "k8s-1", "question": "Can you write Deployment and Service manifests?", "weight": 0.4},
        {"id": "k8s-2", "question": "Do you understand ingress, HPA, and namespaces?", "weight": 0.3},
        {"id": "k8s-3", "question": "Have you used Helm charts?", "weight": 0.3},
    ],
    "Git": [
        {"id": "git-1", "question": "Do you understand branching strategies like GitFlow?", "weight": 0.5},
        {"id": "git-2", "question": "Can you handle merge conflicts and interactive rebase?", "weight": 0.5},
    ],
    "Linux": [
        {"id": "linux-1", "question": "Are you comfortable with CLI, permissions, and processes?", "weight": 0.4},
        {"id": "linux-2", "question": "Can you write bash scripts for automation?", "weight": 0.3},
        {"id": "linux-3", "question": "Do you understand systemd services and networking?", "weight": 0.3},
    ],
    "Terraform": [
        {"id": "trfm-1", "question": "Can you write Terraform modules for cloud infrastructure?", "weight": 0.5},
        {"id": "trfm-2", "question": "Do you understand state management and remote backends?", "weight": 0.5},
    ],
    "Ansible": [
        {"id": "ansible-1", "question": "Have you written Ansible playbooks for server configuration?", "weight": 0.6},
        {"id": "ansible-2", "question": "Do you understand Ansible roles, variables, and inventory?", "weight": 0.4},
    ],
    "Jenkins": [
        {"id": "jenkins-1", "question": "Have you set up Jenkins pipelines with Jenkinsfile?", "weight": 0.6},
        {"id": "jenkins-2", "question": "Do you understand Jenkins agents and plugin management?", "weight": 0.4},
    ],
    "GitHub Actions": [
        {"id": "ghactions-1", "question": "Have you written GitHub Actions workflows for CI/CD?", "weight": 0.6},
        {"id": "ghactions-2", "question": "Do you understand secrets, environments, and reusable workflows?", "weight": 0.4},
    ],
    "ArgoCD": [
        {"id": "argo-1", "question": "Have you set up GitOps deployments with ArgoCD?", "weight": 0.6},
        {"id": "argo-2", "question": "Do you understand ArgoCD app sync and rollback strategies?", "weight": 0.4},
    ],

    # Cloud
    "AWS": [
        {"id": "aws-1", "question": "Are you comfortable with EC2, S3, RDS, and IAM?", "weight": 0.4},
        {"id": "aws-2", "question": "Have you used Lambda, ECS, or EKS for deployments?", "weight": 0.3},
        {"id": "aws-3", "question": "Do you understand VPC networking and security groups?", "weight": 0.3},
    ],
    "GCP": [
        {"id": "gcp-1", "question": "Have you used GCP services like GKE, Cloud Run, or BigQuery?", "weight": 0.6},
        {"id": "gcp-2", "question": "Do you understand GCP IAM and networking?", "weight": 0.4},
    ],
    "Azure": [
        {"id": "azure-1", "question": "Have you used Azure services like AKS, Functions, or Blob Storage?", "weight": 0.6},
        {"id": "azure-2", "question": "Do you understand Azure Active Directory and RBAC?", "weight": 0.4},
    ],
    "DigitalOcean": [
        {"id": "do-1", "question": "Have you deployed applications on DigitalOcean Droplets or App Platform?", "weight": 0.6},
        {"id": "do-2", "question": "Do you understand DigitalOcean Spaces and Managed Databases?", "weight": 0.4},
    ],

    # Security
    "Web App Pentesting": [
        {"id": "wap-1", "question": "Can you identify and exploit OWASP Top 10 vulnerabilities?", "weight": 0.5},
        {"id": "wap-2", "question": "Have you used Burp Suite for intercepting and modifying requests?", "weight": 0.5},
    ],
    "Network Pentesting": [
        {"id": "netp-1", "question": "Can you perform reconnaissance and port scanning with Nmap?", "weight": 0.5},
        {"id": "netp-2", "question": "Have you exploited network services using Metasploit?", "weight": 0.5},
    ],
    "Privilege Escalation": [
        {"id": "priv-1", "question": "Can you escalate privileges on Linux using SUID/sudo misconfigs?", "weight": 0.5},
        {"id": "priv-2", "question": "Have you performed privilege escalation on Windows via token impersonation?", "weight": 0.5},
    ],
    "Network Security": [
        {"id": "netsec-1", "question": "Do you understand firewalls, IDS/IPS, and VPNs?", "weight": 0.5},
        {"id": "netsec-2", "question": "Can you analyze network traffic with Wireshark?", "weight": 0.5},
    ],
    "SIEM/SOC": [
        {"id": "siem-1", "question": "Have you used Splunk or ELK for log analysis?", "weight": 0.5},
        {"id": "siem-2", "question": "Can you write detection rules and investigate alerts?", "weight": 0.5},
    ],
    "Incident Response": [
        {"id": "ir-1", "question": "Have you followed or written an incident response playbook?", "weight": 0.5},
        {"id": "ir-2", "question": "Can you perform basic digital forensics on a compromised system?", "weight": 0.5},
    ],
    "Threat Hunting": [
        {"id": "th-1", "question": "Can you proactively hunt for threats using SIEM or EDR tools?", "weight": 0.5},
        {"id": "th-2", "question": "Do you understand threat intelligence and IOCs?", "weight": 0.5},
    ],
    "Wireshark": [
        {"id": "ws-1", "question": "Can you capture and filter network traffic with Wireshark?", "weight": 0.5},
        {"id": "ws-2", "question": "Can you identify malicious traffic patterns in a pcap file?", "weight": 0.5},
    ],
    "Burp Suite": [
        {"id": "burp-1", "question": "Can you use Burp Suite to intercept, modify, and replay HTTP requests?", "weight": 0.5},
        {"id": "burp-2", "question": "Have you used Burp Scanner or Intruder for automated testing?", "weight": 0.5},
    ],
    "Metasploit": [
        {"id": "msf-1", "question": "Can you use Metasploit to exploit known CVEs?", "weight": 0.5},
        {"id": "msf-2", "question": "Do you understand Meterpreter sessions and post-exploitation modules?", "weight": 0.5},
    ],
    "Nmap": [
        {"id": "nmap-1", "question": "Can you perform SYN scans, version detection, and OS fingerprinting?", "weight": 0.5},
        {"id": "nmap-2", "question": "Have you used Nmap scripts (NSE) for vulnerability scanning?", "weight": 0.5},
    ],
    "Splunk": [
        {"id": "splunk-1", "question": "Can you write SPL queries to search and analyze log data?", "weight": 0.5},
        {"id": "splunk-2", "question": "Have you built Splunk dashboards and alerts?", "weight": 0.5},
    ],
    "ELK Stack": [
        {"id": "elk-1", "question": "Have you set up Elasticsearch, Logstash, and Kibana for log analysis?", "weight": 0.5},
        {"id": "elk-2", "question": "Can you write Kibana dashboards and Elasticsearch queries?", "weight": 0.5},
    ],
    "Ghidra": [
        {"id": "ghidra-1", "question": "Can you reverse engineer binaries using Ghidra?", "weight": 0.5},
        {"id": "ghidra-2", "question": "Do you understand assembly language and decompiled code analysis?", "weight": 0.5},
    ],
    "SQLMap": [
        {"id": "sqlmap-1", "question": "Have you used SQLMap to detect and exploit SQL injection?", "weight": 0.5},
        {"id": "sqlmap-2", "question": "Can you use SQLMap with custom headers, cookies, and tamper scripts?", "weight": 0.5},
    ],
    "Hashcat": [
        {"id": "hashcat-1", "question": "Have you cracked password hashes using Hashcat?", "weight": 0.5},
        {"id": "hashcat-2", "question": "Do you understand different hash types and attack modes?", "weight": 0.5},
    ],
    "Cobalt Strike": [
        {"id": "cs-1", "question": "Have you used Cobalt Strike for red team operations?", "weight": 0.5},
        {"id": "cs-2", "question": "Do you understand Beacon payloads and C2 infrastructure?", "weight": 0.5},
    ],
    "OWASP Top 10": [
        {"id": "owasp-1", "question": "Can you explain and demonstrate all OWASP Top 10 vulnerabilities?", "weight": 0.5},
        {"id": "owasp-2", "question": "Have you remediated OWASP Top 10 issues in a real codebase?", "weight": 0.5},
    ],
    "CVE Exploitation": [
        {"id": "cve-1", "question": "Have you researched and exploited known CVEs in a lab environment?", "weight": 0.5},
        {"id": "cve-2", "question": "Can you find and apply public PoC exploits responsibly?", "weight": 0.5},
    ],
    "Active Directory": [
        {"id": "ad-1", "question": "Do you understand AD structure, GPOs, and Kerberos authentication?", "weight": 0.5},
        {"id": "ad-2", "question": "Have you performed AD attacks like Pass-the-Hash or Kerberoasting?", "weight": 0.5},
    ],
    "Buffer Overflow": [
        {"id": "bof-1", "question": "Can you identify and exploit stack-based buffer overflows?", "weight": 0.5},
        {"id": "bof-2", "question": "Do you understand ASLR, DEP, and bypass techniques?", "weight": 0.5},
    ],
    "Cryptography": [
        {"id": "crypto-1", "question": "Do you understand symmetric vs asymmetric encryption?", "weight": 0.5},
        {"id": "crypto-2", "question": "Can you explain TLS handshake and certificate validation?", "weight": 0.5},
    ],
    "Malware Analysis": [
        {"id": "mal-1", "question": "Can you perform static and dynamic analysis on malware samples?", "weight": 0.5},
        {"id": "mal-2", "question": "Have you used sandboxes like Any.run or Cuckoo for analysis?", "weight": 0.5},
    ],
    "Social Engineering": [
        {"id": "se-1", "question": "Have you conducted phishing simulations or vishing exercises?", "weight": 0.5},
        {"id": "se-2", "question": "Do you understand pretexting, baiting, and tailgating techniques?", "weight": 0.5},
    ],
    "Reverse Engineering": [
        {"id": "re-1", "question": "Can you reverse engineer binaries using tools like Ghidra or IDA?", "weight": 0.5},
        {"id": "re-2", "question": "Do you understand assembly language and calling conventions?", "weight": 0.5},
    ],
    "TCP/IP": [
        {"id": "tcpip-1", "question": "Do you understand the TCP 3-way handshake and packet structure?", "weight": 0.5},
        {"id": "tcpip-2", "question": "Can you explain subnetting, routing, and common protocols?", "weight": 0.5},
    ],
    "Firewalls/IDS": [
        {"id": "fwids-1", "question": "Have you configured firewall rules and IDS/IPS signatures?", "weight": 0.5},
        {"id": "fwids-2", "question": "Can you analyze IDS alerts and reduce false positives?", "weight": 0.5},
    ],

    # Data Science / ML
    "Pandas": [
        {"id": "pandas-1", "question": "Can you clean, merge, and transform large datasets?", "weight": 0.5},
        {"id": "pandas-2", "question": "Have you used groupby, pivot tables, and time series operations?", "weight": 0.5},
    ],
    "NumPy": [
        {"id": "numpy-1", "question": "Can you perform vectorized operations and matrix math with NumPy?", "weight": 0.5},
        {"id": "numpy-2", "question": "Do you understand broadcasting and array indexing?", "weight": 0.5},
    ],
    "Keras": [
        {"id": "keras-1", "question": "Have you built and trained models using Keras Sequential or Functional API?", "weight": 0.6},
        {"id": "keras-2", "question": "Do you understand callbacks, regularization, and model checkpointing?", "weight": 0.4},
    ],
    "JAX": [
        {"id": "jax-1", "question": "Can you use JAX for automatic differentiation and JIT compilation?", "weight": 0.6},
        {"id": "jax-2", "question": "Have you used JAX for training ML models?", "weight": 0.4},
    ],
    "Jupyter": [
        {"id": "jupyter-1", "question": "Are you comfortable with Jupyter notebooks for data exploration?", "weight": 0.5},
        {"id": "jupyter-2", "question": "Have you used JupyterLab or nbconvert for production notebooks?", "weight": 0.5},
    ],
    "Tableau": [
        {"id": "tableau-1", "question": "Can you build interactive dashboards in Tableau?", "weight": 0.6},
        {"id": "tableau-2", "question": "Do you understand Tableau's calculated fields and LOD expressions?", "weight": 0.4},
    ],
    "Power BI": [
        {"id": "pbi-1", "question": "Can you build Power BI reports with DAX measures?", "weight": 0.6},
        {"id": "pbi-2", "question": "Have you connected Power BI to multiple data sources?", "weight": 0.4},
    ],
    "Spark": [
        {"id": "spark-1", "question": "Can you write PySpark jobs for distributed data processing?", "weight": 0.5},
        {"id": "spark-2", "question": "Do you understand RDDs, DataFrames, and partitioning?", "weight": 0.5},
    ],
    "Apache Spark": [
        {"id": "aspark-1", "question": "Can you write PySpark jobs for distributed data processing?", "weight": 0.5},
        {"id": "aspark-2", "question": "Do you understand Spark's execution model and optimization?", "weight": 0.5},
    ],
    "Airflow": [
        {"id": "airflow-1", "question": "Can you write DAGs and schedule data pipelines?", "weight": 0.5},
        {"id": "airflow-2", "question": "Have you handled task dependencies and retries in Airflow?", "weight": 0.5},
    ],

    # Data Engineering
    "dbt": [
        {"id": "dbt-1", "question": "Have you written dbt models and tests for data transformation?", "weight": 0.6},
        {"id": "dbt-2", "question": "Do you understand dbt's ref() function and lineage graph?", "weight": 0.4},
    ],
    "Kafka": [
        {"id": "kafka-1", "question": "Do you understand Kafka topics, partitions, and consumer groups?", "weight": 0.5},
        {"id": "kafka-2", "question": "Have you built real-time streaming pipelines with Kafka?", "weight": 0.5},
    ],
    "Flink": [
        {"id": "flink-1", "question": "Have you used Flink for stateful stream processing?", "weight": 0.6},
        {"id": "flink-2", "question": "Do you understand Flink's windowing and watermark concepts?", "weight": 0.4},
    ],
    "Hadoop": [
        {"id": "hadoop-1", "question": "Do you understand HDFS and MapReduce concepts?", "weight": 0.5},
        {"id": "hadoop-2", "question": "Have you worked with the Hadoop ecosystem (Hive, HBase, YARN)?", "weight": 0.5},
    ],
    "Snowflake": [
        {"id": "snow-1", "question": "Have you built data warehouses and used Snowflake's virtual warehouses?", "weight": 0.6},
        {"id": "snow-2", "question": "Do you understand Snowflake's Time Travel and data sharing?", "weight": 0.4},
    ],
    "BigQuery": [
        {"id": "bq-1", "question": "Have you written complex SQL queries and optimized costs in BigQuery?", "weight": 0.6},
        {"id": "bq-2", "question": "Do you understand BigQuery's partitioning and clustering?", "weight": 0.4},
    ],
    "Redshift": [
        {"id": "rs-1", "question": "Have you designed Redshift schemas with sort and distribution keys?", "weight": 0.6},
        {"id": "rs-2", "question": "Do you understand VACUUM and ANALYZE in Redshift?", "weight": 0.4},
    ],
    "Databricks": [
        {"id": "db-1", "question": "Have you used Databricks for collaborative data science workflows?", "weight": 0.6},
        {"id": "db-2", "question": "Do you understand Delta Lake and its ACID properties?", "weight": 0.4},
    ],
    "AWS Glue": [
        {"id": "glue-1", "question": "Have you built ETL jobs with AWS Glue?", "weight": 0.6},
        {"id": "glue-2", "question": "Do you understand Glue crawlers and the Data Catalog?", "weight": 0.4},
    ],
    "RabbitMQ": [
        {"id": "rmq-1", "question": "Do you understand RabbitMQ exchanges, queues, and bindings?", "weight": 0.5},
        {"id": "rmq-2", "question": "Have you implemented message acknowledgment and dead letter queues?", "weight": 0.5},
    ],
    "GraphQL": [
        {"id": "gql-1", "question": "Can you design and implement a GraphQL schema with queries and mutations?", "weight": 0.5},
        {"id": "gql-2", "question": "Do you understand resolvers, DataLoader, and N+1 problem?", "weight": 0.5},
    ],
    "REST APIs": [
        {"id": "rest-1", "question": "Can you design RESTful APIs following HTTP conventions?", "weight": 0.5},
        {"id": "rest-2", "question": "Do you understand authentication patterns like JWT and OAuth2?", "weight": 0.5},
    ],
    "Webpack/Vite": [
        {"id": "wv-1", "question": "Have you configured Webpack or Vite for a production build?", "weight": 0.6},
        {"id": "wv-2", "question": "Do you understand code splitting, tree shaking, and hot module replacement?", "weight": 0.4},
    ],
    "Tailwind CSS": [
        {"id": "tw-1", "question": "Can you build responsive UIs using Tailwind utility classes?", "weight": 0.6},
        {"id": "tw-2", "question": "Have you customized Tailwind config and used plugins?", "weight": 0.4},
    ],
    "MLflow": [
        {"id": "mlflow-1", "question": "Have you used MLflow for experiment tracking and model registry?", "weight": 0.6},
        {"id": "mlflow-2", "question": "Can you deploy models using MLflow serving?", "weight": 0.4},
    ],
    "Weights & Biases": [
        {"id": "wandb-1", "question": "Have you used W&B for tracking ML experiments and hyperparameter sweeps?", "weight": 0.6},
        {"id": "wandb-2", "question": "Can you use W&B artifacts for dataset and model versioning?", "weight": 0.4},
    ],
    "Ray": [
        {"id": "ray-1", "question": "Have you used Ray for distributed Python or ML workloads?", "weight": 0.6},
        {"id": "ray-2", "question": "Do you understand Ray's actor model and remote functions?", "weight": 0.4},
    ],
    "CUDA": [
        {"id": "cuda-1", "question": "Have you written CUDA kernels for GPU-accelerated computing?", "weight": 0.6},
        {"id": "cuda-2", "question": "Do you understand GPU memory management and parallelism?", "weight": 0.4},
    ],
    "Service Mesh": [
        {"id": "sm-1", "question": "Have you used Istio or Linkerd for service mesh in Kubernetes?", "weight": 0.6},
        {"id": "sm-2", "question": "Do you understand traffic management, mTLS, and observability in a mesh?", "weight": 0.4},
    ],
    "Monitoring/Observability": [
        {"id": "mon-1", "question": "Have you set up Prometheus and Grafana for metrics and alerting?", "weight": 0.5},
        {"id": "mon-2", "question": "Do you understand distributed tracing with Jaeger or OpenTelemetry?", "weight": 0.5},
    ],
    "Infrastructure as Code": [
        {"id": "iac-1", "question": "Have you managed cloud infrastructure using Terraform or Pulumi?", "weight": 0.5},
        {"id": "iac-2", "question": "Do you understand IaC best practices like modules, state, and drift?", "weight": 0.5},
    ],
    "CI/CD": [
        {"id": "cicd-1", "question": "Have you built CI/CD pipelines with GitHub Actions or Jenkins?", "weight": 0.5},
        {"id": "cicd-2", "question": "Can you set up automated testing and deployment stages?", "weight": 0.5},
    ],
    "Linux Administration": [
        {"id": "linuxadm-1", "question": "Can you manage Linux servers including users, services, and networking?", "weight": 0.5},
        {"id": "linuxadm-2", "question": "Have you troubleshot performance issues on Linux systems?", "weight": 0.5},
    ],
}

DEFAULT_TECHNIQUE = [
    {"id": "gen-1", "question": "Have you used this in a real project or production environment?", "weight": 0.6},
    {"id": "gen-2", "question": "Can you explain core concepts to someone else?", "weight": 0.4},
]

SKILL_TO_CATALOG = {
    "python": ["se-001", "se-002"],
    "javascript": ["se-012"],
    "typescript": ["se-012"],
    "react": ["se-013", "se-014"],
    "next.js": ["se-014"],
    "docker": ["se-007"],
    "kubernetes": ["se-008"],
    "postgresql": ["se-010"],
    "sql": ["se-010"],
    "git": ["se-006"],
    "linux": ["cy-002"],
    "web app pentesting": ["cy-003"],
    "network pentesting": ["cy-004"],
    "network security": ["cy-001"],
    "pandas": ["ds-002"],
    "scikit-learn": ["ds-003"],
    "pytorch": ["ds-004"],
    "apache spark": ["de-002"],
    "airflow": ["de-001"],
    "aws": ["cy-007"],
    "ci/cd": ["se-006", "se-007"],
    "terraform": ["se-008"],
}


class Stage1Request(BaseModel):
    target_role: str


class Stage2Request(BaseModel):
    target_role: str
    selected_skills: List[str]


class DiagnosticAnswers(BaseModel):
    target_role: str
    selected_skills: List[str]
    technique_answers: Dict[str, bool]  # question_id -> True/False


@router.get("/stage1/{target_role}")
async def get_stage1(target_role: str):
    skills = ROLE_SKILLS_MAP.get(target_role, {})
    return {"role": target_role, "skill_categories": skills}


@router.post("/stage2")
async def get_stage2(req: Stage2Request):
    questions = []
    for skill in req.selected_skills:
        techs = TECHNIQUE_QUESTIONS.get(skill, DEFAULT_TECHNIQUE)
        questions.append({
            "skill": skill,
            "questions": techs
        })
    return {"skill_questions": questions}


@router.post("/submit", response_model=DiagnosticResult)
async def submit_diagnostic(submission: DiagnosticAnswers):
    skills = []

    for skill in submission.selected_skills:
        skill_lower = skill.lower()
        techs = TECHNIQUE_QUESTIONS.get(skill, DEFAULT_TECHNIQUE)
        total_weight = 0
        earned_weight = 0

        for tech in techs:
            weight = tech.get("weight", 0.5)
            total_weight += weight
            if submission.technique_answers.get(tech["id"], False):
                earned_weight += weight

        score = (earned_weight / total_weight) if total_weight > 0 else 0.0

        skills.append(SkillScore(
            name=skill_lower,
            score=round(score, 2),
            source="quiz",
            evidence=f"Answered {sum(1 for t in techs if submission.technique_answers.get(t['id'], False))}/{len(techs)} technique questions correctly for {skill}"
        ))

    return DiagnosticResult(skills=skills)


@router.post("/gaps")
async def get_gaps(submission: DiagnosticAnswers):
    result = await submit_diagnostic(submission)
    lacking = [s for s in result.skills if s.score < 0.6]
    strong = [s for s in result.skills if s.score >= 0.6]

    return {
        "skills": result.skills,
        "lacking": lacking,
        "strong": strong,
        "message": f"You're strong in {len(strong)} areas but need work in {len(lacking)} areas."
    }