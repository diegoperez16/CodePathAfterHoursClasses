import type { BossData, FightBoss, FightLog, FightResult } from '../types/boss';
import { SPECIAL_MOVES, SPECIAL_MOVE_TURN, CRIT_CHANCE } from '../constants/specialMoves';

export function simulateFight(boss1: BossData, boss2: BossData): FightResult {
  const logs: FightLog[] = [];
  
  // Initialize fighting bosses with current stats
  const fighter1: FightBoss = {
    ...boss1,
    currentHp: boss1.hp,
    currentAttack: boss1.attack,
    currentSpeed: boss1.speed,
    barrier: 0,
    used_special: false,
  };

  const fighter2: FightBoss = {
    ...boss2,
    currentHp: boss2.hp,
    currentAttack: boss2.attack,
    currentSpeed: boss2.speed,
    barrier: 0,
    used_special: false,
  };

  logs.push({
    turn: 0,
    message: `[BATTLE INITIATED] ${fighter1.name} vs ${fighter2.name}`,
  });

  logs.push({
    turn: 0,
    message: `${fighter1.name}: HP=${fighter1.hp}, ATK=${fighter1.attack}, SPD=${fighter1.speed}`,
  });

  logs.push({
    turn: 0,
    message: `${fighter2.name}: HP=${fighter2.hp}, ATK=${fighter2.attack}, SPD=${fighter2.speed}`,
  });

  let turn = 1;
  let attacker: FightBoss;
  let defender: FightBoss;

  // Determine who goes first based on speed
  if (fighter1.currentSpeed >= fighter2.currentSpeed) {
    attacker = fighter1;
    defender = fighter2;
    logs.push({
      turn: 0,
      message: `${fighter1.name} has higher speed and will attack first!`,
    });
  } else {
    attacker = fighter2;
    defender = fighter1;
    logs.push({
      turn: 0,
      message: `${fighter2.name} has higher speed and will attack first!`,
    });
  }

  // Fight loop
  while (fighter1.currentHp > 0 && fighter2.currentHp > 0) {
    logs.push({
      turn,
      message: `\n--- Turn ${turn} ---`,
    });

    // Check if it's turn 3 and special move should be used
    if (turn === SPECIAL_MOVE_TURN && !attacker.used_special) {
      const specialMove = SPECIAL_MOVES.find(m => m.id === attacker.special_id);
      if (specialMove) {
        logs.push({
          turn,
          message: `[SPECIAL MOVE] ${attacker.name} uses ${specialMove.name}! (${specialMove.description})`,
          attacker: attacker.name,
        });
        
        // Apply special move effect
        specialMove.effect(attacker, defender);
        attacker.used_special = true;

        logs.push({
          turn,
          message: `${attacker.name}: HP=${Math.max(0, attacker.currentHp)}, ATK=${attacker.currentAttack}, Barrier=${attacker.barrier}`,
        });

        logs.push({
          turn,
          message: `${defender.name}: HP=${Math.max(0, defender.currentHp)}, ATK=${defender.currentAttack}, Barrier=${defender.barrier}`,
        });
      }
    } else {
      // Normal attack with critical hit chance
      let damage = attacker.currentAttack;
      const isCrit = Math.random() < CRIT_CHANCE;
      
      if (isCrit) {
        damage = Math.floor(damage * 1.5);
      }
      
      if (defender.barrier > 0) {
        const barrierDamage = Math.min(defender.barrier, damage);
        defender.barrier -= barrierDamage;
        damage -= barrierDamage;
        
        logs.push({
          turn,
          message: `${attacker.name} attacks${isCrit ? ' ** CRITICAL HIT **' : ''}! ${barrierDamage} damage absorbed by barrier`,
          attacker: attacker.name,
          defender: defender.name,
        });
        
        if (damage > 0) {
          defender.currentHp -= damage;
          logs.push({
            turn,
            message: `${damage} damage dealt to ${defender.name}! (${Math.max(0, defender.currentHp)} HP remaining)`,
          });
        }
      } else {
        defender.currentHp -= damage;
        logs.push({
          turn,
          message: `${attacker.name} attacks for ${damage} damage${isCrit ? ' ** CRITICAL HIT **' : ''}! ${defender.name} has ${Math.max(0, defender.currentHp)} HP remaining`,
          attacker: attacker.name,
          defender: defender.name,
        });
      }
    }

    // Check if defender is defeated
    if (defender.currentHp <= 0) {
      logs.push({
        turn,
        message: `[K.O.] ${defender.name} has been defeated!`,
      });
      break;
    }

    // Swap attacker and defender for next turn
    [attacker, defender] = [defender, attacker];
    turn++;

    // Safety check to prevent infinite loops
    if (turn > 100) {
      logs.push({
        turn,
        message: '⚠️ Fight exceeded 100 turns! Ending in a draw...',
      });
      break;
    }
  }

  // Determine winner
  let winner: BossData;
  let loser: BossData;

  if (fighter1.currentHp > fighter2.currentHp) {
    winner = boss1;
    loser = boss2;
    logs.push({
      turn,
      message: `[VICTORY] ${boss1.name} WINS!`,
    });
  } else if (fighter2.currentHp > fighter1.currentHp) {
    winner = boss2;
    loser = boss1;
    logs.push({
      turn,
      message: `[VICTORY] ${boss2.name} WINS!`,
    });
  } else {
    // Draw - give it to the one with higher original HP
    if (boss1.hp >= boss2.hp) {
      winner = boss1;
      loser = boss2;
    } else {
      winner = boss2;
      loser = boss1;
    }
    logs.push({
      turn,
      message: `[DRAW] Tie! ${winner.name} wins by tiebreaker.`,
    });
  }

  return {
    winner,
    loser,
    logs,
  };
}
