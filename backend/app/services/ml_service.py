import os
import json
import numpy as np
import joblib

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml", "artifacts"))

class MLInferenceService:
    def __init__(self):
        self.kwh_model = None
        self.anomaly_model = None
        self.feature_order = []
        self.anomaly_features = []
        self.classes = []
        self._load_models()

    def _load_models(self):
        # 1. Load kWh Estimator (M1)
        kwh_path = os.path.join(ARTIFACTS_DIR, "kwh_model.joblib")
        feat_path = os.path.join(ARTIFACTS_DIR, "feature_order.json")
        if os.path.exists(kwh_path) and os.path.exists(feat_path):
            try:
                self.kwh_model = joblib.load(kwh_path)
                with open(feat_path, "r") as f:
                    self.feature_order = json.load(f)
                print("[OK] ML Service: M1 kWh Estimator model loaded successfully.")
            except Exception as e:
                print("[WARN] ML Service: Failed to load kwh_model:", e)

        # 2. Load Anomaly Detector (M5)
        anom_path = os.path.join(ARTIFACTS_DIR, "anomaly_model.joblib")
        if os.path.exists(anom_path):
            try:
                self.anomaly_model = joblib.load(anom_path)
                print("[OK] ML Service: M5 Anomaly Detector model loaded successfully.")
            except Exception as e:
                print("[WARN] ML Service: Failed to load anomaly_model:", e)

        # 3. Load Proof Classifier Classes (M4)
        cls_path = os.path.join(ARTIFACTS_DIR, "classes.json")
        if os.path.exists(cls_path):
            try:
                with open(cls_path, "r") as f:
                    self.classes = json.load(f)
            except Exception:
                pass

    def estimate_household_kwh(self, data: dict) -> float:
        """
        Uses the trained M1 Model to predict monthly kWh.
        Fallback to physics rule if model is not available.
        """
        if self.kwh_model and self.feature_order:
            try:
                row = [data.get(feat, 0.0) for feat in self.feature_order]
                pred = self.kwh_model.predict(np.array([row]))[0]
                return float(np.clip(pred, 35.0, 1500.0))
            except Exception as e:
                print("Inference error:", e)
        # Fallback physics estimate
        return float(data.get("members", 3) * 45.0 + data.get("ac_count", 1) * 90.0)

    def check_consumption_anomaly(self, daily_mean: float, daily_max: float, peak_share: float, variance: float, weekend_ratio: float) -> bool:
        """
        Returns True if anomalous consumption spike detected.
        """
        if self.anomaly_model:
            try:
                sample = np.array([[daily_mean, daily_max, peak_share, variance, weekend_ratio]])
                pred = self.anomaly_model.predict(sample)[0]
                return pred == -1 # -1 is anomaly in IsolationForest
            except Exception:
                pass
        # Simple threshold fallback
        return daily_mean > 35.0 or peak_share > 0.65

ml_service = MLInferenceService()
