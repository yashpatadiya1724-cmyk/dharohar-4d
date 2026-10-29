@echo off
echo Starting LiFE Pulse (HC26-GEDA01)...
echo -----------------------------------
start "LiFE Pulse Backend (FastAPI)" cmd /k "cd backend && python run.py"
start "LiFE Pulse Frontend (Next.js)" cmd /k "cd frontend && npm run dev"
echo Both services launched!
echo Frontend: http://localhost:3000
echo Backend API Docs: http://localhost:8000/docs
