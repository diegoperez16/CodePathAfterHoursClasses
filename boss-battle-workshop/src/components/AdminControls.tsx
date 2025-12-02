import { useState } from 'react';
import { Lock, LogOut } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function AdminControls() {
  const { isAdmin, setAdminMode, logout } = useAdmin();
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMode(password);
    if (password === 'instructor2024') {
      setShowLogin(false);
      setPassword('');
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  if (isAdmin) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-emerald-950/90 border border-emerald-500/30 rounded px-3 py-2 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-mono text-emerald-400">INSTRUCTOR_MODE</span>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {!showLogin ? (
        <button
          onClick={() => setShowLogin(true)}
          className="bg-gray-900/90 border border-gray-700 rounded px-3 py-2 flex items-center gap-2 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
        >
          <Lock className="w-4 h-4" />
          <span className="text-xs font-mono">Instructor Login</span>
        </button>
      ) : (
        <div className="bg-gray-950 border border-gray-700 rounded p-4 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">
                Instructor Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm font-mono text-white focus:border-emerald-500 focus:outline-none"
                placeholder="Enter password"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-xs font-mono text-red-400">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs py-2 px-4 rounded transition-all"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogin(false);
                  setPassword('');
                  setError('');
                }}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-xs py-2 px-4 rounded transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
