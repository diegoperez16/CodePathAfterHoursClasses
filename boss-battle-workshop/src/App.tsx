import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BossProvider } from './context/BossContext';
import { AdminProvider } from './context/AdminContext';
import BossCreationPage from './pages/BossCreationPage';
import FightSimulatorPage from './pages/FightSimulatorPage';
import ScoreboardPage from './pages/ScoreboardPage';
import AdminControls from './components/AdminControls';

function App() {
  return (
    <AdminProvider>
      <BossProvider>
        <Router>
          <AdminControls />
          <Routes>
            <Route path="/" element={<BossCreationPage />} />
            <Route path="/fight" element={<FightSimulatorPage />} />
            <Route path="/scoreboard" element={<ScoreboardPage />} />
          </Routes>
        </Router>
      </BossProvider>
    </AdminProvider>
  );
}

export default App
