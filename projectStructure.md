collector_api/
├── app/
│   ├── __init__.py
│   ├── main.py              # Entry point
│   ├── core/
│   │   └── security.py      # JWT & Password hashing 
│   ├── db/
│   │   └── session.py       # DB connection
│   ├── models/              # SQLAlchemy Tables
│   │   ├── user.py
│   │   └── item.py          # Collector items 
│   ├── schemas/             # Pydantic Models (Data Validation)
│   │   └── item.py
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py
│   │       │   └── items.py
│   │       └── router.py
│   └── services/            # Business Logic
│       └── fraud.py         # Mock fraud detection [cite: 57]
├── tests/                   # Pytest (Required for CI/CD) [cite: 125]
├── Dockerfile               # Container definition
├── docker-compose.yml       # Orchestration
├── .env                     # Environment variables
└── requirements.txt
