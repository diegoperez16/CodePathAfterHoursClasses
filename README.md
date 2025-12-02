# Boss Battle Workshop

An interactive coding workshop web app where students write Python-like code to create Boss characters that battle each other in a turn-based simulator with dynamic combat mechanics.

## Features

- **Boss Creation Page**: Code editor with Monaco Editor for writing Python boss classes
- **Fight Simulator**: Turn-based combat system with special moves, critical hits, and random events
- **Instructor Controls**: Password-protected fight initiation for workshop leaders
- **Advanced Combat Mechanics**: Dodge system, rage mode, critical hits, and random battle events
- **Scoreboard** (Optional): Track wins/losses with Supabase integration
- **Regex Parsing**: Safely extracts boss stats without executing code
- **12 Unique Special Moves**: Each with different strategic effects

## Quick Start

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Instructor Access

To initiate battles as an instructor:
1. Click "Instructor Login" in the top-right corner
2. Enter password: `instructor2024`
3. You can now start fights while students watch

Students can create bosses and select fighters, but only the instructor can execute battles.

## How to Play

### 1. Create a Boss

Students edit the Python template in the code editor:

```python
from boss import Boss

class MyBoss(Boss):
    name = "Thunder King"
    hp = 120
    attack = 40
    speed = 40
    special_id = 2
    story = "A mighty warrior who controls lightning"
```

**Rules:**
- Total stats (HP + Attack + Speed) ≤ 200 points
- All stats must be > 0
- Choose special_id between 1-12
- Provide unique name and story

### 2. Fight Simulator

- Select two bosses from your created list
- Instructor initiates the battle (password required)
- Watch the turn-based combat unfold with dynamic mechanics:
  - **Critical Hits**: 15% chance for 1.5x damage
  - **Dodge System**: 5% base + speed advantage for evasion
  - **Rage Mode**: +10 attack when HP drops below 50%
  - **Random Events**: 15% chance per turn for environmental effects
  - **Special Moves**: Auto-trigger on turn 3
- See detailed animated battle logs

### 3. Scoreboard (Optional)

Track team records and boss statistics using Supabase.

## Combat Mechanics

### Critical Hits
- 15% chance on every attack
- Deals 1.5x damage
- Displays as `** CRITICAL HIT **` in combat log

### Dodge/Evasion System
- Base dodge chance: 5%
- Speed advantage bonus: +1% per speed point difference
- Maximum dodge chance: 30%
- Fast bosses can completely avoid attacks

### Rage Mode
- Activates when HP falls to 50% or below
- Grants +10 attack bonus
- Triggers once per battle
- Creates comeback opportunities

### Random Battle Events (75% chance per turn)

| Event | Effect |
|-------|--------|
| SOLAR FLARE | Both fighters lose 5 HP |
| ADRENALINE RUSH | Random fighter gains +5 attack |
| EARTHQUAKE | Both fighters take 8 damage |
| HEALING MIST | Random fighter heals 10 HP |
| SPEED BOOST | Random fighter gains +3 speed |
| POWER DRAIN | Random fighter loses 5 attack |

## Special Moves

| ID | Name | Effect |
|----|------|--------|
| 1 | OVERLOAD STRIKE | +20 bonus damage |
| 2 | CRITICAL PULSE | Double damage this turn |
| 3 | TRUE BREAKER | +15 true damage (ignores barrier) |
| 4 | SECOND WIND | Heal +25 HP |
| 5 | IRON SKIN | Heal +10 HP / +10 speed |
| 6 | STONE GUARD | Add +20 barrier HP |
| 7 | BATTLE FRENZY | +15 attack for rest of fight |
| 8 | WEAKENING CURSE | Enemy attack -15 |
| 9 | SHADOW BLINK | +20 speed for rest of fight |
| 10 | DUAL EDGE | +10 attack +10 bonus damage |
| 11 | LIFE SIPHON | Enemy -15 HP / Self +10 HP |
| 12 | ADRENAL SURGE | +10 HP +10 speed |

## Supabase Setup (Optional)

To enable the scoreboard feature:

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Create a `bosses` table with this SQL:

```sql
CREATE TABLE bosses (
  id BIGSERIAL PRIMARY KEY,
  team_name TEXT NOT NULL,
  boss_name TEXT NOT NULL UNIQUE,
  hp INTEGER NOT NULL CHECK (hp > 0),
  attack INTEGER NOT NULL CHECK (attack > 0),
  speed INTEGER NOT NULL CHECK (speed > 0),
  special_id INTEGER NOT NULL CHECK (special_id BETWEEN 1 AND 12),
  story TEXT NOT NULL,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_bosses_games_won ON bosses(games_won DESC);
CREATE INDEX idx_bosses_boss_name ON bosses(boss_name);

-- Create function to update boss stats after a fight
CREATE OR REPLACE FUNCTION update_boss_stats(boss_id BIGINT, won BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE bosses 
  SET 
    games_played = games_played + 1,
    games_won = games_won + (CASE WHEN won THEN 1 ELSE 0 END)
  WHERE id = boss_id;
END;
$$ LANGUAGE plpgsql;
```

4. Copy `.env.example` to `.env` and add your credentials:

```bash
cp .env.example .env
```

5. Update `.env` with your Supabase URL and anon key
6. Restart the development server

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **React Router** - Navigation
- **TailwindCSS** - Styling
- **Monaco Editor** - Code editor
- **lucide-react** - Icon library
- **Supabase** - Optional database (scoreboard)

## Project Structure

```
src/
├── components/          # Reusable components (AnimatedFightLog, AdminControls)
├── constants/          # Special moves and game constants
├── context/            # React context (BossContext, AdminContext)
├── lib/                # Supabase utilities
├── pages/              # Main pages (Boss Creation, Fight, Scoreboard)
├── types/              # TypeScript interfaces
└── utils/              # Boss parser and fight simulator logic
```

## Key Features

### Safe Code Parsing

The app **does not execute** student code. Instead, it uses regex patterns to extract:
- Boss name
- HP, Attack, Speed stats
- Special move ID
- Story text

### Fight Simulation Logic

1. **Pre-Battle**: Determine turn order by speed
2. **Each Turn**:
   - Check for random events (15% chance)
   - Check for rage mode activation (HP ≤ 50%)
   - Calculate dodge chance based on speed difference
   - Apply attack damage (with critical hit chance)
   - On turn 3: auto-trigger special move
3. **Victory Condition**: Fight ends when HP ≤ 0
4. **Winner**: Determined by remaining HP

### Combat Flow Example

```
Turn 1: Thunder King attacks for 40 damage
Turn 2: Fire Dragon DODGED the attack! (Speed advantage)
Turn 3: [SPECIAL MOVE] Thunder King uses CRITICAL PULSE!
Turn 4: [RANDOM EVENT: HEALING MIST] Fire Dragon heals 10 HP!
Turn 5: [RAGE MODE] Fire Dragon enters RAGE MODE! Attack +10!
Turn 6: Fire Dragon attacks for 50 damage ** CRITICAL HIT **
```

### Instructor Mode

- Password-protected access (default: `instructor2024`)
- Only instructors can initiate battles
- Students can create bosses and select fighters
- Perfect for workshop demonstrations
- Persistent login via localStorage

### Validation

- Enforces 200 stat point maximum
- Validates all required fields
- Prevents invalid special move IDs
- Ensures unique names and stories

## Educational Use

Perfect for:
- Intro to programming workshops
- Python syntax practice
- Game design concepts (balance, strategy, RNG)
- Strategic thinking and stat allocation
- Competitive coding events
- Understanding probability and randomness in games

## Game Balance Strategy

Students must balance their 200 stat points across three attributes:
- **High HP**: Survive longer, trigger rage mode, tank damage
- **High Attack**: Deal more damage, stronger crits, better rage mode bonus
- **High Speed**: Go first, higher dodge chance, avoid attacks

With the new mechanics:
- Speed builds can dodge attacks (up to 30% evasion)
- Tank builds benefit from rage mode (+10 attack at 50% HP)
- Balanced builds adapt to random events
- Critical hits (15%) reward aggressive strategies

## License

MIT License - Feel free to use for educational purposes!
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
