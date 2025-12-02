import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { BossProvider } from './context/BossContext';
import { AdminProvider } from './context/AdminContext';
import BossCreationPage from './pages/BossCreationPage';
import FightSimulatorPage from './pages/FightSimulatorPage';
import ScoreboardPage from './pages/ScoreboardPage';
import TournamentPage from './pages/TournamentPage';
import AdminControls from './components/AdminControls';

function AppContent() {
  const location = useLocation();
  const showAdminControls = location.pathname !== '/';

  return (
    <>
      {showAdminControls && <AdminControls />}
      <Routes>
        <Route path="/" element={<BossCreationPage />} />
        <Route path="/fight" element={<FightSimulatorPage />} />
        <Route path="/scoreboard" element={<ScoreboardPage />} />
        <Route path="/tournament" element={<TournamentPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AdminProvider>
      <BossProvider>
        <Router>
          <AppContent />
        </Router>
      </BossProvider>
    </AdminProvider>
  );
}

export default App
