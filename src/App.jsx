import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/public/Landing';
import Auth from './pages/public/Auth';
import ForgotPassword from './pages/public/ForgotPassword';
import Legal from './pages/public/Legal';
import DoctorApply from './pages/public/DoctorApply';
import Doctors from './pages/public/Doctors';
import DoctorProfilePage from './pages/public/DoctorProfile';
import Contact from './pages/public/Contact';
import About from './pages/public/About';
import PatientDashboard from './pages/patient/Dashboard';
import PatientAppointments from './pages/patient/Appointments';
import BookAppointment from './pages/patient/BookAppointment';
import PatientProfile from './pages/patient/Profile';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorProfile from './pages/doctor/Profile';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorPatients from './pages/doctor/Patients';
import DoctorEarnings from './pages/doctor/Earnings';
import DoctorSchedule from './pages/doctor/Schedule';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminApprovals from './pages/admin/Approvals';
import AdminUsers from './pages/admin/Users';
import AdminAppointments from './pages/admin/Appointments';
import AdminPayments from './pages/admin/Payments';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import AdminContactMessages from './pages/admin/ContactMessages';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/apply-doctor" element={<DoctorApply />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorProfilePage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />

          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute roles={['patient']}><PatientAppointments /></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute roles={['patient']}><PatientProfile /></ProtectedRoute>} />
          <Route path="/book-appointment/:id" element={<ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/profile" element={<ProtectedRoute roles={['doctor']}><DoctorProfile /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute roles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute roles={['doctor']}><DoctorPatients /></ProtectedRoute>} />
          <Route path="/doctor/earnings" element={<ProtectedRoute roles={['doctor']}><DoctorEarnings /></ProtectedRoute>} />
          <Route path="/doctor/schedule" element={<ProtectedRoute roles={['doctor']}><DoctorSchedule /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin-portal/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/approvals" element={<ProtectedRoute roles={['admin']}><AdminApprovals /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute roles={['admin']}><AdminAppointments /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute roles={['admin']}><AdminPayments /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/contact-messages" element={<ProtectedRoute roles={['admin']}><AdminContactMessages /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute roles={['admin']}><AdminSettings /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
