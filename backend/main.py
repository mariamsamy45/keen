from fastapi import FastAPI
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import Depends
from database import SessionLocal
from datetime import datetime, timedelta
from jose import jwt
import schemas
import models

app = FastAPI()


@app.get("/")
def home():
    return {
        "message": "Keen backend is running!"
    }


from database import engine

@app.get("/test-db")
def test_db():
    try:
        conn = engine.connect()
        conn.close()
        return {"status": "Database connected!"}
    except Exception as e:
        return {"status": "Failed", "error": str(e)}


from database import engine, Base
import models

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "change-this-to-something-random-later"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed_password = pwd_context.hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created!", "user_id": new_user.id}

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password_hash):
        return {"error": "Invalid email or password"}
    
    token = create_access_token({"sub": str(db_user.id)})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/onboarding")
def onboarding(data: schemas.OnboardingCreate, db: Session = Depends(get_db)):
    new_entry = models.Onboarding(
        user_id=data.user_id,
        occupation=data.occupation,
        goal=data.goal,
        budget=data.budget,
        priority=data.priority,
        price_importance=data.price_importance,
        brand_importance=data.brand_importance,
        delivery_importance=data.delivery_importance
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return {"message": "Onboarding saved!", "onboarding_id": new_entry.id}