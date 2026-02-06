import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/public/Landing';
import Auth from './pages/public/Auth';
import ForgotPassword from './pages/public/ForgotPassword';
import Legal from './pages/public/Legal';
import DoctorApply from './pages/public/DoctorApply';
import Doctors from './pages/public/Doctors';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/apply-doctor" element={<DoctorApply />} />
        <Route path="/doctors" element={<Doctors />} />
        {/* We can add more routes here as we build them */}
      </Routes>
    </Router>
  );
}

export default App;
