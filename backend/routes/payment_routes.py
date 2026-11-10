import uuid
import datetime
from flask import Blueprint, request, jsonify
from db import query_db, insert_db, execute_db
from auth_middleware import jwt_required

payment_bp = Blueprint('payment_bp', __name__)

@payment_bp.route('/process', methods=['POST'])
@jwt_required(['farmer', 'admin'])
def process_simulated_payment():
    data = request.get_json() or {}
    farmer_id = request.current_user['id']
    booking_id = data.get('booking_id')
    payment_method = data.get('payment_method', 'Simulated UPI')

    if not booking_id:
        return jsonify({'error': 'Booking ID is required.', 'success': False}), 400

    booking = query_db("""
        SELECT b.*, m.name as machinery_name
        FROM bookings b
        JOIN machinery m ON b.machinery_id = m.id
        WHERE b.id = %s
    """, (booking_id,), one=True)

    if not booking:
        return jsonify({'error': 'Booking not found.', 'success': False}), 404

    if request.current_user['role'] != 'admin' and booking['farmer_id'] != farmer_id:
        return jsonify({'error': 'Unauthorized to pay for this booking.', 'success': False}), 403

    # Check if already paid
    existing_payment = query_db("SELECT id, invoice_number, transaction_id FROM payments WHERE booking_id = %s AND payment_status = 'paid'", (booking_id,), one=True)
    if existing_payment:
        return jsonify({
            'success': True,
            'message': 'Payment already processed for this booking.',
            'transaction_id': existing_payment['transaction_id'],
            'invoice_number': existing_payment['invoice_number']
        })

    # Generate unique transaction ID & invoice number
    random_code = uuid.uuid4().hex[:8].upper()
    timestamp_str = datetime.datetime.now().strftime('%Y%m%d%H%M')
    txn_id = f"TXN-AGRI-{random_code}"
    inv_num = f"INV-{timestamp_str}-{booking_id:04d}"

    payment_id = insert_db("""
        INSERT INTO payments (booking_id, farmer_id, owner_id, amount, payment_method, transaction_id, payment_status, invoice_number)
        VALUES (%s, %s, %s, %s, %s, %s, 'paid', %s)
    """, (booking_id, farmer_id, booking['owner_id'], booking['total_price'], payment_method, txn_id, inv_num))

    # Advance booking status to active
    execute_db("UPDATE bookings SET status = 'active' WHERE id = %s", (booking_id,))
    execute_db("UPDATE machinery SET availability_status = 'in_use' WHERE id = %s", (booking['machinery_id'],))

    return jsonify({
        'success': True,
        'message': 'Payment processed successfully! Your rental is now Active.',
        'payment_id': payment_id,
        'transaction_id': txn_id,
        'invoice_number': inv_num,
        'amount': booking['total_price']
    })

@payment_bp.route('/history', methods=['GET'])
@jwt_required()
def get_payment_history():
    user = request.current_user
    user_id = user['id']
    role = user['role']

    if role == 'farmer':
        sql = """
            SELECT p.*, 
                   b.start_date, b.end_date, b.total_days,
                   m.name as machinery_name, m.category as machinery_category,
                   u.full_name as owner_name, u.mobile as owner_mobile
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN machinery m ON b.machinery_id = m.id
            JOIN users u ON p.owner_id = u.id
            WHERE p.farmer_id = %s
            ORDER BY p.paid_at DESC
        """
        payments = query_db(sql, (user_id,))
    elif role == 'owner':
        sql = """
            SELECT p.*, 
                   b.start_date, b.end_date, b.total_days,
                   m.name as machinery_name, m.category as machinery_category,
                   u.full_name as farmer_name, u.mobile as farmer_mobile
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN machinery m ON b.machinery_id = m.id
            JOIN users u ON p.farmer_id = u.id
            WHERE p.owner_id = %s
            ORDER BY p.paid_at DESC
        """
        payments = query_db(sql, (user_id,))
    else: # admin
        sql = """
            SELECT p.*, 
                   m.name as machinery_name,
                   uf.full_name as farmer_name,
                   uo.full_name as owner_name
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN machinery m ON b.machinery_id = m.id
            JOIN users uf ON p.farmer_id = uf.id
            JOIN users uo ON p.owner_id = uo.id
            ORDER BY p.paid_at DESC
        """
        payments = query_db(sql)

    return jsonify({
        'success': True,
        'count': len(payments),
        'payments': payments
    })

@payment_bp.route('/owner-earnings', methods=['GET'])
@jwt_required(['owner', 'admin'])
def get_owner_earnings():
    owner_id = request.current_user['id']

    # Total earnings
    total_res = query_db("""
        SELECT COALESCE(SUM(amount), 0) as total_earnings, COUNT(id) as paid_transactions
        FROM payments
        WHERE owner_id = %s AND payment_status = 'paid'
    """, (owner_id,), one=True)

    # Monthly breakdown (last 6 months)
    monthly_res = query_db("""
        SELECT strftime('%Y-%m', paid_at) as month_key, SUM(amount) as monthly_amount, COUNT(id) as count
        FROM payments
        WHERE owner_id = %s AND payment_status = 'paid'
        GROUP BY month_key
        ORDER BY month_key ASC
    """, (owner_id,))

    # Completed rentals count
    completed_res = query_db("""
        SELECT COUNT(id) as completed_count
        FROM bookings
        WHERE owner_id = %s AND status = 'completed'
    """, (owner_id,), one=True)

    # Pending payouts (accepted or active bookings not yet completed/paid)
    pending_payouts = query_db("""
        SELECT COALESCE(SUM(total_price), 0) as pending_amount, COUNT(id) as count
        FROM bookings
        WHERE owner_id = %s AND status = 'pending'
    """, (owner_id,), one=True)

    return jsonify({
        'success': True,
        'total_earnings': float(total_res['total_earnings']),
        'paid_transactions': int(total_res['paid_transactions']),
        'completed_rentals': int(completed_res['completed_count']),
        'pending_requests_potential': float(pending_payouts['pending_amount']),
        'monthly_breakdown': monthly_res
    })

@payment_bp.route('/invoice/<int:booking_id>', methods=['GET'])
@jwt_required()
def get_invoice(booking_id):
    current_user = request.current_user
    sql = """
        SELECT p.*,
               b.start_date, b.end_date, b.total_days, b.daily_price, b.total_price as booking_total,
               m.name as machinery_name, m.category as machinery_category, m.model_year,
               uf.full_name as farmer_name, uf.email as farmer_email, uf.mobile as farmer_mobile,
               uf.village as farmer_village, uf.district as farmer_district, uf.state as farmer_state,
               uo.full_name as owner_name, uo.email as owner_email, uo.mobile as owner_mobile,
               uo.village as owner_village, uo.district as owner_district, uo.state as owner_state
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        JOIN machinery m ON b.machinery_id = m.id
        JOIN users uf ON p.farmer_id = uf.id
        JOIN users uo ON p.owner_id = uo.id
        WHERE p.booking_id = %s
    """
    invoice = query_db(sql, (booking_id,), one=True)
    if not invoice:
        # Check if booking exists and return pending invoice view
        booking_data = query_db("""
            SELECT b.*,
                   m.name as machinery_name, m.category as machinery_category, m.model_year,
                   uf.full_name as farmer_name, uf.email as farmer_email, uf.mobile as farmer_mobile,
                   uf.village as farmer_village, uf.district as farmer_district, uf.state as farmer_state,
                   uo.full_name as owner_name, uo.email as owner_email, uo.mobile as owner_mobile,
                   uo.village as owner_village, uo.district as owner_district, uo.state as owner_state
            FROM bookings b
            JOIN machinery m ON b.machinery_id = m.id
            JOIN users uf ON b.farmer_id = uf.id
            JOIN users uo ON b.owner_id = uo.id
            WHERE b.id = %s
        """, (booking_id,), one=True)

        if not booking_data:
            return jsonify({'error': 'Invoice / booking not found.', 'success': False}), 404

        invoice = dict(booking_data)
        invoice['invoice_number'] = f"PROFORMA-{booking_id:04d}"
        invoice['transaction_id'] = "PENDING_CHECKOUT"
        invoice['amount'] = booking_data['total_price']
        invoice['payment_method'] = "To Be Paid"
        invoice['payment_status'] = "unpaid"
        invoice['paid_at'] = None

    if current_user['role'] != 'admin' and current_user['id'] not in [invoice['farmer_id'], invoice['owner_id']]:
        return jsonify({'error': 'Unauthorized to view this invoice.', 'success': False}), 403

    # Add tax & discount breakdown (GST standard demonstration)
    subtotal = float(invoice['amount'])
    gst_rate = 0.05 # 5% agricultural service concession
    gst_amount = round(subtotal * gst_rate, 2)
    grand_total = subtotal + gst_amount

    invoice['subtotal'] = subtotal
    invoice['gst_rate_percent'] = 5.0
    invoice['gst_amount'] = gst_amount
    invoice['grand_total'] = grand_total

    return jsonify({
        'success': True,
        'invoice': invoice
    })

