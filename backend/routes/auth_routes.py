import re
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from db import query_db, insert_db, execute_db
from auth_middleware import generate_token, jwt_required

auth_bp = Blueprint('auth_bp', __name__)

EMAIL_REGEX = r'^[\w\.-]+@[\w\.-]+\.\w+$'

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    mobile = data.get('mobile', '').strip()
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')
    role = data.get('role', 'farmer').strip().lower()
    village = data.get('village', '').strip()
    district = data.get('district', '').strip()
    state = data.get('state', '').strip()

    if not full_name or not email or not password or not mobile or not district or not state:
        return jsonify({'error': 'Please fill all mandatory fields.', 'success': False}), 400

    if not re.match(EMAIL_REGEX, email):
        return jsonify({'error': 'Please enter a valid email address.', 'success': False}), 400

    if password != confirm_password:
        return jsonify({'error': 'Passwords do not match.', 'success': False}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.', 'success': False}), 400

    if role not in ['owner', 'farmer']:
        return jsonify({'error': 'Invalid user role specified. Must be owner or farmer.', 'success': False}), 400

    existing = query_db("SELECT id FROM users WHERE email = %s", (email,), one=True)
    if existing:
        return jsonify({'error': 'An account with this email address already exists.', 'success': False}), 409

    pwd_hash = generate_password_hash(password)
    user_id = insert_db(
        "INSERT INTO users (full_name, email, password_hash, mobile, role, village, district, state) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
        (full_name, email, pwd_hash, mobile, role, village, district, state)
    )

    user = query_db("SELECT id, full_name, email, mobile, role, village, district, state FROM users WHERE id = %s", (user_id,), one=True)
    token = generate_token(user)

    return jsonify({
        'success': True,
        'message': 'Registration successful! Welcome to AgriRent ML.',
        'token': token,
        'user': user
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Please provide email and password.', 'success': False}), 400

    user = query_db("SELECT id, full_name, email, password_hash, mobile, role, village, district, state, is_active FROM users WHERE email = %s", (email,), one=True)
    if not user:
        return jsonify({'error': 'Invalid email or password.', 'success': False}), 401

    if not user.get('is_active', 1):
        return jsonify({'error': 'Your account has been deactivated. Please contact support.', 'success': False}), 403

    if not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password.', 'success': False}), 401

    del user['password_hash']
    token = generate_token(user)

    return jsonify({
        'success': True,
        'message': f'Welcome back, {user["full_name"]}!',
        'token': token,
        'user': user
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    return jsonify({
        'success': True,
        'user': request.current_user
    })

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    data = request.get_json() or {}
    user_id = request.current_user['id']

    full_name = data.get('full_name', request.current_user['full_name']).strip()
    mobile = data.get('mobile', request.current_user['mobile']).strip()
    village = data.get('village', request.current_user.get('village', '')).strip()
    district = data.get('district', request.current_user['district']).strip()
    state = data.get('state', request.current_user['state']).strip()

    execute_db(
        "UPDATE users SET full_name = %s, mobile = %s, village = %s, district = %s, state = %s WHERE id = %s",
        (full_name, mobile, village, district, state, user_id)
    )

    updated_user = query_db("SELECT id, full_name, email, mobile, role, village, district, state FROM users WHERE id = %s", (user_id,), one=True)
    return jsonify({
        'success': True,
        'message': 'Profile updated successfully.',
        'user': updated_user
    })

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    data = request.get_json() or {}
    old_password = data.get('old_password', '')
    new_password = data.get('new_password', '')

    if not old_password or not new_password:
        return jsonify({'error': 'Both old and new passwords are required.', 'success': False}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters.', 'success': False}), 400

    user = query_db("SELECT password_hash FROM users WHERE id = %s", (request.current_user['id'],), one=True)
    if not check_password_hash(user['password_hash'], old_password):
        return jsonify({'error': 'Incorrect current password.', 'success': False}), 400

    new_hash = generate_password_hash(new_password)
    execute_db("UPDATE users SET password_hash = %s WHERE id = %s", (new_hash, request.current_user['id']))

    return jsonify({
        'success': True,
        'message': 'Password changed successfully.'
    })

