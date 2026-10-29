# 🚀 Google Colab Model Training Guide — LiFE Pulse (HC26-GEDA01)

You can train all 3 Machine Learning models directly on **Google Colab (Free T4 GPU / CPU)** with 1 click using the links below.

---

## ⚡ Direct 1-Click Google Colab Links

| Model | Task | Colab Link | Recommended Runtime |
|---|---|---|---|
| **M1: Household kWh Estimator** | 10k Indian homes, XGBoost regression, SHAP plots | [Open in Colab](https://colab.research.google.com/github/yashpatadiya1724-cmyk/lifepulse/blob/main/ml/notebooks/1_M1_Household_kWh_Estimator_Colab.ipynb) | CPU |
| **M4: Proof Photo Classifier** | MobileNetV3 Transfer Learning for LED/Cloth Bag | [Open in Colab](https://colab.research.google.com/github/yashpatadiya1724-cmyk/lifepulse/blob/main/ml/notebooks/2_M4_Proof_Photo_Classifier_Colab.ipynb) | **T4 GPU** |
| **M5: Consumption Anomaly Detector** | Isolation Forest spike & leak detection | [Open in Colab](https://colab.research.google.com/github/yashpatadiya1724-cmyk/lifepulse/blob/main/ml/notebooks/3_M5_Anomaly_Detector_Colab.ipynb) | CPU |

---

## 📋 Step-by-Step Training Instructions in Colab

### Method 1: Using the 1-Click Links Above (Recommended)
1. Click any of the links above to open the notebook directly in [Google Colab](https://colab.research.google.com).
2. For **Notebook 2 (Photo Classifier)**, ensure GPU is enabled:
   - Click **Runtime** → **Change runtime type** → select **T4 GPU** → **Save**.
3. Click **Runtime** → **Run all** (or press `Ctrl + F9`).
4. Cell 1 will ask to connect your Google Drive: click **Connect to Google Drive** and grant permission.
5. The notebook will automatically:
   - Install required packages (`xgboost`, `scikit-learn`, `torch`, `shap`)
   - Generate synthetic training data
   - Train the model
   - Save the trained artifacts directly to `/content/drive/MyDrive/lifepulse/artifacts/`

---

### Method 2: Manual Upload to Colab
1. Go to [colab.research.google.com](https://colab.research.google.com).
2. Click **File** → **Upload notebook**.
3. Select any `.ipynb` file from your local folder:
   `c:\Users\yashp\OneDrive\Desktop\life\ml\notebooks\`
4. Run all cells.

---

## 📦 Exported Artifacts
After training, copy the generated files from your Google Drive `MyDrive/lifepulse/artifacts/` to your project repository's `ml/artifacts/`:
- `kwh_model.joblib` (Trained XGBoost Regressor)
- `feature_order.json` (List of 14 features in exact order)
- `metrics.json` (MAE and R² score)
- `proof_cls.pt` (Trained MobileNetV3 PyTorch weights)
- `anomaly_model.joblib` (Trained Isolation Forest)
