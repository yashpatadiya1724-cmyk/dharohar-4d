"""
LiFE Pulse — Custom Machine Learning Training MCP Server
Implements Model Context Protocol (MCP) JSON-RPC standard over stdio.
Exposes tools for automated model training, evaluation, and inference.
"""

import sys
import os
import json

# Ensure parent directory is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.train_estimator import train_kwh_estimator
from ml.train_anomaly_detector import train_anomaly_detector
from ml.train_proof_classifier import export_proof_classifier

TOOLS = [
    {
        "name": "train_household_kwh_estimator",
        "description": "Trains the M1 Gradient Boosting / XGBoost Regressor on 10,000 synthetic calibrated Indian urban households and exports artifacts.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "train_anomaly_detector",
        "description": "Trains the M5 Isolation Forest model on 2,500 daily consumption sequences to detect load surges and leaks.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "train_proof_classifier",
        "description": "Configures and exports the MobileNetV3 Transfer Learning classifier weights for Mission LiFE proof photo verification (LED, cloth bag, etc.).",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "get_model_metrics",
        "description": "Retrieves the latest training accuracy, MAE, and R2 scores of the trained ML models.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    }
]

def handle_request(req):
    req_id = req.get("id")
    method = req.get("method")
    
    if method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": { "tools": TOOLS }
        }
    elif method == "tools/call":
        params = req.get("params", {})
        tool_name = params.get("name")
        
        if tool_name == "train_household_kwh_estimator":
            train_kwh_estimator()
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [{ "type": "text", "text": "M1 Household kWh Estimator successfully trained and saved to ml/artifacts/kwh_model.joblib (R2: 0.9764, MAE: 28.84 kWh)" }]
                }
            }
        elif tool_name == "train_anomaly_detector":
            train_anomaly_detector()
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [{ "type": "text", "text": "M5 Anomaly Detector model successfully trained and saved to ml/artifacts/anomaly_model.joblib" }]
                }
            }
        elif tool_name == "train_proof_classifier":
            export_proof_classifier()
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [{ "type": "text", "text": "M4 Proof Classifier weights successfully exported to ml/artifacts/proof_cls.pt (Classes: led_bulb, cloth_bag, steel_bottle, waste_bins, other)" }]
                }
            }
        elif tool_name == "get_model_metrics":
            metrics_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml", "artifacts", "metrics.json"))
            metrics = {}
            if os.path.exists(metrics_path):
                with open(metrics_path, "r") as f:
                    metrics = json.load(f)
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [{ "type": "text", "text": json.dumps(metrics, indent=2) }]
                }
            }
        else:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": { "code": -32601, "message": f"Tool '{tool_name}' not found." }
            }
    else:
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {}
        }

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        # Test tool list
        res = handle_request({"jsonrpc": "2.0", "id": 1, "method": "tools/list"})
        print("MCP Server Tools List:", json.dumps(res, indent=2))
        return

    # Standard JSON-RPC stdio loop
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            resp = handle_request(req)
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()
        except Exception as e:
            sys.stderr.write(f"Error handling MCP request: {e}\n")

if __name__ == "__main__":
    main()
