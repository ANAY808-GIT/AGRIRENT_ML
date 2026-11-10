-- AgriRent ML - Complete MySQL Database Schema
-- Tables: users, machinery, bookings, payments, reviews, rental_history

CREATE DATABASE IF NOT EXISTS agrirent_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agrirent_db;

-- 1. Users Table
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

-- 2. Machinery Table
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

-- 3. Bookings Table
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

-- 4. Payments Table
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

-- 5. Reviews Table
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

-- 6. Rental History Table
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

-- Indexes for fast querying
CREATE INDEX idx_machinery_category ON machinery(category);
CREATE INDEX idx_machinery_district ON machinery(location_district);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_bookings_status ON bookings(status);

