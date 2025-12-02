import { useState, useEffect } from 'react';
import type { FightLog } from '../types/boss';

interface AnimatedFightLogProps {
  logs: FightLog[];
  onComplete?: () => void;
}

export default function AnimatedFightLog({ logs, onComplete }: AnimatedFightLogProps) {
  const [displayedLogs, setDisplayedLogs] = useState<FightLog[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= logs.length) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    // Slower delay for better readability (800ms - allows time to read and build excitement)
    const timer = setTimeout(() => {
      setDisplayedLogs(prev => [...prev, logs[currentIndex]]);
      setCurrentIndex(prev => prev + 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [currentIndex, logs, onComplete]);

  return (
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
  );
}
