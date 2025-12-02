import type { BossData, TeamRecord } from '../types/boss';
import { supabase, isSupabaseEnabled } from './supabase';

export async function insertBoss(teamName: string, boss: BossData): Promise<TeamRecord | null> {
  if (!isSupabaseEnabled() || !supabase) {
    console.warn('Supabase is not enabled');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('bosses')
      .insert({
        team_name: teamName,
        boss_name: boss.name,
        hp: boss.hp,
        attack: boss.attack,
        speed: boss.speed,
        special_id: boss.special_id,
        story: boss.story,
        games_played: 0,
        games_won: 0,
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

export async function updateBossStats(
  bossId: number,
  won: boolean
): Promise<boolean> {
  if (!isSupabaseEnabled() || !supabase) {
    console.warn('Supabase is not enabled');
    return false;
  }

  try {
    const { error } = await supabase.rpc('update_boss_stats', {
      boss_id: bossId,
      won: won,
    });

    if (error) {
      console.error('Error updating boss stats:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error updating boss stats:', err);
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
      .from('bosses')
      .select('*')
      .order('games_won', { ascending: false })
      .order('games_played', { ascending: true });

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

export async function getAllBosses(): Promise<BossData[]> {
  if (!isSupabaseEnabled() || !supabase) {
    console.warn('Supabase is not enabled');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('bosses')
      .select('boss_name, hp, attack, speed, special_id, story')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bosses:', error);
      return [];
    }

    // Map database records to BossData format
    return (data || []).map((record) => ({
      name: record.boss_name,
      hp: record.hp,
      attack: record.attack,
      speed: record.speed,
      special_id: record.special_id,
      story: record.story,
    }));
  } catch (err) {
    console.error('Unexpected error fetching bosses:', err);
    return [];
  }
}

export async function getBossByName(bossName: string): Promise<BossData | null> {
  if (!isSupabaseEnabled() || !supabase) {
    console.warn('Supabase is not enabled');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('bosses')
      .select('boss_name, hp, attack, speed, special_id, story')
      .eq('boss_name', bossName)
      .single();

    if (error) {
      console.error('Error fetching boss:', error);
      return null;
    }

    return {
      name: data.boss_name,
      hp: data.hp,
      attack: data.attack,
      speed: data.speed,
      special_id: data.special_id,
      story: data.story,
    };
  } catch (err) {
    console.error('Unexpected error fetching boss:', err);
    return null;
  }
}
