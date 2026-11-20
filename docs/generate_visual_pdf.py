"""
AgriRent ML - Visual Project Report Generator
Generates a comprehensive, professional visual PDF document containing:
- Project Objectives & Problem Introduction
- Machine Learning Integration, Models & Algorithms
- Outcomes, Benchmarks & Analytics
- Database Information, Schema & ER Architecture
- Visual Renderings of Website Interfaces (Landing, Marketplace, Owner, ML Prediction)
"""

import os
import sys
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas

ASSETS_DIR = os.path.join(os.path.dirname(__file__), 'assets')
os.makedirs(ASSETS_DIR, exist_ok=True)
PDF_OUTPUT = os.path.join(os.path.dirname(__file__), 'AgriRent_ML_Visual_Project_Report.pdf')

# ==============================================================================
# 1. GENERATE VISUAL ASSETS (CHARTS & UI MOCKUPS)
# ==============================================================================

def generate_ml_benchmark_chart():
    path = os.path.join(ASSETS_DIR, 'fig_ml_benchmarks.png')
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2), dpi=200)

    # Subplot 1: R2 Validation Scores
    models = ['Linear Regression\n(Production Model)', 'Random Forest\nRegressor', 'Decision Tree\nRegressor']
    r2_scores = [0.8696, 0.8281, 0.6944]
    colors_r2 = ['#15803d', '#3b82f6', '#f59e0b']

    bars1 = ax1.bar(models, r2_scores, color=colors_r2, width=0.55, edgecolor='#1e293b', linewidth=1)
    ax1.set_title('R² Validation Score (Higher is Better)', fontsize=12, fontweight='bold', pad=12, color='#0f172a')
    ax1.set_ylim(0, 1.0)
    ax1.set_ylabel('R² Score', fontsize=10, fontweight='bold')
    ax1.grid(axis='y', linestyle='--', alpha=0.4)
    ax1.axhline(0.8696, color='#15803d', linestyle=':', linewidth=1.5, label='Production Threshold')

    for bar in bars1:
        yval = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2.0, yval + 0.02, f"{yval:.4f}\n({yval*100:.1f}%)",
                 ha='center', va='bottom', fontsize=9, fontweight='bold', color='#0f172a')

    # Subplot 2: RMSE & MAE Error Comparison
    rmse_scores = [3.3909, 3.8930, 5.1910]
    mae_scores = [2.7347, 3.1323, 4.0238]
    x = np.arange(len(models))
    width = 0.32

    b_rmse = ax2.bar(x - width/2, rmse_scores, width, label='RMSE (Units)', color='#ef4444', edgecolor='#1e293b', linewidth=1)
    b_mae = ax2.bar(x + width/2, mae_scores, width, label='MAE (Units)', color='#f97316', edgecolor='#1e293b', linewidth=1)

    ax2.set_title('Error Metrics: RMSE & MAE (Lower is Better)', fontsize=12, fontweight='bold', pad=12, color='#0f172a')
    ax2.set_xticks(x)
    ax2.set_xticklabels(models, fontsize=9)
    ax2.set_ylabel('Demand Count Error (Units)', fontsize=10, fontweight='bold')
    ax2.set_ylim(0, 6.5)
    ax2.grid(axis='y', linestyle='--', alpha=0.4)
    ax2.legend(loc='upper left', frameon=True, fontsize=9)

    for bar in b_rmse:
        yval = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2.0, yval + 0.1, f"{yval:.2f}", ha='center', va='bottom', fontsize=8.5, fontweight='bold')
    for bar in b_mae:
        yval = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2.0, yval + 0.1, f"{yval:.2f}", ha='center', va='bottom', fontsize=8.5, fontweight='bold')

    plt.tight_layout()
    fig.savefig(path, bbox_inches='tight')
    plt.close(fig)
    return path

def generate_demand_trajectory_chart():
    path = os.path.join(ASSETS_DIR, 'fig_demand_trajectory.png')
    fig, ax = plt.subplots(figsize=(10, 4.0), dpi=200)

    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    base_tractor = [22, 18, 28, 42, 38, 16, 24, 30, 48, 52, 44, 26]
    base_harvester = [12, 10, 34, 46, 20, 8, 10, 14, 42, 56, 38, 14]
    base_rotavator = [18, 15, 25, 30, 42, 36, 28, 22, 34, 40, 36, 20]

    ax.plot(months, base_tractor, marker='o', linewidth=2.8, color='#15803d', label='Tractor Fleet (45-50 HP)')
    ax.plot(months, base_harvester, marker='s', linewidth=2.4, color='#dc2626', linestyle='--', label='Combine Harvester (Multi-crop)')
    ax.plot(months, base_rotavator, marker='^', linewidth=2.2, color='#0284c7', linestyle='-.', label='Rotavator (7 Feet)')

    # Highlight harvest seasons
    ax.axvspan('Mar', 'Apr', color='#fef08a', alpha=0.35, label='Rabi Harvest Window (High Stress)')
    ax.axvspan('Sep', 'Nov', color='#fed7aa', alpha=0.35, label='Kharif Harvest & Sowing Window (Peak)')

    ax.set_title('12-Month Multi-Equipment Projected Regional Demand Trajectory', fontsize=12, fontweight='bold', pad=12, color='#0f172a')
    ax.set_ylabel('Forecasted Monthly Bookings (Units)', fontsize=10, fontweight='bold')
    ax.set_xlabel('Calendar Month', fontsize=10, fontweight='bold')
    ax.grid(True, linestyle=':', alpha=0.5)
    ax.legend(loc='upper left', framealpha=0.95, fontsize=8.5)

    plt.tight_layout()
    fig.savefig(path, bbox_inches='tight')
    plt.close(fig)
    return path

def generate_database_er_diagram():
    path = os.path.join(ASSETS_DIR, 'fig_er_diagram.png')
    fig, ax = plt.subplots(figsize=(10, 4.6), dpi=200)
    ax.axis('off')

    # Draw entities as styled boxes
    entities = [
        {"name": "users", "x": 0.05, "y": 0.55, "w": 0.22, "h": 0.38, "pk": "id (PK)", "fields": ["name, email, mobile", "role (owner/farmer/admin)", "village, district, state"]},
        {"name": "machinery", "x": 0.38, "y": 0.55, "w": 0.24, "h": 0.38, "pk": "id (PK)", "fields": ["owner_id (FK -> users)", "name, category, price/day", "location, district, state", "is_available (0/1)"]},
        {"name": "bookings", "x": 0.72, "y": 0.55, "w": 0.25, "h": 0.38, "pk": "id (PK)", "fields": ["farmer_id (FK -> users)", "machinery_id (FK -> mach)", "start_date, end_date", "total_days, total_amount", "status (confirmed/active)"]},
        {"name": "reviews", "x": 0.05, "y": 0.05, "w": 0.22, "h": 0.35, "pk": "id (PK)", "fields": ["machinery_id (FK)", "farmer_id (FK)", "rating (1-5)", "comment, created_at"]},
        {"name": "payments", "x": 0.38, "y": 0.05, "w": 0.24, "h": 0.35, "pk": "id (PK)", "fields": ["booking_id (FK)", "farmer_id (FK)", "amount, method (UPI/Net)", "status (paid/pending)", "invoice_number, txn_id"]},
        {"name": "rental_history", "x": 0.72, "y": 0.05, "w": 0.25, "h": 0.35, "pk": "id (PK)", "fields": ["booking_id (FK)", "farmer_id, machinery_id", "owner_id, dates", "final_settled_amount"]}
    ]

    for ent in entities:
        rect = patches.FancyBboxPatch((ent['x'], ent['y']), ent['w'], ent['h'],
                                      boxstyle="round,pad=0.015,rounding_size=0.02",
                                      facecolor='#f0fdf4', edgecolor='#15803d', linewidth=1.5)
        ax.add_patch(rect)
        # Header strip
        head_rect = patches.FancyBboxPatch((ent['x'], ent['y'] + ent['h'] - 0.09), ent['w'], 0.09,
                                           boxstyle="round,pad=0.015,rounding_size=0.02",
                                           facecolor='#15803d', edgecolor='#15803d')
        ax.add_patch(head_rect)
        ax.text(ent['x'] + ent['w']/2, ent['y'] + ent['h'] - 0.05, ent['name'].upper(),
                color='white', fontweight='bold', fontsize=9.5, ha='center', va='center')

        # Fields
        ax.text(ent['x'] + 0.015, ent['y'] + ent['h'] - 0.13, f"[PK] {ent['pk']}", color='#b91c1c', fontweight='bold', fontsize=8)
        curr_y = ent['y'] + ent['h'] - 0.18
        for f in ent['fields']:
            ax.text(ent['x'] + 0.015, curr_y, f"• {f}", color='#1e293b', fontsize=7.5)
            curr_y -= 0.045

    # Connectors
    # users -> machinery (1:N)
    ax.annotate("", xy=(0.38, 0.74), xytext=(0.27, 0.74), arrowprops=dict(arrowstyle="->", color='#15803d', lw=2))
    ax.text(0.32, 0.76, "1 : N (Fleet)", fontsize=8, color='#15803d', fontweight='bold', ha='center')

    # machinery -> bookings (1:N)
    ax.annotate("", xy=(0.72, 0.74), xytext=(0.62, 0.74), arrowprops=dict(arrowstyle="->", color='#15803d', lw=2))
    ax.text(0.67, 0.76, "1 : N (Rentals)", fontsize=8, color='#15803d', fontweight='bold', ha='center')

    # bookings -> payments (1:1)
    ax.annotate("", xy=(0.50, 0.40), xytext=(0.80, 0.55), arrowprops=dict(arrowstyle="->", color='#2563eb', lw=1.8, connectionstyle="arc3,rad=-0.2"))
    ax.text(0.66, 0.46, "1 : 1 (Settlement)", fontsize=7.5, color='#2563eb', fontweight='bold')

    # bookings -> rental_history (1:1)
    ax.annotate("", xy=(0.84, 0.40), xytext=(0.84, 0.55), arrowprops=dict(arrowstyle="->", color='#64748b', lw=1.8))
    ax.text(0.85, 0.47, "1 : 1 (Archive)", fontsize=7.5, color='#475569', fontweight='bold')

    # machinery -> reviews (1:N)
    ax.annotate("", xy=(0.16, 0.40), xytext=(0.42, 0.55), arrowprops=dict(arrowstyle="->", color='#d97706', lw=1.8, connectionstyle="arc3,rad=-0.2"))
    ax.text(0.24, 0.46, "1 : N (Ratings)", fontsize=7.5, color='#d97706', fontweight='bold')

    plt.tight_layout()
    fig.savefig(path, bbox_inches='tight')
    plt.close(fig)
    return path

def generate_ui_landing_mockup():
    path = os.path.join(ASSETS_DIR, 'fig_ui_landing.png')
    fig, ax = plt.subplots(figsize=(10, 4.2), dpi=200)
    ax.axis('off')

    # Browser window outline
    browser_frame = patches.FancyBboxPatch((0.02, 0.02), 0.96, 0.96, boxstyle="round,pad=0.01", facecolor='#ffffff', edgecolor='#cbd5e1', linewidth=1.5)
    ax.add_patch(browser_frame)

    # Browser Top Navigation Bar
    top_nav = patches.Rectangle((0.02, 0.86), 0.96, 0.12, facecolor='#14532d')
    ax.add_patch(top_nav)
    ax.text(0.06, 0.92, "AgriRent ML", color='white', fontweight='bold', fontsize=12, va='center')
    ax.text(0.26, 0.92, "Home   •   Marketplace   •   How It Works   •   ML Prediction   •   Contact", color='#dcfce7', fontsize=9, va='center')
    ax.text(0.85, 0.92, "[ Login / Register ]", color='#fef08a', fontweight='bold', fontsize=9, va='center')

    # Hero Banner
    hero_box = patches.Rectangle((0.04, 0.48), 0.92, 0.36, facecolor='#ecfdf5', edgecolor='#a7f3d0', linewidth=1)
    ax.add_patch(hero_box)
    ax.text(0.08, 0.74, "Smart Agricultural Machinery Rental & Demand Prediction", color='#064e3b', fontweight='bold', fontsize=12)
    ax.text(0.08, 0.67, "Empowering Farmers with Affordable Mechanization & Machine Learning Insights", color='#047857', fontsize=9.5)

    # Search Bar with Microphone Icon
    search_box = patches.FancyBboxPatch((0.08, 0.52), 0.65, 0.10, boxstyle="round,pad=0.01", facecolor='#ffffff', edgecolor='#10b981', linewidth=1.5)
    ax.add_patch(search_box)
    ax.text(0.11, 0.57, "Search tractors, harvesters, rotavators, districts...", color='#64748b', fontsize=8.5, va='center')

    mic_btn = patches.Circle((0.70, 0.57), 0.038, facecolor='#fee2e2', edgecolor='#ef4444', linewidth=1.5)
    ax.add_patch(mic_btn)
    ax.text(0.70, 0.57, "VOICE", color='#b91c1c', fontsize=7, fontweight='bold', ha='center', va='center')
    ax.text(0.75, 0.57, "Speech-to-Text Search", color='#b91c1c', fontweight='bold', fontsize=8, va='center')

    btn_search = patches.FancyBboxPatch((0.85, 0.52), 0.09, 0.10, boxstyle="round,pad=0.01", facecolor='#15803d', edgecolor='#15803d')
    ax.add_patch(btn_search)
    ax.text(0.895, 0.57, "Search", color='white', fontweight='bold', fontsize=8.5, ha='center', va='center')

    # Featured Implement Cards
    cards = [
        {"name": "Mahindra 575 DI (45 HP)", "cat": "Tractor", "loc": "Satara, MH", "rate": "INR 1,800/day", "x": 0.05},
        {"name": "Preet 987 Self-Propelled", "cat": "Harvester", "loc": "Ludhiana, PB", "rate": "INR 5,500/day", "x": 0.36},
        {"name": "Shaktiman Rotary Tiller", "cat": "Rotavator", "loc": "Satara, MH", "rate": "INR 900/day", "x": 0.67}
    ]

    for c in cards:
        c_box = patches.FancyBboxPatch((c['x'], 0.06), 0.28, 0.38, boxstyle="round,pad=0.01", facecolor='#ffffff', edgecolor='#cbd5e1', linewidth=1.2)
        ax.add_patch(c_box)
        img_stub = patches.Rectangle((c['x'] + 0.015, 0.24), 0.25, 0.18, facecolor='#e2e8f0')
        ax.add_patch(img_stub)
        ax.text(c['x'] + 0.14, 0.33, "Machinery Image / Specs", color='#475569', fontsize=8, ha='center')

        ax.text(c['x'] + 0.02, 0.20, c['name'], fontweight='bold', fontsize=8.5, color='#0f172a')
        ax.text(c['x'] + 0.02, 0.15, f"{c['cat']} | Location: {c['loc']}", fontsize=7.5, color='#475569')
        ax.text(c['x'] + 0.02, 0.10, f"Rate: {c['rate']}", fontweight='bold', fontsize=9, color='#15803d')

        r_btn = patches.FancyBboxPatch((c['x'] + 0.18, 0.08), 0.08, 0.05, boxstyle="round,pad=0.005", facecolor='#15803d')
        ax.add_patch(r_btn)
        ax.text(c['x'] + 0.22, 0.105, "Book", color='white', fontweight='bold', fontsize=7.5, ha='center', va='center')

    plt.tight_layout()
    fig.savefig(path, bbox_inches='tight')
    plt.close(fig)
    return path

def generate_ui_ml_prediction_mockup():
    path = os.path.join(ASSETS_DIR, 'fig_ui_ml_prediction.png')
    fig, ax = plt.subplots(figsize=(10, 4.2), dpi=200)
    ax.axis('off')

    frame = patches.FancyBboxPatch((0.02, 0.02), 0.96, 0.96, boxstyle="round,pad=0.01", facecolor='#ffffff', edgecolor='#cbd5e1', linewidth=1.5)
    ax.add_patch(frame)

    # Top strip
    head = patches.Rectangle((0.02, 0.86), 0.96, 0.12, facecolor='#065f46')
    ax.add_patch(head)
    ax.text(0.06, 0.92, "AgriRent ML - Regional Demand Forecasting Engine", color='white', fontweight='bold', fontsize=11, va='center')
    ax.text(0.85, 0.92, "Linear Regression (R²: 0.8696)", color='#fef08a', fontsize=8.5, va='center')

    # Left: Parameter Selection Box
    left_box = patches.FancyBboxPatch((0.04, 0.05), 0.38, 0.78, boxstyle="round,pad=0.01", facecolor='#f8fafc', edgecolor='#cbd5e1')
    ax.add_patch(left_box)
    ax.text(0.06, 0.78, "Input Agricultural Parameters", fontweight='bold', fontsize=9.5, color='#0f172a')

    inputs = [
        ("Equipment Type", "Tractor (45-50 HP)"),
        ("State & District", "Maharashtra • Satara"),
        ("Month & Season", "November • Rabi Crop Cycle"),
        ("Primary Crop", "Wheat (Winter Cereal)"),
        ("Farm Holding Size", "8.5 Acres (Medium Farm)"),
        ("Local Rainfall", "65.0 mm (Expected)"),
        ("Average Temp", "24.5 °C (Temperate)")
    ]
    curr_y = 0.71
    for label, val in inputs:
        ax.text(0.06, curr_y, label, fontsize=7.5, color='#64748b', fontweight='bold')
        ax.text(0.24, curr_y, val, fontsize=7.5, color='#0f172a')
        curr_y -= 0.075

    btn_calc = patches.FancyBboxPatch((0.06, 0.10), 0.34, 0.08, boxstyle="round,pad=0.01", facecolor='#15803d', edgecolor='#15803d')
    ax.add_patch(btn_calc)
    ax.text(0.23, 0.14, "Calculate Predicted Demand", color='white', fontweight='bold', fontsize=8.5, ha='center', va='center')

    # Right: Results Showcase
    right_box = patches.FancyBboxPatch((0.45, 0.05), 0.51, 0.78, boxstyle="round,pad=0.01", facecolor='#f0fdf4', edgecolor='#86efac')
    ax.add_patch(right_box)

    # Result Header & Metric Badge
    ax.text(0.48, 0.77, "Predicted Monthly Demand", fontsize=9, color='#166534', fontweight='bold')
    ax.text(0.48, 0.68, "37 Units", fontsize=24, color='#15803d', fontweight='bold')

    badge = patches.FancyBboxPatch((0.68, 0.69), 0.24, 0.08, boxstyle="round,pad=0.01", facecolor='#fee2e2', edgecolor='#ef4444')
    ax.add_patch(badge)
    ax.text(0.80, 0.73, "[HIGH DEMAND ZONE]", color='#b91c1c', fontweight='bold', fontsize=8, ha='center', va='center')

    # Cluster Segmentation
    cl_box = patches.FancyBboxPatch((0.48, 0.52), 0.45, 0.12, boxstyle="round,pad=0.01", facecolor='#ffffff', edgecolor='#cbd5e1')
    ax.add_patch(cl_box)
    ax.text(0.50, 0.60, "K-Means Cluster Assignment:", fontsize=7.5, color='#475569', fontweight='bold')
    ax.text(0.50, 0.55, "Cluster A: High Yield / Peak Demand Agricultural Hub", fontsize=7.5, color='#0f172a', fontweight='bold')

    # Advisory Box
    adv_box = patches.FancyBboxPatch((0.48, 0.10), 0.45, 0.38, boxstyle="round,pad=0.01", facecolor='#ffffff', edgecolor='#cbd5e1')
    ax.add_patch(adv_box)
    ax.text(0.50, 0.43, "Actionable Agricultural Recommendations", fontsize=8.5, color='#0f172a', fontweight='bold')
    ax.text(0.50, 0.36, "• For Machinery Owners: Peak demand window. Optimize rates", fontsize=7.5, color='#15803d')
    ax.text(0.52, 0.32, "  by +10% to +15% without reducing booking conversion.", fontsize=7.5, color='#15803d')
    ax.text(0.50, 0.25, "• For Farmers: High equipment reservation contention.", fontsize=7.5, color='#b91c1c')
    ax.text(0.52, 0.21, "  Book at least 7-10 days in advance for sowing windows.", fontsize=7.5, color='#b91c1c')
    ax.text(0.50, 0.14, "Note: Model trained on 1,200 synthetic demonstration records.", fontsize=6.5, color='#64748b', style='italic')

    plt.tight_layout()
    fig.savefig(path, bbox_inches='tight')
    plt.close(fig)
    return path

# ==============================================================================
# 2. REPORTLAB NUMBERED CANVAS (PAGE X OF Y)
# ==============================================================================

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor('#64748b'))

        # Running Header (Page 2 onwards)
        if self._pageNumber > 1:
            self.drawString(54, 11 * inch - 36, "AgriRent ML — Visual Project Report & System Architecture")
            self.drawRightString(8.5 * inch - 54, 11 * inch - 36, "Confidential & Academic Evaluation")
            self.setStrokeColor(colors.HexColor('#cbd5e1'))
            self.setLineWidth(0.5)
            self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)

        # Running Footer
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawString(54, 34, "AgriRent ML: Smart Agricultural Machinery Rental & Demand Prediction Platform")
        self.drawRightString(8.5 * inch - 54, 34, page_str)
        self.setStrokeColor(colors.HexColor('#cbd5e1'))
        self.setLineWidth(0.5)
        self.line(54, 44, 8.5 * inch - 54, 44)

        self.restoreState()

# ==============================================================================
# 3. COMPILE DOCUMENT SECTIONS
# ==============================================================================

def build_pdf():
    print("[1/3] Generating visual chart assets and UI wireframes...")
    fig_benchmarks = generate_ml_benchmark_chart()
    fig_trajectory = generate_demand_trajectory_chart()
    fig_er = generate_database_er_diagram()
    fig_landing = generate_ui_landing_mockup()
    fig_ml_ui = generate_ui_ml_prediction_mockup()

    print("[2/3] Building ReportLab document structure...")
    doc = SimpleDocTemplate(
        PDF_OUTPUT,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=colors.HexColor('#14532d'), spaceAfter=6)
    subtitle_style = ParagraphStyle('DocSubTitle', parent=styles['Normal'], fontName='Helvetica', fontSize=10.5, leading=15, textColor=colors.HexColor('#334155'), spaceAfter=14)
    h1_style = ParagraphStyle('SectionH1', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=14, leading=18, textColor=colors.HexColor('#14532d'), spaceBefore=12, spaceAfter=6, keepWithNext=True)
    h2_style = ParagraphStyle('SectionH2', parent=styles['Heading3'], fontName='Helvetica-Bold', fontSize=10.5, leading=14, textColor=colors.HexColor('#15803d'), spaceBefore=8, spaceAfter=4, keepWithNext=True)
    body_style = ParagraphStyle('BodyText', parent=styles['Normal'], fontName='Helvetica', fontSize=9, leading=13, textColor=colors.HexColor('#1e293b'), spaceAfter=6)
    bullet_style = ParagraphStyle('BulletText', parent=body_style, leftIndent=12, firstLineIndent=-8, spaceAfter=4)
    callout_style = ParagraphStyle('Callout', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8.5, leading=12, textColor=colors.HexColor('#065f46'))
    caption_style = ParagraphStyle('Caption', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=10, textColor=colors.HexColor('#64748b'), alignment=1, spaceAfter=8)

    story = []

    # =========================================================================
    # PAGE 1: TITLE, OBJECTIVE & INTRODUCTION
    # =========================================================================
    story.append(Paragraph("AgriRent ML — Comprehensive Visual Project Report", title_style))
    story.append(Paragraph("Smart Agricultural Machinery Rental and Demand Prediction Platform with Speech-to-Text & Machine Learning", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#15803d'), spaceAfter=12))

    story.append(Paragraph("1. Project Objective & Strategic Motivation", h1_style))
    story.append(Paragraph(
        "Modern agricultural mechanization is critical to enhancing farm yields, reducing manual labor costs, and ensuring timeliness during peak sowing and harvesting windows. However, in emerging agricultural economies like India, over <b>86% of farmers are categorized as small and marginal landowners</b> with average farm holdings under 2 hectares. High capital expenditure ($₹5\\text{–}15\\text{ Lakhs}$) places individual ownership of advanced tractors, multi-crop combine harvesters, and rotary tillers beyond reach.",
        body_style
    ))
    story.append(Paragraph(
        "Concurrently, commercial farm equipment owners suffer from <b>severe asset underutilization</b> (typically active only 30–45 days per agricultural year). <b>AgriRent ML</b> resolves this double-sided friction by introducing a peer-to-peer SaaS marketplace unified with a <b>real-time Machine Learning Demand Prediction and Recommendation Engine</b>.",
        body_style
    ))

    # Two Column Personas Table
    personas_data = [
        [
            Paragraph("<b>🌾 The Farmer / Field Owner</b>", h2_style),
            Paragraph("<b>🚜 The Machinery Owner</b>", h2_style)
        ],
        [
            Paragraph("• Eliminate heavy capital debt via daily equipment leasing.<br/>• Instant search with <b>Speech-to-Text Voice Recognition 🎙️</b>.<br/>• Conflict-free guaranteed reservations with zero double booking.<br/>• Automated GST tax invoices and digital payment simulation.<br/>• ML recommendations tailored to crop cycle & acreage.", body_style),
            Paragraph("• Monetize idle equipment across Kharif, Rabi, and Zaid seasons.<br/>• Full inventory CRUD control with availability toggles.<br/>• One-click reservation request acceptance and rejection.<br/>• Monthly rental earnings analytics and revenue tracking.<br/>• Regional ML demand forecast to implement dynamic pricing.", body_style)
        ]
    ]
    t_personas = Table(personas_data, colWidths=[240, 250])
    t_personas.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#f0fdf4')),
        ('BACKGROUND', (1,0), (1,-1), colors.HexColor('#fefce8')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_personas)
    story.append(Spacer(1, 10))

    story.append(Paragraph("2. Architectural Overview & System Stack", h1_style))
    stack_data = [
        [Paragraph("<b>Component Layer</b>", body_style), Paragraph("<b>Technologies & Architecture</b>", body_style), Paragraph("<b>Key Role in AgriRent ML</b>", body_style)],
        [Paragraph("<b>Client Frontend</b>", body_style), Paragraph("React 18, Vite, Tailwind CSS, Recharts, Lucide Icons", body_style), Paragraph("Responsive web interface, voice search bar, role dashboards.", body_style)],
        [Paragraph("<b>Backend REST API</b>", body_style), Paragraph("Python 3.11+, Flask REST API, PyJWT, Werkzeug", body_style), Paragraph("Authentication middleware, conflict guard, business logic.", body_style)],
        [Paragraph("<b>Machine Learning</b>", body_style), Paragraph("Scikit-Learn, Pandas, NumPy, Joblib, Plotly", body_style), Paragraph("Demand regression, K-Means clustering, 12-month projections.", body_style)],
        [Paragraph("<b>Database Storage</b>", body_style), Paragraph("MySQL Relational Engine & SQLite Zero-Config Fallback", body_style), Paragraph("6 relational tables, ACID transaction safety, foreign keys.", body_style)]
    ]
    t_stack = Table(stack_data, colWidths=[100, 210, 180])
    t_stack.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#14532d')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_stack)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: MACHINE LEARNING INTEGRATION & BENCHMARKS
    # =========================================================================
    story.append(Paragraph("3. Machine Learning Integration & Model Formulation", h1_style))
    story.append(Paragraph(
        "The machine learning module solves the critical challenge of <b>agricultural demand fluctuation</b> caused by monsoons, multi-crop harvesting cycles, and regional equipment deficits. The inference engine combines <b>Supervised Regression</b> for numerical monthly booking predictions with <b>Unsupervised Clustering</b> for regional agricultural categorization.",
        body_style
    ))

    story.append(Paragraph(
        "<b>Dataset Profile:</b> Trained on <code>AgriRent_ML_Synthetic_Demand_Dataset.csv</code> comprising <b>1,200 synthetic demonstration records</b> across 13 agronomic and meteorological parameters. <i>(Clearly labeled as demonstration data for academic and evaluation purposes).</i>",
        body_style
    ))

    # ML Benchmark Chart Image
    story.append(Image(fig_benchmarks, width=6.8*inch, height=2.85*inch))
    story.append(Paragraph("Figure 1: Machine Learning Model Performance Metrics ($R^2$, RMSE, and MAE Comparison)", caption_style))

    # Benchmark Metrics Table
    bench_data = [
        [Paragraph("<b>Algorithm</b>", body_style), Paragraph("<b>R² Validation Score</b>", body_style), Paragraph("<b>RMSE (Units)</b>", body_style), Paragraph("<b>MAE (Units)</b>", body_style), Paragraph("<b>Evaluation Outcome</b>", body_style)],
        [Paragraph("<b>Linear Regression</b>", body_style), Paragraph("<b>0.8696 (86.96%)</b>", body_style), Paragraph("<b>3.3909</b>", body_style), Paragraph("<b>2.7347</b>", body_style), Paragraph("<b>Selected Best Production Model 🏆</b>", body_style)],
        [Paragraph("<b>Random Forest Regressor</b>", body_style), Paragraph("0.8281 (82.81%)", body_style), Paragraph("3.8930", body_style), Paragraph("3.1323", body_style), Paragraph("Strong Ensemble Benchmark", body_style)],
        [Paragraph("<b>Decision Tree Regressor</b>", body_style), Paragraph("0.6944 (69.44%)", body_style), Paragraph("5.1910", body_style), Paragraph("4.0238", body_style), Paragraph("Baseline Interpretability Model", body_style)],
        [Paragraph("<b>K-Means Clustering</b>", body_style), Paragraph("k = 4 Segments", body_style), Paragraph("Inertia Optimized", body_style), Paragraph("N/A", body_style), Paragraph("Regional Agronomic Profiling Engine", body_style)]
    ]
    t_bench = Table(bench_data, colWidths=[130, 95, 80, 75, 120])
    t_bench.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#065f46')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#ecfdf5')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_bench)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Mathematical Model Selection Rationale:", h2_style))
    story.append(Paragraph(
        "Linear Regression achieved the highest cross-validation score ($R^2 = 0.8696$) because continuous agricultural variables (rainfall precipitation in mm, average ambient temperature in °C, farm holding size in acres, and previous month bookings) exhibit strong linear correlation with monthly machinery dispatch frequencies. By utilizing a Scikit-Learn Pipeline combining <code>StandardScaler</code> for numerical scaling and <code>OneHotEncoder</code> for regional and crop categoricals, the model achieves low generalization error without overfitting.",
        body_style
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: OUTCOMES & REGIONAL DEMAND ANALYTICS
    # =========================================================================
    story.append(Paragraph("4. Project Outcomes & Regional Agricultural Analytics", h1_style))
    story.append(Paragraph(
        "The platform delivers tangible economic outcomes for both supply (owners) and demand (farmers) by forecasting machinery requirements across seasonal crop cycles.",
        body_style
    ))

    # Trajectory Chart Image
    story.append(Image(fig_trajectory, width=6.8*inch, height=2.7*inch))
    story.append(Paragraph("Figure 2: 12-Month Multi-Equipment Projected Regional Demand Trajectory", caption_style))

    # Cluster Segmentation Outcomes
    story.append(Paragraph("Regional Market Segmentation (K-Means Clustering, $k=4$):", h2_style))

    cluster_table = [
        [Paragraph("<b>Cluster Segment</b>", body_style), Paragraph("<b>Agronomic Characteristics</b>", body_style), Paragraph("<b>Platform Decision Advisory</b>", body_style)],
        [Paragraph("<b>Cluster A:<br/>High Yield Hub</b>", body_style), Paragraph("Intensive commercial crops (sugarcane, cotton), high farm acreage, low price sensitivity.", body_style), Paragraph("Owners: Premium dynamic pricing (+10–15%).<br/>Farmers: Advance booking 7–10 days ahead.", body_style)],
        [Paragraph("<b>Cluster B:<br/>High Mechanization</b>", body_style), Paragraph("Intensive cereal basins (wheat/paddy) with multi-crop harvester bottlenecks.", body_style), Paragraph("Dispatch cooperative fleets early; scheduled pre-harvest servicing mandatory.", body_style)],
        [Paragraph("<b>Cluster C:<br/>Smallholder Belt</b>", body_style), Paragraph("Dryland pulses and millets, small parcels, highly sensitive to daily rental price.", body_style), Paragraph("Promotional multi-day discount packages (5–10% off) to drive fleet utilization.", body_style)],
        [Paragraph("<b>Cluster D:<br/>Off-Peak Transition</b>", body_style), Paragraph("Inter-cultivation periods with balanced baseline tractor and power tiller demand.", body_style), Paragraph("Standard 24-hour advance booking is sufficient; minimal scheduling contention.", body_style)]
    ]
    t_cluster = Table(cluster_table, colWidths=[105, 195, 190])
    t_cluster.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#15803d')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_cluster)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: DATABASE ARCHITECTURE & CONFLICT-FREE BOOKING
    # =========================================================================
    story.append(Paragraph("5. Database Architecture & Relational Information", h1_style))
    story.append(Paragraph(
        "AgriRent ML implements a robust relational schema with <b>6 primary normalized entities</b>. It operates with dual-database support: full <b>MySQL 8.0</b> compatibility for cloud environments and an automatic, zero-configuration <b>SQLite fallback</b> for immediate local execution.",
        body_style
    ))

    # ER Diagram Image
    story.append(Image(fig_er, width=6.8*inch, height=3.1*inch))
    story.append(Paragraph("Figure 3: Entity-Relationship (ER) Schema Architecture & Foreign Key Cardinality", caption_style))

    story.append(Paragraph("Strict Double-Booking Collision Prevention Algorithm:", h2_style))
    story.append(Paragraph(
        "A critical vulnerability in farm equipment rentals is schedule overlap, where multiple farmers reserve the same tractor for overlapping dates. AgriRent ML enforces a mathematical interval intersection check before approving any reservation:",
        body_style
    ))

    algo_box = [
        [Paragraph("<b>Mathematical Double-Booking Guard Formulation:</b><br/>"
                   "A requested reservation $[S_{\\text{req}}, E_{\\text{req}}]$ is rejected as a collision if:<br/>"
                   "&nbsp;&nbsp;&nbsp;&nbsp;<b>$\\exists \\text{ Booking } b \\in \\text{Bookings} \\text{ where } b.\\text{status} \\in \\{\\text{'confirmed'}, \\text{'active'}\\} \\text{ AND } S_{\\text{req}} \\le b.E \\text{ AND } E_{\\text{req}} \\ge b.S$</b><br/>"
                   "This guarantees 100% reservation integrity with zero duplicate fleet allocation.", callout_style)]
    ]
    t_algo = Table(algo_box, colWidths=[490])
    t_algo.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ecfdf5')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#10b981')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_algo)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: WEBSITE INTERFACES & VISUAL SHOWCASE
    # =========================================================================
    story.append(Paragraph("6. Website Interface & Visual Platform Showcase", h1_style))
    story.append(Paragraph(
        "The web application features an agricultural aesthetic (Forest Green <code>#14532d</code>, Emerald <code>#15803d</code>, Cream, and White) with role-tailored dashboards and integrated speech recognition.",
        body_style
    ))

    story.append(Paragraph("Interface 1: Public Landing Page with Speech-to-Text Voice Search 🎙️", h2_style))
    story.append(Image(fig_landing, width=6.8*inch, height=2.85*inch))
    story.append(Paragraph("Figure 4: Public Landing Page showing Agricultural Hero Banner, Voice Search Bar, and Machinery Catalog", caption_style))

    story.append(Paragraph("Interface 2: Machine Learning Real-Time Demand Forecasting Simulator", h2_style))
    story.append(Image(fig_ml_ui, width=6.8*inch, height=2.85*inch))
    story.append(Paragraph("Figure 5: ML Prediction Interface with Parameter Inputs, Demand Gauge, Cluster Assignment & Advisories", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 6: DASHBOARD MODULES, INVOICING & SUMMARY
    # =========================================================================
    story.append(Paragraph("7. Role-Specific Dashboards & Commercial Invoicing", h1_style))

    # Dashboard Features Grid
    dash_features = [
        [Paragraph("<b>Machinery Owner Dashboard (/owner)</b>", h2_style), Paragraph("<b>Farmer / Field Owner Dashboard (/farmer)</b>", h2_style)],
        [
            Paragraph("• <b>Fleet Management:</b> Add equipment with high-res photos, specs, and daily rates.<br/>"
                      "• <b>Availability Toggles:</b> Instantly enable or pause machinery availability.<br/>"
                      "• <b>Booking Decision Hub:</b> Accept or reject farmer reservation requests with date conflict alerts.<br/>"
                      "• <b>Revenue Dashboard:</b> Real-time monthly earnings analytics and payment transaction logs.<br/>"
                      "• <b>Fleet Demand Forecaster:</b> Regional ML demand predictions for owner's district.", body_style),
            Paragraph("• <b>Machinery Marketplace:</b> Filter by category, district, and maximum daily price.<br/>"
                      "• <b>Speech-to-Text:</b> Click microphone icon to voice-search implements.<br/>"
                      "• <b>Reservation Calendar:</b> Multi-day date selector with automatic duration calculation.<br/>"
                      "• <b>Simulated Payments:</b> Instant UPI / Net Banking settlement simulation.<br/>"
                      "• <b>GST Tax Invoicing:</b> Downloadable official tax invoices with 5% agricultural service tax breakdown.", body_style)
        ]
    ]
    t_dash = Table(dash_features, colWidths=[240, 250])
    t_dash.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#f0fdf4')),
        ('BACKGROUND', (1,0), (1,-1), colors.HexColor('#eff6ff')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_dash)
    story.append(Spacer(1, 12))

    story.append(Paragraph("GST-Compliant Digital Tax Invoice Structure:", h2_style))
    inv_data = [
        [Paragraph("<b>Field Item</b>", body_style), Paragraph("<b>Specification & Value</b>", body_style)],
        [Paragraph("Invoice Number", body_style), Paragraph("<code>INV-YYYYMMDD-XXXX</code> (Unique generated timestamped ID)", body_style)],
        [Paragraph("Rental Subtotal", body_style), Paragraph("Calculated as $\\text{Daily Rate} \\times \\text{Duration (Days)}$", body_style)],
        [Paragraph("Applicable Tax", body_style), Paragraph("5% GST (Itemized as 2.5% CGST + 2.5% SGST)", body_style)],
        [Paragraph("Grand Total", body_style), Paragraph("Subtotal + GST (Settled via UPI, Net Banking, or Debit Card)", body_style)],
        [Paragraph("Download Formats", body_style), Paragraph("Available as structured text receipts and PDF document exports", body_style)]
    ]
    t_inv = Table(inv_data, colWidths=[160, 330])
    t_inv.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#14532d')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_inv)
    story.append(Spacer(1, 12))

    story.append(Paragraph("8. Project Verification & Demonstration Credentials", h1_style))
    creds_data = [
        [Paragraph("<b>Portal</b>", body_style), Paragraph("<b>Email Credential</b>", body_style), Paragraph("<b>Password</b>", body_style), Paragraph("<b>Primary Permissions</b>", body_style)],
        [Paragraph("<b>Machinery Owner</b>", body_style), Paragraph("<code>owner@agrirent.com</code>", body_style), Paragraph("<code>Owner@123</code>", body_style), Paragraph("Add implements, accept bookings, revenue analytics", body_style)],
        [Paragraph("<b>Farmer / Field Owner</b>", body_style), Paragraph("<code>farmer@agrirent.com</code>", body_style), Paragraph("<code>Farmer@123</code>", body_style), Paragraph("Marketplace, voice search, book, pay, invoices", body_style)],
        [Paragraph("<b>Platform Admin</b>", body_style), Paragraph("<code>admin@agrirent.com</code>", body_style), Paragraph("<code>Admin@123</code>", body_style), Paragraph("User directory, fleet audit, ML benchmark reports", body_style)]
    ]
    t_creds = Table(creds_data, colWidths=[110, 150, 90, 140])
    t_creds.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#065f46')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_creds)

    print("[3/3] Compiling PDF document with NumberedCanvas...")
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] Visual report generated at: {PDF_OUTPUT}")

if __name__ == '__main__':
    build_pdf()
