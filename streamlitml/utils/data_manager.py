import os
import sqlite3
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'agrirent.db')

def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        mobile TEXT,
        role TEXT NOT NULL CHECK(role IN ('owner', 'farmer', 'admin')),
        village TEXT,
        district TEXT,
        state TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS machinery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        rental_price_per_day REAL NOT NULL,
        location TEXT NOT NULL,
        district TEXT NOT NULL,
        state TEXT NOT NULL,
        image_url TEXT,
        specifications TEXT,
        is_available INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farmer_id INTEGER NOT NULL,
        machinery_id INTEGER NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        total_days INTEGER NOT NULL,
        daily_rate REAL NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'rejected', 'active', 'completed', 'cancelled')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (farmer_id) REFERENCES users(id),
        FOREIGN KEY (machinery_id) REFERENCES machinery(id)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        farmer_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'paid' CHECK(payment_status IN ('paid', 'pending', 'failed', 'refunded')),
        transaction_id TEXT UNIQUE NOT NULL,
        invoice_number TEXT UNIQUE NOT NULL,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id),
        FOREIGN KEY (farmer_id) REFERENCES users(id)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        machinery_id INTEGER NOT NULL,
        farmer_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (machinery_id) REFERENCES machinery(id),
        FOREIGN KEY (farmer_id) REFERENCES users(id)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS rental_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        farmer_id INTEGER NOT NULL,
        machinery_id INTEGER NOT NULL,
        owner_id INTEGER NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        actual_return_date TEXT,
        final_amount REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );
    """)

    # Seed demo users if empty
    cur.execute("SELECT COUNT(*) AS count FROM users;")
    if cur.fetchone()['count'] == 0:
        demo_pass = generate_password_hash("Pass@123")
        owner_pass = generate_password_hash("Owner@123")
        farmer_pass = generate_password_hash("Farmer@123")
        admin_pass = generate_password_hash("Admin@123")

        cur.execute("""
        INSERT INTO users (name, email, password_hash, mobile, role, village, district, state) VALUES
        ('AgriRent Administrator', 'admin@agrirent.com', ?, '9876543210', 'admin', 'Indiranagar', 'Bengaluru Urban', 'Karnataka'),
        ('Ramesh Patel', 'owner@agrirent.com', ?, '9876543211', 'owner', 'Shirwal', 'Satara', 'Maharashtra'),
        ('Harpreet Singh', 'harpreet@agrirent.com', ?, '9876543212', 'owner', 'Samrala', 'Ludhiana', 'Punjab'),
        ('Suresh Gowda', 'farmer@agrirent.com', ?, '9876543213', 'farmer', 'Mandya Rural', 'Mandya', 'Karnataka'),
        ('Anand Sharma', 'anand@agrirent.com', ?, '9876543214', 'farmer', 'Tanda', 'Karnal', 'Haryana');
        """, (admin_pass, owner_pass, demo_pass, farmer_pass, demo_pass))

        cur.execute("""
        INSERT INTO machinery (owner_id, name, category, description, rental_price_per_day, location, district, state, image_url, specifications, is_available) VALUES
        (2, 'Mahindra 575 DI Tractor', 'Tractor', '45 HP heavy-duty agricultural tractor equipped with hydraulic power steering and high torque backup. Perfect for plowing, sowing, and heavy haulage.', 1800.00, 'Satara Agricultural Hub', 'Satara', 'Maharashtra', 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', 'Power: 45 HP | Cylinders: 4 | Lifting Capacity: 1600 kg', 1),
        (2, 'Shaktiman Rotavator 7 Feet', 'Rotavator', 'High-performance rotary tiller with boron steel blades. Produces fine seedbed preparation in single pass across wet or dry field soils.', 900.00, 'Shirwal Village Market', 'Satara', 'Maharashtra', 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80', 'Working Width: 7 Feet | Blades: 48 L-Type | Suitable HP: 45-60 HP', 1),
        (3, 'Preet 987 Self-Propelled Harvester', 'Harvester', 'Modern multi-crop combine harvester with AC cabin and 14-foot cutter bar. Delivers exceptional grain output and clean straw recovery.', 5500.00, 'Samrala Grain Market', 'Ludhiana', 'Punjab', 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', 'Engine: 101 HP Ashok Leyland | Cutter Bar: 14 Feet | Grain Tank: 2400 Litres', 1),
        (3, 'John Deere 5050D Tractor', 'Tractor', '50 HP fuel-efficient workhorse featuring oil-immersed disc brakes and dual-clutch transmission for high farm productivity.', 2100.00, 'GT Road Machinery Yard', 'Ludhiana', 'Punjab', 'https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?auto=format&fit=crop&w=800&q=80', 'Power: 50 HP | Gearbox: 8 Forward + 4 Reverse | Dual PTO', 1),
        (2, 'VST Shakti 130DI Power Tiller', 'Power Tiller', '13 HP multi-utility rotary power tiller ideal for wet paddy preparation, inter-cultivation in sugarcane, and vegetable horticulture.', 850.00, 'Wai Farm Gate', 'Satara', 'Maharashtra', 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=800&q=80', 'Engine: 13 HP Single Cylinder Diesel | Rotary Width: 600 mm', 1),
        (3, 'National Zero-Till Seed Drill', 'Seed Drill', '11-tyne zero tillage seed-cum-fertilizer drill. Sows seeds directly into paddy stubble without prior field plowing.', 750.00, 'Samrala Cooperative', 'Ludhiana', 'Punjab', 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80', 'Tynes: 11 | Row Spacing: Adjustable 7-9 inches | Capacity: 100 kg Fertilizer + 100 kg Seed', 1),
        (2, 'ASPEE Tractor Mounted Boom Sprayer', 'Sprayer', '600-litre tank capacity tractor-driven sprayer with 12-meter hydraulic folding boom and anti-drip ceramic nozzles.', 1100.00, 'Karad Highway Hub', 'Satara', 'Maharashtra', 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', 'Tank: 600 Litres | Boom Width: 12 m | Nozzles: 24 Ceramic Cones', 1),
        (3, 'Kartar 4000 Paddy Harvester', 'Harvester', 'Track-type tracked paddy combine harvester with low ground pressure. Operates seamlessly in deep mud and waterlogged paddy fields.', 6200.00, 'Khanna Rice Belt', 'Ludhiana', 'Punjab', 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', 'Engine: 101 HP Turbocharged | Tracks: 500 mm Rubber Tracks | Grain Tank: 2000 kg', 1);
        """)

        # Add initial bookings
        cur.execute("""
        INSERT INTO bookings (farmer_id, machinery_id, start_date, end_date, total_days, daily_rate, total_amount, status, notes) VALUES
        (4, 1, '2026-11-25', '2026-11-28', 4, 1800.0, 7200.0, 'confirmed', 'Plowing for Rabi wheat field'),
        (5, 3, '2026-12-01', '2026-12-03', 3, 5500.0, 16500.0, 'pending', 'Paddy harvest requirement'),
        (4, 2, '2026-11-10', '2026-11-12', 3, 900.0, 2700.0, 'completed', 'Soil preparation finished');
        """)

        # Seed initial payment & review
        cur.execute("""
        INSERT INTO payments (booking_id, farmer_id, amount, payment_method, payment_status, transaction_id, invoice_number) VALUES
        (3, 4, 2835.0, 'UPI', 'paid', 'TXN-AGRI-SEED-001', 'INV-20261110-0001');
        """)

        cur.execute("""
        INSERT INTO reviews (machinery_id, farmer_id, rating, comment) VALUES
        (1, 4, 5, 'Exceptional tractor performance. Power and fuel economy were outstanding!'),
        (2, 4, 5, 'Blades were sharp and prepared fine soil in a single pass. Highly recommended.'),
        (3, 5, 4, 'Very clean harvesting with negligible grain loss. Fast operation.');
        """)

    conn.commit()
    conn.close()

# Core Data Helpers
def get_user_by_email(email):
    conn = get_connection()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    return user

def get_user_by_id(user_id):
    conn = get_connection()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return user

def register_user(name, email, password, mobile, role, village, district, state):
    conn = get_connection()
    cur = conn.cursor()
    p_hash = generate_password_hash(password)
    try:
        cur.execute("""
        INSERT INTO users (name, email, password_hash, mobile, role, village, district, state)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, email, p_hash, mobile, role, village, district, state))
        conn.commit()
        user_id = cur.lastrowid
        conn.close()
        return True, user_id
    except sqlite3.IntegrityError:
        conn.close()
        return False, "Email address already registered"

def get_machinery_list(category=None, search=None, district=None, max_price=None, available_only=False):
    conn = get_connection()
    sql = """
    SELECT m.*, u.name AS owner_name, u.mobile AS owner_mobile, u.village AS owner_village,
           COALESCE(AVG(r.rating), 4.8) AS avg_rating,
           COUNT(r.id) AS review_count
    FROM machinery m
    JOIN users u ON m.owner_id = u.id
    LEFT JOIN reviews r ON m.id = r.machinery_id
    WHERE 1=1
    """
    params = []
    if category and category != 'All Categories':
        sql += " AND m.category = ?"
        params.append(category)
    if search:
        sql += " AND (m.name LIKE ? OR m.description LIKE ? OR m.location LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])
    if district and district != 'All Districts':
        sql += " AND m.district = ?"
        params.append(district)
    if max_price:
        sql += " AND m.rental_price_per_day <= ?"
        params.append(float(max_price))
    if available_only:
        sql += " AND m.is_available = 1"

    sql += " GROUP BY m.id ORDER BY m.id DESC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return rows

def get_machinery_by_id(mach_id):
    conn = get_connection()
    row = conn.execute("""
    SELECT m.*, u.name AS owner_name, u.email AS owner_email, u.mobile AS owner_mobile,
           u.village AS owner_village, COALESCE(AVG(r.rating), 4.8) AS avg_rating,
           COUNT(r.id) AS review_count
    FROM machinery m
    JOIN users u ON m.owner_id = u.id
    LEFT JOIN reviews r ON m.id = r.machinery_id
    WHERE m.id = ?
    GROUP BY m.id
    """, (mach_id,)).fetchone()
    conn.close()
    return row

def add_machinery_record(owner_id, name, category, description, price, location, district, state, image_url, specifications):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO machinery (owner_id, name, category, description, rental_price_per_day, location, district, state, image_url, specifications, is_available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    """, (owner_id, name, category, description, price, location, district, state, image_url, specifications))
    conn.commit()
    mach_id = cur.lastrowid
    conn.close()
    return mach_id

def toggle_machinery_availability(mach_id, available):
    conn = get_connection()
    conn.execute("UPDATE machinery SET is_available = ? WHERE id = ?", (1 if available else 0, mach_id))
    conn.commit()
    conn.close()

def delete_machinery_record(mach_id):
    conn = get_connection()
    conn.execute("DELETE FROM machinery WHERE id = ?", (mach_id,))
    conn.commit()
    conn.close()

# Conflict-Free Booking Management
def check_booking_conflict(machinery_id, start_date, end_date):
    """
    Strict Double-Booking Guard:
    Checks if any confirmed or active booking exists where:
    Requested_Start <= Existing_End AND Requested_End >= Existing_Start
    """
    conn = get_connection()
    conflict = conn.execute("""
    SELECT id, start_date, end_date FROM bookings
    WHERE machinery_id = ?
      AND status IN ('confirmed', 'active')
      AND start_date <= ?
      AND end_date >= ?
    LIMIT 1;
    """, (machinery_id, end_date, start_date)).fetchone()
    conn.close()
    return conflict

def create_booking_request(farmer_id, machinery_id, start_date, end_date, notes=""):
    d1 = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()
    d2 = datetime.datetime.strptime(end_date, "%Y-%m-%d").date()
    days = (d2 - d1).days + 1
    if days <= 0:
        return False, "End date must be on or after start date"

    # Check for date conflict
    conflict = check_booking_conflict(machinery_id, start_date, end_date)
    if conflict:
        return False, f"Machinery already reserved from {conflict['start_date']} to {conflict['end_date']}. Please select alternate dates."

    mach = get_machinery_by_id(machinery_id)
    if not mach:
        return False, "Selected machinery was not found"

    daily_rate = float(mach['rental_price_per_day'])
    total_amount = round(daily_rate * days, 2)

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO bookings (farmer_id, machinery_id, start_date, end_date, total_days, daily_rate, total_amount, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    """, (farmer_id, machinery_id, start_date, end_date, days, daily_rate, total_amount, notes))
    conn.commit()
    b_id = cur.lastrowid
    conn.close()
    return True, b_id

def update_booking_status(booking_id, new_status):
    conn = get_connection()
    conn.execute("UPDATE bookings SET status = ? WHERE id = ?", (new_status, booking_id))
    conn.commit()
    conn.close()

def get_owner_booking_requests(owner_id):
    conn = get_connection()
    rows = conn.execute("""
    SELECT b.*, m.name AS machinery_name, m.category, m.image_url,
           u.name AS farmer_name, u.mobile AS farmer_mobile, u.village AS farmer_village, u.district AS farmer_district
    FROM bookings b
    JOIN machinery m ON b.machinery_id = m.id
    JOIN users u ON b.farmer_id = u.id
    WHERE m.owner_id = ?
    ORDER BY b.id DESC
    """, (owner_id,)).fetchall()
    conn.close()
    return rows

def get_farmer_bookings(farmer_id):
    conn = get_connection()
    rows = conn.execute("""
    SELECT b.*, m.name AS machinery_name, m.category, m.image_url, m.location,
           u.name AS owner_name, u.mobile AS owner_mobile,
           p.payment_status, p.invoice_number, p.transaction_id
    FROM bookings b
    JOIN machinery m ON b.machinery_id = m.id
    JOIN users u ON m.owner_id = u.id
    LEFT JOIN payments p ON b.id = p.booking_id
    WHERE b.farmer_id = ?
    ORDER BY b.id DESC
    """, (farmer_id,)).fetchall()
    conn.close()
    return rows

def process_payment_and_invoice(booking_id, farmer_id, payment_method):
    conn = get_connection()
    cur = conn.cursor()
    b = conn.execute("SELECT * FROM bookings WHERE id = ? AND farmer_id = ?", (booking_id, farmer_id)).fetchone()
    if not b:
        conn.close()
        return False, "Booking record not found"

    # Calculate GST (5%)
    subtotal = float(b['total_amount'])
    gst = round(subtotal * 0.05, 2)
    grand_total = round(subtotal + gst, 2)

    import uuid
    txn_id = f"TXN-AGRI-{uuid.uuid4().hex[:8].upper()}"
    inv_num = f"INV-{datetime.datetime.now().strftime('%Y%m%d%H%M')}-{b['id']:04d}"

    cur.execute("""
    INSERT INTO payments (booking_id, farmer_id, amount, payment_method, payment_status, transaction_id, invoice_number)
    VALUES (?, ?, ?, ?, 'paid', ?, ?)
    """, (booking_id, farmer_id, grand_total, payment_method, txn_id, inv_num))

    # Move booking to active / confirmed
    cur.execute("UPDATE bookings SET status = 'active' WHERE id = ?", (booking_id,))

    # Insert rental history log
    mach = conn.execute("SELECT owner_id FROM machinery WHERE id = ?", (b['machinery_id'],)).fetchone()
    cur.execute("""
    INSERT INTO rental_history (booking_id, farmer_id, machinery_id, owner_id, start_date, end_date, final_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (booking_id, farmer_id, b['machinery_id'], mach['owner_id'], b['start_date'], b['end_date'], grand_total))

    conn.commit()
    conn.close()
    return True, {"transaction_id": txn_id, "invoice_number": inv_num, "amount": grand_total}

def add_machinery_review(machinery_id, farmer_id, rating, comment):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO reviews (machinery_id, farmer_id, rating, comment)
    VALUES (?, ?, ?, ?)
    """, (machinery_id, farmer_id, rating, comment))
    conn.commit()
    conn.close()
    return True

def get_reviews_for_machinery(machinery_id):
    conn = get_connection()
    rows = conn.execute("""
    SELECT r.*, u.name AS farmer_name, u.district AS farmer_district
    FROM reviews r
    JOIN users u ON r.farmer_id = u.id
    WHERE r.machinery_id = ?
    ORDER BY r.id DESC
    """, (machinery_id,)).fetchall()
    conn.close()
    return rows

def get_admin_metrics():
    conn = get_connection()
    users_count = conn.execute("SELECT COUNT(*) AS c FROM users").fetchone()['c']
    owners_count = conn.execute("SELECT COUNT(*) AS c FROM users WHERE role = 'owner'").fetchone()['c']
    farmers_count = conn.execute("SELECT COUNT(*) AS c FROM users WHERE role = 'farmer'").fetchone()['c']
    mach_count = conn.execute("SELECT COUNT(*) AS c FROM machinery").fetchone()['c']
    bookings_count = conn.execute("SELECT COUNT(*) AS c FROM bookings").fetchone()['c']
    rev = conn.execute("SELECT COALESCE(SUM(total_amount), 0) AS s FROM bookings WHERE status IN ('confirmed', 'active', 'completed')").fetchone()['s']

    users = conn.execute("SELECT id, name, email, mobile, role, village, district, state, created_at FROM users ORDER BY id ASC").fetchall()
    machinery = conn.execute("""
    SELECT m.*, u.name as owner_name FROM machinery m JOIN users u ON m.owner_id = u.id ORDER BY m.id DESC
    """).fetchall()
    bookings = conn.execute("""
    SELECT b.*, m.name as machinery_name, uf.name as farmer_name, uo.name as owner_name
    FROM bookings b
    JOIN machinery m ON b.machinery_id = m.id
    JOIN users uf ON b.farmer_id = uf.id
    JOIN users uo ON m.owner_id = uo.id
    ORDER BY b.id DESC
    """).fetchall()

    conn.close()
    return {
        "users_count": users_count,
        "owners_count": owners_count,
        "farmers_count": farmers_count,
        "mach_count": mach_count,
        "bookings_count": bookings_count,
        "total_revenue": rev,
        "users": users,
        "machinery": machinery,
        "bookings": bookings
    }
