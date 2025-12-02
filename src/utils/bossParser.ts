import type { BossData, ValidationError } from '../types/boss';
import { MAX_STAT_POINTS } from '../constants/specialMoves';

export function parseBoss(code: string): BossData {
  // Extract name - handle both self.name and name = patterns
  const nameMatch = code.match(/(?:self\.)?name\s*=\s*["']([^"']+)["']/i);
  const name = nameMatch ? nameMatch[1] : '';

  // Extract hp - handle both self.hp and hp = patterns
  const hpMatch = code.match(/(?:self\.)?hp\s*=\s*(\d+)/i);
  const hp = hpMatch ? parseInt(hpMatch[1], 10) : 0;

  // Extract attack - handle both self.attack and attack = patterns
  const attackMatch = code.match(/(?:self\.)?attack\s*=\s*(\d+)/i);
  const attack = attackMatch ? parseInt(attackMatch[1], 10) : 0;

  // Extract speed - handle both self.speed and speed = patterns
  const speedMatch = code.match(/(?:self\.)?speed\s*=\s*(\d+)/i);
  const speed = speedMatch ? parseInt(speedMatch[1], 10) : 0;

  // Extract special_id - handle both self.special_id and special_id = patterns
  const specialMatch = code.match(/(?:self\.)?special_id\s*=\s*(\d+)/i);
  const special_id = specialMatch ? parseInt(specialMatch[1], 10) : 0;

  // Extract story (handle both single and double quotes, multi-line)
  const storyMatch = code.match(/(?:self\.)?story\s*=\s*["']([^"']*)["']/is);
  const story = storyMatch ? storyMatch[1] : '';

  return {
    name,
    hp,
    attack,
    speed,
    special_id,
    story,
  };
}

export function validateBoss(boss: BossData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate name
  if (!boss.name || boss.name.trim() === '' || boss.name === 'BOSS_NAME') {
    errors.push({
      field: 'name',
      message: 'Please provide a unique boss name',
    });
  }

  // Validate HP
  if (boss.hp <= 0) {
    errors.push({
      field: 'hp',
      message: 'HP must be greater than 0',
    });
  }

  // Validate attack
  if (boss.attack <= 0) {
    errors.push({
      field: 'attack',
      message: 'Attack must be greater than 0',
    });
  }

  // Validate speed
  if (boss.speed <= 0) {
    errors.push({
      field: 'speed',
      message: 'Speed must be greater than 0',
    });
  }

  // Validate stat points
  const totalStats = boss.hp + boss.attack + boss.speed;
  if (totalStats > MAX_STAT_POINTS) {
    errors.push({
      field: 'stats',
      message: `Total stats (${totalStats}) exceed maximum of ${MAX_STAT_POINTS}. Current: HP(${boss.hp}) + Attack(${boss.attack}) + Speed(${boss.speed})`,
    });
  }

  // Validate special_id
  if (boss.special_id < 1 || boss.special_id > 12) {
    errors.push({
      field: 'special_id',
      message: 'Special move ID must be between 1 and 12',
    });
  }

  // Validate story
  if (!boss.story || boss.story.trim() === '' || boss.story === 'Write your boss story here') {
    errors.push({
      field: 'story',
      message: 'Please write a unique story for your boss',
    });
  }

  return errors;
}
