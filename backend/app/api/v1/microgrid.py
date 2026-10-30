from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import time
import random
from datetime import datetime

router = APIRouter(prefix="/microgrid", tags=["P2P Micro-Grid"])

# In-memory society state for real-time interactive P2P simulation
DEFAULT_NODES = [
    {
        "id": "node-prosumer-1",
        "name": "Villa 14 (Surya Prosumer)",
        "type": "prosumer",
        "solar_kw": 6.5,
        "current_generation_kw": 5.2,
        "current_load_kw": 1.4,
        "net_export_kw": 3.8,
        "battery_soc_pct": 84,
        "x": 160,
        "y": 140
    },
    {
        "id": "node-prosumer-2",
        "name": "Tower A (Terrace Solar Array)",
        "type": "prosumer",
        "solar_kw": 15.0,
        "current_generation_kw": 11.4,
        "current_load_kw": 4.1,
        "net_export_kw": 7.3,
        "battery_soc_pct": 92,
        "x": 420,
        "y": 120
    },
    {
        "id": "node-consumer-1",
        "name": "Tower B (Apartments 1-12)",
        "type": "consumer",
        "solar_kw": 0.0,
        "current_generation_kw": 0.0,
        "current_load_kw": 6.8,
        "net_export_kw": -6.8,
        "battery_soc_pct": 0,
        "x": 680,
        "y": 150
    },
    {
        "id": "node-consumer-2",
        "name": "Society Clubhouse & Pool",
        "type": "consumer",
        "solar_kw": 0.0,
        "current_generation_kw": 0.0,
        "current_load_kw": 3.2,
        "net_export_kw": -3.2,
        "battery_soc_pct": 0,
        "x": 200,
        "y": 380
    },
    {
        "id": "node-ev",
        "name": "Community EV Fast Charger",
        "type": "flexible_load",
        "solar_kw": 0.0,
        "current_generation_kw": 0.0,
        "current_load_kw": 4.5,
        "net_export_kw": -4.5,
        "battery_soc_pct": 65,
        "x": 420,
        "y": 390
    },
    {
        "id": "node-bess",
        "name": "Society Central BESS (50 kWh)",
        "type": "storage",
        "solar_kw": 0.0,
        "current_generation_kw": 0.0,
        "current_load_kw": 0.0,
        "net_export_kw": 3.4, # Discharging
        "battery_soc_pct": 78,
        "x": 650,
        "y": 370
    }
]

TRANSACTIONS_FEED = [
    {
        "id": "tx-901",
        "seller": "Villa 14",
        "buyer": "Tower B (Flat 401)",
        "energy_kwh": 2.4,
        "price_per_kwh": 5.95,
        "discom_avoided_cost": 7.50,
        "timestamp": "Just now",
        "hash": "0x4f8a...b72e"
    },
    {
        "id": "tx-902",
        "seller": "Tower A (Terrace)",
        "buyer": "Community EV Charger",
        "energy_kwh": 3.8,
        "price_per_kwh": 5.90,
        "discom_avoided_cost": 7.50,
        "timestamp": "2 min ago",
        "hash": "0x91d3...ca01"
    },
    {
        "id": "tx-903",
        "seller": "Society Central BESS",
        "buyer": "Clubhouse Pump",
        "energy_kwh": 1.5,
        "price_per_kwh": 6.10,
        "discom_avoided_cost": 7.50,
        "timestamp": "5 min ago",
        "hash": "0x3e12...f88a"
    }
]

class TradeRequest(BaseModel):
    trader_name: str
    trade_type: str # "buy" or "sell"
    units_kwh: float
    bid_price: float # in INR

@router.get("/state")
def get_microgrid_state(hour: Optional[float] = 13.5):
    """
    Returns live topology, current localized market clearing price,
    node power flows, and smart contract transaction ledger.
    """
    # Solar generation factor based on time of day (bell curve between 6h and 18h)
    hour = max(0.0, min(24.0, float(hour)))
    if 6.0 <= hour <= 18.0:
        solar_factor = max(0.0, round(float(abs(1.0 - ((hour - 12.5) / 5.5) ** 2)), 3))
    else:
        solar_factor = 0.0

    # Dynamic dynamic recalculation
    total_generation = 0.0
    total_consumption = 0.0
    nodes = []

    for n in DEFAULT_NODES:
        node = dict(n)
        if node["solar_kw"] > 0:
            node["current_generation_kw"] = round(node["solar_kw"] * solar_factor * random.uniform(0.92, 1.05), 2)
        else:
            node["current_generation_kw"] = 0.0

        # Adjust demand for evening peak
        if 18.0 <= hour <= 22.0:
            node["current_load_kw"] = round(node["current_load_kw"] * 1.35, 2)

        node["net_export_kw"] = round(node["current_generation_kw"] - node["current_load_kw"], 2)
        total_generation += node["current_generation_kw"]
        total_consumption += node["current_load_kw"]
        nodes.append(node)

    # Market clearing price algorithm
    # Peak DISCOM rate in Ahmedabad: ₹7.50/kWh, Solar Feed-in tariff: ₹2.50/kWh
    # Local P2P market clears between ₹5.50 and ₹6.40/kWh
    surplus_deficit_ratio = (total_generation + 0.1) / (total_consumption + 0.1)
    if surplus_deficit_ratio > 1.2:
        clearing_price = 5.60 # Surplus cheap green energy
    elif surplus_deficit_ratio < 0.6:
        clearing_price = 6.45 # High demand evening
    else:
        clearing_price = 5.95 # Sweet equilibrium

    grid_import_kw = max(0.0, round(total_consumption - total_generation, 2))
    grid_export_kw = max(0.0, round(total_generation - total_consumption, 2))
    society_self_reliance_pct = min(100.0, round((total_generation / (total_consumption + 0.001)) * 100, 1))

    return {
        "status": "online",
        "society_name": "Shivalik Greens Co-Op Housing Society",
        "location": "Satellite, Ahmedabad, Gujarat",
        "transformer_id": "T-TP-SAT-8820",
        "current_hour": hour,
        "metrics": {
            "total_solar_generation_kw": round(total_generation, 2),
            "total_consumption_kw": round(total_consumption, 2),
            "net_grid_import_kw": grid_import_kw,
            "net_grid_export_kw": grid_export_kw,
            "self_sufficiency_pct": society_self_reliance_pct,
            "p2p_clearing_price_inr": clearing_price,
            "discom_standard_tariff_inr": 7.50,
            "discom_export_tariff_inr": 2.50,
            "buyer_savings_pct": round(((7.50 - clearing_price) / 7.50) * 100, 1),
            "seller_gain_pct": round(((clearing_price - 2.50) / 2.50) * 100, 1),
            "co2_avoided_today_kg": round(total_generation * 0.82, 1)
        },
        "nodes": nodes,
        "recent_trades": TRANSACTIONS_FEED
    }

@router.post("/trade")
def place_microgrid_trade(req: TradeRequest):
    """
    Submits a peer-to-peer energy order and instantly matches it inside the society microgrid order book.
    """
    if req.units_kwh <= 0:
        raise HTTPException(status_code=400, detail="Energy units must be greater than 0")

    # Generate synthetic matching counterparty
    if req.trade_type.lower() == "buy":
        seller = "Tower A Solar Array"
        buyer = req.trader_name
        exec_price = min(req.bid_price, 6.20)
    else:
        seller = req.trader_name
        buyer = "Society EV Fast Charger & Pump"
        exec_price = max(req.bid_price, 5.80)

    # Hash simulation
    tx_hash = "0x" + "".join(random.choices("0123456789abcdef", k=10)) + "...p2p"
    savings = round(abs(7.50 - exec_price) * req.units_kwh, 2)

    new_tx = {
        "id": f"tx-{random.randint(1000, 9999)}",
        "seller": seller,
        "buyer": buyer,
        "energy_kwh": req.units_kwh,
        "price_per_kwh": round(exec_price, 2),
        "discom_avoided_cost": 7.50,
        "timestamp": "Just now",
        "hash": tx_hash
    }

    TRANSACTIONS_FEED.insert(0, new_tx)
    if len(TRANSACTIONS_FEED) > 10:
        TRANSACTIONS_FEED.pop()

    return {
        "success": True,
        "message": f"P2P energy order matched! {req.units_kwh} kWh cleared at ₹{exec_price}/kWh.",
        "transaction": new_tx,
        "economic_benefit": {
            "savings_inr": savings,
            "green_tokens_earned": round(req.units_kwh * 2.5, 0),
            "co2_saved_kg": round(req.units_kwh * 0.82, 2)
        }
    }
