from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
import redis
import json

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import models
import schemas
import auth
import services
from database import engine, get_db

# Create DB Tables
models.Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Antigravity API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://sizning-saytingiz.uz"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Redis Connection
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
except Exception:
    redis_client = None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@app.post("/auth/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(username=user.username, password_hash=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/analyze/{inn}", response_model=schemas.AnalysisResult)
@limiter.limit("5/minute")
def analyze_company(request: Request, inn: str, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    # 1. Check Redis Cache
    if redis_client:
        try:
            cached_result = redis_client.get(f"analysis_{inn}")
            if cached_result:
                return json.loads(cached_result)
        except Exception:
            pass # Ignore redis errors if it's not running

    # 2. Find in DB (or mock fetching from external API if not exists)
    company = db.query(models.Company).filter(models.Company.inn == inn).first()
    
    if not company:
        # Mock external API behavior - auto create a company for demo
        company = models.Company(
            inn=inn,
            company_name=f"Mock Company {inn} LLC",
            activity_type="IT Services",
            export_volume=5000000.0,
            tax_debt=0.0,
            total_turnover=20000000.0,
            total_tax_paid=3000000.0
        )
        db.add(company)
        db.commit()
        db.refresh(company)

    # 3. Calculate formulas
    result = services.generate_analysis(company)

    # 4. Save to Redis
    if redis_client:
        try:
            redis_client.setex(f"analysis_{inn}", 3600, json.dumps(result)) # Cache for 1 hour
        except Exception:
            pass

    return result
