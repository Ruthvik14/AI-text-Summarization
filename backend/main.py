from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import SummarizeRequest, SummarizeUrlRequest, SummarizeResponse
from services import summarize_text, fetch_url_text, parse_document_file
import uvicorn
import os

app = FastAPI(title="AI Text Summarizer")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Text Summarizer API is running"}

@app.post("/summarize", response_model=SummarizeResponse)
def summarize_text_endpoint(request: SummarizeRequest):
    return summarize_text(request.text, request.summary_type, request.tone)

@app.post("/summarize-url", response_model=SummarizeResponse)
async def summarize_url_endpoint(request: SummarizeUrlRequest):
    text = await fetch_url_text(request.url)
    return summarize_text(text, request.summary_type, request.tone)

@app.post("/summarize-file", response_model=SummarizeResponse)
async def summarize_file_endpoint(
    file: UploadFile = File(...),
    summary_type: str = Form("short_abstract"),
    tone: str = Form("neutral")
):
    # Validate allowed types/tones manually since Form doesn't strict validate enum strings easily
    if summary_type not in ["short_abstract", "bullet_points", "eli5"]:
        summary_type = "short_abstract"
    if tone not in ["formal", "neutral", "casual"]:
        tone = "neutral"
        
    content = await file.read()
    text = await parse_document_file(content, file.filename)
    return summarize_text(text, summary_type, tone)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
