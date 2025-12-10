from pydantic import BaseModel
from typing import Optional, Literal

class SummarizeRequest(BaseModel):
    text: str
    summary_type: Literal["short_abstract", "bullet_points", "eli5"] = "short_abstract"
    tone: Literal["formal", "neutral", "casual"] = "neutral"

class SummarizeUrlRequest(BaseModel):
    url: str
    summary_type: Literal["short_abstract", "bullet_points", "eli5"] = "short_abstract"
    tone: Literal["formal", "neutral", "casual"] = "neutral"

class SummarizeResponse(BaseModel):
    summary: str
    summary_type: str
    tone: str
    model: str
    input_characters: int
