import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Award, ArrowLeft, Globe, Users, Medal } from 'lucide-react';
import { getScoreboard, getSessionScoreboard } from '../lib/supabaseHelpers';
import { isSupabaseEnabled } from '../lib/supabase';
import type { TeamRecord } from '../types/boss';

interface LocalRecord {
  boss_name: string;
  session_wins: number;
  session_losses: number;
  created_at: string;
}

type ScoreboardRecord = TeamRecord | LocalRecord;

const isGlobalRecord = (record: ScoreboardRecord): record is TeamRecord => {
  return 'games_played' in record;
};

export default function ScoreboardPage() {
  const navigate = useNavigate();
  const [globalTeams, setGlobalTeams] = useState<TeamRecord[]>([]);
  const [sessionTeams, setSessionTeams] = useState<LocalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'global' | 'local'>('global');

  useEffect(() => {
    loadScoreboards();
  }, []);

  const loadScoreboards = async () => {
    if (!isSupabaseEnabled()) {
      setError('Supabase is not configured. Add your credentials to .env file.');
      setLoading(false);
      return;
    }

    try {
      const [globalData, sessionData] = await Promise.all([
        getScoreboard(),
        getSessionScoreboard()
      ]);
      setGlobalTeams(globalData || []);
      setSessionTeams(sessionData || []);
      console.log('📊 Scoreboards loaded:', { global: globalData?.length, session: sessionData?.length });
    } catch (err) {
      setError('Failed to load scoreboard');
      console.error('❌ Scoreboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWinRate = (wins: number, played: number) => {
    if (played === 0) return 0;
    return Math.round((wins / played) * 100);
  };

  const localScoreboard: LocalRecord[] = sessionTeams;

  const currentData: ScoreboardRecord[] = viewMode === 'global' ? globalTeams : localScoreboard;
  const top3 = currentData.slice(0, 3);
  const rest = currentData.slice(3);

  const getBossName = (record: ScoreboardRecord) => 
    record.boss_name;
  
  const getTeamName = (record: ScoreboardRecord) => 
    isGlobalRecord(record) ? record.team_name : '';
  
  const getWins = (record: ScoreboardRecord) => 
    isGlobalRecord(record) ? record.games_won : record.session_wins;
  
  const getPlayed = (record: ScoreboardRecord) => 
    isGlobalRecord(record) ? record.games_played : (record.session_wins + record.session_losses);

  if (!isSupabaseEnabled() && viewMode === 'global') {
    return (
      <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-mono text-emerald-400 mb-2">GLOBAL_SCOREBOARD</h1>
            <p className="text-sm font-mono text-gray-500">Database required</p>
          </header>

          <div className="bg-gray-950 border border-red-500/30 rounded p-8 text-center">
            <h2 className="text-xl font-mono text-red-400 mb-4">CONFIG_ERROR</h2>
            <p className="text-sm font-mono text-gray-400 mb-6">
              Supabase is not configured. Check .env file.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-mono text-xs py-2 px-6 rounded transition-all"
            >
              <ArrowLeft className="w-3 h-3 inline mr-2" />
              BACK_TO_CONSTRUCTOR
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 border-b border-emerald-500/30 pb-6">
          <h1 className="text-2xl md:text-4xl font-light tracking-tight text-white mb-1 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-emerald-400" />
            <span>Scoreboard</span>
          </h1>
          <p className="text-sm text-gray-400 font-mono">// Victory rankings and statistics</p>

          {/* Toggle between Global and Local */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setViewMode('global')}
              className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-xs transition-all ${
                viewMode === 'global'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-emerald-500/30'
              }`}
            >
              <Globe className="w-3 h-3" />
              GLOBAL_STATS
            </button>
            <button
              onClick={() => setViewMode('local')}
              className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-xs transition-all ${
                viewMode === 'local'
                  ? 'bg-cyan-500 text-black'
                  : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-cyan-500/30'
              }`}
            >
              <Users className="w-3 h-3" />
              SESSION_STATS
            </button>
          </div>
        </header>

        {loading && viewMode === 'global' ? (
          <div className="bg-gray-950 border border-emerald-500/20 rounded p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
            <p className="text-gray-400 font-mono text-sm">LOADING_DATA...</p>
          </div>
        ) : error && viewMode === 'global' ? (
          <div className="bg-red-950/50 border border-red-500/30 rounded p-6 text-center">
            <h3 className="text-lg font-mono text-red-400 mb-2">ERROR_LOG</h3>
            <p className="text-red-300 font-mono text-xs">{error}</p>
          </div>
        ) : currentData.length === 0 ? (
          <div className="bg-gray-950 border border-emerald-500/20 rounded p-12 text-center">
            <h2 className="text-xl font-mono text-gray-400 mb-4">
              {viewMode === 'global' ? 'NO_GLOBAL_DATA' : 'NO_SESSION_DATA'}
            </h2>
            <p className="text-sm font-mono text-gray-500 mb-6">
              {viewMode === 'global' 
                ? 'No bosses have been saved to the database yet.'
                : 'No fights have occurred in this session yet.'}
            </p>
            <button
              onClick={() => navigate('/fight')}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs py-2 px-6 rounded transition-all"
            >
              START_FIGHTING
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top 3 Podium */}
            {top3.length > 0 && (
              <div className="bg-gray-950 border border-emerald-500/20 rounded p-6 shadow-lg shadow-emerald-500/10">
                <h2 className="text-sm font-mono text-emerald-400 mb-6 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  TOP_CHAMPIONS
                </h2>
                
                <div className="flex items-end justify-center gap-4 mb-4">
                  {/* 2nd Place */}
                  {top3[1] && (
                    <div className="flex-1 max-w-xs">
                      <div className="bg-gray-900 border border-gray-700 rounded-t p-4 text-center">
                        <div className="flex justify-center mb-2">
                          <Medal className="w-12 h-12 text-gray-400" />
                        </div>
                        <div className="text-sm font-mono text-white mb-1">
                          {getBossName(top3[1])}
                        </div>
                        {getTeamName(top3[1]) && (
                          <div className="text-xs font-mono text-gray-500 mb-2">
                            {getTeamName(top3[1])}
                          </div>
                        )}
                        <div className="text-lg font-mono text-cyan-400">
                          {getWins(top3[1])} wins
                        </div>
                        <div className="text-xs font-mono text-gray-500">
                          {getWinRate(getWins(top3[1]), getPlayed(top3[1]))}% win rate
                        </div>
                      </div>
                      <div className="h-24 bg-gradient-to-t from-gray-700 to-gray-800 rounded-b"></div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {top3[0] && (
                    <div className="flex-1 max-w-xs">
                      <div className="bg-emerald-950 border-2 border-emerald-400 rounded-t p-4 text-center shadow-lg shadow-emerald-500/20">
                        <div className="flex justify-center mb-2">
                          <Trophy className="w-16 h-16 text-emerald-400" />
                        </div>
                        <div className="text-base font-mono text-white mb-1 font-bold">
                          {getBossName(top3[0])}
                        </div>
                        {getTeamName(top3[0]) && (
                          <div className="text-xs font-mono text-emerald-400 mb-2">
                            {getTeamName(top3[0])}
                          </div>
                        )}
                        <div className="text-2xl font-mono text-emerald-400 font-bold">
                          {getWins(top3[0])} wins
                        </div>
                        <div className="text-xs font-mono text-gray-400">
                          {getWinRate(getWins(top3[0]), getPlayed(top3[0]))}% win rate
                        </div>
                      </div>
                      <div className="h-32 bg-gradient-to-t from-emerald-600 to-emerald-500 rounded-b"></div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {top3[2] && (
                    <div className="flex-1 max-w-xs">
                      <div className="bg-gray-900 border border-gray-700 rounded-t p-4 text-center">
                        <div className="flex justify-center mb-2">
                          <Medal className="w-12 h-12 text-yellow-600" />
                        </div>
                        <div className="text-sm font-mono text-white mb-1">
                          {getBossName(top3[2])}
                        </div>
                        {getTeamName(top3[2]) && (
                          <div className="text-xs font-mono text-gray-500 mb-2">
                            {getTeamName(top3[2])}
                          </div>
                        )}
                        <div className="text-lg font-mono text-yellow-600">
                          {getWins(top3[2])} wins
                        </div>
                        <div className="text-xs font-mono text-gray-500">
                          {getWinRate(getWins(top3[2]), getPlayed(top3[2]))}% win rate
                        </div>
                      </div>
                      <div className="h-16 bg-gradient-to-t from-yellow-800 to-yellow-700 rounded-b"></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rest of Rankings */}
            {rest.length > 0 && (
              <div className="bg-gray-950 border border-emerald-500/20 rounded shadow-lg shadow-emerald-500/10 overflow-hidden">
                <div className="bg-black border-b border-emerald-500/20 px-4 py-2">
                  <span className="text-xs font-mono text-emerald-400">FULL_RANKINGS</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-900 border-b border-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-mono text-gray-400">#</th>
                        {viewMode === 'global' && (
                          <th className="px-4 py-3 text-left text-xs font-mono text-gray-400">TEAM</th>
                        )}
                        <th className="px-4 py-3 text-left text-xs font-mono text-gray-400">BOSS</th>
                        <th className="px-4 py-3 text-center text-xs font-mono text-gray-400">WINS</th>
                        <th className="px-4 py-3 text-center text-xs font-mono text-gray-400">PLAYED</th>
                        <th className="px-4 py-3 text-center text-xs font-mono text-gray-400">WIN_%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {rest.map((record, index) => {
                        const winRate = getWinRate(getWins(record), getPlayed(record));
                        return (
                          <tr key={index} className="hover:bg-gray-900/50 transition">
                            <td className="px-4 py-3">
                              <span className="text-xs font-mono text-gray-500">#{index + 4}</span>
                            </td>
                            {getTeamName(record) && (
                              <td className="px-4 py-3">
                                <span className="text-xs font-mono text-gray-400">{getTeamName(record)}</span>
                              </td>
                            )}
                            <td className="px-4 py-3">
                              <span className="text-xs font-mono text-white">
                                {getBossName(record)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-xs font-mono text-emerald-400">
                                {getWins(record)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-xs font-mono text-gray-400">
                                {getPlayed(record)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-mono ${
                                winRate >= 60 ? 'text-emerald-400' :
                                winRate >= 40 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {winRate}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-mono text-xs py-2 px-6 rounded transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" />
            BACK_TO_CONSTRUCTOR
          </button>
          <button
            onClick={() => navigate('/fight')}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-mono text-xs py-2 px-6 rounded transition-all"
          >
            GOTO_ARENA
          </button>
          {viewMode === 'global' && (
            <button
              onClick={loadScoreboards}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs py-2 px-6 rounded transition-all"
            >
              REFRESH_DATA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
