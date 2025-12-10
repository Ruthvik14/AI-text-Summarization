import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

import httpx
from bs4 import BeautifulSoup
from openai import OpenAI
from fastapi import HTTPException
import pypdf
from docx import Document
import io

# Initialize OpenAI client
# Ensure OPENAI_API_KEY is set in environment variables
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def get_prompt_instructions(summary_type: str, tone: str) -> tuple[str, str]:
    """Returns system message and user instruction based on type and tone."""
    
    # Base system message
    system_message = "You are an assistant that specializes in summarizing text clearly and concisely."
    
    # Summary type instruction
    if summary_type == "short_abstract":
        type_instruction = "Summarize the following text in 3–4 sentences, focusing on the core ideas."
    elif summary_type == "bullet_points":
        type_instruction = "Summarize the following text as 5–7 concise bullet points."
    elif summary_type == "eli5":
        type_instruction = "Explain the main ideas of the following text in simple language, as if to a 12-year-old."
    else:
        type_instruction = "Summarize the following text."

    # Tone instruction
    if tone == "formal":
        tone_instruction = "Use a formal tone."
    elif tone == "casual":
        tone_instruction = "Use a casual, friendly tone."
    else:
        tone_instruction = "Use a neutral, straightforward tone."

    prompt_instruction = f"{type_instruction} {tone_instruction}"
    return system_message, prompt_instruction

def summarize_text(text: str, summary_type: str, tone: str) -> dict:
    if not text or not text.strip():
        raise HTTPException(status_code=422, detail="Input text cannot be empty.")

    system_msg, instruction = get_prompt_instructions(summary_type, tone)
    
    full_user_content = f"{instruction}\n\nText to summarize:\n'''{text}'''"

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo", # Or gpt-4o if preferred/available
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": full_user_content}
            ],
            temperature=0.7,
        )
        
        summary_content = response.choices[0].message.content.strip()
        
        return {
            "summary": summary_content,
            "summary_type": summary_type,
            "tone": tone,
            "model": response.model,
            "input_characters": len(text)
        }

    except Exception as e:
        print(f"OpenAI Error: {e}")
        raise HTTPException(status_code=500, detail=f"OpenAI summarization failed: {str(e)}")

async def fetch_url_text(url: str) -> str:
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, follow_redirects=True, timeout=10.0)
            resp.raise_for_status()
            
            # Simple content extraction
            soup = BeautifulSoup(resp.content, "html.parser")
            
            # Remove scripts and styles
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.extract()
                
            text = soup.get_text(separator="\n")
            
            # clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            clean_text = '\n'.join(chunk for chunk in chunks if chunk)
            
            if len(clean_text) < 50:
                 raise HTTPException(status_code=400, detail="Could not extract sufficient text from URL.")
                 
            return clean_text

    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing URL: {str(e)}")

async def parse_document_file(file_content: bytes, filename: str) -> str:
    ext = filename.split('.')[-1].lower()
    text = ""
    
    try:
        if ext == "pdf":
            reader = pypdf.PdfReader(io.BytesIO(file_content))
            for page in reader.pages:
                text += page.extract_text() + "\n"
        elif ext in ["docx", "doc"]:
            doc = Document(io.BytesIO(file_content))
            for para in doc.paragraphs:
                text += para.text + "\n"
        elif ext in ["txt", "md"]:
            text = file_content.decode("utf-8")
        else:
             raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or TXT.")
             
        if not text.strip():
             raise HTTPException(status_code=400, detail="Could not extract text from file or file is empty.")
             
        return text
        
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Error parsing file: {str(e)}")
