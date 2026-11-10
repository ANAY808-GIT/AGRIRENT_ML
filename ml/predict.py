"""
AgriRent ML - Demand Prediction Inference Engine
Provides dynamic prediction, algorithm comparison, and agricultural recommendations.
"""

import os
import json
import numpy as np
import pandas as pd
import joblib

SAVED_MODELS_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')
METADATA_FILE = os.path.join(SAVED_MODELS_DIR, 'model_metadata.json')

class DemandPredictor:
    def __init__(self):
        self.models = {}
        self.metadata = {}
        self.kmeans = None
        self.cluster_scaler = None
        self._load()

    def _load(self):
        if os.path.exists(METADATA_FILE):
            with open(METADATA_FILE, 'r') as f:
                self.metadata = json.load(f)

        model_files = {
            'best': 'best_model.joblib',
            'linear_regression': 'linear_regression.joblib',
            'random_forest': 'random_forest.joblib',
            'decision_tree': 'decision_tree.joblib'
        }

        for key, fname in model_files.items():
            path = os.path.join(SAVED_MODELS_DIR, fname)
            if os.path.exists(path):
                self.models[key] = joblib.load(path)

        kmeans_path = os.path.join(SAVED_MODELS_DIR, 'kmeans_cluster.joblib')
        scaler_path = os.path.join(SAVED_MODELS_DIR, 'cluster_scaler.joblib')
        if os.path.exists(kmeans_path) and os.path.exists(scaler_path):
            self.kmeans = joblib.load(kmeans_path)
            self.cluster_scaler = joblib.load(scaler_path)

    def get_metadata(self):
        return self.metadata

    def predict(self, params, algorithm='best'):
        """
        params: dict with keys:
            machinery_type (str)
            state (str)
            district (str)
            month (int 1-12)
            season (str)
            crop_type (str)
            farm_size_acres (float)
            rental_price_per_day_inr (float/int)
            [optional]: rainfall_mm, average_temperature_c, previous_month_bookings,
                        nearby_available_machinery_count, harvest_season_flag
        """
        district = params.get('district', 'Mysuru')
        mtype = params.get('machinery_type', 'Tractor')

        # Retrieve defaults if not supplied
        district_defaults = self.metadata.get('district_weather_defaults', {}).get(district, {
            'avg_rainfall': 85.0,
            'avg_temp': 28.5,
            'avg_farm_size': 15.0,
            'avg_bookings': 20.0,
            'avg_nearby_machinery': 8.0
        })

        price_defaults = self.metadata.get('machinery_price_defaults', {}).get(mtype, {
            'avg_price': 1500
        })

        month = int(params.get('month', 10))
        harvest_flag = int(params.get('harvest_season_flag', 1 if month in [3, 4, 10, 11] else 0))

        row = {
            'machinery_type': mtype,
            'state': params.get('state', 'Karnataka'),
            'district': district,
            'month': month,
            'season': params.get('season', 'Kharif'),
            'crop_type': params.get('crop_type', 'Paddy'),
            'farm_size_acres': float(params.get('farm_size_acres', district_defaults.get('avg_farm_size', 15.0))),
            'rainfall_mm': float(params.get('rainfall_mm', district_defaults.get('avg_rainfall', 80.0))),
            'average_temperature_c': float(params.get('average_temperature_c', district_defaults.get('avg_temp', 28.0))),
            'rental_price_per_day_inr': float(params.get('rental_price_per_day_inr', price_defaults.get('avg_price', 1500))),
            'previous_month_bookings': int(params.get('previous_month_bookings', int(district_defaults.get('avg_bookings', 18)))),
            'nearby_available_machinery_count': int(params.get('nearby_available_machinery_count', int(district_defaults.get('avg_nearby_machinery', 6)))),
            'harvest_season_flag': harvest_flag
        }

        df_input = pd.DataFrame([row])

        # Model selection
        model_key = algorithm if algorithm in self.models else 'best'
        model = self.models.get(model_key, self.models.get('best'))

        if model is None:
            raise RuntimeError("No trained model loaded.")

        raw_pred = float(model.predict(df_input)[0])
        predicted_count = max(1, int(round(raw_pred)))

        # Multi-model side-by-side comparison
        algorithm_comparisons = {}
        for alg_name, pipe in self.models.items():
            if alg_name != 'best':
                val = float(pipe.predict(df_input)[0])
                algorithm_comparisons[alg_name] = max(1, int(round(val)))

        # Determine demand level
        if predicted_count < 18:
            demand_level = 'Low'
            level_color = '#ef4444' # Red
            badge_class = 'bg-red-100 text-red-800 border-red-300'
        elif predicted_count <= 30:
            demand_level = 'Medium'
            level_color = '#f59e0b' # Amber
            badge_class = 'bg-amber-100 text-amber-800 border-amber-300'
        else:
            demand_level = 'High'
            level_color = '#10b981' # Green
            badge_class = 'bg-emerald-100 text-emerald-800 border-emerald-300'

        # K-Means Cluster identification
        cluster_info = "Agricultural Operational Hub"
        if self.kmeans is not None and self.cluster_scaler is not None:
            try:
                cluster_cols = [
                    'monthly_demand_count',
                    'rental_price_per_day_inr',
                    'farm_size_acres',
                    'previous_month_bookings',
                    'nearby_available_machinery_count'
                ]
                cluster_df = pd.DataFrame([[
                    predicted_count,
                    row['rental_price_per_day_inr'],
                    row['farm_size_acres'],
                    row['previous_month_bookings'],
                    row['nearby_available_machinery_count']
                ]], columns=cluster_cols)
                scaled = self.cluster_scaler.transform(cluster_df)
                cluster_idx = int(self.kmeans.predict(scaled)[0])
                cluster_info = self.metadata.get('cluster_descriptions', {}).get(
                    str(cluster_idx),
                    self.metadata.get('cluster_descriptions', {}).get(cluster_idx, f"Cluster {cluster_idx}")
                )
            except Exception:
                pass

        # Generate actionable agricultural recommendations
        owner_recs = []
        farmer_recs = []

        avg_price = price_defaults.get('avg_price', 1500)
        user_price = row['rental_price_per_day_inr']

        if demand_level == 'High':
            owner_recs.append({
                'title': 'High Demand Premium Opportunity',
                'description': f"Peak requirement anticipated for {mtype} in {district}. You can optimize daily rental rates by +10% to +15% without reducing booking rates.",
                'tag': 'Pricing Strategy'
            })
            owner_recs.append({
                'title': 'Fleet Readiness Alert',
                'description': 'Ensure routine engine inspection, greasing, and spare cutting blade/teeth availability before peak week.',
                'tag': 'Operations'
            })
            farmer_recs.append({
                'title': 'Advance Booking Strongly Advised',
                'description': f"High machinery demand forecasted. Book {mtype} at least 7-10 days in advance to secure equipment for harvesting/sowing windows.",
                'tag': 'Booking Lead Time'
            })
            farmer_recs.append({
                'title': 'Group Rental Savings',
                'description': 'Collaborate with neighboring farmers to book consecutive multi-day slots for lower collective transportation costs.',
                'tag': 'Cost Optimization'
            })
        elif demand_level == 'Medium':
            owner_recs.append({
                'title': 'Competitive Steady Pricing',
                'description': f"Demand is stable. Maintain standard market rate around ₹{int(avg_price)}/day to retain high customer retention.",
                'tag': 'Pricing Strategy'
            })
            owner_recs.append({
                'title': 'Offer Flexible Durations',
                'description': 'Providing 3-day and weekly package discounts can convert tentative inquiries into confirmed bookings.',
                'tag': 'Marketing'
            })
            farmer_recs.append({
                'title': 'Balanced Market Availability',
                'description': f"Standard availability expected. Reserve 3-5 days in advance for best machinery condition and operator match.",
                'tag': 'Booking Window'
            })
        else: # Low demand
            owner_recs.append({
                'title': 'Off-Peak Incentive Pricing',
                'description': f"Demand is expected to be soft. Consider offering a 10%-15% promotional discount or bundled attachments to attract off-season land prep jobs.",
                'tag': 'Pricing Strategy'
            })
            owner_recs.append({
                'title': 'Ideal Maintenance & Overhaul Period',
                'description': 'Schedule comprehensive servicing and repairs now to avoid machine downtime during upcoming busy sowing/harvesting months.',
                'tag': 'Maintenance'
            })
            farmer_recs.append({
                'title': 'Negotiation Advantage',
                'description': f"Lower demand allows farmers to negotiate favorable multi-day rates or bundle implement attachments at reduced cost.",
                'tag': 'Farmer Benefit'
            })

        # Generate comparison across all 8 machinery types in this district & month
        machinery_comparison = []
        for test_mtype in self.metadata.get('machinery_types', []):
            test_row = dict(row)
            test_row['machinery_type'] = test_mtype
            p_def = self.metadata.get('machinery_price_defaults', {}).get(test_mtype, {'avg_price': 1500})
            test_row['rental_price_per_day_inr'] = p_def.get('avg_price', 1500)
            df_test = pd.DataFrame([test_row])
            p_val = max(1, int(round(float(model.predict(df_test)[0]))))
            machinery_comparison.append({
                'machinery_type': test_mtype,
                'predicted_demand': p_val,
                'is_current': test_mtype == mtype
            })

        return {
            'predicted_demand': predicted_count,
            'demand_level': demand_level,
            'level_color': level_color,
            'badge_class': badge_class,
            'cluster_zone': cluster_info,
            'algorithm_used': model_key,
            'algorithm_comparisons': algorithm_comparisons,
            'input_features': row,
            'recommendations': {
                'for_machinery_owners': owner_recs,
                'for_farmers': farmer_recs
            },
            'machinery_comparison': sorted(machinery_comparison, key=lambda x: x['predicted_demand'], reverse=True),
            'disclaimer': 'Prediction generated from synthetic demonstration dataset (1,200 records). Not based on live commercial financial transactions.'
        }

# Global singleton
predictor = DemandPredictor()

if __name__ == '__main__':
    res = predictor.predict({
        'machinery_type': 'Harvester',
        'state': 'Karnataka',
        'district': 'Mysuru',
        'month': 10,
        'season': 'Kharif',
        'crop_type': 'Paddy',
        'farm_size_acres': 18.0,
        'rental_price_per_day_inr': 4200
    })
    print("Test Prediction Result:")
    print(json.dumps(res, indent=2))
