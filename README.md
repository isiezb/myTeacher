# Easy Story, Easy Life: Educational Story Generator

Generate engaging educational stories tailored to specific subjects and grade levels. This application uses AI to create content on demand.

## Project Structure

This project uses a **single Python FastAPI server** to:

1.  Serve the **Frontend (`/public`)**: A static web application built with Vanilla JavaScript and LitElement Web Components.
2.  Provide the **Backend API**: Handles requests, interacts with the OpenRouter AI service to generate stories, and returns results.

*   **`main.py`**: The main FastAPI application entry point, configures CORS, includes routers, and serves static files.
*   **`/public`**: Contains all frontend assets (HTML, CSS, JS, components).
*   **`/routers`**: Defines API endpoints (e.g., `/stories/generate`).
*   **`/services`**: Contains business logic (e.g., calling the OpenRouter API).
*   **`/models`**: Defines Pydantic data models for API requests/responses.
*   **`requirements.txt`**: Lists Python dependencies.

## Features

*   AI Story Generation: Creates stories based on subject, grade, word count, etc.
*   Customization: Specify setting, main character, language.
*   Optional Content: Generate vocabulary lists and summaries.
*   Interactive Display: View generated stories with clear formatting.
*   (Planned): Interactive quizzes, story continuation, personal library.
*   Debug Panel: Built-in tools for diagnosing API and component issues.

## Technologies Used

*   **Frontend:**
    *   Vanilla JavaScript (ES Modules)
    *   LitElement (for Web Components)
    *   Custom CSS (with CSS Variables)
    *   Fetch API
*   **Backend & Server:**
    *   Python 3
    *   FastAPI (Web framework, serves both API and static files)
    *   Uvicorn (ASGI server)
    *   Pydantic (Data validation)
    *   HTTPX (Async HTTP client)
    *   OpenRouter API (for AI story generation)
    *   python-dotenv (Environment variables)

## Getting Started (Development)

### Prerequisites

*   Python 3 (v3.8 or later recommended).
*   An OpenRouter API Key (sign up at [https://openrouter.ai/](https://openrouter.ai/))

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/easy-story.git # Replace with your repo URL
    cd easy-story
    ```

2.  **Create & Activate Virtual Environment:**
    ```bash
    python3 -m venv .venv       # Create environment (use 'python' if 'python3' not found)
    source .venv/bin/activate   # Activate (Linux/macOS)
    # or .venv\Scripts\activate    # Activate (Windows CMD/PowerShell)
    ```

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment:**
    *   Rename `.env.example` to `.env`.
    *   Open `.env` and add your `OPENROUTER_API_KEY`.
    *   Optionally set `UVICORN_RELOAD="true"` in `.env` for development auto-reload.
    *   Ensure `ALLOWED_ORIGINS` in `.env` includes `http://localhost:8080` (or the port you run on).

5.  **Verify Frontend Config:** Check `public/js/env.js` - the `API_URL` should be `""` (empty string) because the API is served from the same origin.

### Running Locally

1.  **Activate Virtual Environment:**
    ```bash
    source .venv/bin/activate
    ```
2.  **Run the FastAPI Server:**
    ```bash
    uvicorn main:app
    # Or if reload is enabled in .env: uvicorn main:app --reload
    ```
3.  **Access the Application:** Open your browser to `http://localhost:8080` (or the port specified in the console output). The FastAPI server now serves both the frontend and the API.

## Deployment (Render Example - Single Service)

Deploy as a single **Python Web Service** on Render:

*   **Repository:** Point to your GitHub repo.
*   **Root Directory:** (Leave blank if `main.py` is in the root).
*   **Environment:** Python 3
*   **Build Command:** `pip install -r requirements.txt`
*   **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
*   **Environment Variables:**
    *   `OPENROUTER_API_KEY`: Your actual OpenRouter key.
    *   `PYTHON_VERSION`: (Optional, e.g., `3.11.5`) Specify Python version if needed.
    *   `ALLOWED_ORIGINS`: Comma-separated list, **MUST include the final Render URL** of this service itself (e.g., `https://your-app-name.onrender.com`). Add `http://localhost:8080` if you still want to test locally against the deployed version.

## License

MIT License

## Acknowledgments

*   Built with LitElement & FastAPI
*   Uses OpenRouter for AI Generation
*   Developed for educational exploration 