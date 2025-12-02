import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Code2, Zap, Shield, Gauge, Sparkles, BookOpen, AlertCircle, Trophy } from 'lucide-react';
import { useBosses } from '../context/BossContext';
import { parseBoss, validateBoss } from '../utils/bossParser';
import { insertBoss } from '../lib/supabaseHelpers';
import { isSupabaseEnabled } from '../lib/supabase';
import { DEFAULT_BOSS_TEMPLATE, PARENT_BOSS_CLASS, SPECIAL_MOVES, MAX_STAT_POINTS } from '../constants/specialMoves';
import type { ValidationError } from '../types/boss';

export default function BossCreationPage() {
  const [code, setCode] = useState(DEFAULT_BOSS_TEMPLATE);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [teamName, setTeamName] = useState('');
  const [saving, setSaving] = useState(false);
  const { addBoss, bosses, realtimeEnabled } = useBosses();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const boss = parseBoss(code);
    const validationErrors = validateBoss(boss);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Add to local state
    addBoss(boss);
    setErrors([]);

    // Save to Supabase if enabled
    if (isSupabaseEnabled()) {
      setSaving(true);
      try {
        const team = teamName.trim() || 'Anonymous';
        const result = await insertBoss(team, boss);
        
        if (result) {
          console.log('Boss saved to Supabase:', result);
        } else {
          console.warn('Failed to save boss to Supabase');
        }
      } catch (error) {
        console.error('Error saving to Supabase:', error);
      } finally {
        setSaving(false);
      }
    }
    
    // Navigate to fight simulator
    navigate('/fight');
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      // Clear errors when user is typing
      if (errors.length > 0) {
        setErrors([]);
      }
    }
  };

  // Parse current boss for preview
  const currentBoss = parseBoss(code);
  const totalStats = currentBoss.hp + currentBoss.attack + currentBoss.speed;
  const statsValid = totalStats <= MAX_STAT_POINTS;

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 border-b border-emerald-500/30 pb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl md:text-4xl font-light tracking-tight text-white mb-1 flex items-center gap-3">
                <Code2 className="w-8 h-8 text-emerald-400" />
                <span>Boss Constructor</span>
              </h1>
              <p className="text-sm text-gray-400 font-mono">// Create and compile your boss entity</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 font-mono mb-1">Bosses Created</div>
              <div className="text-2xl font-mono text-emerald-400">{bosses.length}</div>
              {realtimeEnabled && (
                <div className="flex items-center justify-end gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                  <span className="text-[10px] text-blue-400 font-mono">LIVE</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Parent Class Reference */}
        <div className="mb-4 bg-gray-950 border border-blue-500/20 rounded p-4 shadow-lg shadow-blue-500/10">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-500/20">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-mono text-blue-400">PARENT_CLASS_REFERENCE</h3>
          </div>
          <div className="bg-black rounded p-3 font-mono text-[11px] text-blue-300 max-h-[200px] overflow-y-auto">
            <pre className="whitespace-pre-wrap">{PARENT_BOSS_CLASS}</pre>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Code Editor */}
          <div className="lg:col-span-2 bg-gray-950 border border-emerald-500/20 rounded overflow-hidden shadow-lg shadow-emerald-500/10">
            <div className="bg-black border-b border-emerald-500/20 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                </div>
                <span className="text-xs font-mono text-gray-400">boss_creator.py</span>
              </div>
              <span className="text-xs font-mono text-emerald-400">READY</span>
            </div>
            <div className="h-[600px]">
              <Editor
                height="100%"
                defaultLanguage="python"
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'SF Mono', 'Monaco', 'Courier New', monospace",
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                }}
              />
            </div>
          </div>

          {/* Stats Preview & Info */}
          <div className="space-y-4">
            {/* Boss Preview */}
            <div className="bg-gray-950 border border-emerald-500/20 rounded p-4 shadow-lg shadow-emerald-500/10">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-emerald-500/20">
                <h3 className="text-sm font-mono text-emerald-400">ENTITY_STATS</h3>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              </div>
              
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">name:</span>
                  <span className="text-white">{currentBoss.name || 'NULL'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Shield className="w-3 h-3" />hp:
                  </span>
                  <span className="text-cyan-400">{currentBoss.hp}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Zap className="w-3 h-3" />attack:
                  </span>
                  <span className="text-red-400">{currentBoss.attack}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Gauge className="w-3 h-3" />speed:
                  </span>
                  <span className="text-yellow-400">{currentBoss.speed}</span>
                </div>

                <div className="pt-2 mt-2 border-t border-gray-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-500">total:</span>
                    <span className={statsValid ? 'text-emerald-400' : 'text-red-400'}>
                      {totalStats}/{MAX_STAT_POINTS}
                    </span>
                  </div>
                  <div className="h-1 bg-gray-800 rounded overflow-hidden">
                    <div 
                      className={`h-full transition-all ${statsValid ? 'bg-emerald-400' : 'bg-red-400'}`}
                      style={{ width: `${Math.min((totalStats / MAX_STAT_POINTS) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-gray-800">
                  <span className="text-gray-500 flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3" />special_move:
                  </span>
                  <div className="text-white text-[11px] leading-relaxed">
                    <div className="text-purple-400">
                      [{currentBoss.special_id}] {SPECIAL_MOVES.find(m => m.id === currentBoss.special_id)?.name || 'NONE'}
                    </div>
                    <div className="text-gray-500 mt-0.5">
                      {SPECIAL_MOVES.find(m => m.id === currentBoss.special_id)?.description || '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Moves Reference */}
            <div className="bg-gray-950 border border-emerald-500/20 rounded p-4 shadow-lg shadow-emerald-500/10">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-500/20">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-mono text-emerald-400">AVAILABLE_MOVES</h3>
              </div>
              <div className="space-y-2 max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
                {SPECIAL_MOVES.map((move) => (
                  <div key={move.id} className="text-[11px] font-mono pb-2 border-b border-gray-800 last:border-0">
                    <div className="text-purple-400">[{move.id}] {move.name}</div>
                    <div className="text-gray-500 mt-0.5">{move.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Errors */}
            {errors.length > 0 && (
              <div className="bg-red-950/50 border border-red-500/30 rounded p-4">
                <h3 className="text-sm font-mono text-red-400 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  ERROR_LOG
                </h3>
                <ul className="space-y-1 font-mono text-[11px]">
                  {errors.map((error, idx) => (
                    <li key={idx} className="text-red-300">
                      <span className="text-red-500">&gt;</span> {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Team Name Input (for Supabase) */}
            {isSupabaseEnabled() && (
              <div className="mb-4">
                <label className="block text-xs font-mono text-gray-400 mb-2">
                  Team Name (optional)
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Your team name..."
                  className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm font-mono text-white focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] font-mono text-gray-500 mt-1">
                  Will be saved to database for scoreboard
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-mono text-sm py-3 px-4 rounded transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
            >
              {saving ? (
                <><span className="animate-pulse mr-2">&gt;&gt;&gt;</span>SAVING...</>
              ) : (
                <><span className="mr-2">&gt;</span>COMPILE_AND_DEPLOY</>
              )}
            </button>

            {/* Navigation */}
            <button
              onClick={() => navigate('/fight')}
              className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-mono text-xs py-2 px-4 rounded transition-all"
            >
              GOTO_ARENA <span className="text-emerald-400">→</span>
            </button>
            
            <button
              onClick={() => navigate('/scoreboard')}
              className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-mono text-xs py-2 px-4 rounded transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-3 h-3" />
              VIEW_SCOREBOARD
            </button>
          </div>
        </div>

        {/* Rules Section */}
        <div className="mt-8 bg-gray-950 border border-emerald-500/20 rounded p-6 shadow-lg shadow-emerald-500/10">
          <h3 className="text-sm font-mono text-emerald-400 mb-4 flex items-center gap-2">
            <span className="text-emerald-500">#</span> SYSTEM_CONSTRAINTS
          </h3>
          <ul className="space-y-2 text-xs font-mono text-gray-400">
            <li><span className="text-emerald-500">•</span> total_stats ≤ {MAX_STAT_POINTS} (hp + attack + speed)</li>
            <li><span className="text-emerald-500">•</span> all_values {'>'} 0</li>
            <li><span className="text-emerald-500">•</span> special_id range: 1–12</li>
            <li><span className="text-emerald-500">•</span> unique name && story required</li>
            <li><span className="text-emerald-500">•</span> special_moves auto-trigger @ turn_3</li>
            <li><span className="text-emerald-500">•</span> create unlimited bosses for battle testing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
