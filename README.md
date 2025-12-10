# AI Text Summarizer

A simple but solid full-stack web application to summarize text, URLs, and documents using OpenAI.

## Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API Key

## Backend Setup (FastAPI)

1.  Navigate to the `backend` directory:
    
    cd backend
    

2.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up your OpenAI API Key**:
    -   Open `.env` and paste your key:
        ```bash
        OPENAI_API_KEY="Your Key"
        ```
    -   **Important**: Never commit your `.env` file to version control.

5.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

## Frontend Setup (React + Vite)

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```
    The app will happen at `http://localhost:5173`.

## Usage

1.  Open the frontend URL.
2.  Select **Text**, **URL**, or **File**.
3.  Choose your summary type (Abstract, Bullets, ELI5) and Tone.
4.  Click **Summarize**.
