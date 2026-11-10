import datetime
import jwt
from functools import wraps
from flask import request, jsonify
from config import Config
from db import query_db

def generate_token(user):
    payload = {
        'user_id': user['id'],
        'email': user['email'],
        'role': user['role'],
        'full_name': user['full_name'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=Config.JWT_EXPIRATION_HOURS),
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')

def decode_token(token):
    try:
        return jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def jwt_required(allowed_roles=None):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get('Authorization', None)
            if not auth_header:
                return jsonify({'error': 'Authorization header missing', 'success': False}), 401

            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                return jsonify({'error': 'Invalid token format. Expected Bearer <token>', 'success': False}), 401

            token = parts[1]
            payload = decode_token(token)
            if not payload:
                return jsonify({'error': 'Token has expired or is invalid', 'success': False}), 401

            # Fetch fresh user from DB
            user = query_db("SELECT id, full_name, email, mobile, role, village, district, state, is_active FROM users WHERE id = %s", (payload['user_id'],), one=True)
            if not user or not user.get('is_active', 1):
                return jsonify({'error': 'User account not found or suspended', 'success': False}), 403

            if allowed_roles:
                roles = [allowed_roles] if isinstance(allowed_roles, str) else allowed_roles
                if user['role'] not in roles:
                    return jsonify({'error': f"Access forbidden for role '{user['role']}'. Required: {roles}", 'success': False}), 403

            request.current_user = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator

