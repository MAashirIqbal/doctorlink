import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/public/Landing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* We can add more routes here as we build them */}
      </Routes>
    </Router>
  );
}

export default App;
