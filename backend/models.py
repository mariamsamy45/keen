from sqlalchemy import Column, Integer, String,ForeignKey
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

class Onboarding(Base):
    __tablename__ = "onboarding"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    occupation = Column(String)
    goal = Column(String)
    budget = Column(String)
    priority = Column(String)
    price_importance = Column(String)
    brand_importance = Column(String)
    delivery_importance = Column(String)