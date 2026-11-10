"""
AgriRent ML - End-to-End Test Suite
Validates all phases: Auth, Fleet CRUD, Conflict-Free Booking, Simulated Payments,
Reviews, ML Predictions, and Admin Governance.
"""

import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from app import app

def run_tests():
    client = app.test_client()
    print("=" * 60)
    print("AGRIRENT ML - COMPREHENSIVE END-TO-END VALIDATION")
    print("=" * 60)

    # 1. Health & Status
    res = client.get('/api/health')
    assert res.status_code == 200, "Health check failed"
    print("✓ Phase 1: Health check OK ->", res.json['app'])

    # 2. ML Metrics & Algorithms
    res = client.get('/api/ml/metrics')
    assert res.status_code == 200, "ML metrics failed"
    data = res.json
    print(f"✓ Phase 2: ML Metrics OK -> Best Model: {data['best_model']}, Total Records: {data['total_records']}")
    for model_name, m in data['metrics'].items():
        print(f"   - {model_name}: R²={m['r2_score']}, RMSE={m['rmse']}, MAE={m['mae']}")

    # 3. ML Live Prediction
    pred_payload = {
        'machinery_type': 'Harvester',
        'state': 'Karnataka',
        'district': 'Mysuru',
        'month': 10,
        'season': 'Kharif',
        'crop_type': 'Paddy',
        'farm_size_acres': 20.0,
        'rental_price_per_day_inr': 4500
    }
    res = client.post('/api/ml/predict', json=pred_payload)
    assert res.status_code == 200, "Prediction failed"
    pred_data = res.json['data']
    print(f"✓ Phase 3: ML Demand Prediction OK -> {pred_data['predicted_demand']} units ({pred_data['demand_level']} Demand)")
    print(f"   Cluster: {pred_data['cluster_zone']}")

    # 4. Authentication - Demo Logins
    res_owner = client.post('/api/auth/login', json={'email': 'owner@agrirent.com', 'password': 'owner123'})
    assert res_owner.status_code == 200, "Owner login failed"
    owner_token = res_owner.json['token']
    owner_headers = {'Authorization': f'Bearer {owner_token}'}
    print("✓ Phase 4: Owner Login OK ->", res_owner.json['user']['full_name'])

    res_farmer = client.post('/api/auth/login', json={'email': 'farmer@agrirent.com', 'password': 'farmer123'})
    assert res_farmer.status_code == 200, "Farmer login failed"
    farmer_token = res_farmer.json['token']
    farmer_headers = {'Authorization': f'Bearer {farmer_token}'}
    print("✓ Phase 5: Farmer Login OK ->", res_farmer.json['user']['full_name'])

    res_admin = client.post('/api/auth/login', json={'email': 'admin@agrirent.com', 'password': 'admin123'})
    assert res_admin.status_code == 200, "Admin login failed"
    admin_token = res_admin.json['token']
    admin_headers = {'Authorization': f'Bearer {admin_token}'}
    print("✓ Phase 6: Admin Login OK ->", res_admin.json['user']['full_name'])

    # 5. Owner Adds Machinery
    new_machine = {
        'name': 'Swaraj 855 FE 52 HP Tractor',
        'category': 'Tractor',
        'model_year': '2024',
        'description': 'Heavy duty 52 HP tractor with high fuel economy and reverse PTO.',
        'rental_price_per_day': 1950.0,
        'location_village': 'Srirangapatna',
        'location_district': 'Mandya',
        'location_state': 'Karnataka',
        'availability_status': 'available',
        'specs': {'horsepower': '52 HP', 'fuel_type': 'Diesel'}
    }
    res_add = client.post('/api/machinery', json=new_machine, headers=owner_headers)
    assert res_add.status_code == 201, f"Add machinery failed: {res_add.json}"
    new_m_id = res_add.json['machinery_id']
    print(f"✓ Phase 7: Owner Added Machinery OK -> ID #{new_m_id}")

    # 6. Farmer Submits Booking Request
    booking_req = {
        'machinery_id': new_m_id,
        'start_date': '2026-12-05',
        'end_date': '2026-12-08',
        'farmer_notes': 'Need for sugarcane deep tillage.'
    }
    res_book = client.post('/api/bookings', json=booking_req, headers=farmer_headers)
    assert res_book.status_code == 201, f"Booking request failed: {res_book.json}"
    booking_id = res_book.json['booking_id']
    total_price = res_book.json['total_price']
    print(f"✓ Phase 8: Farmer Booking Request OK -> ID #{booking_id}, Total: ₹{total_price}")

    # 7. Owner Accepts Booking
    res_accept = client.put(f'/api/bookings/{booking_id}/status', json={'status': 'accepted', 'owner_notes': 'Accepted with full tank fuel.'}, headers=owner_headers)
    assert res_accept.status_code == 200, f"Owner accept failed: {res_accept.json}"
    print(f"✓ Phase 9: Owner Accepted Booking #{booking_id}")

    # 8. Test Double-Booking Conflict Prevention
    conflict_req = {
        'machinery_id': new_m_id,
        'start_date': '2026-12-06',
        'end_date': '2026-12-09',
        'farmer_notes': 'Another booking overlapping.'
    }
    res_conflict = client.post('/api/bookings', json=conflict_req, headers=farmer_headers)
    assert res_conflict.status_code == 409, "Double booking was NOT prevented!"
    print(f"✓ Phase 10: Conflict-Free Double Booking Guard Passed! -> {res_conflict.json['error']}")

    # 9. Farmer Executes Simulated Payment
    res_pay = client.post('/api/payments/process', json={'booking_id': booking_id, 'payment_method': 'Simulated UPI (GooglePay)'}, headers=farmer_headers)
    assert res_pay.status_code == 200, f"Payment failed: {res_pay.json}"
    print(f"✓ Phase 11: Simulated Payment Settled -> Txn ID: {res_pay.json['transaction_id']}, Invoice: {res_pay.json['invoice_number']}")

    # 10. Complete Rental & Archive to History
    res_comp = client.post(f'/api/bookings/{booking_id}/complete', headers=owner_headers)
    assert res_comp.status_code == 200, f"Complete rental failed: {res_comp.json}"
    print(f"✓ Phase 12: Rental Completed & Archived to Rental History")

    # 11. Farmer Submits Review
    res_rev = client.post('/api/reviews', json={'booking_id': booking_id, 'rating': 5, 'comment': 'Swaraj 855 was in prime condition! Fuel efficiency exceeded expectations.'}, headers=farmer_headers)
    assert res_rev.status_code == 201, f"Review failed: {res_rev.json}"
    print(f"✓ Phase 13: Review & 5-Star Rating Submitted OK")

    # 12. Admin Stats & Analytics
    res_stats = client.get('/api/admin/stats', headers=admin_headers)
    assert res_stats.status_code == 200, "Admin stats failed"
    st = res_stats.json['stats']
    print(f"✓ Phase 14: Admin Control Dashboard OK -> Users: {st['total_users']}, Machinery: {st['total_machinery']}, Total Bookings: {st['total_bookings']}, Revenue: ₹{st['total_revenue']}")

    print("=" * 60)
    print("ALL 14 VALIDATION PHASES PASSED WITH ZERO ERRORS!")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()

