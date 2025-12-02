export interface BossData {
  name: string;
  hp: number;
  attack: number;
  speed: number;
  special_id: number;
  story: string;
}

export interface SpecialMove {
  id: number;
  name: string;
  description: string;
  effect: (attacker: FightBoss, defender: FightBoss) => void;
}

export interface FightBoss extends BossData {
  currentHp: number;
  currentAttack: number;
  currentSpeed: number;
  barrier: number;
  used_special: boolean;
  rage_mode: boolean;
}

export interface FightLog {
  turn: number;
  message: string;
  attacker?: string;
  defender?: string;
}

export interface FightResult {
  winner: BossData;
  loser: BossData;
  logs: FightLog[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface TeamRecord {
  id?: number;
  team_name: string;
  boss_name: string;
  hp: number;
  attack: number;
  speed: number;
  special_id: number;
  story: string;
  games_played: number;
  games_won: number;
  created_at?: string;
}
