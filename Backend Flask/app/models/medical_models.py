from typing import List, Optional
from pydantic import BaseModel # type: ignore

class NormalRange(BaseModel):
    min: float | None = None
    max: float | None = None

class MedicalTestResult(BaseModel):
    name: str
    value: float | str | None = None
    unit: str | None = None
    normalRange: NormalRange = NormalRange()
    critical: bool = False
    trend: str | None = "stable"
    percentile: int | None = None
    lastUpdated: str | None = None
    category: str | None = None
    interpretation: str | None = None

class Prescription(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    confidence: Optional[float] = None
    possibleMatches: Optional[List[str]] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[List[str]] = None
    warnings: Optional[List[str]] = None
    category: Optional[str] = None
    timeOfDay: Optional[str] = None
    withFood: Optional[bool] = None
    withWater: Optional[bool] = None

class MedicalResponse(BaseModel):
    is_medical: bool
    message: str