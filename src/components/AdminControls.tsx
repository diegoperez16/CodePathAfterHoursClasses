import { useState } from 'react';
import { Lock, LogOut, Settings, Trash2, XCircle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { getAllBosses, deleteBoss } from '../lib/supabaseHelpers';
import { isSupabaseEnabled } from '../lib/supabase';
import type { BossData } from '../types/boss';

export default function AdminControls() {
  const { isAdmin, setAdminMode, logout } = useAdmin();
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [error, setError] = useState('');
  const [allBosses, setAllBosses] = useState<BossData[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleOpenBossManager = async () => {
    if (!isSupabaseEnabled()) {
      alert('Supabase is not configured.');
      return;
    }

    setLoading(true);
    const bosses = await getAllBosses();
    setAllBosses(bosses);
    setLoading(false);
    setShowAdminPanel(true);
  };

  const handleDeleteBoss = async (bossName: string) => {
    if (!confirm(`Permanently delete "${bossName}" from the database? This cannot be undone!`)) {
      return;
    }

    setLoading(true);
    const success = await deleteBoss(bossName);
    setLoading(false);

    if (success) {
      alert(`✅ "${bossName}" deleted from database!`);
      // Refresh the list
      const bosses = await getAllBosses();
      setAllBosses(bosses);
    } else {
      alert(`❌ Failed to delete "${bossName}". Check console for errors.`);
    }
  };

  if (isAdmin) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-emerald-950/90 border border-emerald-500/30 rounded px-3 py-2 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs font-mono text-emerald-400">INSTRUCTOR_MODE</span>
            </div>
            <button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="text-gray-400 hover:text-emerald-400 transition-colors"
              title="Admin Panel"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Admin Panel Modal */}
        {showAdminPanel && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-950 border border-emerald-500/30 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="bg-black border-b border-emerald-500/30 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-mono text-emerald-400">ADMIN_PANEL</h2>
                <button
                  onClick={() => setShowAdminPanel(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto">
                {/* Boss Database Manager */}
                <div className="space-y-3">
                  <h3 className="text-sm font-mono text-emerald-400 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    BOSS_DATABASE_MANAGER
                  </h3>
                  <p className="text-xs font-mono text-gray-400">
                    Permanently delete bosses from the database. Students can load/remove bosses from sessions without admin access.
                  </p>
                  
                  {allBosses.length === 0 ? (
                    <button
                      onClick={handleOpenBossManager}
                      disabled={loading}
                      className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-mono text-xs py-3 px-4 rounded transition-all disabled:opacity-50"
                    >
                      {loading ? 'LOADING...' : 'LOAD_ALL_BOSSES'}
                    </button>
                  ) : (
                    <>
                      <p className="text-xs font-mono text-gray-400">
                        {allBosses.length} boss{allBosses.length !== 1 ? 'es' : ''} in database
                      </p>
                      <div className="bg-black border border-gray-800 rounded max-h-64 overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-gray-900 border-b border-gray-800 sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-mono text-gray-400">BOSS_NAME</th>
                              <th className="px-4 py-2 text-center text-xs font-mono text-gray-400">HP</th>
                              <th className="px-4 py-2 text-center text-xs font-mono text-gray-400">ATK</th>
                              <th className="px-4 py-2 text-center text-xs font-mono text-gray-400">SPD</th>
                              <th className="px-4 py-2 text-center text-xs font-mono text-gray-400">ACTION</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {allBosses.map((boss) => (
                              <tr key={boss.name} className="hover:bg-gray-900/50 transition">
                                <td className="px-4 py-2 text-xs font-mono text-white">{boss.name}</td>
                                <td className="px-4 py-2 text-xs font-mono text-center text-gray-400">{boss.hp}</td>
                                <td className="px-4 py-2 text-xs font-mono text-center text-gray-400">{boss.attack}</td>
                                <td className="px-4 py-2 text-xs font-mono text-center text-gray-400">{boss.speed}</td>
                                <td className="px-4 py-2 text-center">
                                  <button
                                    onClick={() => handleDeleteBoss(boss.name)}
                                    disabled={loading}
                                    className="bg-red-900/50 hover:bg-red-900 border border-red-500/30 text-red-300 font-mono text-xs py-1 px-3 rounded transition-all disabled:opacity-50"
                                  >
                                    DELETE
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button
                        onClick={() => setAllBosses([])}
                        className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 font-mono text-xs py-2 px-4 rounded transition-all"
                      >
                        CLOSE_BOSS_LIST
                      </button>
                    </>
                  )}
                  <p className="text-xs font-mono text-gray-500">
                    ⚠️ Warning: Deleting a boss permanently removes it from the database!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
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
