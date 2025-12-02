import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { BossData } from '../types/boss';

interface BossContextType {
  bosses: BossData[];
  addBoss: (boss: BossData) => void;
  removeBoss: (index: number) => void;
  clearBosses: () => void;
}

const BossContext = createContext<BossContextType | undefined>(undefined);

export function BossProvider({ children }: { children: ReactNode }) {
  const [bosses, setBosses] = useState<BossData[]>([]);

  const addBoss = (boss: BossData) => {
    setBosses((prev) => [...prev, boss]);
  };

  const removeBoss = (index: number) => {
    setBosses((prev) => prev.filter((_, i) => i !== index));
  };

  const clearBosses = () => {
    setBosses([]);
  };

  return (
    <BossContext.Provider value={{ bosses, addBoss, removeBoss, clearBosses }}>
      {children}
    </BossContext.Provider>
  );
}

export function useBosses() {
  const context = useContext(BossContext);
  if (context === undefined) {
    throw new Error('useBosses must be used within a BossProvider');
  }
  return context;
}
