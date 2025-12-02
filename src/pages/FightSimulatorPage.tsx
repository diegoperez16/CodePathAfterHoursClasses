import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Trophy, RotateCcw, Plus, BarChart3, RefreshCw, X } from 'lucide-react';
import { useBosses } from '../context/BossContext';
import { simulateFight } from '../utils/fightSimulator';
import { getAllBosses, updateBossStatsByName, updateSessionStats } from '../lib/supabaseHelpers';
import { isSupabaseEnabled } from '../lib/supabase';
import AnimatedFightLog from '../components/AnimatedFightLog';
import type { FightResult, BossData } from '../types/boss';

export default function FightSimulatorPage() {
  const { bosses, addBoss, removeBoss, realtimeEnabled } = useBosses();
  const navigate = useNavigate();
  const [selectedBoss1, setSelectedBoss1] = useState<number>(-1);
  const [selectedBoss2, setSelectedBoss2] = useState<number>(-1);
  const [fightResult, setFightResult] = useState<FightResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [loadingFromDB, setLoadingFromDB] = useState(false);
  const [showBossSelector, setShowBossSelector] = useState(false);
  const [availableBosses, setAvailableBosses] = useState<BossData[]>([]);
  const [selectedDBBosses, setSelectedDBBosses] = useState<Set<string>>(new Set());
  const [showStory, setShowStory] = useState<BossData | null>(null);

  const handleOpenBossSelector = async () => {
    if (!isSupabaseEnabled()) {
      alert('Supabase is not configured. Please set up your .env file.');
      return;
    }

    setLoadingFromDB(true);
    try {
      const dbBosses = await getAllBosses();
      if (dbBosses.length === 0) {
        alert('No bosses found in database.');
      } else {
        setAvailableBosses(dbBosses);
        setShowBossSelector(true);
      }
    } catch (error) {
      console.error('Error loading bosses:', error);
      alert('Failed to load bosses from database.');
    } finally {
      setLoadingFromDB(false);
    }
  };

  const toggleBossSelection = (bossName: string) => {
    const newSelection = new Set(selectedDBBosses);
    if (newSelection.has(bossName)) {
      newSelection.delete(bossName);
    } else {
      newSelection.add(bossName);
    }
    setSelectedDBBosses(newSelection);
  };

  const handleLoadSelected = async () => {
    let loadedCount = 0;
    for (const boss of availableBosses) {
      if (selectedDBBosses.has(boss.name)) {
        // Only add if not already in local list
        if (!bosses.find(b => b.name === boss.name)) {
          await addBoss(boss);
          loadedCount++;
        }
      }
    }
    
    setShowBossSelector(false);
    setSelectedDBBosses(new Set());
    alert(`Loaded ${loadedCount} boss${loadedCount !== 1 ? 'es' : ''} from database!`);
  };

  const handleLoadAll = async () => {
    let loadedCount = 0;
    for (const boss of availableBosses) {
      // Only add if not already in local list
      if (!bosses.find(b => b.name === boss.name)) {
        await addBoss(boss);
        loadedCount++;
      }
    }
    
    setShowBossSelector(false);
    setSelectedDBBosses(new Set());
    alert(`Loaded all ${loadedCount} bosses from database!`);
  };

  const handleFight = async () => {
    if (selectedBoss1 === -1 || selectedBoss2 === -1) {
      alert('Please select two bosses to fight!');
      return;
    }

    if (selectedBoss1 === selectedBoss2) {
      alert('Please select two different bosses!');
      return;
    }

    setIsAnimating(true);
    setFightResult(null);
    setShowComplete(false);

    // Simulate delay for dramatic effect
    setTimeout(async () => {
      const result = simulateFight(bosses[selectedBoss1], bosses[selectedBoss2]);
      setFightResult(result);
      setIsAnimating(false);
      
      // Update database stats if Supabase is enabled
      if (isSupabaseEnabled()) {
        try {
          // Update global stats (bosses table)
          await updateBossStatsByName(result.winner.name, true);
          await updateBossStatsByName(result.loser.name, false);
          
          // Update session stats (session_bosses table)
          await updateSessionStats(result.winner.name, true);
          await updateSessionStats(result.loser.name, false);
          
          console.log('✅ Database stats updated successfully');
        } catch (error) {
          console.error('Error updating boss stats:', error);
        }
      }
    }, 500);
  };

  const handleReset = () => {
    setFightResult(null);
    setSelectedBoss1(-1);
    setSelectedBoss2(-1);
    setShowComplete(false);
  };

  const handleRemoveBossFromSession = async (bossName: string, index: number) => {
    if (!confirm(`Remove ${bossName} from the arena? (This won't delete it from the database)`)) {
      return;
    }

    // Remove from session table
    await removeBoss(index);
    
    // Reset selections if removed boss was selected
    if (selectedBoss1 === index) setSelectedBoss1(-1);
    if (selectedBoss2 === index) setSelectedBoss2(-1);
    
    // Adjust selections if they're after the removed index
    if (selectedBoss1 > index) setSelectedBoss1(selectedBoss1 - 1);
    if (selectedBoss2 > index) setSelectedBoss2(selectedBoss2 - 1);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 border-b border-cyan-500/30 pb-6">
          <h1 className="text-2xl md:text-4xl font-light tracking-tight text-white mb-1 flex items-center gap-3">
            <Swords className="w-8 h-8 text-cyan-400" />
            <span>Battle Arena</span>
          </h1>
          <p className="text-sm text-gray-400 font-mono">// Initialize combat simulation</p>
          <div className="mt-4 flex flex-wrap gap-4 items-center text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              <span className="text-gray-500">entities_loaded: <span className="text-cyan-400">{bosses.length}</span></span>
            </div>
            {bosses.length >= 2 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-emerald-400">READY</span>
              </div>
            )}
            {realtimeEnabled && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-blue-400">REALTIME_SYNC</span>
              </div>
            )}
            {isSupabaseEnabled() && (
              <button
                onClick={handleOpenBossSelector}
                disabled={loadingFromDB}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-emerald-400 hover:border-emerald-500/30 font-mono text-xs py-1.5 px-3 rounded transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loadingFromDB ? 'animate-spin' : ''}`} />
                {loadingFromDB ? 'Loading...' : 'Load from DB'}
              </button>
            )}
          </div>
        </header>

        {/* Boss Selector Modal */}
        {showBossSelector && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-950 border border-emerald-500/30 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl shadow-emerald-500/20">
              <div className="bg-black border-b border-emerald-500/30 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-mono text-emerald-400">SELECT_BOSSES_TO_LOAD</h2>
                <button
                  onClick={() => {
                    setShowBossSelector(false);
                    setSelectedDBBosses(new Set());
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-2 mb-6">
                  {availableBosses.map((boss, index) => {
                    const isSelected = selectedDBBosses.has(boss.name);
                    const alreadyLoaded = bosses.find(b => b.name === boss.name);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => !alreadyLoaded && toggleBossSelection(boss.name)}
                        disabled={!!alreadyLoaded}
                        className={`w-full text-left p-4 rounded border transition-all ${
                          alreadyLoaded
                            ? 'border-gray-800 bg-gray-900/30 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'border-emerald-400 bg-emerald-500/10'
                            : 'border-gray-800 hover:border-emerald-500/30 bg-gray-900/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-mono text-sm text-white">{boss.name}</h3>
                            {alreadyLoaded && (
                              <span className="text-[10px] font-mono text-gray-500">Already loaded</span>
                            )}
                          </div>
                          {isSelected && !alreadyLoaded && (
                            <div className="w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-black"></div>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                          <div className="text-gray-500">
                            HP <span className="text-cyan-400">{boss.hp}</span>
                          </div>
                          <div className="text-gray-500">
                            ATK <span className="text-red-400">{boss.attack}</span>
                          </div>
                          <div className="text-gray-500">
                            SPD <span className="text-yellow-400">{boss.speed}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-black border-t border-emerald-500/30 px-6 py-4 flex gap-3">
                <button
                  onClick={handleLoadAll}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs py-2 px-4 rounded transition-all"
                >
                  LOAD_ALL ({availableBosses.filter(b => !bosses.find(existing => existing.name === b.name)).length})
                </button>
                <button
                  onClick={handleLoadSelected}
                  disabled={selectedDBBosses.size === 0}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-mono text-xs py-2 px-4 rounded transition-all"
                >
                  LOAD_SELECTED ({selectedDBBosses.size})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Boss Selection */}
        {!fightResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Boss 1 Selection */}
            <div className="bg-gray-950 border border-cyan-500/20 rounded p-4 shadow-lg shadow-cyan-500/10">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-cyan-500/20">
                <h2 className="text-sm font-mono text-cyan-400">ENTITY_SLOT_A</h2>
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              </div>
              
              {bosses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-mono text-xs mb-4">NULL: No entities found</p>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs py-2 px-4 rounded transition-all"
                  >
                    INITIALIZE_ENTITY
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {bosses.map((boss, index) => (
                    <div key={index} className="relative group">
                      <button
                        onClick={() => setSelectedBoss1(index)}
                        className={`w-full text-left p-3 rounded border transition-all ${
                          selectedBoss1 === index
                            ? 'border-cyan-400 bg-cyan-500/10'
                            : 'border-gray-800 hover:border-cyan-500/30 bg-gray-900/50'
                        }`}
                      >
                        <h3 className="font-mono text-sm text-white mb-2">{boss.name}</h3>
                        <div className="grid grid-cols-3 gap-2 text-[11px] font-mono mb-2">
                          <div className="text-gray-500">
                            HP <span className="text-cyan-400">{boss.hp}</span>
                          </div>
                          <div className="text-gray-500">
                            ATK <span className="text-red-400">{boss.attack}</span>
                          </div>
                          <div className="text-gray-500">
                            SPD <span className="text-yellow-400">{boss.speed}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowStory(boss);
                          }}
                          className="text-xs font-mono text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
                          title="View Story"
                        >
                          <Trophy className="w-3 h-3" />
                          <span>Story</span>
                        </button>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveBossFromSession(boss.name, index);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-400 text-white p-1.5 rounded transition-all"
                        title="Remove from session"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Boss 2 Selection */}
            <div className="bg-gray-950 border border-red-500/20 rounded p-4 shadow-lg shadow-red-500/10">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-red-500/20">
                <h2 className="text-sm font-mono text-red-400">ENTITY_SLOT_B</h2>
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
              </div>
              
              {bosses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-mono text-xs mb-4">NULL: No entities found</p>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs py-2 px-4 rounded transition-all"
                  >
                    INITIALIZE_ENTITY
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {bosses.map((boss, index) => (
                    <div key={index} className="relative group">
                      <button
                        onClick={() => setSelectedBoss2(index)}
                        className={`w-full text-left p-3 rounded border transition-all ${
                          selectedBoss2 === index
                            ? 'border-red-400 bg-red-500/10'
                            : 'border-gray-800 hover:border-red-500/30 bg-gray-900/50'
                        }`}
                      >
                        <h3 className="font-mono text-sm text-white mb-2">{boss.name}</h3>
                        <div className="grid grid-cols-3 gap-2 text-[11px] font-mono mb-2">
                          <div className="text-gray-500">
                            HP <span className="text-cyan-400">{boss.hp}</span>
                          </div>
                          <div className="text-gray-500">
                            ATK <span className="text-red-400">{boss.attack}</span>
                          </div>
                          <div className="text-gray-500">
                            SPD <span className="text-yellow-400">{boss.speed}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowStory(boss);
                          }}
                          className="text-xs font-mono text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
                          title="View Story"
                        >
                          <Trophy className="w-3 h-3" />
                          <span>Story</span>
                        </button>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveBossFromSession(boss.name, index);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-400 text-white p-1.5 rounded transition-all"
                        title="Remove from session"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Story Modal */}
        {showStory && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-950 border border-emerald-500/30 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="sticky top-0 bg-gray-950 border-b border-emerald-500/30 p-4 flex justify-between items-center">
                <h3 className="text-lg font-mono text-emerald-400">{showStory.name}_STORY</h3>
                <button
                  onClick={() => setShowStory(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-900 border border-gray-800 rounded p-4">
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm font-mono">
                    <div>
                      <span className="text-gray-500">HP:</span> <span className="text-cyan-400">{showStory.hp}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">ATK:</span> <span className="text-red-400">{showStory.attack}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">SPD:</span> <span className="text-yellow-400">{showStory.speed}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {showStory.story}
                  </div>
                </div>
                <button
                  onClick={() => setShowStory(null)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs py-2 px-4 rounded transition-all"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fight Button */}
        {!fightResult && bosses.length >= 2 && (
          <div className="text-center mb-6">
            <button
              onClick={handleFight}
              disabled={isAnimating || selectedBoss1 === -1 || selectedBoss2 === -1}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-mono text-sm py-3 px-12 rounded transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
            >
              {isAnimating ? (
                <><span className="animate-pulse">&gt;&gt;&gt;</span> SIMULATING_COMBAT...</>
              ) : (
                <><span>&gt;&gt;&gt;</span> EXECUTE_BATTLE_SIMULATION</>
              )}
            </button>
          </div>
        )}

        {/* Fight Result */}
        {fightResult && (
          <div className="space-y-4">
            {/* Winner Announcement - Only show after animation completes */}
            {showComplete && (
              <div className="bg-gray-950 border-2 border-emerald-400 rounded p-6 shadow-lg shadow-emerald-500/20 animate-fadeIn">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-emerald-400" />
                    <div className="text-xs font-mono text-emerald-400">SIMULATION_COMPLETE</div>
                  </div>
                  <div className="text-2xl font-mono text-white mb-1">VICTOR</div>
                  <div className="text-3xl font-mono font-bold text-emerald-400 mb-2">{fightResult.winner.name}</div>
                  <div className="text-xs font-mono text-gray-500">
                    defeated <span className="text-red-400">{fightResult.loser.name}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Fight Log */}
            <div className="bg-gray-950 border border-cyan-500/20 rounded shadow-lg shadow-cyan-500/10 overflow-hidden">
              <div className="bg-black border-b border-cyan-500/20 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                  </div>
                  <span className="text-xs font-mono text-gray-400">combat_log.txt</span>
                </div>
              </div>
              <AnimatedFightLog 
                logs={fightResult.logs} 
                onComplete={() => setShowComplete(true)}
              />
            </div>

            {/* Action Buttons */}
            {showComplete && (
              <div className="flex flex-wrap gap-3 justify-center animate-fadeIn">
                <button
                  onClick={handleReset}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs py-2 px-6 rounded transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  RESET_ARENA
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-mono text-xs py-2 px-6 rounded transition-all flex items-center gap-2"
                >
                  <Plus className="w-3 h-3" />
                  NEW_ENTITY
                </button>
                <button
                  onClick={() => navigate('/scoreboard')}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-mono text-xs py-2 px-6 rounded transition-all flex items-center gap-2"
                >
                  <BarChart3 className="w-3 h-3" />
                  VIEW_SCORES
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        {!fightResult && (
          <div className="text-center flex gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-mono text-xs py-2 px-6 rounded transition-all"
            >
              <span className="text-emerald-400">←</span> BACK_TO_CONSTRUCTOR
            </button>
            <button
              onClick={() => navigate('/tournament')}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-mono text-xs py-2 px-6 rounded transition-all flex items-center gap-2"
            >
              <Trophy className="w-3 h-3" />
              TOURNAMENT_MODE
            </button>
            <button
              onClick={() => navigate('/scoreboard')}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-mono text-xs py-2 px-6 rounded transition-all flex items-center gap-2"
            >
              <Trophy className="w-3 h-3" />
              VIEW_SCOREBOARD
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
