import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from db import init_db

# Import Blueprints
from routes.auth_routes import auth_bp
from routes.machinery_routes import machinery_bp
from routes.booking_routes import booking_bp
from routes.payment_routes import payment_bp
from routes.review_routes import review_bp
from routes.ml_routes import ml_bp
from routes.admin_routes import admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend requests
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Create upload directory
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

    # Initialize and seed database
    with app.app_context():
        init_db()

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(machinery_bp, url_prefix='/api/machinery')
    app.register_blueprint(booking_bp, url_prefix='/api/bookings')
    app.register_blueprint(payment_bp, url_prefix='/api/payments')
    app.register_blueprint(review_bp, url_prefix='/api/reviews')
    app.register_blueprint(ml_bp, url_prefix='/api/ml')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'app': 'AgriRent ML API Backend',
            'version': '1.0.0',
            'database': 'Connected (MySQL / SQLite Dual Support)',
            'ml_model': 'Loaded and Active'
        })

    # Serve built React frontend from frontend/dist if available
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))
    if os.path.exists(dist_dir):
        from flask import send_from_directory

        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_frontend(path):
            if path and os.path.exists(os.path.join(dist_dir, path)):
                return send_from_directory(dist_dir, path)
            return send_from_directory(dist_dir, 'index.html')

    @app.errorhandler(404)
    def not_found(error):
        # If frontend dist exists, return index.html for client-side routing
        if os.path.exists(dist_dir):
            from flask import send_from_directory
            return send_from_directory(dist_dir, 'index.html')
        return jsonify({'error': 'Requested endpoint not found', 'success': False}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error occurred', 'success': False}), 500

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[*] AgriRent ML Backend Server running on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
