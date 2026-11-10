import os
import sqlite3
import pymysql
from pymysql.cursors import DictCursor
from werkzeug.security import generate_password_hash
from config import Config

_use_mysql = False
_mysql_conn_params = {
    'host': Config.MYSQL_HOST,
    'port': Config.MYSQL_PORT,
    'user': Config.MYSQL_USER,
    'password': Config.MYSQL_PASSWORD,
    'database': Config.MYSQL_DB,
    'cursorclass': DictCursor,
    'autocommit': True
}

def test_mysql_connection():
    global _use_mysql
    try:
        conn = pymysql.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD
        )
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{Config.MYSQL_DB}` CHARACTER SET utf8mb4;")
        conn.close()
        _use_mysql = True
        print("[DATABASE] Successfully connected to MySQL server!")
        return True
    except Exception as e:
        _use_mysql = False
        print(f"[DATABASE] MySQL not available ({e}). Using SQLite fallback: {Config.SQLITE_DB_PATH}")
        return False

def get_connection():
    if _use_mysql:
        return pymysql.connect(**_mysql_conn_params)
    else:
        conn = sqlite3.connect(Config.SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

def format_query(sql):
    """Convert %s placeholders to ? for sqlite if running SQLite"""
    if not _use_mysql:
        return sql.replace('%s', '?')
    return sql

def query_db(query, args=(), one=False):
    sql = format_query(query)
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql, args)
        if _use_mysql:
            rv = cur.fetchall()
            cur.close()
        else:
            rows = cur.fetchall()
            rv = [dict(row) for row in rows]
            cur.close()
        return (rv[0] if rv else None) if one else rv
    finally:
        conn.close()

def execute_db(query, args=()):
    sql = format_query(query)
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql, args)
        if not _use_mysql:
            conn.commit()
        affected = cur.rowcount
        cur.close()
        return affected
    finally:
        conn.close()

def insert_db(query, args=()):
    sql = format_query(query)
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql, args)
        if not _use_mysql:
            conn.commit()
            last_id = cur.lastrowid
        else:
            last_id = cur.lastrowid
        cur.close()
        return last_id
    finally:
        conn.close()

def init_db():
    test_mysql_connection()
    conn = get_connection()
    cur = conn.cursor()

    if _use_mysql:
        # MySQL table creation
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(120) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            mobile VARCHAR(20) NOT NULL,
            role ENUM('owner', 'farmer', 'admin') NOT NULL DEFAULT 'farmer',
            village VARCHAR(100),
            district VARCHAR(100) NOT NULL,
            state VARCHAR(100) NOT NULL,
            avatar_url TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS machinery (
            id INT AUTO_INCREMENT PRIMARY KEY,
            owner_id INT NOT NULL,
            name VARCHAR(150) NOT NULL,
            category VARCHAR(50) NOT NULL,
            model_year VARCHAR(10),
            description TEXT NOT NULL,
            rental_price_per_day DECIMAL(10, 2) NOT NULL,
            location_village VARCHAR(100),
            location_district VARCHAR(100) NOT NULL,
            location_state VARCHAR(100) NOT NULL,
            specs_json TEXT,
            image_url TEXT NOT NULL,
            availability_status ENUM('available', 'in_use', 'maintenance') DEFAULT 'available',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            machinery_id INT NOT NULL,
            farmer_id INT NOT NULL,
            owner_id INT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            total_days INT NOT NULL,
            daily_price DECIMAL(10, 2) NOT NULL,
            total_price DECIMAL(10, 2) NOT NULL,
            status ENUM('pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled') DEFAULT 'pending',
            farmer_notes TEXT,
            owner_response_notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (machinery_id) REFERENCES machinery(id) ON DELETE CASCADE,
            FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            booking_id INT NOT NULL,
            farmer_id INT NOT NULL,
            owner_id INT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            payment_method VARCHAR(50) DEFAULT 'Simulated UPI',
            transaction_id VARCHAR(100) NOT NULL UNIQUE,
            payment_status ENUM('paid', 'pending', 'refunded') DEFAULT 'paid',
            invoice_number VARCHAR(50) NOT NULL UNIQUE,
            paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
            FOREIGN KEY (farmer_id) REFERENCES users(id),
            FOREIGN KEY (owner_id) REFERENCES users(id)
        ) ENGINE=InnoDB;
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            booking_id INT NOT NULL,
            machinery_id INT NOT NULL,
            farmer_id INT NOT NULL,
            rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
            FOREIGN KEY (machinery_id) REFERENCES machinery(id) ON DELETE CASCADE,
            FOREIGN KEY (farmer_id) REFERENCES users(id)
        ) ENGINE=InnoDB;
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS rental_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            booking_id INT NOT NULL,
            machinery_id INT NOT NULL,
            farmer_id INT NOT NULL,
            owner_id INT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            total_amount DECIMAL(10, 2) NOT NULL,
            completion_status VARCHAR(50) DEFAULT 'Completed',
            completion_notes TEXT,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
            FOREIGN KEY (machinery_id) REFERENCES machinery(id),
            FOREIGN KEY (farmer_id) REFERENCES users(id),
            FOREIGN KEY (owner_id) REFERENCES users(id)
        ) ENGINE=InnoDB;
        """)
    else:
        # SQLite schema
        cur.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            mobile TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'farmer',
            village TEXT,
            district TEXT NOT NULL,
            state TEXT NOT NULL,
            avatar_url TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS machinery (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            model_year TEXT,
            description TEXT NOT NULL,
            rental_price_per_day REAL NOT NULL,
            location_village TEXT,
            location_district TEXT NOT NULL,
            location_state TEXT NOT NULL,
            specs_json TEXT,
            image_url TEXT NOT NULL,
            availability_status TEXT DEFAULT 'available',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machinery_id INTEGER NOT NULL,
            farmer_id INTEGER NOT NULL,
            owner_id INTEGER NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            total_days INTEGER NOT NULL,
            daily_price REAL NOT NULL,
            total_price REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            farmer_notes TEXT,
            owner_response_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (machinery_id) REFERENCES machinery(id) ON DELETE CASCADE,
            FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            farmer_id INTEGER NOT NULL,
            owner_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            payment_method TEXT DEFAULT 'Simulated UPI',
            transaction_id TEXT NOT NULL UNIQUE,
            payment_status TEXT DEFAULT 'paid',
            invoice_number TEXT NOT NULL UNIQUE,
            paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
            FOREIGN KEY (farmer_id) REFERENCES users(id),
            FOREIGN KEY (owner_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            machinery_id INTEGER NOT NULL,
            farmer_id INTEGER NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
            FOREIGN KEY (machinery_id) REFERENCES machinery(id) ON DELETE CASCADE,
            FOREIGN KEY (farmer_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS rental_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            machinery_id INTEGER NOT NULL,
            farmer_id INTEGER NOT NULL,
            owner_id INTEGER NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            total_amount REAL NOT NULL,
            completion_status TEXT DEFAULT 'Completed',
            completion_notes TEXT,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
            FOREIGN KEY (machinery_id) REFERENCES machinery(id),
            FOREIGN KEY (farmer_id) REFERENCES users(id),
            FOREIGN KEY (owner_id) REFERENCES users(id)
        );
        """)
        conn.commit()

    # Seed default data if users table is empty
    seed_if_empty(cur, conn)
    conn.close()
    print("[DATABASE] Initialization & verification complete!")

def seed_if_empty(cur, conn):
    cur.execute("SELECT COUNT(*) as cnt FROM users" if _use_mysql else "SELECT COUNT(*) as cnt FROM users")
    res = cur.fetchone()
    count = res['cnt'] if _use_mysql else res[0]

    if count == 0:
        print("[DATABASE] Seeding initial demonstration data...")
        admin_hash = generate_password_hash('admin123')
        owner_hash = generate_password_hash('owner123')
        farmer_hash = generate_password_hash('farmer123')

        users = [
            (1, 'AgriRent Administrator', 'admin@agrirent.com', admin_hash, '+91 98765 00001', 'admin', 'Agri Hub Central', 'Mysuru', 'Karnataka'),
            (2, 'Ramesh Patel (Machinery Owner)', 'owner@agrirent.com', owner_hash, '+91 98450 12345', 'owner', 'Srirangapatna', 'Mandya', 'Karnataka'),
            (3, 'Vikram Deshmukh (Machinery Owner)', 'vikram@agrirent.com', owner_hash, '+91 94220 98765', 'owner', 'Baramati', 'Pune', 'Maharashtra'),
            (4, 'Suresh Gowda (Farmer)', 'farmer@agrirent.com', farmer_hash, '+91 97310 54321', 'farmer', 'Hunsur', 'Mysuru', 'Karnataka'),
            (5, 'Anand Patil (Farmer)', 'anand@agrirent.com', farmer_hash, '+91 98900 11223', 'farmer', 'Shirur', 'Pune', 'Maharashtra')
        ]

        user_sql = format_query("INSERT INTO users (id, full_name, email, password_hash, mobile, role, village, district, state) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)")
        for u in users:
            cur.execute(user_sql, u)

        # Machinery seed
        machinery = [
            (1, 2, 'Mahindra 575 DI 4WD Tractor', 'Tractor', '2023',
             'Heavy-duty 45 HP multi-utility tractor with power steering and fuel-efficient m-Boost engine. Ideal for ploughing, rotavating, and haulage.',
             1800.0, 'Srirangapatna', 'Mandya', 'Karnataka',
             '{"horsepower": "45 HP", "fuel_type": "Diesel", "pto_rpm": "540", "condition": "Excellent", "operator_available": true}',
             'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', 'available'),

            (2, 2, 'Preet 987 Self-Propelled Harvester', 'Harvester', '2022',
             'Multi-crop combine harvester equipped with heavy-duty cutter bar. Perfect for wheat, paddy, and soybean harvesting with minimal grain loss.',
             4500.0, 'Srirangapatna', 'Mandya', 'Karnataka',
             '{"horsepower": "101 HP", "fuel_type": "Diesel", "cutter_width": "14 feet", "condition": "Serviced", "grain_tank": "2100 L"}',
             'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=800&q=80', 'available'),

            (3, 2, 'Shaktiman Rotary Tiller (Rotavator)', 'Rotavator', '2023',
             '7-foot heavy-duty rotary tiller with Boron steel blades. Produces excellent seedbed preparation in single pass in dry and wetland.',
             1200.0, 'Srirangapatna', 'Mandya', 'Karnataka',
             '{"working_width": "2.1 m", "blade_type": "L-type", "gear_drive": "Multi-speed", "condition": "Like New"}',
             'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800&q=80', 'available'),

            (4, 3, 'John Deere 5050 D Tractor', 'Tractor', '2024',
             '50 HP high-torque engine with collarshift transmission. Excellent for deep tillage and laser levelling applications.',
             2100.0, 'Baramati', 'Pune', 'Maharashtra',
             '{"horsepower": "50 HP", "fuel_type": "Diesel", "lifting_capacity": "1600 kg", "condition": "Brand New"}',
             'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80', 'available'),

            (5, 3, 'VST Shakti 130 DI Power Tiller', 'Power Tiller', '2022',
             '13 HP lightweight power tiller specifically tailored for wetland puddling, inter-cultivation and horticulture orchards.',
             950.0, 'Baramati', 'Pune', 'Maharashtra',
             '{"horsepower": "13 HP", "fuel_type": "Diesel", "rotary_blades": "16", "condition": "Good"}',
             'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80', 'available'),

            (6, 2, 'ASPEE Tractor-Mounted Boom Sprayer', 'Sprayer', '2023',
             '400-liter capacity boom sprayer with 12 nozzles covering 10-meter swath width. Ensures uniform droplet distribution for crop protection.',
             750.0, 'Hunsur', 'Mysuru', 'Karnataka',
             '{"tank_capacity": "400 L", "pressure_bar": "40 Bar", "boom_length": "10 m", "condition": "Excellent"}',
             'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80', 'available'),

            (7, 3, 'National 9-Tyne Automatic Seed Drill', 'Seed Drill', '2023',
             'Precise seed cum fertilizer drill with adjustable metering mechanisms. Suitable for wheat, gram, maize, and mustard sowing.',
             1100.0, 'Shirur', 'Pune', 'Maharashtra',
             '{"rows": "9 Rows", "spacing": "Adjustable", "box_capacity": "80 kg", "condition": "Excellent"}',
             'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80', 'available'),

            (8, 2, 'Lemken 3-Bottom Reversible Hydraulic Plough', 'Plough', '2023',
             'Heavy-duty mould board reversible plough with hydraulic turnover device. Ideal for tough soil and deep root-zone aeration.',
             850.0, 'Srirangapatna', 'Mandya', 'Karnataka',
             '{"bottoms": "3", "underframe_clearance": "75 cm", "condition": "Good"}',
             'https://images.unsplash.com/photo-1595838725922-a8c88686f376?auto=format&fit=crop&w=800&q=80', 'available')
        ]

        m_sql = format_query("INSERT INTO machinery (id, owner_id, name, category, model_year, description, rental_price_per_day, location_village, location_district, location_state, specs_json, image_url, availability_status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)")
        for m in machinery:
            cur.execute(m_sql, m)

        # Bookings seed
        bookings = [
            (1, 1, 4, 2, '2026-10-15', '2026-10-18', 4, 1800.0, 7200.0, 'completed', 'Need for paddy land preparation in Hunsur.', 'Approved on time. Equipment delivered in good order.'),
            (2, 2, 4, 2, '2026-11-01', '2026-11-05', 5, 4500.0, 22500.0, 'active', 'Combine harvester needed for paddy harvesting season.', 'Accepted with certified operator.'),
            (3, 3, 4, 2, '2026-11-20', '2026-11-22', 3, 1200.0, 3600.0, 'pending', 'Rotavator needed for post-harvest soil conditioning.', None),
            (4, 4, 5, 3, '2026-10-25', '2026-10-28', 4, 2100.0, 8400.0, 'completed', 'Deep tilling for sugarcane planting.', 'Returned on time and clean.'),
            (5, 5, 5, 3, '2026-11-12', '2026-11-14', 3, 950.0, 2850.0, 'accepted', 'Wetland puddling for vegetable nursery.', 'Accepted. Will deliver machine by 7 AM.')
        ]

        b_sql = format_query("INSERT INTO bookings (id, machinery_id, farmer_id, owner_id, start_date, end_date, total_days, daily_price, total_price, status, farmer_notes, owner_response_notes) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)")
        for b in bookings:
            cur.execute(b_sql, b)

        # Payments seed
        payments = [
            (1, 1, 4, 2, 7200.0, 'Simulated UPI (GooglePay)', 'TXN-AGRI-98234710', 'paid', 'INV-2026-00101', '2026-10-14 10:30:00'),
            (2, 2, 4, 2, 22500.0, 'Simulated Net Banking (SBI)', 'TXN-AGRI-98234855', 'paid', 'INV-2026-00102', '2026-10-31 16:45:00'),
            (3, 4, 5, 3, 8400.0, 'Simulated UPI (PhonePe)', 'TXN-AGRI-98234901', 'paid', 'INV-2026-00103', '2026-10-24 14:15:00'),
            (4, 5, 5, 3, 2850.0, 'Simulated Card (Visa)', 'TXN-AGRI-98234988', 'paid', 'INV-2026-00104', '2026-11-10 09:00:00')
        ]

        p_sql = format_query("INSERT INTO payments (id, booking_id, farmer_id, owner_id, amount, payment_method, transaction_id, payment_status, invoice_number, paid_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)")
        for p in payments:
            cur.execute(p_sql, p)

        # Reviews seed
        reviews = [
            (1, 1, 1, 4, 5, 'The Mahindra 575 DI tractor was in top condition! Plowing was completed ahead of schedule and fuel efficiency was superb.'),
            (2, 4, 4, 5, 5, 'John Deere 5050 D is extremely powerful! High torque handled the heavy clay soil with ease. Ramesh was very cooperative.')
        ]

        r_sql = format_query("INSERT INTO reviews (id, booking_id, machinery_id, farmer_id, rating, comment) VALUES (%s, %s, %s, %s, %s, %s)")
        for r in reviews:
            cur.execute(r_sql, r)

        # Rental history seed
        history = [
            (1, 1, 1, 4, 2, '2026-10-15', '2026-10-18', 7200.0, 'Completed', 'Rental completed successfully. Tractor returned in clean working condition.'),
            (2, 4, 4, 5, 3, '2026-10-25', '2026-10-28', 8400.0, 'Completed', 'Deep tillage work completed for sugarcane. Equipment returned safely.')
        ]

        h_sql = format_query("INSERT INTO rental_history (id, booking_id, machinery_id, farmer_id, owner_id, start_date, end_date, total_amount, completion_status, completion_notes) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)")
        for h in history:
            cur.execute(h_sql, h)

        if not _use_mysql:
            conn.commit()
        print("[DATABASE] Seeding finished successfully!")

