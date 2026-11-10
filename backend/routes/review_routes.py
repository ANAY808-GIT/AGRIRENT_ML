from flask import Blueprint, request, jsonify
from db import query_db, insert_db
from auth_middleware import jwt_required

review_bp = Blueprint('review_bp', __name__)

@review_bp.route('', methods=['POST'])
@jwt_required(['farmer', 'admin'])
def submit_review():
    data = request.get_json() or {}
    farmer_id = request.current_user['id']
    booking_id = data.get('booking_id')
    rating = int(data.get('rating', 5))
    comment = data.get('comment', '').strip()

    if not booking_id:
        return jsonify({'error': 'Booking ID is required.', 'success': False}), 400

    if rating < 1 or rating > 5:
        return jsonify({'error': 'Rating must be between 1 and 5 stars.', 'success': False}), 400

    booking = query_db("SELECT * FROM bookings WHERE id = %s", (booking_id,), one=True)
    if not booking:
        return jsonify({'error': 'Booking not found.', 'success': False}), 404

    if request.current_user['role'] != 'admin' and booking['farmer_id'] != farmer_id:
        return jsonify({'error': 'Unauthorized to review this booking.', 'success': False}), 403

    existing = query_db("SELECT id FROM reviews WHERE booking_id = %s", (booking_id,), one=True)
    if existing:
        return jsonify({'error': 'You have already submitted a review for this rental.', 'success': False}), 409

    review_id = insert_db("""
        INSERT INTO reviews (booking_id, machinery_id, farmer_id, rating, comment)
        VALUES (%s, %s, %s, %s, %s)
    """, (booking_id, booking['machinery_id'], farmer_id, rating, comment))

    return jsonify({
        'success': True,
        'message': 'Thank you! Your review has been published.',
        'review_id': review_id
    }), 201

@review_bp.route('/owner', methods=['GET'])
@jwt_required(['owner', 'admin'])
def get_owner_reviews():
    owner_id = request.current_user['id']
    sql = """
        SELECT r.*, 
               m.name as machinery_name,
               m.category as machinery_category,
               u.full_name as farmer_name,
               u.district as farmer_district,
               b.start_date, b.end_date
        FROM reviews r
        JOIN machinery m ON r.machinery_id = m.id
        JOIN users u ON r.farmer_id = u.id
        JOIN bookings b ON r.booking_id = b.id
        WHERE m.owner_id = %s
        ORDER BY r.created_at DESC
    """
    reviews = query_db(sql, (owner_id,))
    avg_rating = 5.0
    if reviews:
        avg_rating = round(sum(r['rating'] for r in reviews) / len(reviews), 1)

    return jsonify({
        'success': True,
        'count': len(reviews),
        'avg_rating': avg_rating,
        'reviews': reviews
    })

@review_bp.route('/farmer', methods=['GET'])
@jwt_required(['farmer', 'admin'])
def get_farmer_reviews():
    farmer_id = request.current_user['id']
    sql = """
        SELECT r.*, 
               m.name as machinery_name,
               m.category as machinery_category,
               m.image_url as machinery_image,
               uo.full_name as owner_name
        FROM reviews r
        JOIN machinery m ON r.machinery_id = m.id
        JOIN users uo ON m.owner_id = uo.id
        WHERE r.farmer_id = %s
        ORDER BY r.created_at DESC
    """
    reviews = query_db(sql, (farmer_id,))
    return jsonify({
        'success': True,
        'count': len(reviews),
        'reviews': reviews
    })

