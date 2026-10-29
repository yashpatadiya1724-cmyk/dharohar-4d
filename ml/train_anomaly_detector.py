import os
import sys
import json
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def train_anomaly_detector():
    print("🧠 Generating simulated household daily load sequences for Anomaly Training (M5)...")
    rng = np.random.default_rng(42)
    N = 2500 # 2500 household month sequences
    
    # Features per household:
    # [daily_mean_kwh, daily_max_kwh, peak_hour_share, day_to_day_variance, weekend_ratio]
    normal_mean = rng.normal(7.5, 2.0, N).clip(2.0, 25.0)
    normal_max = normal_mean * rng.uniform(1.4, 2.5, N)
    peak_share = rng.uniform(0.20, 0.45, N)
    variance = rng.uniform(0.5, 3.0, N)
    weekend_ratio = rng.uniform(1.0, 1.35, N)
    
    X_normal = np.column_stack([normal_mean, normal_max, peak_share, variance, weekend_ratio])
    
    # Inject 3% synthetic anomalies (e.g. AC compressor failure, water leak pump running continuously, or billing meter tampering)
    num_anomalies = int(N * 0.03)
    anomaly_mean = rng.uniform(25.0, 60.0, num_anomalies) # Huge sudden jump
    anomaly_max = anomaly_mean * rng.uniform(2.5, 4.0, num_anomalies)
    anomaly_peak = rng.uniform(0.60, 0.90, num_anomalies) # 80%+ load in peak hours
    anomaly_variance = rng.uniform(10.0, 30.0, num_anomalies)
    anomaly_weekend = rng.uniform(2.0, 3.5, num_anomalies)
    
    X_anomalies = np.column_stack([anomaly_mean, anomaly_max, anomaly_peak, anomaly_variance, anomaly_weekend])
    X = np.vstack([X_normal, X_anomalies])
    
    print("🚀 Training Isolation Forest Anomaly Model...")
    model = IsolationForest(n_estimators=100, contamination=0.03, random_state=42)
    model.fit(X)
    
    test_normal = np.array([[8.0, 14.0, 0.30, 1.5, 1.1]])
    test_anomaly = np.array([[45.0, 95.0, 0.85, 22.0, 3.0]])
    
    pred_normal = model.predict(test_normal)[0] # 1 is normal
    pred_anomaly = model.predict(test_anomaly)[0] # -1 is anomaly
    
    print(f"Validation Test: Normal input -> {pred_normal} (Expected 1), Spike anomaly -> {pred_anomaly} (Expected -1)")
    
    os.makedirs("ml/artifacts", exist_ok=True)
    joblib.dump(model, "ml/artifacts/anomaly_model.joblib")
    
    features = ["daily_mean_kwh", "daily_max_kwh", "peak_hour_share", "variance", "weekend_ratio"]
    with open("ml/artifacts/anomaly_features.json", "w") as f:
        json.dump(features, f, indent=2)
        
    print("💾 M5 Anomaly Detector Model successfully saved to ml/artifacts/anomaly_model.joblib!")

if __name__ == "__main__":
    train_anomaly_detector()
