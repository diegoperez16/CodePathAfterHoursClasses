import { useState, useEffect, useCallback } from 'react';
import type { FightLog } from '../types/boss';

interface AnimatedFightLogProps {
  logs: FightLog[];
  onComplete?: () => void;
  autoPlay?: boolean;
}

export default function AnimatedFightLog({ logs, onComplete, autoPlay = true }: AnimatedFightLogProps) {
  const [displayedLogs, setDisplayedLogs] = useState<FightLog[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay);

  const advanceTurn = useCallback(() => {
    if (currentIndex < logs.length) {
      setDisplayedLogs(prev => [...prev, logs[currentIndex]]);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, logs]);

  useEffect(() => {
    if (currentIndex >= logs.length) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    if (isAutoPlay) {
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
        {displayedLogs.map((log, index) => (
          <div
            key={index}
            className="mb-0.5 whitespace-pre-wrap animate-fadeIn"
            style={{
              animation: 'fadeIn 0.2s ease-in',
            }}
          >
            {log.message}
          </div>
        ))}
        {currentIndex < logs.length && (
          <div className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1"></div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="bg-gray-900 border border-gray-800 rounded px-4 py-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono text-gray-400">Progress</span>
          <span className="text-xs font-mono text-emerald-400">{currentIndex} / {logs.length}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentIndex / logs.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
