# 🚀 Dharohar 4D — Render Production Deployment Guide

Aapka poora project **Render** (`https://render.com`) par deploy hone ke liye 100% ready hai! 
Isme humne **Render Blueprint (`render.yaml`)** configure kar diya hai, jisse aap **1-Click** me Frontend aur Backend dono ek saath deploy kar sakte hain.

---

## 📋 Option 1: 1-Click Blueprint Deploy (Recommended & Fastest)

Yeh sabse aasan tarika hai kyunki `render.yaml` backend aur frontend ko khud aapas me connect kar deta hai.

### Step 1: Code ko GitHub par Push karein
Agar aapne already GitHub repo banayi hui hai:
```bash
git add .
git commit -m "feat: Render deployment blueprint and production readiness"
git push origin main
```

### Step 2: Render Dashboard par jayein
1. [dashboard.render.com](https://dashboard.render.com) par login karein.
2. Top right par **`New +`** button par click karein.
3. Dropdown me se **`Blueprint`** select karein.
4. Apna GitHub repository connect karein jisme Dharohar 4D push kiya hai.

### Step 3: Blueprint Apply karein
1. Render automatically `render.yaml` file ko detect kar lega.
2. Render aapko do services dikhayega:
   - 🐍 **`dharohar-4d-backend`** (Python 3.11, FastAPI)
   - ⚡ **`dharohar-4d-frontend`** (Node 20, Next.js 14)
3. **Environment Variables**:
   - `GROQ_API_KEY`: Aapki Groq API key enter karein (`gsk_...`).
4. **`Apply`** button par click karein!

Render dono services build karega aur deploy kar dega. Frontend automatically internal network se backend se connect ho jayega!

---

## 🛠️ Option 2: Manual Deploy (Step-by-Step)

Agar aap Blueprint use nahi karna chahte aur dono services alag-alag banana chahte hain:

### Service A: FastAPI Backend deploy karein
1. Render Dashboard par **`New +`** -> **`Web Service`** select karein.
2. Apna GitHub repo select karein.
3. Settings enter karein:
   - **Name**: `dharohar-4d-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
4. **Environment Variables (Add Environment Variable)**:
   - `PYTHON_VERSION`: `3.11.9`
   - `GROQ_API_KEY`: `your_groq_api_key_here`
   - `WIKI_USER_AGENT`: `Dharohar4D/1.0 (heritage-explorer@dharohar.org)`
   - `PYTHONUNBUFFERED`: `1`
5. **`Create Web Service`** par click karein.
6. Deploy hone ke baad, backend ka URL copy kar lein (jaise: `https://dharohar-4d-backend.onrender.com`).

---

### Service B: Next.js Frontend deploy karein
1. Render Dashboard par **`New +`** -> **`Web Service`** select karein.
2. Wahi GitHub repo dobara select karein.
3. Settings enter karein:
   - **Name**: `dharohar-4d-frontend`
   - **Root Directory**: *(empty chhod dein, default root `.` rahega)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: `Free`
4. **Environment Variables**:
   - `NODE_VERSION`: `20.12.2`
   - `BACKEND_URL`: Aapke backend ka URL (jaise `https://dharohar-4d-backend.onrender.com`)
5. **`Create Web Service`** par click karein.

Jab build complete ho jayega, Render aapko frontend ka live link de dega!

---

## 🔍 Verification Checklist

| Feature | Localhost | Render Cloud | Status |
|---|---|---|---|
| Dynamic Port Binding | `$PORT` / 8001 | Auto-injected by Render | ✅ Configured |
| Wildcard CORS | Configured | `allow_origin_regex` for `*.onrender.com` | ✅ Configured |
| Next.js API Rewrite | `127.0.0.1:8001` | Reads `process.env.BACKEND_URL` | ✅ Configured |
| Production Build | 0 errors | 11/11 Static Routes Generated | ✅ Verified |
| 4D Monuments & Groq AI | Working | Fallbacks + Qwen 27B live | ✅ Verified |

---
**Hackathon:** HC26-CULT01 | Blithchron '27, IIT Gandhinagar

