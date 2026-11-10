-- AgriRent ML - Demonstration Seed Data

USE agrirent_db;

-- 1. Insert Default Users (Admin, Owners, Farmers)
-- Passwords hashed using werkzeug generate_password_hash ('admin123', 'owner123', 'farmer123')
-- We use sha256 or werkzeug scrypt hash in the python script.

INSERT INTO users (id, full_name, email, password_hash, mobile, role, village, district, state) VALUES
(1, 'Administrator', 'admin@agrirent.com', 'scrypt:32768:8:1$i3P9qE5R$dummyhashadmin', '+91 98765 00001', 'admin', 'Kaveri Nagar', 'Mysuru', 'Karnataka'),
(2, 'Ramesh Patel', 'owner@agrirent.com', 'scrypt:32768:8:1$i3P9qE5R$dummyhashowner', '+91 98450 12345', 'owner', 'Srirangapatna', 'Mandya', 'Karnataka'),
(3, 'Vikram Singh', 'vikram@agrirent.com', 'scrypt:32768:8:1$i3P9qE5R$dummyhashowner2', '+91 94220 98765', 'owner', 'Baramati', 'Pune', 'Maharashtra'),
(4, 'Suresh Gowda', 'farmer@agrirent.com', 'scrypt:32768:8:1$i3P9qE5R$dummyhashfarmer', '+91 97310 54321', 'farmer', 'Hunsur', 'Mysuru', 'Karnataka'),
(5, 'Anand Deshmukh', 'anand@agrirent.com', 'scrypt:32768:8:1$i3P9qE5R$dummyhashfarmer2', '+91 98900 11223', 'farmer', 'Shirur', 'Pune', 'Maharashtra');

-- 2. Insert Machinery
INSERT INTO machinery (id, owner_id, name, category, model_year, description, rental_price_per_day, location_village, location_district, location_state, specs_json, image_url, availability_status) VALUES
(1, 2, 'Mahindra 575 DI 4WD Tractor', 'Tractor', '2023', 'Heavy-duty 45 HP multi-utility tractor with power steering and fuel-efficient m-Boost engine. Ideal for ploughing, rotavating, and haulage.', 1800.00, 'Srirangapatna', 'Mandya', 'Karnataka', '{"horsepower": "45 HP", "fuel_type": "Diesel", "pto_rpm": "540", "condition": "Excellent", "operator_available": true}', 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', 'available'),
(2, 2, 'Preet 987 Self-Propelled Harvester', 'Harvester', '2022', 'Multi-crop combine harvester equipped with heavy-duty cutter bar. Perfect for wheat, paddy, and soybean harvesting with minimal grain loss.', 4500.00, 'Srirangapatna', 'Mandya', 'Karnataka', '{"horsepower": "101 HP", "fuel_type": "Diesel", "cutter_width": "14 feet", "condition": "Serviced", "grain_tank": "2100 L"}', 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=800&q=80', 'available'),
(3, 2, 'Shaktiman Rotary Tiller (Rotavator)', 'Rotavator', '2023', '7-foot heavy-duty rotary tiller with Boron steel blades. Produces excellent seedbed preparation in single pass in dry and wetland.', 1200.00, 'Srirangapatna', 'Mandya', 'Karnataka', '{"working_width": "2.1 m", "blade_type": "L-type", "gear_drive": "Multi-speed", "condition": "Like New"}', 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800&q=80', 'available'),
(4, 3, 'John Deere 5050 D Tractor', 'Tractor', '2024', '50 HP high-torque engine with collarshift transmission. Excellent for deep tillage and laser levelling applications.', 2100.00, 'Baramati', 'Pune', 'Maharashtra', '{"horsepower": "50 HP", "fuel_type": "Diesel", "lifting_capacity": "1600 kg", "condition": "Brand New"}', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80', 'available'),
(5, 3, 'VST Shakti 130 DI Power Tiller', 'Power Tiller', '2022', '13 HP lightweight power tiller specifically tailored for wetland puddling, inter-cultivation and horticulture orchards.', 950.00, 'Baramati', 'Pune', 'Maharashtra', '{"horsepower": "13 HP", "fuel_type": "Diesel", "rotary_blades": "16", "condition": "Good"}', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80', 'available'),
(6, 2, 'ASPEE Tractor-Mounted Boom Sprayer', 'Sprayer', '2023', '400-liter capacity boom sprayer with 12 nozzles covering 10-meter swath width. Ensures uniform droplet distribution for crop protection.', 750.00, 'Hunsur', 'Mysuru', 'Karnataka', '{"tank_capacity": "400 L", "pressure_bar": "40 Bar", "boom_length": "10 m", "condition": "Excellent"}', 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80', 'available'),
(7, 3, 'National 9-Tyne Automatic Seed Drill', 'Seed Drill', '2023', 'Precise seed cum fertilizer drill with adjustable metering mechanisms. Suitable for wheat, gram, maize, and mustard sowing.', 1100.00, 'Shirur', 'Pune', 'Maharashtra', '{"rows": "9 Rows", "spacing": "Adjustable", "box_capacity": "80 kg", "condition": "Excellent"}', 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80', 'available');

-- 3. Insert Demonstration Bookings
INSERT INTO bookings (id, machinery_id, farmer_id, owner_id, start_date, end_date, total_days, daily_price, total_price, status, farmer_notes, owner_response_notes) VALUES
(1, 1, 4, 2, '2026-10-15', '2026-10-18', 4, 1800.00, 7200.00, 'completed', 'Need for paddy land preparation in Hunsur.', 'Approved on time. Equipment delivered in good order.'),
(2, 2, 4, 2, '2026-11-01', '2026-11-03', 3, 4500.00, 13500.00, 'active', 'Combine harvester needed for paddy harvesting season.', 'Accepted with certified operator.'),
(3, 3, 4, 2, '2026-11-15', '2026-11-17', 3, 1200.00, 3600.00, 'pending', 'Rotavator needed for post-harvest soil conditioning.', NULL);

-- 4. Insert Payments
INSERT INTO payments (id, booking_id, farmer_id, owner_id, amount, payment_method, transaction_id, payment_status, invoice_number, paid_at) VALUES
(1, 1, 4, 2, 7200.00, 'Simulated UPI (GooglePay)', 'TXN-AGRI-98234710', 'paid', 'INV-2026-00101', '2026-10-14 10:30:00'),
(2, 2, 4, 2, 13500.00, 'Simulated Net Banking (SBI)', 'TXN-AGRI-98234855', 'paid', 'INV-2026-00102', '2026-10-31 16:45:00');

-- 5. Insert Reviews
INSERT INTO reviews (id, booking_id, machinery_id, farmer_id, rating, comment) VALUES
(1, 1, 1, 4, 5, 'The Mahindra 575 DI tractor was in top condition! Plowing was completed ahead of schedule and the fuel efficiency was superb.');

-- 6. Insert Rental History
INSERT INTO rental_history (id, booking_id, machinery_id, farmer_id, owner_id, start_date, end_date, total_amount, completion_status, completion_notes) VALUES
(1, 1, 1, 4, 2, '2026-10-15', '2026-10-18', 7200.00, 'Completed', 'Rental completed successfully. Tractor returned in clean working condition.');

