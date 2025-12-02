import type { BossData, TeamRecord } from '../types/boss';
import { supabase, isSupabaseEnabled } from './supabase';

export async function insertBoss(teamName: string, boss: BossData): Promise<TeamRecord | null> {
  if (!isSupabaseEnabled() || !supabase) {
    console.warn('Supabase is not enabled');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('teams')
      .insert({
        team_name: teamName,
        boss_name: boss.name,
        hp: boss.hp,
        attack: boss.attack,
        speed: boss.speed,
        special_id: boss.special_id,
        wins: 0,
        losses: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting boss:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error inserting boss:', err);
    return null;
  }
}

export async function updateWinLoss(
  teamId: number,
  isWin: boolean
): Promise<boolean> {
  if (!isSupabaseEnabled() || !supabase) {
    console.warn('Supabase is not enabled');
    return false;
  }

  try {
    const { error } = await supabase.rpc('increment_win_loss', {
      team_id: teamId,
      is_win: isWin,
    });

    if (error) {
      console.error('Error updating win/loss:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error updating win/loss:', err);
    return false;
  }
}

export async function getScoreboard(): Promise<TeamRecord[]> {
  if (!isSupabaseEnabled() || !supabase) {
    console.warn('Supabase is not enabled');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('wins', { ascending: false })
      .order('losses', { ascending: true });

    if (error) {
      console.error('Error fetching scoreboard:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching scoreboard:', err);
    return [];
  }
}
