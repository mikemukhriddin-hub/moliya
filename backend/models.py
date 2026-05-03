from sqlalchemy import Column, Integer, String, DECIMAL, TIMESTAMP, text
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String(20), default='analyst') # admin, analyst, user
    last_login = Column(TIMESTAMP)

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    inn = Column(String(9), unique=True, index=True, nullable=False)
    company_name = Column(String(255))
    activity_type = Column(String(100))
    export_volume = Column(DECIMAL(15, 2))
    tax_debt = Column(DECIMAL(15, 2))
    total_turnover = Column(DECIMAL(15, 2), default=0)
    total_tax_paid = Column(DECIMAL(15, 2), default=0)
    created_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
