# 🔌 Port Configuration Summary

## Current Setup (As of Now)

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **Backend (Node.js)** | `5000` | `http://localhost:5000` | ✅ Running |
| **Frontend (Vite)** | `3000` | `http://localhost:3000` | ✅ Running |
| **MongoDB** | `27017` | `mongodb://localhost:27017` | ✅ Running |

---

## 📝 Environment Files - Updated to Match

### Backend Configuration

**File:** `BackEnd-Project/.env` (working local file)
```properties
PORT=5000
FRONTEND_URL=http://localhost:3001
MONGO_URI=mongodb://localhost:27017/document_optimizer
```

**File:** `BackEnd-Project/env.txt` (example for instructor)
```properties
PORT=5000
FRONTEND_URL=http://localhost:3001
MONGO_URI=mongodb://localhost:27017/document_optimizer
```

### Frontend Configuration

**File:** `FrontEnd-React-Assignment-1/.env` (working local file)
```properties
VITE_BACKEND_URL=http://localhost:5000
```

**File:** `FrontEnd-React-Assignment-1/env.txt` (example for instructor)
```properties
VITE_BACKEND_URL=http://localhost:5000
```

---

## ✅ Connection Flow

```
Frontend (http://localhost:3000)
         ↓
         [Axios with baseURL=http://localhost:5000]
         ↓
Backend (http://localhost:5000)
         ↓
         [CORS allowed from http://localhost:3000]
         ✅ Connection Established
```

---

## 🔄 CORS Configuration

- **Backend listens on:** `http://localhost:5000`
- **Backend allows CORS from:** `http://localhost:3000` (via `FRONTEND_URL`)
- **Frontend sends requests to:** `http://localhost:5000`
- **Frontend runs on:** `http://localhost:3000`

---

## 📌 Why Port 3001?

Port 3000 was in use by another process, so Vite automatically used port 3001.

If you want to force port 3000:
```javascript
// In vite.config.js, set:
server: {
  port: 3000,
  strictPort: true  // Fail if port is in use
}
```

And update `BackEnd-Project/.env`:
```properties
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 To Access the Application

- **Frontend:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **Backend API:** http://localhost:5000/api/*
