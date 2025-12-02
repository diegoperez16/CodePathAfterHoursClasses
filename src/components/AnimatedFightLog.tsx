import { useState, useEffect, useCallback } from 'react';
import type { FightLog } from '../types/boss';

interface AnimatedFightLogProps {
  logs: FightLog[];
  onComplete?: () => void;
  autoPlay?: boolean;
}

export default function AnimatedFightLog({ logs, onComplete, autoPlay = false }: AnimatedFightLogProps) {
  const [displayedLogs, setDisplayedLogs] = useState<FightLog[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [currentStats, setCurrentStats] = useState<{
    fighter1: { name: string; hp: number; attack: number; speed: number; barrier: number };
    fighter2: { name: string; hp: number; attack: number; speed: number; barrier: number };
  } | null>(null);
  const [changedStats, setChangedStats] = useState<{
    fighter1: { hp: boolean; attack: boolean; speed: boolean; barrier: boolean };
    fighter2: { hp: boolean; attack: boolean; speed: boolean; barrier: boolean };
  }>({ fighter1: { hp: false, attack: false, speed: false, barrier: false }, fighter2: { hp: false, attack: false, speed: false, barrier: false } });

  const advanceTurn = useCallback(() => {
    if (currentIndex < logs.length) {
      const log = logs[currentIndex];
      setDisplayedLogs(prev => [...prev, log]);
      
      // Update current stats if available
      if (log.currentStats) {
        // Detect which stats changed
        if (currentStats) {
          const changes = {
            fighter1: {
              hp: log.currentStats.fighter1.hp !== currentStats.fighter1.hp,
              attack: log.currentStats.fighter1.attack !== currentStats.fighter1.attack,
              speed: log.currentStats.fighter1.speed !== currentStats.fighter1.speed,
              barrier: log.currentStats.fighter1.barrier !== currentStats.fighter1.barrier,
            },
            fighter2: {
              hp: log.currentStats.fighter2.hp !== currentStats.fighter2.hp,
              attack: log.currentStats.fighter2.attack !== currentStats.fighter2.attack,
              speed: log.currentStats.fighter2.speed !== currentStats.fighter2.speed,
              barrier: log.currentStats.fighter2.barrier !== currentStats.fighter2.barrier,
            }
          };
          setChangedStats(changes);
          
          // Clear highlights after 2.5 seconds
          setTimeout(() => {
            setChangedStats({ fighter1: { hp: false, attack: false, speed: false, barrier: false }, fighter2: { hp: false, attack: false, speed: false, barrier: false } });
          }, 2500);
        }
        
        setCurrentStats(log.currentStats);
      }
      
      // Only update turn counter when we see a new turn message (contains "--- Turn")
      if (log.message.includes('--- Turn')) {
        const turnMatch = log.message.match(/Turn (\d+)/);
        if (turnMatch) {
          setCurrentTurn(parseInt(turnMatch[1]));
        }
      }
      
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, logs, currentStats]);

  useEffect(() => {
    if (currentIndex >= logs.length) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    // Auto-play turn 0 (battle initiation) messages OR if in auto mode
    const currentLog = logs[currentIndex];
    const isTurn0 = currentLog.turn === 0;
    
    if (isAutoPlay || isTurn0) {
      const timer = setTimeout(() => {
        advanceTurn();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, logs, onComplete, isAutoPlay, advanceTurn]);

  // Handle keyboard events for manual progression
  useEffect(() => {
    if (isAutoPlay) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && currentIndex < logs.length) {
        advanceTurn();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAutoPlay, currentIndex, logs.length, advanceTurn]);

  return (
    <div className="space-y-3">
      {/* Live Stats Display */}
      {currentStats && (
        <div className="bg-gray-950 border border-cyan-500/30 rounded-lg p-4 shadow-lg shadow-cyan-500/10">
          <h3 className="text-xs font-mono text-cyan-400 mb-3 uppercase tracking-wider">Live Battle Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Fighter 1 */}
            <div className="bg-gray-900/50 border border-gray-800 rounded p-3 space-y-2">
              <div className="text-sm font-mono text-white font-bold truncate">{currentStats.fighter1.name}</div>
              <div className="space-y-1.5">
                <div className={`flex items-center justify-between text-xs font-mono transition-all ${changedStats.fighter1.hp ? 'bg-cyan-500/20 px-2 py-1 rounded' : ''}`}>
                  <span className="text-gray-400">HP:</span>
                  <span className={`font-bold ${currentStats.fighter1.hp > 50 ? 'text-emerald-400' : currentStats.fighter1.hp > 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {Math.max(0, currentStats.fighter1.hp)}
                  </span>
                </div>
                <div className={`flex items-center justify-between text-xs font-mono transition-all ${changedStats.fighter1.attack ? 'bg-cyan-500/20 px-2 py-1 rounded' : ''}`}>
                  <span className="text-gray-400">ATK:</span>
                  <span className="text-orange-400 font-bold">{currentStats.fighter1.attack}</span>
                </div>
                <div className={`flex items-center justify-between text-xs font-mono transition-all ${changedStats.fighter1.speed ? 'bg-cyan-500/20 px-2 py-1 rounded' : ''}`}>
                  <span className="text-gray-400">SPD:</span>
                  <span className="text-blue-400 font-bold">{currentStats.fighter1.speed}</span>
                </div>
                <div className={`flex items-center justify-between text-xs font-mono transition-all ${changedStats.fighter1.barrier ? 'bg-cyan-500/20 px-2 py-1 rounded' : ''}`}>
                  <span className="text-gray-400">BARRIER:</span>
                  <span className="text-purple-400 font-bold">{currentStats.fighter1.barrier}</span>
                </div>
              </div>
            </div>

            {/* Fighter 2 */}
            <div className="bg-gray-900/50 border border-gray-800 rounded p-3 space-y-2">
              <div className="text-sm font-mono text-white font-bold truncate">{currentStats.fighter2.name}</div>
              <div className="space-y-1.5">
                <div className={`flex items-center justify-between text-xs font-mono transition-all ${changedStats.fighter2.hp ? 'bg-cyan-500/20 px-2 py-1 rounded' : ''}`}>
                  <span className="text-gray-400">HP:</span>
                  <span className={`font-bold ${currentStats.fighter2.hp > 50 ? 'text-emerald-400' : currentStats.fighter2.hp > 20 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {Math.max(0, currentStats.fighter2.hp)}
                  </span>
                </div>
                <div className={`flex items-center justify-between text-xs font-mono transition-all ${changedStats.fighter2.attack ? 'bg-cyan-500/20 px-2 py-1 rounded' : ''}`}>
                  <span className="text-gray-400">ATK:</span>
                  <span className="text-orange-400 font-bold">{currentStats.fighter2.attack}</span>
                </div>
                <div className={`flex items-center justify-between text-xs font-mono transition-all ${changedStats.fighter2.speed ? 'bg-cyan-500/20 px-2 py-1 rounded' : ''}`}>
                  <span className="text-gray-400">SPD:</span>
                  <span className="text-blue-400 font-bold">{currentStats.fighter2.speed}</span>
                </div>
                <div className={`flex items-center justify-between text-xs font-mono transition-all ${changedStats.fighter2.barrier ? 'bg-cyan-500/20 px-2 py-1 rounded' : ''}`}>
                  <span className="text-gray-400">BARRIER:</span>
                  <span className="text-purple-400 font-bold">{currentStats.fighter2.barrier}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-400">Mode:</span>
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`text-xs font-mono px-3 py-1 rounded transition-all ${
              isAutoPlay
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}
          >
            Auto
          </button>
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`text-xs font-mono px-3 py-1 rounded transition-all ${
              !isAutoPlay
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}
          >
            Manual
          </button>
        </div>
        {!isAutoPlay && currentIndex < logs.length && (
          <div className="text-xs font-mono text-gray-500">
            Press <span className="text-cyan-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">Enter</span> to advance
          </div>
        )}
      </div>

      {/* Battle Log */}
      <div className="bg-black rounded p-4 font-mono text-xs text-emerald-400 max-h-[500px] overflow-y-auto">
        {displayedLogs.map((log, index) => {
          // Check if this is a random event or special move
          const isRandomEvent = log.isRandomEvent;
          const isSpecialMove = log.message.includes('[SPECIAL MOVE]');
          const isRageMode = log.message.includes('[RAGE MODE]');
          const isCriticalHit = log.message.includes('** CRITICAL HIT **');
          const isKO = log.message.includes('[K.O.]');
          const isVictory = log.message.includes('[VICTORY]') || log.message.includes('WINS');
          
          // Check for stat changes (gains/loses)
          const hasStatChange = log.message.includes('gains') || 
                                log.message.includes('loses') || 
                                log.message.includes('heals') ||
                                log.message.includes('+') && (
                                  log.message.includes('attack') || 
                                  log.message.includes('speed') || 
                                  log.message.includes('barrier') ||
                                  log.message.includes('HP')
                                );
          
          // Skip empty messages (used only for stats updates)
          if (!log.message.trim()) {
            return null;
          }
          
          return (
            <div key={index}>
              {isRandomEvent && (
                <div className="my-1 bg-yellow-900/30 border border-yellow-500/50 rounded px-2 py-1 animate-pulse">
                  <div className="text-yellow-300 font-bold text-center tracking-wider">
                    WARNING
                  </div>
                </div>
              )}
              {isSpecialMove && (
                <div className="my-1 bg-purple-900/30 border border-purple-500/50 rounded px-2 py-1">
                  <div className="text-purple-300 font-bold text-center tracking-wider">
                    SPECIAL MOVE ACTIVATED
                  </div>
                </div>
              )}
              <div
                className={`mb-0.5 whitespace-pre-wrap animate-fadeIn ${
                  isRandomEvent ? 'text-yellow-300 font-bold' : 
                  isSpecialMove ? 'text-purple-300 font-bold' :
                  isRageMode ? 'text-red-400 font-bold' :
                  isCriticalHit ? 'text-orange-400 font-bold' :
                  isKO ? 'text-red-500 font-bold' :
                  isVictory ? 'text-cyan-400 font-bold text-lg' :
                  hasStatChange ? 'text-blue-300' : ''
                }`}
                style={{
                  animation: 'fadeIn 0.2s ease-in',
                }}
              >
                {log.message}
              </div>
            </div>
          );
        })}
        {currentIndex < logs.length && (
          <div className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1"></div>
        )}
      </div>

      {/* Turn Counter */}
      <div className="bg-gray-900 border border-gray-800 rounded px-4 py-2">
        <div className="flex items-center justify-center">
          <span className="text-xs font-mono text-gray-400">Turn: </span>
          <span className="text-xs font-mono text-emerald-400 ml-2">{currentTurn}</span>
        </div>
      </div>
    </div>
  );
}
