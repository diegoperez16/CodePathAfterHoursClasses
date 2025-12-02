import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Trophy, RotateCcw, Plus, BarChart3, Lock } from 'lucide-react';
import { useBosses } from '../context/BossContext';
import { useAdmin } from '../context/AdminContext';
import { simulateFight } from '../utils/fightSimulator';
import AnimatedFightLog from '../components/AnimatedFightLog';
import type { FightResult } from '../types/boss';

export default function FightSimulatorPage() {
  const { bosses } = useBosses();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [selectedBoss1, setSelectedBoss1] = useState<number>(-1);
  const [selectedBoss2, setSelectedBoss2] = useState<number>(-1);
  const [fightResult, setFightResult] = useState<FightResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const handleFight = () => {
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
    setTimeout(() => {
      const result = simulateFight(bosses[selectedBoss1], bosses[selectedBoss2]);
      setFightResult(result);
      setIsAnimating(false);
    }, 500);
  };

  const handleReset = () => {
    setFightResult(null);
    setSelectedBoss1(-1);
    setSelectedBoss2(-1);
    setShowComplete(false);
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
          <div className="mt-4 flex gap-4 text-xs font-mono">
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
          </div>
        </header>

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
                    <button
                      key={index}
                      onClick={() => setSelectedBoss1(index)}
                      className={`w-full text-left p-3 rounded border transition-all ${
                        selectedBoss1 === index
                          ? 'border-cyan-400 bg-cyan-500/10'
                          : 'border-gray-800 hover:border-cyan-500/30 bg-gray-900/50'
                      }`}
                    >
                      <h3 className="font-mono text-sm text-white mb-2">{boss.name}</h3>
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
                    <button
                      key={index}
                      onClick={() => setSelectedBoss2(index)}
                      className={`w-full text-left p-3 rounded border transition-all ${
                        selectedBoss2 === index
                          ? 'border-red-400 bg-red-500/10'
                          : 'border-gray-800 hover:border-red-500/30 bg-gray-900/50'
                      }`}
                    >
                      <h3 className="font-mono text-sm text-white mb-2">{boss.name}</h3>
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
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fight Button */}
        {!fightResult && bosses.length >= 2 && (
          <div className="text-center mb-6">
            {!isAdmin ? (
              <div className="space-y-3">
                <div className="bg-gray-950 border border-yellow-500/30 rounded p-4 max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-mono text-yellow-400">INSTRUCTOR_AUTH_REQUIRED</span>
                  </div>
                  <p className="text-xs font-mono text-gray-400 text-center">
                    Combat simulation can only be initiated by the instructor.
                  </p>
                  {selectedBoss1 !== -1 && selectedBoss2 !== -1 && (
                    <div className="mt-3 pt-3 border-t border-gray-800 text-center">
                      <p className="text-xs font-mono text-emerald-400">
                        Battle ready: <span className="text-white">{bosses[selectedBoss1].name}</span> vs <span className="text-white">{bosses[selectedBoss2].name}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
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
            )}
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
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-mono text-xs py-2 px-6 rounded transition-all"
            >
              <span className="text-emerald-400">←</span> BACK_TO_CONSTRUCTOR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
