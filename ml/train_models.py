"""
AgriRent ML - Model Training Script
Trains Linear Regression, Random Forest Regressor, Decision Tree Regressor, and K-Means Clustering
Dataset: AgriRent_ML_Synthetic_Demand_Dataset.csv (1,200 synthetic demonstration records)
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.cluster import KMeans
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

# Optional plot generation
os.environ['MPLCONFIGDIR'] = os.path.join(os.path.dirname(__file__), 'temp_mpl')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

DATASET_PATH = os.path.join(os.path.dirname(__file__), 'dataset.csv')
SAVED_MODELS_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')

def train_and_evaluate():
    print(f"Loading dataset from: {DATASET_PATH}")
    df = pd.read_csv(DATASET_PATH)

    print(f"Dataset shape: {df.shape}")
    print(f"Missing values: {df.isnull().sum().sum()}")
    print(f"Duplicate rows: {df.duplicated().sum()}")

    # Clean dataset (if any duplicates or nulls)
    df = df.drop_duplicates().dropna()

    # Features and target definition
    categorical_features = ['machinery_type', 'state', 'district', 'season', 'crop_type']
    numerical_features = [
        'month',
        'farm_size_acres',
        'rainfall_mm',
        'average_temperature_c',
        'rental_price_per_day_inr',
        'previous_month_bookings',
        'nearby_available_machinery_count',
        'harvest_season_flag'
    ]
    target_col = 'monthly_demand_count'

    X = df[categorical_features + numerical_features]
    y = df[target_col]

    # Preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features),
            ('num', StandardScaler(), numerical_features)
        ]
    )

    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    models = {
        'Linear Regression': LinearRegression(),
        'Random Forest Regressor': RandomForestRegressor(n_estimators=120, max_depth=12, random_state=42),
        'Decision Tree Regressor': DecisionTreeRegressor(max_depth=8, random_state=42)
    }

    metrics_results = {}
    fitted_pipelines = {}

    print("\nTraining and evaluating models:")
    best_model_name = None
    best_r2 = -float('inf')

    for name, model in models.items():
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', model)
        ])
        pipeline.fit(X_train, y_train)
        fitted_pipelines[name] = pipeline

        y_pred = pipeline.predict(X_test)

        mae = float(mean_absolute_error(y_test, y_pred))
        mse = float(mean_squared_error(y_test, y_pred))
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_test, y_pred))

        metrics_results[name] = {
            'mae': round(mae, 4),
            'mse': round(mse, 4),
            'rmse': round(rmse, 4),
            'r2_score': round(r2, 4)
        }
        print(f"-> {name}: MAE={mae:.4f}, MSE={mse:.4f}, RMSE={rmse:.4f}, R²={r2:.4f}")

        if r2 > best_r2:
            best_r2 = r2
            best_model_name = name

    print(f"\nBest Model Selected: {best_model_name} (R² = {best_r2:.4f})")

    # Fit K-Means Clustering on numerical demand profiles
    # This segments rental demand into 4 strategic cluster zones
    cluster_features = [
        'monthly_demand_count',
        'rental_price_per_day_inr',
        'farm_size_acres',
        'previous_month_bookings',
        'nearby_available_machinery_count'
    ]
    cluster_scaler = StandardScaler()
    cluster_data_scaled = cluster_scaler.fit_transform(df[cluster_features])
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    kmeans.fit(cluster_data_scaled)

    cluster_labels_desc = {
        0: "Cluster A: High Yield / Peak Demand Agricultural Hub",
        1: "Cluster B: Moderate Steady Regional Rental Zone",
        2: "Cluster C: Price Sensitive / Small-holder Farming Region",
        3: "Cluster D: Emerging Mechanization / Off-Peak Transition"
    }

    # Save models
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

    joblib.dump(fitted_pipelines[best_model_name], os.path.join(SAVED_MODELS_DIR, 'best_model.joblib'))
    joblib.dump(fitted_pipelines['Linear Regression'], os.path.join(SAVED_MODELS_DIR, 'linear_regression.joblib'))
    joblib.dump(fitted_pipelines['Random Forest Regressor'], os.path.join(SAVED_MODELS_DIR, 'random_forest.joblib'))
    joblib.dump(fitted_pipelines['Decision Tree Regressor'], os.path.join(SAVED_MODELS_DIR, 'decision_tree.joblib'))
    joblib.dump(kmeans, os.path.join(SAVED_MODELS_DIR, 'kmeans_cluster.joblib'))
    joblib.dump(cluster_scaler, os.path.join(SAVED_MODELS_DIR, 'cluster_scaler.joblib'))

    # Build feature metadata & default context lookup tables
    metadata = {
        'is_synthetic': True,
        'dataset_disclaimer': 'Trained on 1,200 synthetic demonstration records. Designed for platform evaluation and academic presentation.',
        'total_records': len(df),
        'best_model': best_model_name,
        'metrics': metrics_results,
        'machinery_types': sorted(df['machinery_type'].unique().tolist()),
        'states': sorted(df['state'].unique().tolist()),
        'districts_by_state': {
            state: sorted(df[df['state'] == state]['district'].unique().tolist())
            for state in df['state'].unique()
        },
        'seasons': sorted(df['season'].unique().tolist()),
        'crops': sorted(df['crop_type'].unique().tolist()),
        'district_weather_defaults': {},
        'machinery_price_defaults': {},
        'cluster_descriptions': cluster_labels_desc
    }

    # Precompute district defaults for weather / rainfall
    for district, group in df.groupby('district'):
        metadata['district_weather_defaults'][district] = {
            'avg_rainfall': round(float(group['rainfall_mm'].mean()), 1),
            'avg_temp': round(float(group['average_temperature_c'].mean()), 1),
            'avg_farm_size': round(float(group['farm_size_acres'].mean()), 1),
            'avg_bookings': round(float(group['previous_month_bookings'].mean()), 1),
            'avg_nearby_machinery': round(float(group['nearby_available_machinery_count'].mean()), 1)
        }

    # Precompute machinery price defaults
    for mtype, group in df.groupby('machinery_type'):
        metadata['machinery_price_defaults'][mtype] = {
            'avg_price': round(float(group['rental_price_per_day_inr'].mean()), 0),
            'min_price': int(group['rental_price_per_day_inr'].min()),
            'max_price': int(group['rental_price_per_day_inr'].max())
        }

    # Save metadata JSON
    with open(os.path.join(SAVED_MODELS_DIR, 'model_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)

    # Plot model comparison chart
    try:
        model_names = list(metrics_results.keys())
        r2_vals = [metrics_results[m]['r2_score'] for m in model_names]
        rmse_vals = [metrics_results[m]['rmse'] for m in model_names]
        mae_vals = [metrics_results[m]['mae'] for m in model_names]

        x = np.arange(len(model_names))
        width = 0.25

        fig, ax = plt.subplots(figsize=(10, 5))
        ax.bar(x - width, r2_vals, width, label='R² Score (Higher is better)', color='#15803d')
        ax.bar(x, rmse_vals, width, label='RMSE (Lower is better)', color='#0284c7')
        ax.bar(x + width, mae_vals, width, label='MAE (Lower is better)', color='#d97706')

        ax.set_ylabel('Metric Value')
        ax.set_title('AgriRent ML: Algorithm Performance Comparison\n(Synthetic Demonstration Dataset - 1,200 Records)')
        ax.set_xticks(x)
        ax.set_xticklabels(model_names)
        ax.legend()
        ax.grid(axis='y', linestyle='--', alpha=0.5)

        chart_path = os.path.join(SAVED_MODELS_DIR, 'model_comparison.png')
        plt.tight_layout()
        plt.savefig(chart_path, dpi=150)
        plt.close()
        print(f"Model comparison chart saved to: {chart_path}")
    except Exception as e:
        print(f"Note on chart generation: {e}")

    print("\nTraining completed successfully!")
    return metadata

if __name__ == '__main__':
    train_and_evaluate()

