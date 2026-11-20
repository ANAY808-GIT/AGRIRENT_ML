# AgriRent ML – Streamlit Web Platform

**AgriRent ML** is an interactive, full-stack agricultural machinery rental and demand prediction platform built in Python using **Streamlit**, **Scikit-Learn**, and **SQLite / MySQL**.

---

## 🌟 Key Features

1. **Multi-Role User Experience & Instant Role Switcher:**
   - **🌾 Farmer / Field Owner (`Suresh Gowda`)**: Marketplace search, voice search shortcuts, conflict-free equipment booking, simulated payments, downloadable GST invoices, and ML recommendations.
   - **🚜 Machinery Owner (`Ramesh Patel`)**: Fleet catalog management, booking request approval/rejection, monthly revenue analytics, and regional demand forecasting.
   - **🛡️ Platform Administrator**: Global user management, machinery verification, booking audits, and ML algorithm performance metrics.
   - **🏠 Public Guest View**: High-impact agricultural landing page, featured equipment listings, and service walkthrough.

2. **Strict Conflict-Free Booking Engine:**
   - Prevents double-booking by mathematically verifying date intervals before accepting any reservation:
     $$\text{Requested Start} \le \text{Existing End} \quad \text{AND} \quad \text{Requested End} \ge \text{Existing Start}$$

3. **Machine Learning Demand Prediction:**
   - Real-time inference using pre-trained **Linear Regression** ($R^2 = 0.8696$) and **K-Means Clustering** ($k=4$).
   - Calculates monthly demand units, market pressure tier, and tailored advisories for owners and farmers.
   - 12-month visual demand trajectory powered by Plotly.

4. **Simulated Payments & Itemized Invoices:**
   - Instant digital settlement simulation (UPI, Net Banking, Card).
   - Generates downloadable GST tax receipts with calculated CGST/SGST.

---

## 🚀 How to Run Locally

### Option 1: 1-Click Launch (Windows)
Double-click **`run_streamlit.bat`** in the repository root:
```text
D:\agrirentml\run_streamlit.bat
```

### Option 2: Run via Terminal
```bash
cd streamlitml
python -m streamlit run app.py
```
Open your browser to: **`http://localhost:8501`**

---

## ☁️ How to Deploy to Streamlit Community Cloud (Free Forever)

Streamlit Community Cloud is 100% free and deploys directly from your GitHub repository:

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Add StreamlitML platform"
   git push origin main
   ```
2. Go to 👉 **[share.streamlit.io](https://share.streamlit.io)** and sign in with your GitHub account (**`ANAY808-GIT`**).
3. Click **"New app"**.
4. Set the configuration:
   - **Repository:** `ANAY808-GIT/AGRIRENT_ML`
   - **Branch:** `main`
   - **Main file path:** `streamlitml/app.py`
5. Click **"Deploy!"**.

Your application will be live at:
`https://agrirent-ml.streamlit.app`

---

## 📂 Directory Structure

```text
streamlitml/
├── app.py                      # Main Streamlit application
├── requirements.txt            # Streamlit Cloud Python dependencies
├── Procfile                    # Cloud runner configuration
├── .streamlit/
│   └── config.toml             # Agricultural green palette & server settings
├── data/
│   └── AgriRent_ML_Synthetic_Demand_Dataset.csv
├── models/
│   ├── best_model.joblib
│   ├── kmeans_cluster.joblib
│   ├── cluster_scaler.joblib
│   └── model_metadata.json
└── utils/
    ├── data_manager.py         # Relational database adapter & conflict guard
    └── ml_engine.py            # ML model loader & prediction pipeline
```
