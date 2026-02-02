import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/public/Landing';
import Auth from './pages/public/Auth';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        {/* We can add more routes here as we build them */}
      </Routes>
    </Router>
  );
}

export default App;
