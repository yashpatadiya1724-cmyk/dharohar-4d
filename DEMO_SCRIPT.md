# 🎤 LiFE Pulse (HC26-GEDA01) — 2.5-Minute Hackathon Demo Script

> **Team Presentation Guide for Mission LiFE Hackathon Judges**
> **Total Time:** 2 Minutes 30 Seconds

---

### [0:00 – 0:25] The Problem & Vision
> *"Respected Judges, climate awareness is at an all-time high, but citizens struggle with one simple question: **'Aaj mere ghar ke hisaab se kaunsa ek action sabse zyada bijli aur paisa bachayega?'** At the same time, state agencies like GEDA don't have ward-level granular data on how much energy is being saved by behavioral shifts.*
>
> *Introducing **LiFE Pulse** — Gujarat's Personal Sustainability Companion and GEDA Live Impact Ledger."*

---

### [0:25 – 0:55] Rapid Onboarding & Transparent LiFE Score
> *(Screen: Open [http://localhost:3000](http://localhost:3000) or `/onboarding`)*
>
> *"In under 2 minutes, a citizen like Rina from Satellite Ward, Ahmedabad selects their home type, appliances, and habits. LiFE Pulse calculates a transparent, explainable **LiFE Score from 0 to 100** based on 6 core drivers:*
> 1. *Electricity Intensity (vs. Gujarat urban benchmark of ~45 kWh/person)*
> 2. *Appliance Efficiency (Star labels & LED share)*
> 3. *Peak-Hour Load Optimization*
> 4. *Eco Commute, Waste Segregation, and Plastic Avoidance.*
>
> *No black box — clicking 'How is this calculated' explains the exact math to the user."*

---

### [0:55 – 1:35] Daily Micro-Actions & Peak-Load Shifter
> *(Screen: Click on Today's Action card, then navigate to `/peak`)*
>
> *"Every morning, LiFE Pulse serves **3 personalized micro-actions** selected from our catalog of 60+ Mission LiFE actions. Actions are verified through timer, photo upload, or bill OCR with anti-fraud diminishing returns.*
>
> *Crucially, our **Peak-Load Shifting Engine** analyzes the 6:00 PM to 10:00 PM evening grid peak window. By shifting a 2kW water geyser from 7 PM to 10 PM, a household saves 18 kWh of peak load, earning instant bonus points and relieving grid congestion for Torrent Power and UGVCL."*

---

### [1:35 – 2:05] 30-Second Rooftop Solar Decision Engine
> *(Screen: Navigate to `/solar`)*
>
> *"When a citizen wants to explore solar, they don't need complex engineering quotes. In 30 seconds, using Gujarat's solar irradiance of 4.6 kWh/kW/day, our engine estimates:*
> - *Recommended System Size (e.g. 3 kW for a ₹2,200 monthly bill)*
> - *Direct **PM Surya Ghar Muft Bijli Yojana** central subsidy (₹78,000)*
> - *Net investment, annual savings, payback period (3.8 years), and a 25-year cumulative cash flow projection.*
> - *One-click connection to GEDA-certified installers."*

---

### [2:05 – 2:30] GEDA Municipal Admin Hub & Machine Learning Core
> *(Screen: Click 'GEDA Admin' in top-right or go to `/admin`)*
>
> *"For state officials and urban local bodies, the GEDA Admin Hub provides a live municipal heatmap across 6 Ahmedabad wards — Navrangpura, Satellite, Maninagar, Naranpura, Bopal, and Chandkheda — aggregating verified energy savings, avoided CO₂ tonnes, and a photo verification queue.*
>
> *Under the hood, LiFE Pulse is powered by our Machine Learning Suite:*
> - *M1 XGBoost Monthly kWh Estimator with **R² = 0.9764***
> - *M4 MobileNetV3 Transfer Learning proof classifier*
> - *M5 Isolation Forest anomaly detector.*
>
> *With full trilingual support in Gujarati, Hindi, and English, LiFE Pulse bridges the gap between individual citizen habits and statewide clean energy targets. Thank you!"*

---

### 💡 Pro Demo Tips for Judges:
1. **Show Language Switch:** Toggle from English to **ગુજરાતી** in the navbar to show deep local commitment.
2. **Show What-If Sliders:** Go to `/simulate` and move the AC slider from 18°C to 24°C to demonstrate real-time dynamic score bump.
3. **Show Verification:** Complete an action on the Home page to show confetti and ledger entry.
