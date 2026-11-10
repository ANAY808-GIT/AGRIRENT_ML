# AgriRent ML: System Architecture & Technical Specification

## 1. System Overview
AgriRent ML is a full-stack smart agricultural machinery rental web application powered by machine learning demand forecasting. It bridges the gap between machinery owners with underutilized equipment and small/marginal farmers needing access to mechanized implements.

### Core Objectives
1. **Multi-Role Experience**: Distinct authenticated dashboards, sidebars, metrics, and workflows for **Machinery Owners**, **Farmers / Field Owners**, and **Platform Administrators**.
2. **Conflict-Free Bookings**: Comprehensive calendar date verification preventing double bookings and schedule collisions.
3. **Machine Learning Demand Intelligence**: Live scikit-learn models predicting monthly machinery demand counts and clustering agricultural zones based on weather, previous bookings, pricing, and farm sizes.
4. **Transparent Settlements**: Simulated payments, GST tax breakdown invoices, and verified two-sided ratings.

---

## 2. Technology Stack

### Frontend
- **Framework**: React.js 18 with Vite
- **Styling**: Tailwind CSS (Agricultural green palette: Dark green `#14532d`, Emerald `#15803d`, Leaf `#22c55e`, Lime `#84cc16`, Cream `#fbfaf6`)
- **Routing**: React Router DOM v6 with role-based `ProtectedRoute` guards
- **Data Visualization**: Recharts (Revenue distributions, error metrics, demand comparisons)
- **Icons**: Lucide React

### Backend
- **Framework**: Python 3.x with Flask REST API
- **Authentication**: JWT (JSON Web Tokens) with 7-day expiration & Werkzeug password hashing
- **CORS**: Flask-CORS for cross-origin client interaction
- **Database Architecture**: Dual Database Engine
  - **Primary**: MySQL (InnoDB, Foreign Keys, UTF8mb4) via PyMySQL
  - **Zero-Config Fallback**: SQLite (`backend/agrirent.db`) automatically activated when MySQL server is not locally running, guaranteeing zero installation friction on any grading environment.

### Machine Learning
- **Dataset**: `AgriRent_ML_Synthetic_Demand_Dataset.csv` (1,200 synthetic demonstration records) located at `ml/dataset.csv`.
- **Algorithms**:
  1. **Linear Regression** (Best validation fit: R² = 0.8696, RMSE = 3.39)
  2. **Random Forest Regressor** (n_estimators=120, max_depth=12: R² = 0.8281, RMSE = 3.89)
  3. **Decision Tree Regressor** (max_depth=8: R² = 0.6944, RMSE = 5.19)
  4. **K-Means Clustering** (k=4 unsupervised segmentation of agricultural rental demand zones)
- **Persistence**: Joblib serialization (`ml/saved_models/`)

---

## 3. Database Schema

The database consists of 6 relational tables:

```mermaid
erDiagram
    users ||--o{ machinery : "owns"
    users ||--o{ bookings : "rents as farmer"
    users ||--o{ bookings : "confirms as owner"
    machinery ||--o{ bookings : "scheduled in"
    bookings ||--o| payments : "settled by"
    bookings ||--o| reviews : "reviewed in"
    bookings ||--o| rental_history : "archived in"

    users {
        int id PK
        string full_name
        string email UK
        string password_hash
        string mobile
        string role "owner, farmer, admin"
        string village
        string district
        string state
        boolean is_active
        datetime created_at
    }

    machinery {
        int id PK
        int owner_id FK
        string name
        string category
        string model_year
        text description
        decimal rental_price_per_day
        string location_village
        string location_district
        string location_state
        text specs_json
        text image_url
        string availability_status "available, in_use, maintenance"
    }

    bookings {
        int id PK
        int machinery_id FK
        int farmer_id FK
        int owner_id FK
        date start_date
        date end_date
        int total_days
        decimal daily_price
        decimal total_price
        string status "pending, accepted, rejected, active, completed, cancelled"
        text farmer_notes
        text owner_response_notes
    }

    payments {
        int id PK
        int booking_id FK
        int farmer_id FK
        int owner_id FK
        decimal amount
        string payment_method
        string transaction_id UK
        string payment_status "paid, pending, refunded"
        string invoice_number UK
        datetime paid_at
    }

    reviews {
        int id PK
        int booking_id FK
        int machinery_id FK
        int farmer_id FK
        int rating "1 to 5"
        text comment
        datetime created_at
    }

    rental_history {
        int id PK
        int booking_id FK
        int machinery_id FK
        int farmer_id FK
        int owner_id FK
        date start_date
        date end_date
        decimal total_amount
        string completion_status
        text completion_notes
        datetime completed_at
    }
```

---

## 4. Conflict-Free Booking Workflow & Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Farmer
    actor Owner
    participant API as AgriRent API
    participant DB as Database Engine

    Farmer->>API: POST /api/bookings (machinery_id, dates)
    API->>DB: Query existing 'accepted'/'active' bookings for date overlap
    alt Date Overlap Exists
        DB-->>API: Conflict found
        API-->>Farmer: 409 Conflict (Dates already reserved)
    else No Overlap
        API->>DB: Insert booking (status: 'pending')
        API-->>Farmer: 201 Created
        Owner->>API: GET /api/bookings/owner
        API-->>Owner: List pending requests
        Owner->>API: PUT /api/bookings/:id/status (status: 'accepted')
        API->>DB: Update booking to 'accepted'
        Farmer->>API: POST /api/payments/process (Simulated Payment)
        API->>DB: Record payment, update booking to 'active', machinery to 'in_use'
        Note over Farmer,Owner: Fieldwork executed during rental duration
        Owner->>API: POST /api/bookings/:id/complete
        API->>DB: Set booking 'completed', machinery 'available', insert rental_history
        Farmer->>API: POST /api/reviews (rating: 1-5, comment)
        API->>DB: Store verified customer review
    end
```

---

## 5. Machine Learning Demand Architecture

```mermaid
flowchart TD
    A["Synthetic Dataset (1,200 records)<br/>AgriRent_ML_Synthetic_Demand_Dataset.csv"] --> B["Data Preprocessing<br/>Duplicates & Null Check"]
    B --> C["Feature Extraction & Encoding"]
    C --> D1["OneHotEncoder<br/>machinery_type, state, district, season, crop_type"]
    C --> D2["StandardScaler<br/>rainfall, temp, price, farm_size, bookings"]
    D1 & D2 --> E["80/20 Train-Test Split"]
    E --> F1["Linear Regression<br/>R² = 0.8696 (Selected Best)"]
    E --> F2["Random Forest Regressor<br/>R² = 0.8281"]
    E --> F3["Decision Tree Regressor<br/>R² = 0.6944"]
    E --> F4["K-Means Clustering<br/>4 Operational Zones"]
    F1 & F2 & F3 & F4 --> G["Joblib Serialization<br/>ml/saved_models/"]
    G --> H["Flask /api/ml/predict Inference API"]
    H --> I["Dynamic Owner & Farmer Recommendations"]
```

