import type { BossData, TeamRecord } from '../types/boss';
import { supabase, isSupabaseEnabled } from './supabase';

export async function insertBoss(teamName: string, boss: BossData): Promise<TeamRecord | null> {
  console.log('📝 Attempting to insert boss:', { teamName, bossName: boss.name });
  
  if (!isSupabaseEnabled() || !supabase) {
    console.warn('⚠️ Supabase is not enabled');
    return null;
  }

  try {
    console.log('🚀 Inserting boss to Supabase...');
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
      console.error('❌ Error inserting boss:', error);
      return null;
    }

    console.log('✅ Boss saved successfully:', data);
    return data;
  } catch (err) {
    console.error('💥 Unexpected error inserting boss:', err);
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

export async function updateBossStatsByName(
  bossName: string,
  won: boolean
): Promise<boolean> {
  console.log(`📊 Updating stats for ${bossName}, won: ${won}`);
  
  if (!isSupabaseEnabled() || !supabase) {
    console.warn('⚠️ Supabase is not enabled');
    return false;
  }

  try {
    // First, get the boss to find its ID
    const { data: boss, error: fetchError } = await supabase
      .from('bosses')
      .select('id')
      .eq('boss_name', bossName)
      .single();

    if (fetchError || !boss) {
      console.warn(`⚠️ Boss ${bossName} not found in database`);
      return false;
    }

    // Get current stats
    const { data: currentBoss, error: currentError } = await supabase
      .from('bosses')
      .select('games_played, games_won')
      .eq('id', boss.id)
      .single();

    if (currentError || !currentBoss) {
      console.error('❌ Error fetching current stats:', currentError);
      return false;
    }

    // Update the stats
    const { data, error: updateError } = await supabase
      .from('bosses')
      .update({
        games_played: currentBoss.games_played + 1,
        games_won: currentBoss.games_won + (won ? 1 : 0)
      })
      .eq('id', boss.id)
      .select();

    if (updateError) {
      console.error('❌ Error updating boss stats:', updateError);
      return false;
    }

    console.log(`✅ Stats updated for ${bossName}:`, data);
    return true;
  } catch (err) {
    console.error('💥 Unexpected error updating boss stats:', err);
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

export async function deleteBoss(bossName: string): Promise<boolean> {
  console.log('🗑️ Attempting to delete boss:', bossName);
  
  if (!isSupabaseEnabled() || !supabase) {
    console.warn('⚠️ Supabase is not enabled');
    return false;
  }

  try {
    console.log('🚀 Deleting boss from Supabase...');
    const { error } = await supabase
      .from('bosses')
      .delete()
      .eq('boss_name', bossName);

    if (error) {
      console.error('❌ Error deleting boss:', error);
      return false;
    }

    console.log('✅ Boss deleted successfully:', bossName);
    return true;
  } catch (err) {
    console.error('💥 Unexpected error deleting boss:', err);
    return false;
  }
}

// Session Management Functions
export async function addBossToSession(bossName: string): Promise<boolean> {
  if (!isSupabaseEnabled() || !supabase) {
    console.warn('⚠️ Supabase is not enabled');
    return false;
  }

  try {
    console.log('📥 Adding boss to session:', bossName);
    const { error } = await supabase
      .from('session_bosses')
      .insert({ boss_name: bossName })
      .select()
      .single();

    if (error) {
      // Ignore duplicate errors (boss already in session)
      if (error.code === '23505') {
        console.log('ℹ️ Boss already in session:', bossName);
        return true;
      }
      console.error('❌ Error adding boss to session:', error);
      return false;
    }

    console.log('✅ Boss added to session:', bossName);
    return true;
  } catch (err) {
    console.error('💥 Unexpected error adding boss to session:', err);
    return false;
  }
}

export async function removeBossFromSession(bossName: string): Promise<boolean> {
  if (!isSupabaseEnabled() || !supabase) {
    console.warn('⚠️ Supabase is not enabled');
    return false;
  }

  try {
    console.log('📤 Removing boss from session:', bossName);
    const { error } = await supabase
      .from('session_bosses')
      .delete()
      .eq('boss_name', bossName);

    if (error) {
      console.error('❌ Error removing boss from session:', error);
      return false;
    }

    console.log('✅ Boss removed from session:', bossName);
    return true;
  } catch (err) {
    console.error('💥 Unexpected error removing boss from session:', err);
    return false;
  }
}

export async function getSessionBosses(): Promise<BossData[]> {
  if (!isSupabaseEnabled() || !supabase) {
    console.warn('⚠️ Supabase is not enabled');
    return [];
  }

  try {
    console.log('🔍 Fetching session bosses...');
    
    // First, get all boss names from session
    const { data: sessionData, error: sessionError } = await supabase
      .from('session_bosses')
      .select('boss_name');

    if (sessionError) {
      console.error('❌ Error fetching session boss names:', sessionError);
      return [];
    }

    if (!sessionData || sessionData.length === 0) {
      console.log('ℹ️ No session bosses found');
      return [];
    }

    const bossNames = sessionData.map(item => item.boss_name);
    console.log('📋 Session boss names:', bossNames);

    // Then fetch full boss data for those names
    const { data: bossesData, error: bossesError } = await supabase
      .from('bosses')
      .select('*')
      .in('boss_name', bossNames);

    if (bossesError) {
      console.error('❌ Error fetching boss data:', bossesError);
      return [];
    }

    if (!bossesData) {
      console.log('⚠️ No boss data found for session bosses');
      return [];
    }

    // Transform to BossData format
    const bosses: BossData[] = bossesData.map((boss: any) => ({
      name: boss.boss_name,
      hp: boss.hp,
      attack: boss.attack,
      speed: boss.speed,
      special_id: boss.special_id,
      story: boss.story,
    }));

    console.log('✅ Fetched', bosses.length, 'session bosses');
    return bosses;
  } catch (err) {
    console.error('💥 Unexpected error fetching session bosses:', err);
    return [];
  }
}

export async function clearSession(): Promise<boolean> {
  if (!isSupabaseEnabled() || !supabase) {
    console.warn('⚠️ Supabase is not enabled');
    return false;
  }

  try {
    console.log('🗑️ Clearing all session bosses...');
    const { error } = await supabase
      .from('session_bosses')
      .delete()
      .neq('boss_name', ''); // Delete all rows

    if (error) {
      console.error('❌ Error clearing session:', error);
      return false;
    }

    console.log('✅ Session cleared successfully');
    return true;
  } catch (err) {
    console.error('💥 Unexpected error clearing session:', err);
    return false;
  }
}

export async function updateSessionStats(bossName: string, won: boolean): Promise<boolean> {
  if (!isSupabaseEnabled() || !supabase) {
    console.warn('⚠️ Supabase is not enabled');
    return false;
  }

  try {
    console.log('📊 Updating session stats:', bossName, won ? 'WON' : 'LOST');
    
    // Get current stats
    const { data, error: fetchError } = await supabase
      .from('session_bosses')
      .select('session_wins, session_losses')
      .eq('boss_name', bossName)
      .single();

    if (fetchError || !data) {
      console.warn('⚠️ Boss not found in session:', bossName);
      return false;
    }

    // Update stats
    const { error: updateError } = await supabase
      .from('session_bosses')
      .update({
        session_wins: won ? data.session_wins + 1 : data.session_wins,
        session_losses: won ? data.session_losses : data.session_losses + 1
      })
      .eq('boss_name', bossName);

    if (updateError) {
      console.error('❌ Error updating session stats:', updateError);
      return false;
    }

    console.log('✅ Session stats updated');
    return true;
  } catch (err) {
    console.error('💥 Unexpected error updating session stats:', err);
    return false;
  }
}

export async function getSessionScoreboard(): Promise<any[]> {
  if (!isSupabaseEnabled() || !supabase) {
    console.warn('⚠️ Supabase is not enabled');
    return [];
  }

  try {
    console.log('🔍 Fetching session scoreboard...');
    const { data, error } = await supabase
      .from('session_bosses')
      .select('boss_name, session_wins, session_losses')
      .order('session_wins', { ascending: false });

    if (error) {
      console.error('❌ Error fetching session scoreboard:', error);
      return [];
    }

    console.log('✅ Fetched session scoreboard:', data?.length || 0, 'entries');
    return data || [];
  } catch (err) {
    console.error('💥 Unexpected error fetching session scoreboard:', err);
    return [];
  }
}
