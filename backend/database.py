from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# PostgreSQL URL aligned with docker-compose.yml
SQLALCHEMY_DATABASE_URL = "postgresql://admin:adminpassword@localhost:5432/antigravity_db"

# Fallback to sqlite if postgres/docker is not available
# SQLALCHEMY_DATABASE_URL = "sqlite:///./antigravity.db"

# Engine setup
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
