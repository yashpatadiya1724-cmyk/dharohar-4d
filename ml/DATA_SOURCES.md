# LiFE Pulse — Dataset & Calibration Sources (HC26-GEDA01)

This document catalogs the scientific and empirical reference data sources used to calibrate the LiFE Pulse domain engines, physics formulas, and ML estimators.

---

## 1. Household Electricity Benchmarks & Load Profiles
- **UCI Machine Learning Repository:** *Individual Household Electric Power Consumption Dataset*
  - **Usage:** Hourly load shape calibration, evening peak window curve, standby base-load distribution.
  - **License:** Open Access (CC BY 4.0)
- **Central Electricity Authority (CEA) of India:** *CO2 Baseline Database for the Indian Power Sector (Version 19 / 2024)*
  - **Grid Emission Factor:** `0.82 kg CO2 / kWh` for the national/regional grid.
  - **Source:** [CEA Official Portal](https://cea.nic.in)
- **Bureau of Energy Efficiency (BEE):** *Standards & Labeling Program Specifications*
  - **Appliance Wattages:** AC 1.5 Ton (1400W), Refrigerator (150W), Water Geyser (2000W), Ceiling Fan (75W), LED Bulb (9W vs 60W Incandescent).
  - **Thermostat Guideline:** 24°C default comfort setting yields ~6% electricity savings per 1°C increase.

---

## 2. Solar Radiation & Tariff Slabs
- **NASA Prediction of Worldwide Energy Resources (POWER) API / Global Solar Atlas:**
  - **Gujarat Average Irradiance:** 4.60 - 5.20 kWh/m²/day.
  - **Performance Ratio (PR):** 0.75 - 0.78 for rooftop grid-connected PV systems.
- **PM Surya Ghar: Muft Bijli Yojana (Ministry of New and Renewable Energy - MNRE):**
  - **Subsidy Structure:** ₹30,000 for 1 kW; ₹60,000 for 2 kW; ₹78,000 for 3 kW and higher residential systems.
- **Gujarat Electricity Regulatory Commission (GERC):**
  - **DISCOM Tariffs:** Torrent Power & UGVCL/PGVCL/DGVCL/MGVCL domestic tariff slabs (~₹5.80 off-peak, ₹7.50 peak surcharge).

---

## 3. Mission LiFE Official Actions
- **Ministry of Environment, Forest and Climate Change (MoEFCC):**
  - *Mission LiFE: 75 Actions across 7 Themes* (Energy, Water, Plastic, Food, Waste, E-waste, Healthy Lifestyle).
  - Seeded into `actions_catalog` table with verified trilingual titles (English, Hindi, Gujarati).

---

## 4. Municipal Boundaries & Recyclers
- **Ahmedabad Municipal Corporation (AMC) & OpenStreetMap:**
  - 6 Key Wards: Navrangpura, Satellite, Maninagar, Naranpura, Bopal, Chandkheda.
- **Central Pollution Control Board (CPCB):**
  - Authorized E-waste dismantling and recycling collection points in Gujarat.
