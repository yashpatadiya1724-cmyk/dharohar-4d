# LiFE Pulse (HC26-GEDA01) 🌱⚡
> **Mission LiFE Citizen Engagement App | Personal Sustainability Companion & GEDA Impact Dashboard**

LiFE Pulse helps citizens translate climate awareness into daily, measurable high-impact micro-actions, optimizes peak-hour electrical loads, calculates rooftop solar feasibility in 30 seconds, and provides GEDA (Gujarat Energy Development Agency) with a live, ward-level aggregate impact dashboard.

---

## 🌟 Key Features
1. **Under-2-Minute Onboarding:** Rapid household baseline footprint calculation across appliances, members, and habits.
2. **Explainable LiFE Score (0–100):** Transparent multi-driver scoring (Electricity intensity, appliance mix, peak load shift, eco commute, waste segregation, plastic avoidance).
3. **Daily 3 Micro-Actions:** Tailored daily actions selected from a 60+ action catalog across the 7 Mission LiFE themes with instant kWh, CO₂, and water metrics.
4. **Peak-Load Shifting Engine:** 24-hour interactive visual timeline to shift heavy appliance loads (geysers, washing machines, pumps) away from the 6 PM – 10 PM grid peak.
5. **Rooftop Solar Decision Engine:** Accurate sizing, PM Surya Ghar Muft Bijli Yojana subsidy estimation, payback period, and 25-year financial trajectory.
6. **Community Quests & Leaderboard:** Society- and ward-level gamification with streaks, badges, and healthy eco-competitions.
7. **AI Sustainability Coach:** RAG-powered bilingual assistant grounded in official Mission LiFE documentation with "Add to my plan" integration.
8. **GEDA Admin Hub:** Live municipal ward heatmaps, cumulative energy savings ledgers, and proof-verification review queue.
9. **Multi-Lingual:** Full native support for English, Hindi (हिन्दी), and Gujarati (ગુજરાતી).

---

## 🏗️ Architecture & Tech Stack
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, PWA, Lucide Icons
- **Backend:** FastAPI (Python 3.11), Pydantic v2, SQLAlchemy ORM (SQLite / PostgreSQL dual-support)
- **ML & Analytics:** XGBoost kWh estimation, MobileNetV3 proof verification, Rolling Z-score anomaly detector
- **Seeds & Simulation:** 6 Ahmedabad Wards (Navrangpura, Satellite, Maninagar, Naranpura, Bopal, Chandkheda), 300 synthetic households, 60 days of historical impact ledger.

---

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python run.py
```
Backend API interactive docs: `http://localhost:8000/docs`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Citizen PWA will be live at `http://localhost:3000`

---
*Developed for Mission LiFE Hackathon 2026 (Problem Statement HC26-GEDA01)*
