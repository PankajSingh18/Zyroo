# ZyroAI

ZyroAI is a web-based AI assistant for chatting, creating custom agents, understanding images, and automating tasks through connected services such as Gmail, Google Calendar, and Instagram.

## What the project does

- **AI chat:** Ask questions and continue conversations with saved thread context.
- **Custom agents:** Create agents with their own instructions, model settings, and tools.
- **Image understanding:** Upload an image and ask the assistant to describe or analyze it.
- **Connected services:** Authorize Google services and use agent tools to work with email and calendar data. Instagram publishing is also supported when configured.
- **Human approval:** Review sensitive actions, such as sending an email, creating a calendar event, or publishing an Instagram post, before they execute.
- **Credits and payments:** Chat and agent actions use credits; users can purchase more through the pricing page.

## How it works

1. The **React frontend** sends chat, agent, and integration requests to the backend API.
2. The **Express backend** authenticates requests, loads user and agent data from MongoDB, and runs chat workflows.
3. **LangChain and LangGraph** connect the configured Groq model to conversation history, agent instructions, and tools.
4. The backend exposes integrations as **MCP tools**. The AI can request a tool, but approval-protected actions pause for user confirmation before they run.
5. Firebase provides Google sign-in. The backend verifies the Firebase ID token and issues an HTTP-only session cookie.
6. Cloudinary stores uploaded images. Gemini or the configured vision fallback analyzes image content.

## Main technologies

- **Frontend:** React, Vite, Tailwind CSS, Redux Toolkit, Firebase Web SDK
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **AI and tools:** Groq, LangChain, LangGraph, Model Context Protocol (MCP), Google Gemini
- **Integrations:** Google OAuth, Gmail, Google Calendar, Instagram, Cloudinary, Razorpay

## Project structure

```text
backend/
  controllers/  API request handlers
  services/     Chat and agent workflows
  mcp/          MCP server and integration tools
  models/       MongoDB data models
  routes/       Express API routes
  config/       Database, Firebase, and provider setup
frontend/
  src/pages/    Chat, login, agents, integrations, and pricing screens
  src/features/ Frontend API calls
  src/components/ Shared UI and brand components
```

## Requirements

- Node.js 20 or newer
- npm
- MongoDB (local or Atlas)
- API credentials for the providers you want to use

## Setup

Install dependencies in both applications:

```bash
cd backend && npm ci
cd ../frontend && npm ci
```

Create `backend/.env` and `frontend/.env` using the variables below. Never commit real environment files, API keys, OAuth secrets, or service-account credentials.

### Backend environment

Required for the API and agent chat:

```dotenv
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
JWT_SECRET=generate_a_long_random_secret
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
AUTOMATE_MCP_SECRET=generate_a_long_random_secret
ENCRYPTION_KEY=generate_64_hex_characters
SOCIAL_TOKEN_ENCRYPTION_KEY=generate_64_hex_characters
```

Firebase Admin authentication also needs `backend/serviceAccountKey.json`. Download the service-account JSON from the same Firebase project used by the frontend. This file is ignored by Git and must remain private.

For Google sign-in integrations (Gmail and Calendar), configure:

```dotenv
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/integrations/google/callback
```

Add that exact callback URL to the OAuth client's **Authorized redirect URIs** in Google Cloud Console.

For production deployments where the frontend and backend use different origins, set `NODE_ENV=production` on the backend. Authentication cookies then use `SameSite=None; Secure`, which allows the browser to send the session cookie with credentialed API requests. Also set `CLIENT_URL` to the exact frontend origin (for example, `https://your-frontend.onrender.com`) and configure the frontend's `VITE_SERVER_URL` to the backend's public URL.

Optional integrations:

- Image understanding: `GOOGLE_API_KEY` and `GEMINI_VISION_MODEL` (defaults to `gemini-2.5-flash`). If Gemini is not configured, image analysis can use the Groq vision fallback.
- Web search: `TAVILY_API_KEY`.
- Instagram OAuth/publishing: `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_CONFIG_ID`, `INSTAGRAM_REDIRECT_URI`, and `INSTAGRAM_GRAPH_VERSION`.
- Payments: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_PLAN_100_AMOUNT_PAISE`, `RAZORPAY_PLAN_500_AMOUNT_PAISE`, `RAZORPAY_PLAN_2000_AMOUNT_PAISE`.
- Credit pricing: `CHAT_CREDIT_COST`.
- `API_BASE_URL` may be set to the backend base URL when needed.

### Frontend environment

Create `frontend/.env`:

```dotenv
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_SERVER_URL=http://localhost:8000
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

Use the Firebase Web App config and Firebase Admin service account from the same Firebase project. In Cloudinary, create an unsigned upload preset for browser image uploads. Do not put Cloudinary API secrets in frontend variables.

## Run locally

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the local URL printed by Vite (by default, `http://localhost:5173`).

## Useful commands

```bash
# Frontend production build
cd frontend && npm run build

# Frontend lint
cd frontend && npm run lint
```

## Security notes

- `.env` files and `backend/serviceAccountKey.json` are excluded from Git.
- Rotate credentials if they have been exposed; do not paste them into issues, screenshots, or chat.
- Use separate provider credentials for development and production.
