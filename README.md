# AuthApp — Full-Stack Authentication Application

> A secure, production-ready authentication system built for the **Infosys Internship** project.  
> **Stack:** Python FastAPI · React + Vite · SQLite · SQLAlchemy · JWT · bcrypt · Axios

---

## 📋 Project Overview

AuthApp is a full-stack authentication application that demonstrates secure user registration, login, and session management. It follows industry best practices including password hashing (bcrypt), JWT-based stateless authentication, and input validation on both client and server.

---

## 🛠️ Technologies Used

| Layer      | Technology                                      |
|------------|------------------------------------------------|
| Backend    | Python 3.11+, FastAPI, Uvicorn                 |
| Database   | SQLite (via SQLAlchemy ORM)                    |
| Auth       | JWT (python-jose), bcrypt (passlib)            |
| Validation | Pydantic v2, pydantic-settings                 |
| Frontend   | React 19, Vite 6, React Router v7             |
| HTTP       | Axios (with JWT interceptor)                   |
| Styling    | Vanilla CSS (custom dark theme, glassmorphism) |

---

## 📁 Project Structure

```
authentication-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py        # Package init
│   │   ├── main.py            # FastAPI app, CORS, router mount
│   │   ├── config.py          # Settings (pydantic-settings + .env)
│   │   ├── database.py        # SQLAlchemy engine, session, Base
│   │   ├── models.py          # User ORM model
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   ├── auth.py            # bcrypt hashing + JWT utilities
│   │   └── routes/
│   │       ├── __init__.py
│   │       └── auth.py        # /signup /login /me /logout endpoints
│   ├── requirements.txt
│   ├── .env.example
│   └── .env                   # (created from .env.example — git-ignored)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AlertBanner.jsx   # Global error/success banner
│   │   │   ├── FieldError.jsx    # Inline field validation error
│   │   │   └── LogoIcon.jsx      # Brand logo icon
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login page
│   │   │   ├── Signup.jsx        # Signup page
│   │   │   └── Dashboard.jsx     # Protected dashboard
│   │   ├── services/
│   │   │   └── api.js            # Axios instance + auth API calls
│   │   ├── App.jsx               # Router with protected/public routes
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Design system (tokens, components)
│   ├── index.html
│   ├── package.json
│   ├── .env.example
│   └── .env                   # (created from .env.example — git-ignored)
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Python 3.11+** — [python.org](https://www.python.org/downloads/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)

---

### 🔧 Backend Setup

```bash
# 1. Navigate to the backend directory
cd authentication-app/backend

# 2. Create a virtual environment
python -m venv venv

# 3. Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# 4. Install Python dependencies
pip install -r requirements.txt

# 5. Create the .env file from the example
copy .env.example .env       # Windows
cp .env.example .env         # macOS / Linux

# 6. (Optional) Edit .env to set a strong SECRET_KEY
#    Generate one with: python -c "import secrets; print(secrets.token_hex(32))"
```

### ▶️ Start the Backend

```bash
# From authentication-app/backend/ with venv activated:
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **Base URL:** `http://localhost:8000`
- **Interactive Docs (Swagger):** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **Health Check:** `http://localhost:8000/health`

---

### 🎨 Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd authentication-app/frontend

# 2. Install Node dependencies
npm install

# 3. Create the .env file from the example
copy .env.example .env       # Windows
cp .env.example .env         # macOS / Linux
```

### ▶️ Start the Frontend

```bash
# From authentication-app/frontend/:
npm run dev
```

The React app will be available at: **`http://localhost:5173`**

---

## 🌐 API Endpoints

| Method | Endpoint              | Auth Required | Description                        |
|--------|-----------------------|---------------|------------------------------------|
| GET    | `/health`             | ❌             | Health check                       |
| POST   | `/api/v1/auth/signup` | ❌             | Register a new user                |
| POST   | `/api/v1/auth/login`  | ❌             | Login and receive JWT token        |
| GET    | `/api/v1/auth/me`     | ✅ Bearer JWT  | Get current user profile           |
| POST   | `/api/v1/auth/logout` | ✅ Bearer JWT  | Confirm logout (client clears JWT) |

### Example Request — Signup

```bash
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "securepass123",
    "confirm_password": "securepass123"
  }'
```

### Example Request — Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "securepass123"}'
```

---

## 🗄️ Database

- **Type:** SQLite (file-based, zero config)
- **File:** `authentication-app/backend/auth_app.db` (auto-created on first run)
- **ORM:** SQLAlchemy 2.0

### Users Table Schema

| Column        | Type         | Constraints              |
|---------------|--------------|--------------------------|
| `id`          | INTEGER      | PRIMARY KEY, AUTOINCREMENT |
| `first_name`  | VARCHAR(100) | NOT NULL                 |
| `last_name`   | VARCHAR(100) | NOT NULL                 |
| `email`       | VARCHAR(255) | UNIQUE, NOT NULL, INDEXED |
| `password_hash` | VARCHAR(255) | NOT NULL               |

> ⚠️ **`password_hash` is never returned in any API response.**

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcrypt via `passlib` |
| Authentication tokens | JWT signed with HS256 |
| Token expiry | 30 minutes (configurable via `.env`) |
| Input validation | Pydantic v2 on backend, JS on frontend |
| Duplicate email | HTTP 409 Conflict |
| Invalid credentials | HTTP 401 (same message for email/password — no enumeration) |
| CORS | Restricted to `localhost:5173` by default |
| Secrets | All via `.env` — never hardcoded |

---

## 🧪 Testing Instructions

### Signup Tests

| Test Case | Expected Result |
|-----------|----------------|
| Valid signup (all fields correct) | ✅ Redirects to Dashboard |
| Password mismatch | ❌ "Passwords do not match" |
| Invalid email format | ❌ "Enter a valid email address" |
| Duplicate email | ❌ "An account with this email address already exists" |
| Empty fields | ❌ Field-level "required" errors |
| Password < 8 characters | ❌ "Password must be at least 8 characters" |

### Login Tests

| Test Case | Expected Result |
|-----------|----------------|
| Correct credentials | ✅ Redirects to Dashboard |
| Wrong password | ❌ "Invalid email or password" |
| Non-existent email | ❌ "Invalid email or password" |
| Empty fields | ❌ Field-level "required" errors |
| Invalid email format | ❌ "Enter a valid email address" |

### Logout Tests

| Test Case | Expected Result |
|-----------|----------------|
| Click Logout on Dashboard | ✅ JWT cleared, redirected to Login |
| Access `/dashboard` after logout | ✅ Redirected to Login (ProtectedRoute) |
| Access `/login` while logged in | ✅ Redirected to Dashboard (PublicRoute) |

### Using the Interactive API Docs

1. Navigate to `http://localhost:8000/docs`
2. Use the **Signup** endpoint to create a user
3. Use the **Login** endpoint — copy the `access_token`
4. Click **Authorize** (top right) → paste `Bearer <token>`
5. Test `/auth/me` and `/auth/logout`

---

## 🔑 Environment Variables

### Backend (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | *(required)* | JWT signing secret |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Token expiry duration |
| `DATABASE_URL` | `sqlite:///./auth_app.db` | SQLAlchemy DB URL |
| `ALLOWED_ORIGINS` | `http://localhost:5173,...` | CORS allowed origins |

### Frontend (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Backend API base URL |

---

## 👤 Author

Built as part of the **Infosys Internship** program.
