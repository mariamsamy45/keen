from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OnboardingCreate(BaseModel):
    user_id: int
    occupation: str
    goal: str
    budget: str
    priority: str
    price_importance: str
    brand_importance: str
    delivery_importance: str