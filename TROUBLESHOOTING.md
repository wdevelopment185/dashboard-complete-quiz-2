# 🔧 Troubleshooting Guide

## Issues & Solutions

### ❌ "Database Unknown" in Frontend
**Cause:** MongoDB is not running locally  
**Solution:**
```powershell
# Check if MongoDB is running
Get-Process mongod -ErrorAction SilentlyContinue

# If not, start MongoDB
mongod
# This starts MongoDB on localhost:27017 (default)
```

---

### ❌ "Registration Failed" Error
**Possible Causes:**
1. Backend is not running
2. MongoDB is not running
3. CORS issue

**Solution:**
1. Start MongoDB (see above)
2. Start backend and **watch the console logs**:
   ```powershell
   cd BackEnd-Project
   node index.js
   ```
3. Try registration and check backend console for detailed error messages
4. Make sure frontend `.env` has: `VITE_BACKEND_URL=http://localhost:5000`

---

### ❌ "Server Unhealthy" Message
**Cause:** Backend failed to start or MongoDB connection failed  
**Solution:**
1. Check backend console for errors
2. Ensure MongoDB is running (see above)
3. Restart backend server

---

### ❌ CORS Error in Browser Console
**Message:** "Access to XMLHttpRequest has been blocked by CORS policy"  
**Solution:**
- Frontend should run on **port 3000** (backend CORS is set to `http://localhost:3000`)
- Vite is now configured to run on port 3000 in `vite.config.js`
- If port 3000 is in use, either:
  - Kill the process using port 3000
  - Or add `port: 3001` to vite.config.js and update backend CORS to `http://localhost:3001`

---

## 🚀 Full Setup (Clean Start)

### Terminal 1: Start MongoDB
```powershell
mongod
```
Expected: `Waiting for connections on port 27017`

### Terminal 2: Start Backend
```powershell
cd D:\awd-project-quiz1\BackEnd-Project
npm install  # only first time
node index.js
```
Expected:
```
Connected to MongoDB
Server listening on port 5000
```

### Terminal 3: Start Frontend
```powershell
cd D:\awd-project-quiz1\FrontEnd-React-Assignment-1
npm install  # only first time
npm run dev
```
Expected: `Local: http://localhost:3000`

---

## ✅ How to Verify Everything is Working

1. **Health Check:** http://localhost:3000 → Health badge should show 🟢 Healthy
2. **Signup:** Go to http://localhost:3000/signup → Fill form → Click "Create account"
3. **Watch Backend Console:** You should see:
   - `📝 Registration attempt: { firstName, lastName, email }`
   - `✅ User saved successfully: [user_id]`
   - `🔐 JWT token generated`

If you see `❌ Registration error:`, the message after it tells you the problem.

---

## 📝 Environment Files Checklist

**Backend:**
- ✅ `BackEnd-Project/.env` (local, DO NOT commit)
- ✅ `BackEnd-Project/.env.txt` (example, SAFE to commit)
- ❌ DELETE: `BackEnd-Project/.env.example`

**Frontend:**
- ✅ `FrontEnd-React-Assignment-1/.env` (local, DO NOT commit)
- ✅ `FrontEnd-React-Assignment-1/.env.txt` (example, SAFE to commit)
- ❌ DELETE: `FrontEnd-React-Assignment-1/.env.example`
- ❌ DELETE: Root `env.txt`

---

## 📊 Quick Debug Checklist

- [ ] MongoDB running? `Get-Process mongod`
- [ ] Backend console shows "Connected to MongoDB"?
- [ ] Frontend health badge shows 🟢 Healthy?
- [ ] Backend `.env` has correct `MONGO_URI`?
- [ ] Frontend `.env` has `VITE_BACKEND_URL=http://localhost:5000`?
- [ ] Frontend running on port 3000?
- [ ] Browser console has no CORS errors?

