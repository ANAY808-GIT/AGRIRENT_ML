"""
AgriRent ML - Comprehensive PDF Guide Generator
Uses ReportLab to build a technical and functional specification PDF.
"""

import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Palette constants
COLOR_PRIMARY_DARK = colors.HexColor('#14532d')   # Dark green
COLOR_PRIMARY_MED  = colors.HexColor('#15803d')   # Emerald green
COLOR_ACCENT_LIME  = colors.HexColor('#65a30d')   # Lime green
COLOR_BG_LIGHT     = colors.HexColor('#f8faf8')   # Warm light cream/green
COLOR_TEXT_MAIN    = colors.HexColor('#1e293b')   # Slate 800
COLOR_TEXT_MUTED   = colors.HexColor('#64748b')   # Slate 500
COLOR_BORDER       = colors.HexColor('#cbd5e1')   # Slate 300
COLOR_HIGHLIGHT_BG = colors.HexColor('#ecfdf5')   # Emerald 50
COLOR_AMBER_BG     = colors.HexColor('#fffbeb')   # Amber 50
COLOR_AMBER_BORDER = colors.HexColor('#fde68a')   # Amber 200
COLOR_AMBER_TEXT   = colors.HexColor('#92400e')   # Amber 800

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(COLOR_TEXT_MUTED)

        # Do not draw headers/footers on cover page
        if self._pageNumber > 1:
            # Header
            self.drawString(54, 750, "AgriRent ML: Smart Agricultural Machinery Rental & Demand Platform")
            self.drawRightString(612 - 54, 750, "System Architecture & Feature Guide")
            self.setStrokeColor(COLOR_BORDER)
            self.setLineWidth(0.5)
            self.line(54, 742, 612 - 54, 742)

            # Footer
            self.line(54, 45, 612 - 54, 45)
            self.drawString(54, 32, "Confidential • Prepared for Academic & Commercial Architecture Review")
            self.drawRightString(612 - 54, 32, f"Page {self._pageNumber} of {page_count}")

        self.restoreState()

def build_pdf(filename="docs/AgriRent_ML_Platform_Comprehensive_Guide.pdf"):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=64,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=COLOR_PRIMARY_DARK,
        alignment=0,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=COLOR_TEXT_MAIN,
        alignment=0,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'CustomH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=COLOR_PRIMARY_DARK,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'CustomH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=COLOR_PRIMARY_MED,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=COLOR_TEXT_MAIN,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=body_style,
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=COLOR_AMBER_TEXT
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=0
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=COLOR_TEXT_MAIN,
        alignment=0
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=COLOR_PRIMARY_DARK,
        alignment=0
    )

    story = []

    # ----------------------------------------------------
    # COVER / HEADER BLOCK
    # ----------------------------------------------------
    story.append(Paragraph("AgriRent ML", title_style))
    story.append(Paragraph("Smart Agricultural Machinery Rental and Demand Prediction Platform", subtitle_style))
    story.append(Paragraph("<b>Comprehensive Architectural Blueprint, Feature Specification & User Guide</b>", body_style))
    story.append(HRFlowable(width="100%", thickness=2, color=COLOR_PRIMARY_MED, spaceAfter=14))

    # Academic Disclaimer Box
    disclaimer_text = (
        "<b>ACADEMIC & DEMONSTRATION DISCLOSURE:</b> This platform integrates actual Scikit-Learn machine learning algorithms "
        "(Linear Regression, Random Forest Regressor, Decision Tree Regressor, and K-Means Clustering) trained on 1,200 "
        "synthetic demonstration records (AgriRent_ML_Synthetic_Demand_Dataset.csv). It is constructed for university evaluation, "
        "portfolio examination, and commercial agricultural prototyping."
    )
    disclaimer_table = Table([[Paragraph(disclaimer_text, callout_style)]], colWidths=[504])
    disclaimer_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), COLOR_AMBER_BG),
        ('BOX', (0,0), (-1,-1), 1, COLOR_AMBER_BORDER),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(disclaimer_table)
    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 1: EXECUTIVE SUMMARY & PROBLEM STATEMENT
    # ----------------------------------------------------
    story.append(Paragraph("1. Executive Summary & Problem Statement", h1_style))
    story.append(Paragraph(
        "Modern agricultural mechanization is critical for food security, crop yield maximization, and timely land preparation. "
        "However, in emerging economies like India, smallholder farmers (cultivating under 5 acres) face severe economic barriers:",
        body_style
    ))
    story.append(Paragraph("• <b>High Capital Barrier:</b> Purchasing tractors, combine harvesters, and rotavators requires ₹6 to ₹30 Lakhs, forcing smallholders into debt or reliance on manual labor.", bullet_style))
    story.append(Paragraph("• <b>Seasonal Equipment Underutilization:</b> Machinery owners experience severe downtime (equipment idle 60-70% of the year outside localized sowing and harvesting peaks).", bullet_style))
    story.append(Paragraph("• <b>Peak Bottlenecks & Double-Booking Disputes:</b> Informally booked machinery frequently fails to arrive, leading to missed monsoon sowing or delayed harvesting.", bullet_style))
    story.append(Paragraph("• <b>Information Asymmetry:</b> Lack of predictive demand intelligence prevents owners from anticipating where equipment is needed most across neighboring districts.", bullet_style))
    story.append(Paragraph(
        "<b>AgriRent ML solves this</b> by providing a unified, decentralized rental ecosystem with <b>separate role-based portals</b> for Machinery Owners, Farmers, and Platform Administrators, backed by <b>conflict-free booking calendar guards</b>, <b>itemized GST invoicing</b>, <b>Speech-to-Text voice searching</b>, and an <b>AI-driven demand forecasting engine</b>.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # ----------------------------------------------------
    # SECTION 2: TECHNOLOGY STACK & DUAL DATABASE ARCHITECTURE
    # ----------------------------------------------------
    story.append(Paragraph("2. Full-Stack Technology Architecture", h1_style))
    story.append(Paragraph(
        "The system adheres to clean separation of concerns across presentation, business logic, persistence, and predictive intelligence:",
        body_style
    ))

    tech_data = [
        [Paragraph("Layer", table_header_style), Paragraph("Technologies", table_header_style), Paragraph("Key Purpose & Implementation Details", table_header_style)],
        [
            Paragraph("Frontend", table_cell_bold),
            Paragraph("React.js 18, Vite, Tailwind CSS, React Router v6, Recharts, Lucide", table_cell_style),
            Paragraph("High-performance Single Page Application (SPA), role-based ProtectedRoute guards, responsive sidebar layout, agricultural green palette, and client-side Recharts charts.", table_cell_style)
        ],
        [
            Paragraph("Backend API", table_cell_bold),
            Paragraph("Python 3.x, Flask REST API, Flask-CORS, PyJWT, Werkzeug", table_cell_style),
            Paragraph("Stateless REST API endpoints, JWT token authentication (7-day validity), role validation decorators, parameterized SQL queries, and secure password hashing.", table_cell_style)
        ],
        [
            Paragraph("Database", table_cell_bold),
            Paragraph("MySQL + SQLite Dual Engine, PyMySQL, SQLite3", table_cell_style),
            Paragraph("Production-ready MySQL schema (6 tables, foreign keys, cascades). Automatic fallback to SQLite (backend/agrirent.db) ensures zero configuration on any evaluation system.", table_cell_style)
        ],
        [
            Paragraph("Machine Learning", table_cell_bold),
            Paragraph("Scikit-Learn, Pandas, NumPy, Joblib, Matplotlib", table_cell_style),
            Paragraph("Linear Regression, Random Forest, Decision Tree, and K-Means Clustering (k=4). Automated data pipeline, metric comparisons, and Joblib model serialization.", table_cell_style)
        ],
        [
            Paragraph("Voice Search", table_cell_bold),
            Paragraph("Web Speech API (SpeechRecognition / webkitSpeechRecognition)", table_cell_style),
            Paragraph("Speech-to-text built into all 7 platform search bars, tuned for Indian English (en-IN) agricultural implement vocabulary with animated listening states.", table_cell_style)
        ]
    ]

    t_tech = Table(tech_data, colWidths=[80, 150, 274])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY_DARK),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_tech)
    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 3: THREE USER ROLES & ACCESS CONTROL
    # ----------------------------------------------------
    story.append(Paragraph("3. Multi-Role User Portals & Permissions", h1_style))
    story.append(Paragraph(
        "AgriRent ML implements role-based access control (RBAC). Upon login, the system inspects the user's role and redirects them directly to their dedicated console:",
        body_style
    ))

    story.append(Paragraph("Role A: Machinery Owner (/owner/*)", h2_style))
    story.append(Paragraph("Designed for individuals or equipment depots that own tractors, harvesters, or attachments and wish to rent them out safely.", body_style))
    story.append(Paragraph("• <b>Dashboard:</b> Real-time statistics (total fleet, available units, in-field deployments, pending booking requests, monthly earnings) and Recharts monthly revenue chart.", bullet_style))
    story.append(Paragraph("• <b>Add Machinery:</b> Detailed listing form capturing brand, model year, horsepower, fuel type, daily rental price, village/district location, operator availability, and photo presets.", bullet_style))
    story.append(Paragraph("• <b>My Machinery:</b> Fleet inventory manager with quick status switcher (🟢 Available, 🟡 In Field, 🔴 Under Maintenance), edit modal, and deletion.", bullet_style))
    story.append(Paragraph("• <b>Booking Requests:</b> Review farmer reservations with farmer contact, village, rental dates, and calculated totals. One-click <i>Accept</i> or <i>Reject</i> with response notes.", bullet_style))
    story.append(Paragraph("• <b>Active Rentals:</b> Track equipment operating in farmer fields with a <i>Mark as Completed</i> button that safely transitions equipment back to available.", bullet_style))
    story.append(Paragraph("• <b>Rental History:</b> Historical archival record of all concluded rentals, settled revenue, and dates.", bullet_style))
    story.append(Paragraph("• <b>Earnings & Settlements:</b> Financial summary displaying total gross payouts, completed rentals count, and itemized customer transaction table.", bullet_style))
    story.append(Paragraph("• <b>ML Demand Prediction:</b> Predicts monthly machinery demand in the owner's district to recommend dynamic pricing (+10-15% peak surges, off-season maintenance overhauls).", bullet_style))
    story.append(Paragraph("• <b>Customer Reviews:</b> Real-time display of farmer feedback and 1-5 star ratings.", bullet_style))
    story.append(Paragraph("• <b>My Profile:</b> Manage contact phone numbers, depot village/district, and change account passwords.", bullet_style))

    story.append(Paragraph("Role B: Farmer / Field Owner (/farmer/*)", h2_style))
    story.append(Paragraph("Designed for farmers seeking machinery for land preparation, sowing, crop protection, or harvesting.", body_style))
    story.append(Paragraph("• <b>Farmer Dashboard:</b> Summary metrics (total bookings, pending reservations, active field rentals, completed rentals, total spent, AI seasonal top pick) and live active rental status banner.", bullet_style))
    story.append(Paragraph("• <b>Marketplace & Find Machinery:</b> Interactive equipment catalog with horizontal category tabs (Tractors, Harvesters, Rotavators, Power Tillers, Sprayers, Seed Drills, Ploughs, Threshers), keyword search with voice recognition, price slider (₹500 to ₹6,000/day), location district filter, and available-only toggle.", bullet_style))
    story.append(Paragraph("• <b>Machinery Details:</b> In-depth machinery profiles featuring verified owner badges, technical specifications (HP, PTO, fuel type), certified operator indicators, and verified customer reviews.", bullet_style))
    story.append(Paragraph("• <b>Conflict-Free Booking Calculator:</b> Integrated date picker that computes rental days and total cost while executing real-time server checks to prevent overlapping reservations.", bullet_style))
    story.append(Paragraph("• <b>My Bookings:</b> Full booking lifecycle tracker with status badges (Pending, Approved, Active, Completed, Cancelled). Allows cancellation of pending requests.", bullet_style))
    story.append(Paragraph("• <b>Simulated Payment Checkout:</b> Complete checkout for approved bookings via Simulated UPI (GooglePay/PhonePe), Net Banking (SBI), Kisan Credit Cards (KCC), or Debit Cards.", bullet_style))
    story.append(Paragraph("• <b>Itemized Tax Invoices:</b> Instant PDF-style proforma and tax invoices featuring unique invoice IDs (INV-...), transaction IDs (TXN-AGRI-...), and 5% agricultural concessional GST breakdown.", bullet_style))
    story.append(Paragraph("• <b>Active Rentals:</b> Live ongoing field rentals with owner contact details and return guidelines.", bullet_style))
    story.append(Paragraph("• <b>ML Seasonal Recommendations:</b> AI suggestions indicating peak-demand machinery in the farmer's district to advise early booking lead times (7-10 days).", bullet_style))
    story.append(Paragraph("• <b>Reviews and Feedback:</b> Post-rental review submission modal enabling farmers to rate machinery condition and write comments.", bullet_style))

    story.append(Paragraph("Role C: Platform Administrator (/admin/*)", h2_style))
    story.append(Paragraph("Provides platform-wide supervision and algorithmic auditing:", body_style))
    story.append(Paragraph("• <b>Central Platform Statistics:</b> Total users, farmers, owners, machinery registered, bookings, and gross platform rental volume.", bullet_style))
    story.append(Paragraph("• <b>User Management:</b> View all accounts, filter by role, activate or suspend offending accounts with 1 click, or permanently delete users.", bullet_style))
    story.append(Paragraph("• <b>Machinery Moderation:</b> Inspect equipment listings across all owners and remove non-compliant listings.", bullet_style))
    story.append(Paragraph("• <b>Central Booking Oversight:</b> Registry of all bookings across every farmer and owner with date ranges and financial amounts.", bullet_style))
    story.append(Paragraph("• <b>Platform Analytics:</b> Category popularity visualizations and district concentration breakdown.", bullet_style))
    story.append(Paragraph("• <b>ML Model Benchmark Reports:</b> Multi-model evaluation scorecard comparing Linear Regression, Random Forest, Decision Tree, and K-Means clustering.", bullet_style))
    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 4: CONFLICT-FREE BOOKING WORKFLOW
    # ----------------------------------------------------
    story.append(Paragraph("4. Conflict-Free Booking & Lifecycle Engine", h1_style))
    story.append(Paragraph(
        "Double-booking prevention is critical in agricultural operations because equipment delays can ruin harvest yields. "
        "AgriRent ML implements a mathematical date overlap validation query directly on the database engine:",
        body_style
    ))

    story.append(Paragraph(
        "<b>Overlap Condition:</b> A proposed booking for machinery <i>M</i> with start date <i>S_new</i> and end date <i>E_new</i> "
        "conflicts with an existing booking if:<br/>"
        "<code>existing.start_date &lt;= E_new AND existing.end_date &gt;= S_new AND status IN ('accepted', 'active')</code>",
        body_style
    ))
    story.append(Paragraph(
        "If a conflict is detected, the API immediately halts booking creation and returns HTTP 409 Conflict with the exact date range already reserved, ensuring zero double-bookings.",
        body_style
    ))

    booking_steps_data = [
        [Paragraph("Step", table_header_style), Paragraph("Actor", table_header_style), Paragraph("Action & System State", table_header_style)],
        [Paragraph("1", table_cell_bold), Paragraph("Farmer", table_cell_style), Paragraph("Searches marketplace, selects machinery, picks dates (e.g., Oct 15 - Oct 18).", table_cell_style)],
        [Paragraph("2", table_cell_bold), Paragraph("System", table_cell_style), Paragraph("Validates date overlap. Inserts booking with status <code>'pending'</code>.", table_cell_style)],
        [Paragraph("3", table_cell_bold), Paragraph("Owner", table_cell_style), Paragraph("Receives notification in Booking Requests. Clicks <i>Accept Booking</i>. Status becomes <code>'accepted'</code>.", table_cell_style)],
        [Paragraph("4", table_cell_bold), Paragraph("Farmer", table_cell_style), Paragraph("Sees accepted status. Completes simulated checkout. Booking becomes <code>'active'</code>, machinery becomes <code>'in_use'</code>.", table_cell_style)],
        [Paragraph("5", table_cell_bold), Paragraph("Fieldwork", table_cell_style), Paragraph("Equipment is mobilized to farmer's field during rental duration.", table_cell_style)],
        [Paragraph("6", table_cell_bold), Paragraph("Completion", table_cell_style), Paragraph("Owner clicks <i>Mark as Completed</i>. Status moves to <code>'completed'</code>, machinery is restored to <code>'available'</code>, and record is saved in <code>rental_history</code>.", table_cell_style)],
        [Paragraph("7", table_cell_bold), Paragraph("Review", table_cell_style), Paragraph("Farmer submits 1-5 star review and comments, updating the machinery's public rating.", table_cell_style)]
    ]

    t_booking = Table(booking_steps_data, colWidths=[40, 70, 394])
    t_booking.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY_DARK),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_booking)
    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 5: MACHINE LEARNING DEMAND PREDICTION
    # ----------------------------------------------------
    story.append(Paragraph("5. Machine Learning Demand Prediction Deep-Dive", h1_style))
    story.append(Paragraph(
        "The machine learning module is built using Python Scikit-Learn to model agricultural machinery rental demand counts. "
        "It was trained on the supplied dataset containing 1,200 records spanning 8 machinery types across 9 agricultural districts.",
        body_style
    ))

    story.append(Paragraph("Dataset Input Features & Pipeline", h2_style))
    story.append(Paragraph("• <b>Categorical Features (OneHotEncoded):</b> Machinery Type (8 categories), State (5 states), District (9 districts), Season (Kharif, Rabi, Summer), Crop Type (8 crops).", bullet_style))
    story.append(Paragraph("• <b>Numerical Features (StandardScaled):</b> Month (1-12), Farm Size (acres), Rainfall (mm), Average Temperature (°C), Rental Price (₹/day), Previous Month Bookings, Nearby Machinery Density, Harvest Season Flag.", bullet_style))
    story.append(Paragraph("• <b>Target Variable:</b> <code>monthly_demand_count</code> (continuous demand ranging from 4 to 62 units).", bullet_style))
    story.append(Paragraph("• <b>Data Partitioning:</b> 80% training set (960 records), 20% holdout test set (240 records) with random state seed 42.", bullet_style))

    story.append(Paragraph("Empirical Model Evaluation Scorecard", h2_style))

    ml_data = [
        [Paragraph("Model / Algorithm", table_header_style), Paragraph("MAE (Lower=Better)", table_header_style), Paragraph("RMSE (Lower=Better)", table_header_style), Paragraph("R² Score (Higher=Better)", table_header_style), Paragraph("Production Status", table_header_style)],
        [
            Paragraph("Linear Regression", table_cell_bold),
            Paragraph("2.7347 units", table_cell_style),
            Paragraph("3.3909 units", table_cell_style),
            Paragraph("0.8696 (86.9%)", table_cell_style),
            Paragraph("<b>Selected Best Model</b>", table_cell_style)
        ],
        [
            Paragraph("Random Forest Regressor (120 Trees)", table_cell_bold),
            Paragraph("3.1323 units", table_cell_style),
            Paragraph("3.8930 units", table_cell_style),
            Paragraph("0.8281 (82.8%)", table_cell_style),
            Paragraph("Benchmark Regressor", table_cell_style)
        ],
        [
            Paragraph("Decision Tree Regressor (Depth=8)", table_cell_bold),
            Paragraph("4.0238 units", table_cell_style),
            Paragraph("5.1910 units", table_cell_style),
            Paragraph("0.6944 (69.4%)", table_cell_style),
            Paragraph("Baseline Regressor", table_cell_style)
        ],
        [
            Paragraph("K-Means Clustering (k=4)", table_cell_bold),
            Paragraph("—", table_cell_style),
            Paragraph("—", table_cell_style),
            Paragraph("—", table_cell_style),
            Paragraph("4 Agricultural Zones", table_cell_style)
        ]
    ]

    t_ml = Table(ml_data, colWidths=[130, 85, 90, 95, 104])
    t_ml.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY_DARK),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_ml)
    story.append(Spacer(1, 10))

    story.append(Paragraph("K-Means Unsupervised Agricultural Clusters:", h2_style))
    story.append(Paragraph("• <b>Cluster 0:</b> High Yield / Peak Demand Agricultural Hub (High density, heavy harvest requirements).", bullet_style))
    story.append(Paragraph("• <b>Cluster 1:</b> Moderate Steady Regional Rental Zone (Balanced supply and utilization).", bullet_style))
    story.append(Paragraph("• <b>Cluster 2:</b> Price Sensitive / Small-holder Farming Region (High sensitivity to daily rates).", bullet_style))
    story.append(Paragraph("• <b>Cluster 3:</b> Emerging Mechanization / Off-Peak Transition (Ideal for maintenance and promo discounts).", bullet_style))

    story.append(Paragraph("Categorical Demand Thresholds & Strategic Recommendations:", h2_style))
    story.append(Paragraph("• <b>High Demand (&gt; 30 units):</b> Owner Recommendation: Implement +10% to +15% surge pricing; perform immediate engine blade greasing. Farmer Advisory: Book 7-10 days in advance to secure equipment.", bullet_style))
    story.append(Paragraph("• <b>Medium Demand (18 - 30 units):</b> Maintain market standard pricing (~₹1,500-₹2,000/day); offer 3-day duration packages. Farmer Advisory: Reserve 3-5 days in advance.", bullet_style))
    story.append(Paragraph("• <b>Low Demand (&lt; 18 units):</b> Owner Recommendation: Offer 10-15% promotional off-season discounts or bundle attachments; schedule major overhaul. Farmer Advisory: Negotiate package rates.", bullet_style))
    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 6: SPEECH-TO-TEXT VOICE SEARCH
    # ----------------------------------------------------
    story.append(Paragraph("6. Speech-to-Text (Voice Search) Architecture", h1_style))
    story.append(Paragraph(
        "To empower farmers in rural settings where typing complex technical model numbers may be cumbersome, "
        "AgriRent ML integrates browser-native Speech-to-Text across <b>all 7 search bars</b> on the platform:",
        body_style
    ))
    story.append(Paragraph("1. <b>Landing Page Search Bar:</b> Voice search for featured tractors and combines.", bullet_style))
    story.append(Paragraph("2. <b>Marketplace & Find Machinery:</b> Search brands, categories, and power specs by speaking.", bullet_style))
    story.append(Paragraph("3. <b>Farmer Rental History:</b> Voice search completed rentals by owner name or machine.", bullet_style))
    story.append(Paragraph("4. <b>Owner Rental History:</b> Voice filter records by farmer or equipment.", bullet_style))
    story.append(Paragraph("5. <b>Admin User Management:</b> Voice lookup of users by name, email, or district.", bullet_style))
    story.append(Paragraph("6. <b>Admin Machinery Moderation:</b> Voice search machinery listings.", bullet_style))
    story.append(Paragraph("7. <b>Admin Booking Registry:</b> Voice lookup of reservations and transactions.", bullet_style))
    story.append(Paragraph(
        "<b>Technical Implementation:</b> Implemented via <code>VoiceSearchButton.jsx</code> wrapping the Web Speech API "
        "(<code>window.SpeechRecognition || window.webkitSpeechRecognition</code>). Features language tuning for Indian English "
        "(<code>en-IN</code>), an animated pulsing red microphone state with live <i>'Speak now...'</i> feedback, automatic punctuation cleanup, "
        "and error handling for microphone permission denials.",
        body_style
    ))
    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 7: DATABASE SCHEMA & DATA MODEL
    # ----------------------------------------------------
    story.append(Paragraph("7. Database Structure & Relational Schema", h1_style))
    story.append(Paragraph(
        "The relational data model comprises 6 core tables with primary keys, foreign key constraints, indexes, and cascades:",
        body_style
    ))

    schema_data = [
        [Paragraph("Table Name", table_header_style), Paragraph("Primary / Foreign Keys", table_header_style), Paragraph("Columns & Descriptions", table_header_style)],
        [
            Paragraph("users", table_cell_bold),
            Paragraph("PK: id", table_cell_style),
            Paragraph("full_name, email (UNIQUE), password_hash, mobile, role ('owner','farmer','admin'), village, district, state, avatar_url, is_active, created_at.", table_cell_style)
        ],
        [
            Paragraph("machinery", table_cell_bold),
            Paragraph("PK: id<br/>FK: owner_id -> users(id)", table_cell_style),
            Paragraph("name, category, model_year, description, rental_price_per_day, location_village, location_district, location_state, specs_json, image_url, availability_status ('available','in_use','maintenance').", table_cell_style)
        ],
        [
            Paragraph("bookings", table_cell_bold),
            Paragraph("PK: id<br/>FK: machinery_id, farmer_id, owner_id", table_cell_style),
            Paragraph("start_date, end_date, total_days, daily_price, total_price, status ('pending','accepted','rejected','active','completed','cancelled'), farmer_notes, owner_response_notes, created_at.", table_cell_style)
        ],
        [
            Paragraph("payments", table_cell_bold),
            Paragraph("PK: id<br/>FK: booking_id, farmer_id, owner_id", table_cell_style),
            Paragraph("amount, payment_method, transaction_id (UNIQUE), payment_status ('paid','pending','refunded'), invoice_number (UNIQUE), paid_at.", table_cell_style)
        ],
        [
            Paragraph("reviews", table_cell_bold),
            Paragraph("PK: id<br/>FK: booking_id, machinery_id, farmer_id", table_cell_style),
            Paragraph("rating (INT 1-5), comment (TEXT), created_at.", table_cell_style)
        ],
        [
            Paragraph("rental_history", table_cell_bold),
            Paragraph("PK: id<br/>FK: booking_id, machinery_id, farmer_id, owner_id", table_cell_style),
            Paragraph("start_date, end_date, total_amount, completion_status, completion_notes, completed_at.", table_cell_style)
        ]
    ]

    t_schema = Table(schema_data, colWidths=[90, 130, 284])
    t_schema.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY_DARK),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_schema)
    story.append(Spacer(1, 14))

    # ----------------------------------------------------
    # SECTION 8: QUICK START & DEMO CREDENTIALS
    # ----------------------------------------------------
    story.append(Paragraph("8. Execution Guide & Evaluation Credentials", h1_style))
    story.append(Paragraph(
        "The project is structured for immediate execution. Pre-seeded credentials allow instant evaluation:",
        body_style
    ))

    cred_data = [
        [Paragraph("Role", table_header_style), Paragraph("Login Email", table_header_style), Paragraph("Password", table_header_style), Paragraph("Sample User Details", table_header_style)],
        [
            Paragraph("Machinery Owner", table_cell_bold),
            Paragraph("owner@agrirent.com", table_cell_style),
            Paragraph("owner123", table_cell_style),
            Paragraph("Ramesh Patel • Mandya, Karnataka (Fleet Owner)", table_cell_style)
        ],
        [
            Paragraph("Farmer / Field Owner", table_cell_bold),
            Paragraph("farmer@agrirent.com", table_cell_style),
            Paragraph("farmer123", table_cell_style),
            Paragraph("Suresh Gowda • Mysuru, Karnataka (Field Farmer)", table_cell_style)
        ],
        [
            Paragraph("Super Administrator", table_cell_bold),
            Paragraph("admin@agrirent.com", table_cell_style),
            Paragraph("admin123", table_cell_style),
            Paragraph("AgriRent Central Governance Officer", table_cell_style)
        ]
    ]

    t_cred = Table(cred_data, colWidths=[110, 130, 80, 184])
    t_cred.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY_DARK),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_cred)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Quick Execution Instructions:", h2_style))
    story.append(Paragraph("• <b>Unified Server (Single Port 5000):</b> Run <code>python backend/app.py</code> and open <code>http://localhost:5000</code> in your browser. Flask serves both the React Single Page App and the REST APIs.", bullet_style))
    story.append(Paragraph("• <b>Dual Developer Mode:</b> In Terminal 1 run <code>python backend/app.py</code>; in Terminal 2 run <code>cd frontend &amp;&amp; npm run dev</code>. Open <code>http://localhost:3000</code>.", bullet_style))
    story.append(Paragraph("• <b>Automated End-to-End Test Suite:</b> Run <code>python test_platform_e2e.py</code> to execute the 14-phase automated verification script (validating Auth, Fleet CRUD, Booking, Double-Booking Guard, Payments, Invoices, Reviews, and ML Predictions).", bullet_style))

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_PRIMARY_MED, spaceAfter=8))
    story.append(Paragraph("© AgriRent ML Engineering Team • Built with React, Flask, and Scikit-Learn", callout_style))

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[PDF GENERATION SUCCESS] Document written to: {os.path.abspath(filename)}")
    return os.path.abspath(filename)

if __name__ == '__main__':
    out = build_pdf()
    print("Finished:", out)

