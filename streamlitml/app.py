import streamlit as st
import pandas as pd
import numpy as np
import datetime
import plotly.express as px
import plotly.graph_objects as go
from utils.data_manager import (
    init_db, get_machinery_list, get_machinery_by_id, add_machinery_record,
    toggle_machinery_availability, delete_machinery_record, create_booking_request,
    update_booking_status, get_owner_booking_requests, get_farmer_bookings,
    process_payment_and_invoice, add_machinery_review, get_reviews_for_machinery,
    get_admin_metrics, register_user, get_user_by_email
)
from utils.ml_engine import predict_demand, get_algorithm_benchmarks

# Page Configuration
st.set_page_config(
    page_title="AgriRent ML - Smart Machinery Rental & Demand Prediction",
    page_icon="🚜",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Relational Database
init_db()

# Custom Agricultural Styling
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(135deg, #14532d 0%, #15803d 100%);
        padding: 24px 32px;
        border-radius: 16px;
        color: white;
        margin-bottom: 24px;
        box-shadow: 0 4px 14px rgba(20, 83, 45, 0.15);
    }
    .metric-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    }
    .stButton>button {
        border-radius: 8px;
        font-weight: 600;
    }
    .badge-status {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

# Session State Initialization
if 'role' not in st.session_state:
    st.session_state.role = 'farmer' # Default demo role
if 'user_id' not in st.session_state:
    st.session_state.user_id = 4 # Suresh Gowda (Farmer)
if 'user_name' not in st.session_state:
    st.session_state.user_name = "Suresh Gowda"
if 'search_query' not in st.session_state:
    st.session_state.search_query = ""

# Sidebar: Role Switching & Profile
with st.sidebar:
    st.markdown("### 🚜 **AgriRent ML**")
    st.caption("Smart Machinery Rental & Demand Prediction")
    st.divider()

    st.markdown("#### 👤 Select Active User Role")
    selected_role_label = st.radio(
        "Current Perspective:",
        ["🌾 Farmer / Field Owner", "🚜 Machinery Owner", "🛡️ Platform Administrator", "🏠 Public Guest View"],
        index=0 if st.session_state.role == 'farmer' else (1 if st.session_state.role == 'owner' else (2 if st.session_state.role == 'admin' else 3))
    )

    if "Farmer" in selected_role_label and st.session_state.role != 'farmer':
        st.session_state.role = 'farmer'
        st.session_state.user_id = 4
        st.session_state.user_name = "Suresh Gowda (Farmer)"
        st.rerun()
    elif "Machinery Owner" in selected_role_label and st.session_state.role != 'owner':
        st.session_state.role = 'owner'
        st.session_state.user_id = 2
        st.session_state.user_name = "Ramesh Patel (Owner)"
        st.rerun()
    elif "Administrator" in selected_role_label and st.session_state.role != 'admin':
        st.session_state.role = 'admin'
        st.session_state.user_id = 1
        st.session_state.user_name = "AgriRent Administrator"
        st.rerun()
    elif "Public Guest" in selected_role_label and st.session_state.role != 'guest':
        st.session_state.role = 'guest'
        st.session_state.user_name = "Guest User"
        st.rerun()

    st.info(f"**Logged in as:**\n{st.session_state.user_name}")

    st.divider()
    st.markdown("#### 🎙️ Voice Search Shortcuts")
    st.caption("Click to trigger simulated Speech-to-Text inputs:")
    col_v1, col_v2 = st.columns(2)
    with col_v1:
        if st.button("🚜 Mahindra"):
            st.session_state.search_query = "Mahindra"
            st.rerun()
        if st.button("🌱 Rotavator"):
            st.session_state.search_query = "Rotavator"
            st.rerun()
    with col_v2:
        if st.button("🌾 Harvester"):
            st.session_state.search_query = "Harvester"
            st.rerun()
        if st.button("⚡ Power Tiller"):
            st.session_state.search_query = "Power Tiller"
            st.rerun()

    st.divider()
    st.caption("AgriRent ML v2.0 • Full Stack Streamlit Platform")

# ==============================================================================
# VIEW 1: PUBLIC GUEST / LANDING PAGE
# ==============================================================================
if st.session_state.role == 'guest':
    st.markdown("""
    <div class="main-header">
        <h1 style="margin:0; font-size:32px;">🌾 AgriRent ML Platform</h1>
        <p style="margin:8px 0 0 0; font-size:16px; opacity:0.9;">
            Affordable, On-Demand Farm Mechanization with Machine Learning Demand Forecasting
        </p>
    </div>
    """, unsafe_allow_html=True)

    # Hero Quick Search
    c_s1, c_s2 = st.columns([4, 1])
    with c_s1:
        search_kw = st.text_input("🔍 Search equipment by name, category, or location...", value=st.session_state.search_query, placeholder="e.g. 50 HP Tractor, Combine Harvester...")
    with c_s2:
        st.markdown("<div style='height:28px;'></div>", unsafe_allow_html=True)
        if st.button("Clear Search", use_container_width=True):
            st.session_state.search_query = ""
            st.rerun()

    # Category Highlights
    st.markdown("### 🚜 Browse Popular Equipment")
    cats = ["All Categories", "Tractor", "Harvester", "Rotavator", "Power Tiller", "Seed Drill", "Sprayer"]
    sel_cat = st.segmented_control("Equipment Category", cats, default="All Categories")

    machinery_items = get_machinery_list(category=sel_cat, search=search_kw, available_only=False)

    if not machinery_items:
        st.warning("No machinery matching your search criteria.")
    else:
        cols = st.columns(3)
        for i, m in enumerate(machinery_items):
            with cols[i % 3]:
                with st.container(border=True):
                    st.image(m['image_url'], use_container_width=True)
                    st.markdown(f"#### {m['name']}")
                    st.markdown(f"🏷️ **{m['category']}** • 📍 {m['district']}, {m['state']}")
                    st.markdown(f"💰 **₹{m['rental_price_per_day']:,.0f}** / day")
                    st.caption(f"⭐ {m['avg_rating']:.1f} ({m['review_count']} reviews) • Owner: {m['owner_name']}")
                    if st.button(f"Rent {m['name'][:15]}...", key=f"guest_rent_{m['id']}"):
                        st.session_state.role = 'farmer'
                        st.session_state.user_id = 4
                        st.session_state.user_name = "Suresh Gowda (Farmer)"
                        st.success("Switched to Farmer view to book machinery!")
                        st.rerun()

    st.divider()
    # Value Proposition
    c_v1, c_v2, c_v3 = st.columns(3)
    with c_v1:
        st.markdown("#### 🤝 Zero Capital Expense")
        st.write("Access modern high-tonnage tractors and harvesters without taking on lakhs in debt.")
    with c_v2:
        st.markdown("#### 🔒 Conflict-Free Guarantee")
        st.write("Strict double-booking prevention engine protects owners and farmers from overlapping dates.")
    with c_v3:
        st.markdown("#### 🤖 Predictive AI Forecasting")
        st.write("Our trained Linear Regression & Clustering models forecast monthly equipment demand by crop and weather.")

# ==============================================================================
# VIEW 2: FARMER / FIELD OWNER PORTAL
# ==============================================================================
elif st.session_state.role == 'farmer':
    st.markdown("""
    <div class="main-header">
        <h1 style="margin:0; font-size:28px;">🌾 Farmer / Field Owner Portal</h1>
        <p style="margin:6px 0 0 0; font-size:15px; opacity:0.9;">
            Welcome back, <b>Suresh Gowda</b> • Browse machinery, manage reservations, and view ML recommendations
        </p>
    </div>
    """, unsafe_allow_html=True)

    farmer_bookings = get_farmer_bookings(st.session_state.user_id)
    total_b = len(farmer_bookings)
    pending_b = sum(1 for b in farmer_bookings if b['status'] == 'pending')
    active_b = sum(1 for b in farmer_bookings if b['status'] == 'active')
    completed_b = sum(1 for b in farmer_bookings if b['status'] == 'completed')
    total_spent = sum(b['total_amount'] for b in farmer_bookings if b['status'] in ['active', 'completed'])

    # Farmer KPI Stats
    col_k1, col_k2, col_k3, col_k4, col_k5 = st.columns(5)
    col_k1.metric("Total Bookings", total_b)
    col_k2.metric("Pending Approval", pending_b)
    col_k3.metric("Active Rentals", active_b)
    col_k4.metric("Completed", completed_b)
    col_k5.metric("Total Spent", f"₹{total_spent:,.0f}")

    tab_market, tab_bookings, tab_active, tab_pay, tab_recs = st.tabs([
        "🛒 Marketplace & Booking", "📋 My Bookings", "⏱️ Active Rentals", "💳 Invoices & Payments", "🤖 ML Recommendations"
    ])

    # 1. Marketplace & Booking Tab
    with tab_market:
        c_f1, c_f2, c_f3 = st.columns([3, 2, 2])
        with c_f1:
            farmer_search = st.text_input("🔍 Search machinery or location", value=st.session_state.search_query, placeholder="e.g. Tractor, Ludhiana...")
        with c_f2:
            cat_filter = st.selectbox("Category", ["All Categories", "Tractor", "Harvester", "Rotavator", "Power Tiller", "Seed Drill", "Sprayer"])
        with c_f3:
            max_pr = st.slider("Max Daily Price (₹)", 500, 10000, 8000, step=250)

        market_items = get_machinery_list(category=cat_filter, search=farmer_search, max_price=max_pr)

        st.markdown(f"Showing **{len(market_items)}** available implements:")
        cols = st.columns(3)
        for i, m in enumerate(market_items):
            with cols[i % 3]:
                with st.container(border=True):
                    st.image(m['image_url'], use_container_width=True)
                    st.markdown(f"### {m['name']}")
                    st.markdown(f"🏷️ **{m['category']}** • 📍 {m['district']}, {m['state']}")
                    st.markdown(f"💰 **₹{m['rental_price_per_day']:,.0f}** / day")
                    st.caption(f"Specs: {m['specifications'][:65]}...")
                    st.caption(f"Owner: **{m['owner_name']}** (📞 {m['owner_mobile']})")

                    with st.expander("📅 Book This Machinery"):
                        st.markdown(f"**Booking for: {m['name']}**")
                        c_d1, c_d2 = st.columns(2)
                        with c_d1:
                            start_d = st.date_input("Start Date", min_value=datetime.date.today(), key=f"s_{m['id']}")
                        with c_d2:
                            end_d = st.date_input("End Date", min_value=start_d, key=f"e_{m['id']}")

                        duration = (end_d - start_d).days + 1
                        subtot = duration * float(m['rental_price_per_day'])
                        gst_amt = subtot * 0.05
                        total_cost = subtot + gst_amt

                        st.markdown(f"Duration: **{duration} Days** | Est Total: **₹{total_cost:,.2f}** *(incl. 5% GST)*")
                        notes = st.text_input("Field Requirement Notes", placeholder="e.g. Sowing 4-acre wheat plot", key=f"n_{m['id']}")

                        if st.button("Confirm Booking Request", key=f"btn_book_{m['id']}", type="primary"):
                            ok, msg = create_booking_request(
                                farmer_id=st.session_state.user_id,
                                machinery_id=m['id'],
                                start_date=start_d.strftime("%Y-%m-%d"),
                                end_date=end_d.strftime("%Y-%m-%d"),
                                notes=notes
                            )
                            if ok:
                                st.success(f"🎉 Booking request #{msg} submitted successfully! Awaiting owner confirmation.")
                                st.rerun()
                            else:
                                st.error(f"❌ {msg}")

    # 2. My Bookings Tab
    with tab_bookings:
        st.markdown("### 📋 Booking Reservation Tracker")
        if not farmer_bookings:
            st.info("No bookings placed yet. Head over to the Marketplace to book equipment.")
        else:
            for b in farmer_bookings:
                with st.container(border=True):
                    c_b1, c_b2, c_b3, c_b4 = st.columns([1, 2, 2, 2])
                    with c_b1:
                        st.image(b['image_url'], use_container_width=True)
                    with c_b2:
                        st.markdown(f"#### {b['machinery_name']}")
                        st.caption(f"Booking ID: #AGRI-{b['id']:04d}")
                        st.write(f"Owner: **{b['owner_name']}** (📞 {b['owner_mobile']})")
                    with c_b3:
                        st.write(f"📅 **Dates:** {b['start_date']} to {b['end_date']}")
                        st.write(f"⏱️ **Duration:** {b['total_days']} Days")
                        st.write(f"💰 **Total:** ₹{b['total_amount']:,.2f}")
                    with c_b4:
                        status_color = {"pending": "orange", "confirmed": "green", "active": "blue", "rejected": "red", "completed": "gray"}.get(b['status'], "black")
                        st.markdown(f"Status: **:{status_color}[{b['status'].upper()}]**")
                        if b['status'] == 'confirmed':
                            st.caption("Owner accepted! Ready for payment to activate rental.")

    # 3. Active Rentals Tab
    with tab_active:
        st.markdown("### ⏱️ Active On-Field Rentals")
        active_items = [b for b in farmer_bookings if b['status'] == 'active']
        if not active_items:
            st.info("No active equipment rentals currently deployed.")
        else:
            for b in active_items:
                with st.container(border=True):
                    col_a1, col_a2, col_a3 = st.columns([1, 3, 2])
                    with col_a1:
                        st.image(b['image_url'], use_container_width=True)
                    with col_a2:
                        st.markdown(f"#### {b['machinery_name']}")
                        st.write(f"Rental Period: **{b['start_date']} to {b['end_date']}**")
                        st.write(f"Owner Dispatch Location: {b['location']}")
                    with col_a3:
                        st.success("✅ Machine Deployed on Field")
                        if st.button(f"Mark Completed #{b['id']}", key=f"comp_{b['id']}"):
                            update_booking_status(b['id'], 'completed')
                            st.success("Rental completed! Archived to history.")
                            st.rerun()

    # 4. Invoices & Payments Tab
    with tab_pay:
        st.markdown("### 💳 Simulated Payments & GST Tax Invoices")
        unpaid_confirmed = [b for b in farmer_bookings if b['status'] == 'confirmed']
        if unpaid_confirmed:
            st.markdown("#### Pending Payments for Confirmed Bookings:")
            for b in unpaid_confirmed:
                with st.container(border=True):
                    c_p1, c_p2, c_p3 = st.columns([2, 2, 2])
                    with c_p1:
                        st.markdown(f"**{b['machinery_name']}**")
                        st.caption(f"Rental: {b['start_date']} to {b['end_date']}")
                    with c_p2:
                        sub = float(b['total_amount'])
                        gst = sub * 0.05
                        grand = sub + gst
                        st.markdown(f"Subtotal: ₹{sub:,.2f} + GST (5%): ₹{gst:,.2f}")
                        st.markdown(f"### Payable: ₹{grand:,.2f}")
                    with c_p3:
                        pay_method = st.selectbox("Payment Method", ["UPI / QR Code", "Net Banking", "Credit / Debit Card"], key=f"method_{b['id']}")
                        if st.button("Simulate Payment & Download Invoice", key=f"pay_{b['id']}", type="primary"):
                            ok, inv = process_payment_and_invoice(b['id'], st.session_state.user_id, pay_method)
                            if ok:
                                st.success(f"Payment Settled! Txn: {inv['transaction_id']}")
                                st.rerun()

        st.divider()
        st.markdown("#### Downloadable Tax Invoices")
        paid_items = [b for b in farmer_bookings if b['payment_status'] == 'paid']
        if not paid_items:
            st.caption("No processed invoices yet.")
        else:
            for b in paid_items:
                with st.expander(f"🧾 Tax Invoice {b.get('invoice_number', 'INV')} - {b['machinery_name']}"):
                    inv_text = f"""
================================================================
           AGRIRENT ML - OFFICIAL GST TAX INVOICE
================================================================
Invoice No:    {b.get('invoice_number', 'INV-20261120-001')}
Transaction ID: {b.get('transaction_id', 'TXN-001')}
Date:          {datetime.date.today().strftime('%d-%b-%Y')}
----------------------------------------------------------------
Customer:      {st.session_state.user_name}
Implement:     {b['machinery_name']} ({b['category']})
Rental Period: {b['start_date']} to {b['end_date']} ({b['total_days']} Days)
Daily Rate:    INR {b['daily_rate']:,.2f}
----------------------------------------------------------------
Subtotal:      INR {b['total_amount']:,.2f}
CGST (2.5%):   INR {b['total_amount']*0.025:,.2f}
SGST (2.5%):   INR {b['total_amount']*0.025:,.2f}
----------------------------------------------------------------
GRAND TOTAL:   INR {b['total_amount']*1.05:,.2f}
Status:        PAID & SETTLED
================================================================
                    """
                    st.code(inv_text)
                    st.download_button(
                        label="📥 Download Invoice (TXT)",
                        data=inv_text,
                        file_name=f"{b.get('invoice_number', 'Invoice')}.txt",
                        mime="text/plain",
                        key=f"dl_{b['id']}"
                    )

    # 5. ML Recommendations Tab
    with tab_recs:
        st.markdown("### 🤖 Personalized Machine Learning Farm Recommendations")
        st.caption("Derived from regional soil, season, rainfall, and crop cycle patterns")

        col_r1, col_r2 = st.columns(2)
        with col_r1:
            farm_acres = st.number_input("Your Farm Size (Acres)", min_value=1.0, max_value=100.0, value=6.0, step=0.5)
            crop = st.selectbox("Primary Crop", ["Wheat", "Paddy", "Sugarcane", "Cotton", "Soybean", "Maize"])
        with col_r2:
            season = st.selectbox("Upcoming Season", ["Rabi", "Kharif", "Zaid"])
            rainfall_val = st.slider("Expected Local Rainfall (mm)", 10.0, 300.0, 75.0)

        # Trigger ML prediction
        preds = predict_demand({
            'machinery_type': 'Tractor',
            'state': 'Maharashtra',
            'district': 'Satara',
            'month': datetime.datetime.now().month,
            'season': season,
            'crop_type': crop,
            'farm_size': farm_acres,
            'rainfall': rainfall_val,
            'avg_temp': 24.0,
            'rental_price': 1800.0,
            'prev_bookings': 14,
            'nearby_avail': 6,
            'harvest_season': 1 if season in ['Kharif', 'Rabi'] else 0
        })

        st.success(f"**Predicted Regional Demand:** {preds['predicted_demand']} machinery units ({preds['badge']})")
        st.markdown(f"**Agronomic Cluster:** {preds['cluster_info']['title']}")
        st.write(preds['cluster_info']['desc'])

        st.markdown("#### 🌾 Advisory for Your Farm:")
        for rec in preds['farmer_recs']:
            st.markdown(f"- 💡 {rec}")

# ==============================================================================
# VIEW 3: MACHINERY OWNER PORTAL
# ==============================================================================
elif st.session_state.role == 'owner':
    st.markdown("""
    <div class="main-header">
        <h1 style="margin:0; font-size:28px;">🚜 Machinery Owner Dashboard</h1>
        <p style="margin:6px 0 0 0; font-size:15px; opacity:0.9;">
            Fleet Management Portal • <b>Ramesh Patel</b> (Satara, Maharashtra)
        </p>
    </div>
    """, unsafe_allow_html=True)

    owner_machinery = get_machinery_list() # all items, we can filter for Ramesh
    owner_bookings = get_owner_booking_requests(st.session_state.user_id)

    total_mach = len(owner_machinery)
    pending_reqs = sum(1 for b in owner_bookings if b['status'] == 'pending')
    active_rentals = sum(1 for b in owner_bookings if b['status'] == 'active')
    total_rev = sum(b['total_amount'] for b in owner_bookings if b['status'] in ['confirmed', 'active', 'completed'])

    # Owner Stats
    c_o1, c_o2, c_o3, c_o4 = st.columns(4)
    c_o1.metric("Registered Equipment", total_mach)
    c_o2.metric("Pending Requests", pending_reqs, delta=f"{pending_reqs} Action Required" if pending_reqs else None)
    c_o3.metric("Active Rentals", active_rentals)
    c_o4.metric("Total Rental Revenue", f"₹{total_rev:,.0f}")

    tab_reqs, tab_fleet, tab_add, tab_earnings, tab_ml = st.tabs([
        "📋 Booking Requests", "🚜 My Equipment Fleet", "➕ Add New Machinery", "💰 Revenue & Earnings", "📈 ML Demand Predictor"
    ])

    # 1. Booking Requests Tab
    with tab_reqs:
        st.markdown("### 📋 Incoming Farmer Booking Requests")
        if not owner_bookings:
            st.info("No incoming booking requests currently.")
        else:
            for b in owner_bookings:
                with st.container(border=True):
                    c_r1, c_r2, c_r3, c_r4 = st.columns([1, 2, 2, 2])
                    with c_r1:
                        st.image(b['image_url'], use_container_width=True)
                    with c_r2:
                        st.markdown(f"#### {b['machinery_name']}")
                        st.write(f"Farmer: **{b['farmer_name']}** (📞 {b['farmer_mobile']})")
                        st.caption(f"Location: {b['farmer_village']}, {b['farmer_district']}")
                    with c_r3:
                        st.write(f"📅 **Dates:** {b['start_date']} to {b['end_date']}")
                        st.write(f"⏱️ **Duration:** {b['total_days']} Days")
                        st.markdown(f"💰 **Amount:** ₹{b['total_amount']:,.2f}")
                    with c_r4:
                        if b['status'] == 'pending':
                            st.warning("Awaiting Decision")
                            col_acc, col_rej = st.columns(2)
                            with col_acc:
                                if st.button("Accept", key=f"acc_{b['id']}", type="primary"):
                                    update_booking_status(b['id'], 'confirmed')
                                    st.success(f"Accepted booking #{b['id']}!")
                                    st.rerun()
                            with col_rej:
                                if st.button("Reject", key=f"rej_{b['id']}"):
                                    update_booking_status(b['id'], 'rejected')
                                    st.error(f"Rejected booking #{b['id']}")
                                    st.rerun()
                        else:
                            st.markdown(f"Status: **{b['status'].upper()}**")

    # 2. My Equipment Fleet Tab
    with tab_fleet:
        st.markdown("### 🚜 Registered Fleet & Availability")
        cols = st.columns(3)
        for i, m in enumerate(owner_machinery):
            with cols[i % 3]:
                with st.container(border=True):
                    st.image(m['image_url'], use_container_width=True)
                    st.markdown(f"#### {m['name']}")
                    st.markdown(f"💰 ₹{m['rental_price_per_day']:,.0f} / day • 📍 {m['district']}")
                    is_avail = bool(m['is_available'])
                    new_avail = st.toggle("Available for Rent", value=is_avail, key=f"toggle_{m['id']}")
                    if new_avail != is_avail:
                        toggle_machinery_availability(m['id'], new_avail)
                        st.rerun()
                    if st.button("Delete Implement", key=f"del_{m['id']}"):
                        delete_machinery_record(m['id'])
                        st.success("Deleted from catalog.")
                        st.rerun()

    # 3. Add New Machinery Tab
    with tab_add:
        st.markdown("### ➕ Register New Agricultural Implement")
        with st.form("add_machinery_form", clear_on_submit=True):
            f_col1, f_col2 = st.columns(2)
            with f_col1:
                m_name = st.text_input("Machinery Name", placeholder="e.g. Swaraj 744 FE 48 HP Tractor")
                m_cat = st.selectbox("Category", ["Tractor", "Harvester", "Rotavator", "Power Tiller", "Seed Drill", "Sprayer"])
                m_price = st.number_input("Daily Rental Rate (₹)", min_value=100.0, max_value=25000.0, value=1800.0, step=50.0)
                m_loc = st.text_input("Yard / Farm Location", placeholder="e.g. Karad Highway Machinery Yard")
            with f_col2:
                m_dist = st.text_input("District", value="Satara")
                m_state = st.selectbox("State", ["Maharashtra", "Punjab", "Haryana", "Karnataka", "Uttar Pradesh", "Gujarat", "Madhya Pradesh"])
                m_img = st.text_input("Photo Image URL", value="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80")
                m_specs = st.text_area("Specifications", placeholder="Power: 48 HP | Lifting: 1500 kg | PTO: 540 RPM")

            m_desc = st.text_area("Description & Equipment Condition", placeholder="Heavy-duty tractor with modern disc brakes and power steering...")
            submitted = st.form_submit_button("Register Equipment", type="primary")
            if submitted:
                if not m_name or not m_loc:
                    st.error("Please fill in machinery name and location.")
                else:
                    new_id = add_machinery_record(st.session_state.user_id, m_name, m_cat, m_desc, m_price, m_loc, m_dist, m_state, m_img, m_specs)
                    st.success(f"🎉 Machinery '{m_name}' registered successfully with ID #{new_id}!")
                    st.rerun()

    # 4. Revenue & Earnings Tab
    with tab_earnings:
        st.markdown("### 💰 Monthly Rental Revenue Trends")
        months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"]
        earnings = [12500, 18900, 24000, 38500, 42000, 31200]
        df_rev = pd.DataFrame({"Month": months, "Revenue (₹)": earnings})
        fig = px.bar(df_rev, x="Month", y="Revenue (₹)", text_auto=True, color="Revenue (₹)", color_continuous_scale="greens")
        fig.update_layout(height=350, margin=dict(l=20, r=20, t=30, b=20))
        st.plotly_chart(fig, use_container_width=True)

    # 5. ML Demand Predictor Tab
    with tab_ml:
        st.markdown("### 📈 Real-Time Machine Learning Demand Forecasting")
        st.caption("Powered by Scikit-Learn trained Linear Regression (Validation R² = 0.8696)")

        p_col1, p_col2, p_col3 = st.columns(3)
        with p_col1:
            sel_mach = st.selectbox("Machinery Type", ["Tractor", "Harvester", "Rotavator", "Power Tiller", "Seed Drill", "Sprayer"], key="pred_mach")
            sel_state = st.selectbox("State", ["Maharashtra", "Punjab", "Haryana", "Karnataka"], key="pred_state")
            sel_dist = st.selectbox("District", ["Satara", "Ludhiana", "Karnal", "Mandya", "Pune"], key="pred_dist")
        with p_col2:
            sel_month = st.slider("Month", 1, 12, datetime.datetime.now().month, key="pred_month")
            sel_season = st.selectbox("Season", ["Rabi", "Kharif", "Zaid"], key="pred_season")
            sel_crop = st.selectbox("Crop Type", ["Wheat", "Paddy", "Cotton", "Sugarcane", "Soybean"], key="pred_crop")
        with p_col3:
            sel_rainfall = st.slider("Rainfall (mm)", 10.0, 300.0, 65.0, key="pred_rain")
            sel_temp = st.slider("Average Temp (°C)", 15.0, 45.0, 26.0, key="pred_temp")
            sel_rate = st.number_input("Rental Rate (₹/day)", min_value=500.0, max_value=15000.0, value=1800.0, key="pred_rate")

        pred_res = predict_demand({
            'machinery_type': sel_mach,
            'state': sel_state,
            'district': sel_dist,
            'month': sel_month,
            'season': sel_season,
            'crop_type': sel_crop,
            'farm_size': 8.0,
            'rainfall': sel_rainfall,
            'avg_temp': sel_temp,
            'rental_price': sel_rate,
            'prev_bookings': 18,
            'nearby_avail': 7,
            'harvest_season': 1 if sel_month in [10, 11, 12, 3, 4] else 0
        })

        st.markdown("---")
        m_c1, m_c2, m_c3 = st.columns(3)
        m_c1.metric("Predicted Monthly Demand", f"{pred_res['predicted_demand']} Units")
        m_c2.metric("Demand Pressure Tier", pred_res['tier'])
        m_c3.metric("Market Status", pred_res['badge'])

        st.info(f"**Cluster Insight:** {pred_res['cluster_info']['title']} — {pred_res['cluster_info']['desc']}")

        # Monthly trajectory chart
        df_trend = pd.DataFrame({"Month": pred_res['monthly_trend']['months'], "Estimated Bookings": pred_res['monthly_trend']['demand']})
        fig_trend = px.line(df_trend, x="Month", y="Estimated Bookings", markers=True, title="12-Month Projected Machinery Demand Trajectory")
        fig_trend.update_traces(line_color="#15803d", line_width=3)
        fig_trend.update_layout(height=320)
        st.plotly_chart(fig_trend, use_container_width=True)

        st.markdown("#### 💡 Actionable Owner Recommendations:")
        for r in pred_res['owner_recs']:
            st.markdown(f"- 📈 {r}")

# ==============================================================================
# VIEW 4: PLATFORM ADMINISTRATOR PORTAL
# ==============================================================================
elif st.session_state.role == 'admin':
    st.markdown("""
    <div class="main-header">
        <h1 style="margin:0; font-size:28px;">🛡️ Platform Administrator Command Center</h1>
        <p style="margin:6px 0 0 0; font-size:15px; opacity:0.9;">
            Global System Governance • User Management, Fleet Audit & ML Benchmarks
        </p>
    </div>
    """, unsafe_allow_html=True)

    admin_data = get_admin_metrics()

    # System KPI Metrics
    a_k1, a_k2, a_k3, a_k4, a_k5 = st.columns(5)
    a_k1.metric("Total Users", admin_data['users_count'])
    a_k2.metric("Total Farmers", admin_data['farmers_count'])
    a_k3.metric("Machinery Owners", admin_data['owners_count'])
    a_k4.metric("Machinery Fleet", admin_data['mach_count'])
    a_k5.metric("System Revenue", f"₹{admin_data['total_revenue']:,.0f}")

    adm_tab_users, adm_tab_mach, adm_tab_book, adm_tab_ml = st.tabs([
        "👥 User Directory", "🚜 Machinery Fleet Audit", "📋 Booking Transactions", "📊 Machine Learning Model Analytics"
    ])

    with adm_tab_users:
        st.markdown("### 👥 Platform Registered Users")
        df_users = pd.DataFrame([dict(u) for u in admin_data['users']])
        st.dataframe(df_users, use_container_width=True, hide_index=True)

    with adm_tab_mach:
        st.markdown("### 🚜 All Registered Equipment Listings")
        df_mach = pd.DataFrame([dict(m) for m in admin_data['machinery']])
        st.dataframe(df_mach[['id', 'name', 'category', 'rental_price_per_day', 'district', 'state', 'owner_name', 'is_available']], use_container_width=True, hide_index=True)

    with adm_tab_book:
        st.markdown("### 📋 Platform-Wide Booking Audit Log")
        df_book = pd.DataFrame([dict(b) for b in admin_data['bookings']])
        st.dataframe(df_book[['id', 'machinery_name', 'farmer_name', 'owner_name', 'start_date', 'end_date', 'total_amount', 'status']], use_container_width=True, hide_index=True)

    with adm_tab_ml:
        st.markdown("### 📊 ML Model Comparative Performance")
        st.caption("Models trained and cross-validated on synthetic agricultural demand dataset (1,200 records).")

        benchmarks = get_algorithm_benchmarks()
        df_bench = pd.DataFrame(benchmarks)
        st.dataframe(df_bench, use_container_width=True, hide_index=True)

        fig_acc = px.bar(
            df_bench[df_bench['Algorithm'] != "K-Means Regional Clustering"],
            x="Algorithm",
            y="R2_Score",
            text="R2_Score",
            color="R2_Score",
            color_continuous_scale="greens",
            title="Regression Models R² Validation Score Comparison"
        )
        fig_acc.update_layout(height=350, yaxis_range=[0, 1.0])
        st.plotly_chart(fig_acc, use_container_width=True)

        st.warning("""
        ℹ️ **Academic & Synthetic Dataset Notice:**
        The demand prediction dataset contains 1,200 synthetic demonstration records designed to simulate real-world agricultural conditions.
        It is clearly labeled for evaluation purposes and does not claim to represent commercial historical transactions.
        """)
