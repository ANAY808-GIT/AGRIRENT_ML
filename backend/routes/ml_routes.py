import os
import sys
from flask import Blueprint, request, jsonify

# Ensure ml directory is on sys.path
ML_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'ml'))
if ML_DIR not in sys.path:
    sys.path.append(ML_DIR)

from predict import predictor

ml_bp = Blueprint('ml_bp', __name__)

@ml_bp.route('/predict', methods=['POST'])
def predict_demand():
    data = request.get_json() or {}
    algorithm = data.get('algorithm', 'best')

    try:
        result = predictor.predict(data, algorithm=algorithm)
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'error': f'Prediction engine error: {str(e)}',
            'success': False
        }), 500

@ml_bp.route('/options', methods=['GET'])
def get_options():
    meta = predictor.get_metadata()
    return jsonify({
        'success': True,
        'machinery_types': meta.get('machinery_types', []),
        'states': meta.get('states', []),
        'districts_by_state': meta.get('districts_by_state', {}),
        'seasons': meta.get('seasons', []),
        'crops': meta.get('crops', []),
        'district_weather_defaults': meta.get('district_weather_defaults', {}),
        'machinery_price_defaults': meta.get('machinery_price_defaults', {}),
        'disclaimer': meta.get('dataset_disclaimer', 'Demonstration synthetic dataset.')
    })

@ml_bp.route('/metrics', methods=['GET'])
def get_model_metrics():
    meta = predictor.get_metadata()
    return jsonify({
        'success': True,
        'best_model': meta.get('best_model', 'Linear Regression'),
        'metrics': meta.get('metrics', {}),
        'total_records': meta.get('total_records', 1200),
        'cluster_descriptions': meta.get('cluster_descriptions', {}),
        'disclaimer': meta.get('dataset_disclaimer', 'Synthetic demonstration data (1,200 records).')
    })

@ml_bp.route('/seasonal-recommendations', methods=['GET'])
def get_seasonal_recommendations():
    state = request.args.get('state', 'Karnataka')
    district = request.args.get('district', 'Mysuru')
    month = int(request.args.get('month', 10))
    season = request.args.get('season', 'Kharif')

    meta = predictor.get_metadata()
    mtypes = meta.get('machinery_types', ['Tractor', 'Harvester', 'Rotavator', 'Seed Drill', 'Sprayer', 'Power Tiller', 'Plough', 'Thresher'])

    recommendations = []
    for m in mtypes:
        try:
            pred = predictor.predict({
                'machinery_type': m,
                'state': state,
                'district': district,
                'month': month,
                'season': season,
                'crop_type': 'Paddy'
            })
            recommendations.append({
                'machinery_type': m,
                'predicted_demand': pred['predicted_demand'],
                'demand_level': pred['demand_level'],
                'level_color': pred['level_color'],
                'badge_class': pred['badge_class'],
                'top_farmer_recommendation': pred['recommendations']['for_farmers'][0] if pred['recommendations']['for_farmers'] else None,
                'top_owner_recommendation': pred['recommendations']['for_machinery_owners'][0] if pred['recommendations']['for_machinery_owners'] else None
            })
        except Exception:
            pass

    recommendations = sorted(recommendations, key=lambda x: x['predicted_demand'], reverse=True)

    return jsonify({
        'success': True,
        'state': state,
        'district': district,
        'month': month,
        'season': season,
        'recommendations': recommendations
    })

