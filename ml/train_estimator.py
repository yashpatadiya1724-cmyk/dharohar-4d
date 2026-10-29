import os
import sys
import json
import numpy as np

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

def train_kwh_estimator():
    print("🧠 Generating 10,000 calibrated Indian urban household samples (numpy)...")
    rng = np.random.default_rng(42)
    N = 10000

    feature_names = [
        'members', 'home_type', 'ac_count', 'ac_star', 'ac_hours',
        'fridge', 'geyser', 'geyser_hours', 'fans', 'led_share',
        'lights', 'washing', 'ev', 'season'
    ]

    members = rng.integers(1, 8, N)
    home_type = rng.choice([0, 1, 2, 3], N, p=[.25, .4, .25, .1])
    ac_count = rng.choice([0, 1, 2, 3], N, p=[.35, .35, .2, .1])
    ac_star = rng.integers(1, 6, N)
    ac_hours = rng.uniform(0, 10, N)
    fridge = rng.choice([0, 1, 2], N, p=[.05, .85, .10])
    geyser = rng.choice([0, 1], N, p=[.4, .6])
    geyser_hours = rng.uniform(0.2, 2, N)
    fans = rng.integers(1, 8, N)
    led_share = rng.uniform(0, 1, N)
    lights = rng.integers(4, 25, N)
    washing = rng.choice([0, 1], N, p=[.3, .7])
    ev = rng.choice([0, 1], N, p=[.93, .07])
    season = rng.integers(0, 3, N)

    # Calibrated physics formula + stochastic noise
    kwh = (
        ac_count * ac_hours * 1.4 * 30 * (1.2 - ac_star * 0.05) * np.where(season == 1, 1.3, 0.6)
        + geyser * geyser_hours * 2.0 * 30 * np.where(season == 0, 1.2, 0.5)
        + fridge * 45.0
        + fans * 0.075 * 10 * 30
        + lights * (led_share * 9 + (1 - led_share) * 40) / 1000 * 5 * 30
        + washing * 8.0
        + ev * 90.0
        + members * 14.0
    )
    y = np.clip(kwh * rng.normal(1.0, 0.06, N), 35, 1400)

    X = np.column_stack([
        members, home_type, ac_count, ac_star, ac_hours,
        fridge, geyser, geyser_hours, fans, led_share,
        lights, washing, ev, season
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("🚀 Training Gradient Boosting Regressor (M1 Estimator)...")
    model = GradientBoostingRegressor(n_estimators=150, max_depth=5, learning_rate=0.08, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)

    print(f"✅ Model Trained! Test MAE: {mae:.2f} kWh, R² Score: {r2:.4f}")

    os.makedirs("ml/artifacts", exist_ok=True)
    joblib.dump(model, "ml/artifacts/kwh_model.joblib")

    with open("ml/artifacts/feature_order.json", "w") as f:
        json.dump(feature_names, f, indent=2)

    metrics = {
        "model_type": "GradientBoostingRegressor",
        "test_mae": float(mae),
        "test_r2": float(r2),
        "dataset_size": N,
        "features": feature_names
    }
    with open("ml/artifacts/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print("💾 Artifacts successfully saved to ml/artifacts/ (kwh_model.joblib, feature_order.json, metrics.json)")

if __name__ == "__main__":
    train_kwh_estimator()
