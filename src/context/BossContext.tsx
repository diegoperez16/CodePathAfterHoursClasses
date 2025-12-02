import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { BossData } from '../types/boss';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { getSessionBosses, addBossToSession, removeBossFromSession, deleteBoss as deleteBossFromDB } from '../lib/supabaseHelpers';

interface BossContextType {
  bosses: BossData[];
  addBoss: (boss: BossData) => Promise<void>;
  removeBoss: (index: number) => Promise<void>;
  deleteBoss: (bossName: string) => Promise<boolean>;
  clearBosses: () => void;
  realtimeEnabled: boolean;
}

const BossContext = createContext<BossContextType | undefined>(undefined);

export function BossProvider({ children }: { children: ReactNode }) {
  const [bosses, setBosses] = useState<BossData[]>([]);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

  // Load all bosses from database on mount if Supabase is enabled
  useEffect(() => {
    if (isSupabaseEnabled()) {
      loadBossesFromDB();
      setupRealtimeSubscription();
      setRealtimeEnabled(true);
    }
  }, []);

  const loadBossesFromDB = async () => {
    try {
      const sessionBosses = await getSessionBosses();
      setBosses(sessionBosses);
      console.log('🔄 Loaded', sessionBosses.length, 'bosses from session');
    } catch (error) {
      console.error('Error loading session bosses:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!supabase) return;

    console.log('📡 Setting up realtime subscription...');

    const channel = supabase
      .channel('session_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_bosses'
        },
        async (payload) => {
          console.log('🔔 Session realtime event:', payload);

          if (payload.eventType === 'INSERT') {
            const bossName = payload.new.boss_name;
            // Fetch the full boss data and add to session
            const sessionBosses = await getSessionBosses();
            const newBoss = sessionBosses.find(b => b.name === bossName);
            
            if (newBoss) {
              setBosses((prev) => {
                if (prev.find(b => b.name === newBoss.name)) {
                  return prev;
                }
                console.log('✨ New boss added to session via realtime:', newBoss.name);
                return [...prev, newBoss];
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const bossName = payload.old.boss_name;
            setBosses((prev) => prev.filter(b => b.name !== bossName));
            console.log('🗑️ Boss removed from session via realtime:', bossName);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });

    // Cleanup on unmount
    return () => {
      console.log('🔌 Unsubscribing from realtime');
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  };

  const addBoss = async (boss: BossData) => {
    // Add to session table (realtime will update all clients)
    await addBossToSession(boss.name);
    
    // If realtime is not enabled, add locally
    if (!realtimeEnabled) {
      setBosses((prev) => [...prev, boss]);
    }
  };

  const removeBoss = async (index: number) => {
    const bossToRemove = bosses[index];
    if (!bossToRemove) return;

    // Remove from session table (realtime will update all clients)
    await removeBossFromSession(bossToRemove.name);
    
    // If realtime is not enabled, remove locally
    if (!realtimeEnabled) {
      setBosses((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const deleteBoss = async (bossName: string): Promise<boolean> => {
    if (!isSupabaseEnabled()) {
      // If Supabase is not enabled, just remove locally
      setBosses((prev) => prev.filter(b => b.name !== bossName));
      return true;
    }

    // Delete from database (realtime will handle local removal)
    const success = await deleteBossFromDB(bossName);
    
    // If realtime is not enabled, remove locally
    if (success && !realtimeEnabled) {
      setBosses((prev) => prev.filter(b => b.name !== bossName));
    }
    
    return success;
  };

  const clearBosses = () => {
    setBosses([]);
  };

  return (
    <BossContext.Provider value={{ bosses, addBoss, removeBoss, deleteBoss, clearBosses, realtimeEnabled }}>
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
