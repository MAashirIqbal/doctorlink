import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/public/Landing';
import Auth from './pages/public/Auth';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import Legal from './pages/public/Legal';
import DoctorApply from './pages/public/DoctorApply';
import Doctors from './pages/public/Doctors';
import DoctorProfilePage from './pages/public/DoctorProfile';
import Contact from './pages/public/Contact';
import About from './pages/public/About';
import PatientDashboard from './pages/patient/Dashboard';
import PatientAppointments from './pages/patient/Appointments';
import AppointmentDetail from './pages/patient/AppointmentDetail';
import BookAppointment from './pages/patient/BookAppointment';
import PatientProfile from './pages/patient/Profile';
import SymptomAnalyzer from './pages/patient/SymptomAnalyzer';
import Messages from './pages/shared/Messages';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorProfile from './pages/doctor/Profile';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorPatients from './pages/doctor/Patients';
import DoctorEarnings from './pages/doctor/Earnings';
import DoctorSchedule from './pages/doctor/Schedule';
import DoctorAppointmentDetail from './pages/doctor/AppointmentDetail';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminApprovals from './pages/admin/Approvals';
import AdminUsers from './pages/admin/Users';
import AdminPatients from './pages/admin/Patients';
import AdminPatientDetail from './pages/admin/PatientDetail';
import AdminDoctors from './pages/admin/Doctors';
import AdminDoctorDetail from './pages/admin/DoctorDetail';
import AdminAppointments from './pages/admin/Appointments';
import AdminAppointmentDetail from './pages/admin/AppointmentDetail';
import AdminPayments from './pages/admin/Payments';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import AdminContactMessages from './pages/admin/ContactMessages';
import AdminAnnouncements from './pages/admin/Announcements';


function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
        <ThemeToggle />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/apply-doctor" element={<DoctorApply />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorProfilePage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />

          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute roles={['patient']}><PatientAppointments /></ProtectedRoute>} />
          <Route path="/patient/appointments/:id" element={<ProtectedRoute roles={['patient']}><AppointmentDetail /></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute roles={['patient']}><PatientProfile /></ProtectedRoute>} />
          <Route path="/patient/symptom-analyzer" element={<ProtectedRoute roles={['patient']}><SymptomAnalyzer /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute roles={['patient', 'doctor']}><Messages /></ProtectedRoute>} />
          <Route path="/book-appointment/:id" element={<ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/profile" element={<ProtectedRoute roles={['doctor']}><DoctorProfile /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute roles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute roles={['doctor']}><DoctorPatients /></ProtectedRoute>} />
          <Route path="/doctor/earnings" element={<ProtectedRoute roles={['doctor']}><DoctorEarnings /></ProtectedRoute>} />
          <Route path="/doctor/schedule" element={<ProtectedRoute roles={['doctor']}><DoctorSchedule /></ProtectedRoute>} />
          <Route path="/doctor/appointments/:id" element={<ProtectedRoute roles={['doctor']}><DoctorAppointmentDetail /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin-portal/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/approvals" element={<ProtectedRoute roles={['admin']}><AdminApprovals /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/patients" element={<ProtectedRoute roles={['admin']}><AdminPatients /></ProtectedRoute>} />
          <Route path="/admin/patients/:id" element={<ProtectedRoute roles={['admin']}><AdminPatientDetail /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute roles={['admin']}><AdminDoctors /></ProtectedRoute>} />
          <Route path="/admin/doctors/:id" element={<ProtectedRoute roles={['admin']}><AdminDoctorDetail /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute roles={['admin']}><AdminAppointments /></ProtectedRoute>} />
          <Route path="/admin/appointments/:id" element={<ProtectedRoute roles={['admin']}><AdminAppointmentDetail /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute roles={['admin']}><AdminPayments /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute roles={['admin']}><AdminAnnouncements /></ProtectedRoute>} />
          <Route path="/admin/contact-messages" element={<ProtectedRoute roles={['admin']}><AdminContactMessages /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute roles={['admin']}><AdminSettings /></ProtectedRoute>} />
        </Routes>
        </ToastProvider>
      </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
