import json
from flask import Blueprint, request, jsonify
from db import query_db, insert_db, execute_db
from auth_middleware import jwt_required

machinery_bp = Blueprint('machinery_bp', __name__)

@machinery_bp.route('', methods=['GET'])
def get_machinery():
    category = request.args.get('category', '').strip()
    search = request.args.get('search', '').strip()
    district = request.args.get('district', '').strip()
    state = request.args.get('state', '').strip()
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    availability = request.args.get('availability', '').strip()
    owner_id = request.args.get('owner_id', type=int)

    query = """
        SELECT m.*, 
               u.full_name as owner_name, 
               u.mobile as owner_mobile, 
               u.email as owner_email,
               COALESCE(AVG(r.rating), 4.8) as avg_rating,
               COUNT(r.id) as review_count
        FROM machinery m
        JOIN users u ON m.owner_id = u.id
        LEFT JOIN reviews r ON m.id = r.machinery_id
        WHERE 1=1
    """
    params = []

    if category and category.lower() != 'all':
        query += " AND LOWER(m.category) = LOWER(%s)"
        params.append(category)

    if search:
        query += " AND (LOWER(m.name) LIKE LOWER(%s) OR LOWER(m.description) LIKE LOWER(%s) OR LOWER(m.location_district) LIKE LOWER(%s))"
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard])

    if district:
        query += " AND LOWER(m.location_district) = LOWER(%s)"
        params.append(district)

    if state:
        query += " AND LOWER(m.location_state) = LOWER(%s)"
        params.append(state)

    if min_price is not None:
        query += " AND m.rental_price_per_day >= %s"
        params.append(min_price)

    if max_price is not None:
        query += " AND m.rental_price_per_day <= %s"
        params.append(max_price)

    if availability:
        query += " AND m.availability_status = %s"
        params.append(availability)

    if owner_id:
        query += " AND m.owner_id = %s"
        params.append(owner_id)

    query += " GROUP BY m.id ORDER BY m.id DESC"

    machinery_list = query_db(query, params)
    for m in machinery_list:
        if isinstance(m.get('specs_json'), str):
            try:
                m['specs'] = json.loads(m['specs_json'])
            except Exception:
                m['specs'] = {}
        else:
            m['specs'] = m.get('specs_json') or {}
        m['avg_rating'] = round(float(m['avg_rating']), 1) if m.get('avg_rating') else 4.8

    return jsonify({
        'success': True,
        'count': len(machinery_list),
        'machinery': machinery_list
    })

@machinery_bp.route('/<int:machinery_id>', methods=['GET'])
def get_machinery_detail(machinery_id):
    query = """
        SELECT m.*, 
               u.full_name as owner_name, 
               u.mobile as owner_mobile, 
               u.email as owner_email,
               u.village as owner_village,
               u.district as owner_district,
               u.state as owner_state
        FROM machinery m
        JOIN users u ON m.owner_id = u.id
        WHERE m.id = %s
    """
    machinery = query_db(query, (machinery_id,), one=True)
    if not machinery:
        return jsonify({'error': 'Machinery not found', 'success': False}), 404

    if isinstance(machinery.get('specs_json'), str):
        try:
            machinery['specs'] = json.loads(machinery['specs_json'])
        except Exception:
            machinery['specs'] = {}
    else:
        machinery['specs'] = machinery.get('specs_json') or {}

    # Fetch reviews
    reviews = query_db("""
        SELECT r.*, u.full_name as farmer_name, u.district as farmer_district
        FROM reviews r
        JOIN users u ON r.farmer_id = u.id
        WHERE r.machinery_id = %s
        ORDER BY r.created_at DESC
    """, (machinery_id,))

    # Fetch active / accepted bookings dates for calendar
    bookings = query_db("""
        SELECT start_date, end_date, status
        FROM bookings
        WHERE machinery_id = %s AND status IN ('accepted', 'active')
    """, (machinery_id,))

    avg_rating = 4.8
    if reviews:
        avg_rating = round(sum(r['rating'] for r in reviews) / len(reviews), 1)

    machinery['reviews'] = reviews
    machinery['avg_rating'] = avg_rating
    machinery['review_count'] = len(reviews)
    machinery['booked_dates'] = bookings

    return jsonify({
        'success': True,
        'machinery': machinery
    })

@machinery_bp.route('', methods=['POST'])
@jwt_required(['owner', 'admin'])
def add_machinery():
    data = request.get_json() or {}
    owner_id = request.current_user['id']

    name = data.get('name', '').strip()
    category = data.get('category', '').strip()
    model_year = data.get('model_year', '2023').strip()
    description = data.get('description', '').strip()
    rental_price = data.get('rental_price_per_day', 0)
    village = data.get('location_village', request.current_user.get('village', '')).strip()
    district = data.get('location_district', request.current_user['district']).strip()
    state = data.get('location_state', request.current_user['state']).strip()
    image_url = data.get('image_url', '').strip()
    availability = data.get('availability_status', 'available').strip()
    specs = data.get('specs', {})

    if not name or not category or not description or float(rental_price) <= 0:
        return jsonify({'error': 'Name, category, description, and valid rental price are required.', 'success': False}), 400

    if not image_url:
        # Default placeholder per category
        category_placeholders = {
            'Tractor': 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
            'Harvester': 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=800&q=80',
            'Rotavator': 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800&q=80',
            'Power Tiller': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
            'Sprayer': 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
            'Seed Drill': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
            'Plough': 'https://images.unsplash.com/photo-1595838725922-a8c88686f376?auto=format&fit=crop&w=800&q=80',
            'Thresher': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80'
        }
        image_url = category_placeholders.get(category, 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80')

    specs_str = json.dumps(specs) if isinstance(specs, dict) else '{}'

    machinery_id = insert_db("""
        INSERT INTO machinery (owner_id, name, category, model_year, description, rental_price_per_day, location_village, location_district, location_state, specs_json, image_url, availability_status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (owner_id, name, category, model_year, description, float(rental_price), village, district, state, specs_str, image_url, availability))

    return jsonify({
        'success': True,
        'message': f"Machinery '{name}' listed successfully!",
        'machinery_id': machinery_id
    }), 201

@machinery_bp.route('/<int:machinery_id>', methods=['PUT'])
@jwt_required(['owner', 'admin'])
def update_machinery(machinery_id):
    current_user = request.current_user
    machinery = query_db("SELECT * FROM machinery WHERE id = %s", (machinery_id,), one=True)
    if not machinery:
        return jsonify({'error': 'Machinery not found', 'success': False}), 404

    if current_user['role'] != 'admin' and machinery['owner_id'] != current_user['id']:
        return jsonify({'error': 'Unauthorized to modify this machinery.', 'success': False}), 403

    data = request.get_json() or {}
    name = data.get('name', machinery['name']).strip()
    category = data.get('category', machinery['category']).strip()
    model_year = data.get('model_year', machinery['model_year']).strip()
    description = data.get('description', machinery['description']).strip()
    rental_price = float(data.get('rental_price_per_day', machinery['rental_price_per_day']))
    village = data.get('location_village', machinery['location_village']).strip()
    district = data.get('location_district', machinery['location_district']).strip()
    state = data.get('location_state', machinery['location_state']).strip()
    image_url = data.get('image_url', machinery['image_url']).strip()
    availability = data.get('availability_status', machinery['availability_status']).strip()

    specs = data.get('specs')
    specs_str = json.dumps(specs) if specs is not None else machinery.get('specs_json', '{}')

    execute_db("""
        UPDATE machinery 
        SET name = %s, category = %s, model_year = %s, description = %s, rental_price_per_day = %s,
            location_village = %s, location_district = %s, location_state = %s, specs_json = %s,
            image_url = %s, availability_status = %s
        WHERE id = %s
    """, (name, category, model_year, description, rental_price, village, district, state, specs_str, image_url, availability, machinery_id))

    return jsonify({
        'success': True,
        'message': 'Machinery details updated successfully.'
    })

@machinery_bp.route('/<int:machinery_id>', methods=['DELETE'])
@jwt_required(['owner', 'admin'])
def delete_machinery(machinery_id):
    current_user = request.current_user
    machinery = query_db("SELECT * FROM machinery WHERE id = %s", (machinery_id,), one=True)
    if not machinery:
        return jsonify({'error': 'Machinery not found', 'success': False}), 404

    if current_user['role'] != 'admin' and machinery['owner_id'] != current_user['id']:
        return jsonify({'error': 'Unauthorized to delete this machinery.', 'success': False}), 403

    execute_db("DELETE FROM machinery WHERE id = %s", (machinery_id,))
    return jsonify({
        'success': True,
        'message': 'Machinery removed successfully.'
    })

@machinery_bp.route('/categories', methods=['GET'])
def get_categories():
    cats = query_db("""
        SELECT category, COUNT(*) as count, MIN(rental_price_per_day) as min_price, AVG(rental_price_per_day) as avg_price
        FROM machinery
        GROUP BY category
        ORDER BY count DESC
    """)
    return jsonify({
        'success': True,
        'categories': cats
    })

