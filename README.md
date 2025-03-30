# Easy Story, Easy Life: Educational Story Generator

Generate engaging educational stories tailored to specific subjects and grade levels. This application uses AI to create content on demand.

## Project Structure

This project now consists of two main parts:

1.  **Frontend (`/public`, `server.js`):**
    *   A static web application built with Vanilla JavaScript and LitElement Web Components.
    *   Served by a simple Node.js/Express server (`server.js`).
    *   Handles user interaction and displays generated content.
    *   Communicates with the backend API.

2.  **Backend (Python/FastAPI - root directory):**
    *   A FastAPI application responsible for handling API requests.
    *   Contains the logic for interacting with the OpenRouter AI service to generate stories (`services/story_generator.py`).
    *   Defines API routes (`routers/story.py`) and data models (`models/story.py`).
    *   Requires Python and dependencies listed in `requirements.txt`.

## Features

*   **AI Story Generation:** Creates stories based on subject, grade, word count, etc.
*   **Customization:** Specify setting, main character, language.
*   **Optional Content:** Generate vocabulary lists and summaries.
*   **Interactive Display:** View generated stories with clear formatting.
*   **(Planned):** Interactive quizzes, story continuation, personal library.
*   **Debug Panel:** Built-in tools for diagnosing API and component issues.

## Technologies Used

*   **Frontend:**
    *   Vanilla JavaScript (ES Modules)
    *   LitElement (for Web Components)
    *   Custom CSS (with CSS Variables)
    *   Fetch API
    *   Node.js/Express (for serving static files)
*   **Backend:**
    *   Python 3
    *   FastAPI (Web framework)
    *   Uvicorn (ASGI server)
    *   Pydantic (Data validation)
    *   HTTPX (Async HTTP client)
    *   OpenRouter API (for AI story generation)
    *   python-dotenv (Environment variables)

## Getting Started (Development)

### Prerequisites

*   Node.js (v18 or later recommended) for the frontend server.
*   Python 3 (v3.8 or later recommended) for the backend API.
*   An OpenRouter API Key (sign up at [https://openrouter.ai/](https://openrouter.ai/))

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/easy-story.git # Replace with your repo URL
    cd easy-story
    ```

2.  **Frontend Setup:**
    ```bash
    npm install
    ```
    *Note: Currently, `server.js` only serves static files and has no build step.* 

3.  **Backend Setup:**
    *   **Create & Activate Virtual Environment:**
        ```bash
        python3 -m venv .venv       # Create environment (use 'python' if 'python3' not found)
        source .venv/bin/activate   # Activate (Linux/macOS)
        # or .venv\Scripts\activate    # Activate (Windows CMD/PowerShell)
        ```
    *   **Install Dependencies:**
        ```bash
        pip install -r requirements.txt
        ```
    *   **Configure Environment:**
        *   Rename `.env.example` to `.env`.
        *   Open `.env` and add your `OPENROUTER_API_KEY`.
        *   *Important:* In `.env`, set `ALLOWED_ORIGINS` to include the URL where you'll run the frontend (e.g., `http://localhost:3000` if using the default Node server port, or adjust if different).
        *   Optionally set `UVICORN_RELOAD="true"` in `.env` for development auto-reload.

### Running Locally

You need to run both the frontend server and the backend API server simultaneously.

1.  **Run the Backend API Server:**
    *   Make sure your virtual environment is activated (`source .venv/bin/activate`).
    *   Run from the project root directory:
        ```bash
        uvicorn main:app
        # Or if reload is enabled in .env: uvicorn main:app --reload
        ```
    *   The API will typically run on `http://localhost:8080` (check console output).

2.  **Run the Frontend Server:**
    *   Open a *new* terminal window.
    *   Navigate to the project root directory.
    *   Make sure the `API_URL` in `public/js/env.js` points to your running backend API URL (e.g., `http://localhost:8080`).
    *   Run the Node.js static server:
        ```bash
        node server.js
        ```
    *   The frontend will typically run on `http://localhost:10000` (check console output).

3.  **Access the Application:** Open your browser to the frontend server URL (e.g., `http://localhost:10000`).

## Deployment (Render Example)

This project requires deploying **two separate services** on Render:

1.  **Backend API Service (FastAPI):**
    *   **Type:** Web Service
    *   **Repository:** Point to your GitHub repo.
    *   **Root Directory:** (Leave blank if backend files are in the root, or specify subfolder if needed).
    *   **Environment:** Python 3
    *   **Build Command:** `pip install -r requirements.txt`
    *   **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
    *   **Environment Variables:**
        *   `OPENROUTER_API_KEY`: Your actual OpenRouter key.
        *   `PYTHON_VERSION`: (Optional, e.g., `3.11.5`) Specify Python version if needed.
        *   `ALLOWED_ORIGINS`: Comma-separated list of URLs allowed to access the API (e.g., `https://your-frontend-domain.onrender.com`).
    *   Note the URL assigned by Render to this service (e.g., `https://your-backend.onrender.com`).

2.  **Frontend Service (Node.js Static Server):**
    *   **Type:** Web Service
    *   **Repository:** Point to your GitHub repo.
    *   **Root Directory:** (Leave blank if `server.js`/`public` are in the root).
    *   **Environment:** Node
    *   **Build Command:** `npm install` (or leave blank if no build needed)
    *   **Start Command:** `node server.js`
    *   **Important:** Before deploying the frontend, **edit `public/js/env.js`** in your code, change the `API_URL` to the URL of your deployed **Backend API Service** (from step 1), commit, and push the change.

## License

MIT License

## Acknowledgments

*   Built with LitElement
*   Uses OpenRouter for AI Generation
*   Developed for educational exploration 