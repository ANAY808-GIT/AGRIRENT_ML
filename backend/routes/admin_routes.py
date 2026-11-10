from flask import Blueprint, request, jsonify
from db import query_db, execute_db
from auth_middleware import jwt_required

admin_bp = Blueprint('admin_bp', __name__)

@admin_bp.route('/stats', methods=['GET'])
@jwt_required('admin')
def get_admin_stats():
    # User counts
    users_count = query_db("SELECT COUNT(*) as total FROM users", one=True)['total']
    farmers_count = query_db("SELECT COUNT(*) as count FROM users WHERE role = 'farmer'", one=True)['count']
    owners_count = query_db("SELECT COUNT(*) as count FROM users WHERE role = 'owner'", one=True)['count']

    # Machinery stats
    machinery_count = query_db("SELECT COUNT(*) as total FROM machinery", one=True)['total']
    available_machinery = query_db("SELECT COUNT(*) as count FROM machinery WHERE availability_status = 'available'", one=True)['count']

    # Bookings stats
    bookings_count = query_db("SELECT COUNT(*) as total FROM bookings", one=True)['total']
    active_bookings = query_db("SELECT COUNT(*) as count FROM bookings WHERE status = 'active'", one=True)['count']
    completed_bookings = query_db("SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'", one=True)['count']
    pending_bookings = query_db("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'", one=True)['count']

    # Revenue
    revenue = query_db("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'paid'", one=True)['total']

    return jsonify({
        'success': True,
        'stats': {
            'total_users': int(users_count),
            'total_farmers': int(farmers_count),
            'total_owners': int(owners_count),
            'total_machinery': int(machinery_count),
            'available_machinery': int(available_machinery),
            'total_bookings': int(bookings_count),
            'active_bookings': int(active_bookings),
            'completed_bookings': int(completed_bookings),
            'pending_bookings': int(pending_bookings),
            'total_revenue': float(revenue)
        }
    })

@admin_bp.route('/users', methods=['GET'])
@jwt_required('admin')
def get_users():
    role = request.args.get('role', '').strip()
    search = request.args.get('search', '').strip()

    sql = "SELECT id, full_name, email, mobile, role, village, district, state, is_active, created_at FROM users WHERE 1=1"
    params = []

    if role:
        sql += " AND role = %s"
        params.append(role)

    if search:
        sql += " AND (full_name LIKE %s OR email LIKE %s OR district LIKE %s)"
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard])

    sql += " ORDER BY id DESC"
    users = query_db(sql, params)
    return jsonify({
        'success': True,
        'count': len(users),
        'users': users
    })

@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['PUT'])
@jwt_required('admin')
def toggle_user_status(user_id):
    if user_id == request.current_user['id']:
        return jsonify({'error': 'Cannot disable your own admin account.', 'success': False}), 400

    user = query_db("SELECT is_active FROM users WHERE id = %s", (user_id,), one=True)
    if not user:
        return jsonify({'error': 'User not found.', 'success': False}), 404

    new_status = 0 if user.get('is_active', 1) else 1
    execute_db("UPDATE users SET is_active = %s WHERE id = %s", (new_status, user_id))

    return jsonify({
        'success': True,
        'message': f"User account {'activated' if new_status else 'suspended'} successfully.",
        'is_active': new_status
    })

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required('admin')
def delete_user(user_id):
    if user_id == request.current_user['id']:
        return jsonify({'error': 'Cannot delete your own admin account.', 'success': False}), 400

    execute_db("DELETE FROM users WHERE id = %s", (user_id,))
    return jsonify({
        'success': True,
        'message': 'User deleted successfully.'
    })

@admin_bp.route('/machinery', methods=['GET'])
@jwt_required('admin')
def get_all_machinery():
    sql = """
        SELECT m.*, u.full_name as owner_name, u.email as owner_email, u.mobile as owner_mobile
        FROM machinery m
        JOIN users u ON m.owner_id = u.id
        ORDER BY m.id DESC
    """
    machinery = query_db(sql)
    return jsonify({
        'success': True,
        'count': len(machinery),
        'machinery': machinery
    })

@admin_bp.route('/bookings', methods=['GET'])
@jwt_required('admin')
def get_all_bookings():
    sql = """
        SELECT b.*, 
               m.name as machinery_name, m.category as machinery_category,
               uf.full_name as farmer_name, uf.email as farmer_email, uf.mobile as farmer_mobile,
               uo.full_name as owner_name, uo.email as owner_email, uo.mobile as owner_mobile,
               p.transaction_id, p.payment_status
        FROM bookings b
        JOIN machinery m ON b.machinery_id = m.id
        JOIN users uf ON b.farmer_id = uf.id
        JOIN users uo ON b.owner_id = uo.id
        LEFT JOIN payments p ON b.id = p.booking_id
        ORDER BY b.id DESC
    """
    bookings = query_db(sql)
    return jsonify({
        'success': True,
        'count': len(bookings),
        'bookings': bookings
    })

@admin_bp.route('/analytics', methods=['GET'])
@jwt_required('admin')
def get_platform_analytics():
    # Category popularity
    category_data = query_db("""
        SELECT category, COUNT(m.id) as machinery_count, COUNT(b.id) as booking_count, COALESCE(SUM(b.total_price), 0) as total_revenue
        FROM machinery m
        LEFT JOIN bookings b ON m.id = b.machinery_id
        GROUP BY category
        ORDER BY booking_count DESC
    """)

    # District popularity
    district_data = query_db("""
        SELECT location_district, COUNT(*) as count
        FROM machinery
        GROUP BY location_district
        ORDER BY count DESC
    """)

    # Booking status breakdown
    status_data = query_db("""
        SELECT status, COUNT(*) as count
        FROM bookings
        GROUP BY status
    """)

    return jsonify({
        'success': True,
        'category_analytics': category_data,
        'district_analytics': district_data,
        'booking_status_breakdown': status_data
    })

