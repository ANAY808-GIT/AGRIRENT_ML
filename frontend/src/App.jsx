import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MachineryDetailPage from './pages/MachineryDetailPage';

// Protected Route Guard
import ProtectedRoute from './components/common/ProtectedRoute';

// Owner Pages
import OwnerLayout from './pages/owner/OwnerLayout';
import OwnerOverview from './pages/owner/OwnerOverview';
import AddMachinery from './pages/owner/AddMachinery';
import MyMachinery from './pages/owner/MyMachinery';
import BookingRequests from './pages/owner/BookingRequests';
import OwnerActiveRentals from './pages/owner/OwnerActiveRentals';
import OwnerRentalHistory from './pages/owner/OwnerRentalHistory';
import OwnerEarnings from './pages/owner/OwnerEarnings';
import OwnerMLDemand from './pages/owner/OwnerMLDemand';
import OwnerReviews from './pages/owner/OwnerReviews';
import OwnerProfile from './pages/owner/OwnerProfile';

// Farmer Pages
import FarmerLayout from './pages/farmer/FarmerLayout';
import FarmerOverview from './pages/farmer/FarmerOverview';
import FindMachinery from './pages/farmer/FindMachinery';
import Marketplace from './pages/farmer/Marketplace';
import MyBookings from './pages/farmer/MyBookings';
import FarmerActiveRentals from './pages/farmer/FarmerActiveRentals';
import FarmerRentalHistory from './pages/farmer/FarmerRentalHistory';
import FarmerPayments from './pages/farmer/FarmerPayments';
import FarmerMLRecommendations from './pages/farmer/FarmerMLRecommendations';
import FarmerReviews from './pages/farmer/FarmerReviews';
import FarmerProfile from './pages/farmer/FarmerProfile';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import UserManagement from './pages/admin/UserManagement';
import MachineryManagement from './pages/admin/MachineryManagement';
import BookingManagement from './pages/admin/BookingManagement';
import MLAnalytics from './pages/admin/MLAnalytics';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/machinery/:id" element={<MachineryDetailPage />} />

      {/* Machinery Owner Dashboard */}
      <Route
        path="/owner"
        element={
          <ProtectedRoute allowedRoles={['owner', 'admin']}>
            <OwnerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="dashboard" element={<OwnerOverview />} />
        <Route path="add-machinery" element={<AddMachinery />} />
        <Route path="my-machinery" element={<MyMachinery />} />
        <Route path="booking-requests" element={<BookingRequests />} />
        <Route path="active-rentals" element={<OwnerActiveRentals />} />
        <Route path="rental-history" element={<OwnerRentalHistory />} />
        <Route path="earnings" element={<OwnerEarnings />} />
        <Route path="ml-demand" element={<OwnerMLDemand />} />
        <Route path="customer-reviews" element={<OwnerReviews />} />
        <Route path="profile" element={<OwnerProfile />} />
      </Route>

      {/* Farmer Dashboard */}
      <Route
        path="/farmer"
        element={
          <ProtectedRoute allowedRoles={['farmer', 'admin']}>
            <FarmerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/farmer/dashboard" replace />} />
        <Route path="dashboard" element={<FarmerOverview />} />
        <Route path="find-machinery" element={<FindMachinery />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="my-bookings" element={<MyBookings />} />
        <Route path="active-rentals" element={<FarmerActiveRentals />} />
        <Route path="rental-history" element={<FarmerRentalHistory />} />
        <Route path="payments" element={<FarmerPayments />} />
        <Route path="ml-recommendations" element={<FarmerMLRecommendations />} />
        <Route path="reviews" element={<FarmerReviews />} />
        <Route path="profile" element={<FarmerProfile />} />
      </Route>

      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminOverview />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="machinery" element={<MachineryManagement />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="analytics" element={<AdminOverview />} />
        <Route path="ml-reports" element={<MLAnalytics />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

