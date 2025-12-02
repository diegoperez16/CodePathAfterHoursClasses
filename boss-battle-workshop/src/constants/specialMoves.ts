import type { SpecialMove, FightBoss } from '../types/boss';

export const SPECIAL_MOVES: SpecialMove[] = [
  {
    id: 1,
    name: 'OVERLOAD STRIKE',
    description: '+20 bonus damage',
    effect: (attacker: FightBoss, defender: FightBoss) => {
      const damage = attacker.currentAttack + 20;
      if (defender.barrier > 0) {
        const remainingDamage = Math.max(0, damage - defender.barrier);
        defender.barrier = Math.max(0, defender.barrier - damage);
        defender.currentHp -= remainingDamage;
      } else {
        defender.currentHp -= damage;
      }
    }
  },
  {
    id: 2,
    name: 'CRITICAL PULSE',
    description: 'Double damage this turn',
    effect: (attacker: FightBoss, defender: FightBoss) => {
      const damage = attacker.currentAttack * 2;
      if (defender.barrier > 0) {
        const remainingDamage = Math.max(0, damage - defender.barrier);
        defender.barrier = Math.max(0, defender.barrier - damage);
        defender.currentHp -= remainingDamage;
      } else {
        defender.currentHp -= damage;
      }
    }
  },
  {
    id: 3,
    name: 'TRUE BREAKER',
    description: '+15 true damage (ignores barrier)',
    effect: (_attacker: unknown, defender: FightBoss) => {
      defender.currentHp -= 15;
    }
  },
  {
    id: 4,
    name: 'SECOND WIND',
    description: 'Heal +25 HP',
    effect: (attacker: FightBoss) => {
      attacker.currentHp += 25;
    }
  },
  {
    id: 5,
    name: 'IRON SKIN',
    description: 'Heal +10 HP / +10 speed',
    effect: (attacker: FightBoss) => {
      attacker.currentHp += 10;
      attacker.currentSpeed += 10;
    }
  },
  {
    id: 6,
    name: 'STONE GUARD',
    description: 'Add +20 barrier HP',
    effect: (attacker: FightBoss) => {
      attacker.barrier += 20;
    }
  },
  {
    id: 7,
    name: 'BATTLE FRENZY',
    description: '+15 attack for rest of fight',
    effect: (attacker: FightBoss) => {
      attacker.currentAttack += 15;
    }
  },
  {
    id: 8,
    name: 'WEAKENING CURSE',
    description: 'Enemy attack -15',
    effect: (_attacker: unknown, defender: FightBoss) => {
      defender.currentAttack = Math.max(1, defender.currentAttack - 15);
    }
  },
  {
    id: 9,
    name: 'SHADOW BLINK',
    description: '+20 speed for rest of fight',
    effect: (attacker: FightBoss) => {
      attacker.currentSpeed += 20;
    }
  },
  {
    id: 10,
    name: 'DUAL EDGE',
    description: '+10 attack +10 bonus damage',
    effect: (attacker: FightBoss, defender: FightBoss) => {
      attacker.currentAttack += 10;
      const damage = attacker.currentAttack + 10;
      if (defender.barrier > 0) {
        const remainingDamage = Math.max(0, damage - defender.barrier);
        defender.barrier = Math.max(0, defender.barrier - damage);
        defender.currentHp -= remainingDamage;
      } else {
        defender.currentHp -= damage;
      }
    }
  },
  {
    id: 11,
    name: 'LIFE SIPHON',
    description: 'Enemy -15 HP / Self +10 HP',
    effect: (attacker: FightBoss, defender: FightBoss) => {
      defender.currentHp -= 15;
      attacker.currentHp += 10;
    }
  },
  {
    id: 12,
    name: 'ADRENAL SURGE',
    description: '+10 HP +10 speed',
    effect: (attacker: FightBoss) => {
      attacker.currentHp += 10;
      attacker.currentSpeed += 10;
    }
  }
];

export const PARENT_BOSS_CLASS = `# Parent Boss Class (Read-Only Reference)
class Boss:
    """
    Base Boss class with combat attributes.
    All custom bosses must inherit from this class.
    """
    def __init__(self):
        self.name = "Unknown"
        self.hp = 100
        self.attack = 50
        self.speed = 50
        self.special_id = 1
        self.story = "No story provided"
    
    def get_stats(self):
        return {
            "name": self.name,
            "hp": self.hp,
            "attack": self.attack,
            "speed": self.speed,
            "special_id": self.special_id,
            "story": self.story
        }`;

export const DEFAULT_BOSS_TEMPLATE = `from boss import Boss

class MyBoss(Boss):
    """
    Custom Boss Implementation
    Define your boss attributes below
    """
    def __init__(self):
        super().__init__()
        
        # Boss Identity
        self.name = "BOSS_NAME"
        self.story = "Write your boss story here"
        
        # Combat Stats (Total: hp + attack + speed <= 200)
        self.hp = 100      # Health points
        self.attack = 50   # Damage per turn
        self.speed = 50    # Turn order priority
        
        # Special Move (ID: 1-12)
        self.special_id = 3`;

export const MAX_STAT_POINTS = 200;
export const SPECIAL_MOVE_TURN = 3;
export const CRIT_CHANCE = 0.15; // 15% chance for critical hit
