import datetime
from flask import Blueprint, request, jsonify
from db import query_db, insert_db, execute_db
from auth_middleware import jwt_required

booking_bp = Blueprint('booking_bp', __name__)

def check_date_overlap(machinery_id, start_date_str, end_date_str, exclude_booking_id=None):
    """
    Checks if there is an existing 'accepted' or 'active' booking for machinery_id
    that overlaps with [start_date, end_date].
    Overlap condition: existing.start_date <= new.end_date AND existing.end_date >= new.start_date
    """
    sql = """
        SELECT id, start_date, end_date, status
        FROM bookings
        WHERE machinery_id = %s
          AND status IN ('accepted', 'active')
          AND start_date <= %s
          AND end_date >= %s
    """
    params = [machinery_id, end_date_str, start_date_str]
    if exclude_booking_id:
        sql += " AND id != %s"
        params.append(exclude_booking_id)

    conflicts = query_db(sql, params)
    return conflicts

@booking_bp.route('', methods=['POST'])
@jwt_required(['farmer', 'admin'])
def create_booking():
    data = request.get_json() or {}
    farmer_id = request.current_user['id']
    machinery_id = data.get('machinery_id')
    start_date_str = data.get('start_date', '').strip()
    end_date_str = data.get('end_date', '').strip()
    farmer_notes = data.get('farmer_notes', '').strip()

    if not machinery_id or not start_date_str or not end_date_str:
        return jsonify({'error': 'Machinery ID, start date, and end date are required.', 'success': False}), 400

    try:
        start_date = datetime.date.fromisoformat(start_date_str)
        end_date = datetime.date.fromisoformat(end_date_str)
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.', 'success': False}), 400

    if end_date < start_date:
        return jsonify({'error': 'End date cannot be prior to start date.', 'success': False}), 400

    machinery = query_db("SELECT * FROM machinery WHERE id = %s", (machinery_id,), one=True)
    if not machinery:
        return jsonify({'error': 'Machinery not found.', 'success': False}), 404

    if machinery['owner_id'] == farmer_id:
        return jsonify({'error': 'Owners cannot book their own machinery.', 'success': False}), 400

    # Overlap / Double booking prevention
    conflicts = check_date_overlap(machinery_id, start_date_str, end_date_str)
    if conflicts:
        conflict_dates = f"{conflicts[0]['start_date']} to {conflicts[0]['end_date']}"
        return jsonify({
            'error': f'Machinery already booked from {conflict_dates}. Double booking is prevented. Please select alternative dates.',
            'success': False,
            'conflict': conflicts[0]
        }), 409

    total_days = (end_date - start_date).days + 1
    daily_price = float(machinery['rental_price_per_day'])
    total_price = total_days * daily_price

    booking_id = insert_db("""
        INSERT INTO bookings (machinery_id, farmer_id, owner_id, start_date, end_date, total_days, daily_price, total_price, status, farmer_notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending', %s)
    """, (machinery_id, farmer_id, machinery['owner_id'], start_date_str, end_date_str, total_days, daily_price, total_price, farmer_notes))

    return jsonify({
        'success': True,
        'message': 'Booking request submitted successfully! The machinery owner will review your request.',
        'booking_id': booking_id,
        'total_days': total_days,
        'total_price': total_price
    }), 201

@booking_bp.route('/farmer', methods=['GET'])
@jwt_required(['farmer', 'admin'])
def get_farmer_bookings():
    farmer_id = request.current_user['id']
    status = request.args.get('status', '').strip()

    sql = """
        SELECT b.*, 
               m.name as machinery_name, 
               m.category as machinery_category,
               m.image_url as machinery_image,
               m.location_district as machinery_district,
               m.location_village as machinery_village,
               u.full_name as owner_name,
               u.mobile as owner_mobile,
               u.email as owner_email,
               p.transaction_id,
               p.payment_status,
               r.rating as review_rating
        FROM bookings b
        JOIN machinery m ON b.machinery_id = m.id
        JOIN users u ON b.owner_id = u.id
        LEFT JOIN payments p ON b.id = p.booking_id
        LEFT JOIN reviews r ON b.id = r.booking_id
        WHERE b.farmer_id = %s
    """
    params = [farmer_id]
    if status:
        sql += " AND b.status = %s"
        params.append(status)

    sql += " ORDER BY b.id DESC"
    bookings = query_db(sql, params)

    return jsonify({
        'success': True,
        'count': len(bookings),
        'bookings': bookings
    })

@booking_bp.route('/owner', methods=['GET'])
@jwt_required(['owner', 'admin'])
def get_owner_bookings():
    owner_id = request.current_user['id']
    status = request.args.get('status', '').strip()

    sql = """
        SELECT b.*, 
               m.name as machinery_name, 
               m.category as machinery_category,
               m.image_url as machinery_image,
               m.location_district as machinery_district,
               u.full_name as farmer_name,
               u.mobile as farmer_mobile,
               u.email as farmer_email,
               u.village as farmer_village,
               u.district as farmer_district,
               p.transaction_id,
               p.payment_status
        FROM bookings b
        JOIN machinery m ON b.machinery_id = m.id
        JOIN users u ON b.farmer_id = u.id
        LEFT JOIN payments p ON b.id = p.booking_id
        WHERE b.owner_id = %s
    """
    params = [owner_id]
    if status:
        sql += " AND b.status = %s"
        params.append(status)

    sql += " ORDER BY b.id DESC"
    bookings = query_db(sql, params)

    return jsonify({
        'success': True,
        'count': len(bookings),
        'bookings': bookings
    })

@booking_bp.route('/<int:booking_id>/status', methods=['PUT'])
@jwt_required(['owner', 'admin'])
def update_booking_status(booking_id):
    current_user = request.current_user
    data = request.get_json() or {}
    new_status = data.get('status', '').strip().lower()
    notes = data.get('owner_notes', '').strip()

    if new_status not in ['accepted', 'rejected', 'active', 'completed']:
        return jsonify({'error': 'Invalid status update.', 'success': False}), 400

    booking = query_db("SELECT * FROM bookings WHERE id = %s", (booking_id,), one=True)
    if not booking:
        return jsonify({'error': 'Booking not found.', 'success': False}), 404

    if current_user['role'] != 'admin' and booking['owner_id'] != current_user['id']:
        return jsonify({'error': 'Unauthorized to manage this booking.', 'success': False}), 403

    # If accepting, verify once more that no other confirmed booking was placed in between
    if new_status == 'accepted':
        conflicts = check_date_overlap(booking['machinery_id'], str(booking['start_date']), str(booking['end_date']), exclude_booking_id=booking_id)
        if conflicts:
            return jsonify({
                'error': f'Cannot accept: Conflict with existing booking ID #{conflicts[0]["id"]} from {conflicts[0]["start_date"]} to {conflicts[0]["end_date"]}.',
                'success': False
            }), 409

    execute_db("""
        UPDATE bookings 
        SET status = %s, owner_response_notes = COALESCE(%s, owner_response_notes)
        WHERE id = %s
    """, (new_status, notes if notes else None, booking_id))

    # If accepted or active, update machinery status if needed
    if new_status == 'active':
        execute_db("UPDATE machinery SET availability_status = 'in_use' WHERE id = %s", (booking['machinery_id'],))
    elif new_status == 'completed':
        execute_db("UPDATE machinery SET availability_status = 'available' WHERE id = %s", (booking['machinery_id'],))
        # Move to rental history if not already there
        existing_hist = query_db("SELECT id FROM rental_history WHERE booking_id = %s", (booking_id,), one=True)
        if not existing_hist:
            insert_db("""
                INSERT INTO rental_history (booking_id, machinery_id, farmer_id, owner_id, start_date, end_date, total_amount, completion_status, completion_notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s, 'Completed', %s)
            """, (booking_id, booking['machinery_id'], booking['farmer_id'], booking['owner_id'], booking['start_date'], booking['end_date'], booking['total_price'], notes or 'Rental completed successfully.'))

    return jsonify({
        'success': True,
        'message': f'Booking has been marked as {new_status}.'
    })

@booking_bp.route('/<int:booking_id>/cancel', methods=['PUT'])
@jwt_required(['farmer', 'admin'])
def cancel_booking(booking_id):
    current_user = request.current_user
    booking = query_db("SELECT * FROM bookings WHERE id = %s", (booking_id,), one=True)
    if not booking:
        return jsonify({'error': 'Booking not found.', 'success': False}), 404

    if current_user['role'] != 'admin' and booking['farmer_id'] != current_user['id']:
        return jsonify({'error': 'Unauthorized to cancel this booking.', 'success': False}), 403

    if booking['status'] not in ['pending', 'accepted']:
        return jsonify({'error': f"Cannot cancel booking with status '{booking['status']}'.", 'success': False}), 400

    execute_db("UPDATE bookings SET status = 'cancelled' WHERE id = %s", (booking_id,))
    execute_db("UPDATE machinery SET availability_status = 'available' WHERE id = %s", (booking['machinery_id'],))

    return jsonify({
        'success': True,
        'message': 'Booking cancelled successfully.'
    })

@booking_bp.route('/<int:booking_id>/complete', methods=['POST'])
@jwt_required(['owner', 'farmer', 'admin'])
def complete_booking(booking_id):
    current_user = request.current_user
    booking = query_db("SELECT * FROM bookings WHERE id = %s", (booking_id,), one=True)
    if not booking:
        return jsonify({'error': 'Booking not found.', 'success': False}), 404

    if current_user['role'] != 'admin' and current_user['id'] not in [booking['owner_id'], booking['farmer_id']]:
        return jsonify({'error': 'Unauthorized.', 'success': False}), 403

    execute_db("UPDATE bookings SET status = 'completed' WHERE id = %s", (booking_id,))
    execute_db("UPDATE machinery SET availability_status = 'available' WHERE id = %s", (booking['machinery_id'],))

    # Add to rental_history if not existing
    hist = query_db("SELECT id FROM rental_history WHERE booking_id = %s", (booking_id,), one=True)
    if not hist:
        insert_db("""
            INSERT INTO rental_history (booking_id, machinery_id, farmer_id, owner_id, start_date, end_date, total_amount, completion_status, completion_notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'Completed', 'Rental completed by user.')
        """, (booking_id, booking['machinery_id'], booking['farmer_id'], booking['owner_id'], booking['start_date'], booking['end_date'], booking['total_price']))

    return jsonify({
        'success': True,
        'message': 'Rental successfully completed and archived to history!'
    })

