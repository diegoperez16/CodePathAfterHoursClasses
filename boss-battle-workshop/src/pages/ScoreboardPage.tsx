import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScoreboard } from '../lib/supabaseHelpers';
import { isSupabaseEnabled } from '../lib/supabase';
import type { TeamRecord } from '../types/boss';
import { SPECIAL_MOVES } from '../constants/specialMoves';

export default function ScoreboardPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScoreboard();
  }, []);

  const loadScoreboard = async () => {
    if (!isSupabaseEnabled()) {
      setError('Supabase is not configured. Add your credentials to .env file.');
      setLoading(false);
      return;
    }

    try {
      const data = await getScoreboard();
      setTeams(data);
    } catch (err) {
      setError('Failed to load scoreboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getWinRate = (team: TeamRecord) => {
    const total = team.wins + team.losses;
    if (total === 0) return 0;
    return Math.round((team.wins / total) * 100);
  };

  if (!isSupabaseEnabled()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 p-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2">📊 Scoreboard</h1>
            <p className="text-xl text-green-200">Supabase Integration Required</p>
          </header>

          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">⚠️ Configuration Needed</h2>
            <p className="text-gray-600 mb-4">
              To use the scoreboard feature, you need to configure Supabase:
            </p>
            <ol className="text-left text-gray-700 space-y-2 mb-6 max-w-2xl mx-auto">
              <li>1. Create a free account at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a></li>
              <li>2. Create a new project</li>
              <li>3. Create a table named 'teams' with columns: id (int8), team_name (text), boss_name (text), hp (int4), attack (int4), speed (int4), special_id (int4), wins (int4), losses (int4), created_at (timestamp)</li>
              <li>4. Create a `.env` file in the project root with:
                <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
{`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key`}
                </pre>
              </li>
              <li>5. Restart the development server</li>
            </ol>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition"
            >
              ← Back to Boss Creation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">📊 Scoreboard</h1>
          <p className="text-xl text-green-200">Top Boss Champions</p>
        </header>

        {loading ? (
          <div className="bg-white rounded-lg shadow-xl p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading scoreboard...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold text-red-800 mb-2">❌ Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-xl p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Teams Yet</h2>
            <p className="text-gray-600 mb-6">Be the first to submit a boss to the scoreboard!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition"
            >
              Create Your First Boss
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Boss
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                    HP
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                    ATK
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                    SPD
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                    Special
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                    W/L
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                    Win %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teams.map((team, index) => (
                  <tr
                    key={team.id}
                    className={`${
                      index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'
                    } transition`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && `#${index + 1}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{team.team_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-purple-600">{team.boss_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-blue-600">{team.hp}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-red-600">{team.attack}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-green-600">{team.speed}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-xs text-gray-600">
                        {SPECIAL_MOVES.find(m => m.id === team.special_id)?.name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-gray-900">
                        {team.wins} - {team.losses}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-bold ${
                        getWinRate(team) >= 60 ? 'text-green-600' :
                        getWinRate(team) >= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {getWinRate(team)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition"
          >
            ← Boss Creation
          </button>
          <button
            onClick={() => navigate('/fight')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition"
          >
            ⚔️ Fight Arena
          </button>
          <button
            onClick={loadScoreboard}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
