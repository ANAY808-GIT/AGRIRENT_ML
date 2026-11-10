# AgriRent ML: Smart Agricultural Machinery Rental & Demand Prediction Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-green.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1.3-forestgreen.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.9-orange.svg)](https://scikit-learn.org)

AgriRent ML is a full-stack smart agricultural machinery rental platform equipped with Machine Learning demand prediction. It features completely separate authenticated portals, responsive sidebars, permission controls, and dedicated workflows for **Machinery Owners**, **Farmers / Field Owners**, and **Platform Administrators**.

---

## 🌾 Key Platform Features

1. **Role-Based Portals & Dashboards**:
   - **Machinery Owner Dashboard**: Fleet inventory CRUD, booking approvals, active field tracking, historical revenues, Recharts earnings distributions, Scikit-Learn demand forecasting, and customer feedback.
   - **Farmer Dashboard**: Interactive machinery marketplace, multi-attribute filtering (category, price slider, district, availability), real-time booking with conflict prevention, simulated payment checkout, PDF-style tax invoice generation, and seasonal AI equipment suggestions.
   - **Admin Governance Center**: Total platform metrics (users, fleet, bookings, gross volume), user account activation/suspension, machinery listing moderation, central booking registry, and algorithm benchmark scorecards.

2. **Conflict-Free Booking Engine**:
   - Automated server-side date validation prevents double-bookings or overlapping reservations for the same machine.

3. **Speech-to-Text (Voice Search) Integration**:
   - Integrated browser Web Speech API voice search across **all 7 search bars** on the platform (Public Landing Page, Farmer Marketplace & Find Machinery, Farmer Rental History, Owner Rental History, User Management, Machinery Moderation, and Booking Oversight).
   - Real-time speech recognition tuned for agricultural terminology with animated listening feedback and microphone status indicators.

4. **Machine Learning Demand Prediction**:
   - Trained on the supplied dataset (`AgriRent_ML_Synthetic_Demand_Dataset.csv` / `ml/dataset.csv`, 1,200 demonstration records).
   - Evaluates **Linear Regression**, **Random Forest Regressor**, **Decision Tree Regressor**, and **K-Means Clustering**.
   - Outputs forecasted monthly demand count, categorical demand badge (*Low*, *Medium*, *High*), K-Means agricultural zone segment, and targeted pricing and booking advisories.
   - *Academic Disclaimer: The dataset represents synthetic demonstration records designed for academic validation and platform simulation.*

4. **Simulated Payments & Invoicing**:
   - Simulated checkout supporting UPI, Kisan Credit Cards, Net Banking, and Debit Cards.
   - Generates unique transaction IDs (`TXN-AGRI-...`) and itemized invoices (`INV-...`) with 5% concessional agricultural GST breakdowns.

5. **Dual Database Engine**:
   - **MySQL Support**: Native MySQL schema (`database/schema.sql`).
   - **Zero-Config Fallback**: Automatic SQLite database (`backend/agrirent.db`) enabled seamlessly if MySQL is not running, guaranteeing immediate execution on any evaluation computer.

---

## 📁 Project Directory Structure

```
agrirentml/
├── AgriRent_ML_Synthetic_Demand_Dataset.csv   # Original demonstration dataset
├── backend/                                   # Flask REST API backend
│   ├── routes/
│   │   ├── admin_routes.py                   # Platform administration & analytics
│   │   ├── auth_routes.py                    # JWT authentication & profile
│   │   ├── booking_routes.py                 # Conflict-free booking engine
│   │   ├── machinery_routes.py               # Machinery fleet CRUD
│   │   ├── ml_routes.py                      # Demand prediction endpoints
│   │   ├── payment_routes.py                 # Simulated checkout & invoices
│   │   └── review_routes.py                  # Farmer ratings & reviews
│   ├── app.py                                # Flask application factory & frontend server
│   ├── auth_middleware.py                    # JWT verification decorator
│   ├── config.py                             # Configuration & secret keys
│   └── db.py                                 # Dual MySQL / SQLite database layer
├── database/                                  # Database assets
│   ├── schema.sql                            # Complete MySQL schema (6 tables)
│   └── seed_data.sql                         # Demonstration seed records
├── docs/                                      # Technical documentation
│   └── ARCHITECTURE.md                       # Architecture & sequence diagrams
├── frontend/                                  # React.js Vite frontend
│   ├── src/
│   │   ├── components/common/                # Navbar, Footer, ProtectedRoute
│   │   ├── context/                          # AuthContext (JWT, user state)
│   │   ├── pages/                            # LandingPage, LoginPage, RegisterPage
│   │   │   ├── admin/                        # Admin console pages
│   │   │   ├── farmer/                       # Farmer console pages
│   │   │   └── owner/                        # Machinery Owner console pages
│   │   ├── services/api.js                   # Unified fetch API client
│   │   ├── App.jsx                           # Route declarations
│   │   ├── main.jsx                          # Root React DOM entry
│   │   └── index.css                         # Tailwind CSS styling
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── ml/                                        # Machine Learning module
│   ├── saved_models/                         # Serialized joblib models & metadata
│   │   ├── best_model.joblib
│   │   ├── linear_regression.joblib
│   │   ├── random_forest.joblib
│   │   ├── decision_tree.joblib
│   │   ├── kmeans_cluster.joblib
│   │   ├── cluster_scaler.joblib
│   │   ├── model_metadata.json
│   │   └── model_comparison.png
│   ├── dataset.csv                           # Demonstration training data (1,200 rows)
│   ├── predict.py                            # Demand inference engine
│   └── train_models.py                       # Training & evaluation pipeline
├── test_platform_e2e.py                       # Automated 14-phase end-to-end test suite
└── README.md
```

---

## 🔑 Pre-Configured Demo Credentials

The database comes pre-seeded with three active accounts for instant demonstration. You can also click the **1-Click Demo Fill buttons** on the login screen:

| Role | Email | Password | Name |
| :--- | :--- | :--- | :--- |
| **Machinery Owner** | `owner@agrirent.com` | `owner123` | Ramesh Patel (Mandya, KA) |
| **Farmer / Field Owner** | `farmer@agrirent.com` | `farmer123` | Suresh Gowda (Mysuru, KA) |
| **Platform Administrator** | `admin@agrirent.com` | `admin123` | AgriRent Administrator |

*Note: New accounts can also be created anytime from the `/register` page.*

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & npm

---

### Step 1: Install Python Dependencies
```bash
pip install flask flask-cors pyjwt werkzeug pymysql pandas numpy scikit-learn joblib matplotlib
```

### Step 2: Train & Save Machine Learning Models
```bash
python ml/train_models.py
```
*This trains Linear Regression, Random Forest, Decision Tree, and K-Means Clustering on `ml/dataset.csv`, saves the `.joblib` files to `ml/saved_models/`, and generates comparison charts.*

### Step 3: Install Frontend Dependencies & Build
```bash
cd frontend
npm install
npm run build
cd ..
```

---

### Step 4: Run the Application

#### Option A: Unified Server (Recommended for Quick Demo)
Flask serves both the built React application and the REST API + ML engine on a single port:
```bash
python backend/app.py
```
Open your browser and visit: **`http://localhost:5000`**

#### Option B: Developer Mode (Live Hot Reloading)
Open two terminal tabs:

**Terminal 1 (Backend API):**
```bash
python backend/app.py
```

**Terminal 2 (Vite Frontend):**
```bash
cd frontend
npm run dev
```
Visit: **`http://localhost:3000`** *(Requests to `/api` are automatically proxied to Flask on port 5000)*.

---

## 🧪 Run Automated End-to-End Test Suite

To verify all 14 phases (Auth, Fleet CRUD, Booking, Double-Booking Prevention, Payments, Invoices, Reviews, ML Inference, and Admin Analytics):
```bash
python test_platform_e2e.py
```

Expected Output:
```
============================================================
AGRIRENT ML - COMPREHENSIVE END-TO-END VALIDATION
============================================================
✓ Phase 1: Health check OK
✓ Phase 2: ML Metrics OK -> Best Model: Linear Regression, Total Records: 1200
✓ Phase 3: ML Demand Prediction OK -> 41 units (High Demand)
✓ Phase 4: Owner Login OK
✓ Phase 5: Farmer Login OK
✓ Phase 6: Admin Login OK
✓ Phase 7: Owner Added Machinery OK
✓ Phase 8: Farmer Booking Request OK
✓ Phase 9: Owner Accepted Booking
✓ Phase 10: Conflict-Free Double Booking Guard Passed!
✓ Phase 11: Simulated Payment Settled
✓ Phase 12: Rental Completed & Archived to Rental History
✓ Phase 13: Review & 5-Star Rating Submitted OK
✓ Phase 14: Admin Control Dashboard OK
============================================================
ALL 14 VALIDATION PHASES PASSED WITH ZERO ERRORS!
============================================================
```

---

## 📊 Machine Learning Model Evaluation Summary

| Model | MAE | RMSE | R² Score | Selection Status |
| :--- | :---: | :---: | :---: | :--- |
| **Linear Regression** | **2.7347** | **3.3909** | **0.8696** | **Selected Best Regressor** |
| **Random Forest Regressor** | 3.1323 | 3.8930 | 0.8281 | Benchmark Regressor |
| **Decision Tree Regressor** | 4.0238 | 5.1910 | 0.6944 | Baseline Regressor |
| **K-Means Clustering (k=4)** | — | — | — | 4 Operational Agricultural Zones |

*Disclaimer: The ML model operates on a synthetic dataset (1,200 records) provided specifically for platform evaluation.*

---

## 🛡️ License & Academic Integrity
Developed as a complete smart agricultural software engineering and machine learning prototype.
For academic demonstration, collegiate presentation, and portfolio showcase.

