from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    role: str = 'analyst'

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    last_login: Optional[datetime] = None
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class CompanyBase(BaseModel):
    inn: str
    company_name: str
    activity_type: str
    export_volume: float
    tax_debt: float
    total_turnover: float
    total_tax_paid: float

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class SWOTAnalysis(BaseModel):
    strengths: list[str]
    weaknesses: list[str]
    opportunities: list[str]
    threats: list[str]

class AnalysisResult(BaseModel):
    inn: str
    tax_burden_percent: float
    export_efficiency_percent: float
    potential_benefit: str
    recommendations: list[str]
    swot: SWOTAnalysis
    ai_powered: bool
