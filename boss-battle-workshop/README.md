# ⚔️ Boss Battle Workshop

An interactive coding workshop web app where students write Python-like code to create Boss characters that battle each other in a turn-based simulator.

## 🎮 Features

- **Boss Creation Page**: Code editor with Monaco Editor for writing Python boss classes
- **Fight Simulator**: Turn-based combat system with special moves
- **Scoreboard** (Optional): Track wins/losses with Supabase integration
- **Regex Parsing**: Safely extracts boss stats without executing code
- **12 Unique Special Moves**: Each with different strategic effects

## 🚀 Quick Start

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

## 📝 How to Play

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
- Watch the turn-based combat unfold
- Special moves trigger automatically on turn 3
- See detailed battle logs

### 3. Scoreboard (Optional)

Track team records and boss statistics using Supabase.

## ✨ Special Moves

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

## 🗄️ Supabase Setup (Optional)

To enable the scoreboard feature:

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Create a `teams` table with this SQL:

```sql
CREATE TABLE teams (
  id BIGSERIAL PRIMARY KEY,
  team_name TEXT NOT NULL,
  boss_name TEXT NOT NULL,
  hp INTEGER NOT NULL,
  attack INTEGER NOT NULL,
  speed INTEGER NOT NULL,
  special_id INTEGER NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to increment wins/losses
CREATE OR REPLACE FUNCTION increment_win_loss(team_id BIGINT, is_win BOOLEAN)
RETURNS VOID AS $$
BEGIN
  IF is_win THEN
    UPDATE teams SET wins = wins + 1 WHERE id = team_id;
  ELSE
    UPDATE teams SET losses = losses + 1 WHERE id = team_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

4. Copy `.env.example` to `.env` and add your credentials:

```bash
cp .env.example .env
```

5. Update `.env` with your Supabase URL and anon key
6. Restart the development server

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **React Router** - Navigation
- **TailwindCSS** - Styling
- **Monaco Editor** - Code editor
- **Supabase** - Optional database (scoreboard)

## 📁 Project Structure

```
src/
├── components/          # Reusable components
├── constants/          # Special moves and game constants
├── context/            # React context for state management
├── lib/                # Supabase utilities
├── pages/              # Main pages (Boss Creation, Fight, Scoreboard)
├── types/              # TypeScript interfaces
└── utils/              # Boss parser and fight simulator logic
```

## 🧪 Key Features

### Safe Code Parsing

The app **does not execute** student code. Instead, it uses regex patterns to extract:
- Boss name
- HP, Attack, Speed stats
- Special move ID
- Story text

### Fight Simulation Logic

1. Determine turn order by speed
2. Each turn: deal attack damage to opponent
3. On turn 3: auto-trigger special move
4. Special effects apply immediately
5. Fight ends when HP ≤ 0
6. Winner determined by remaining HP

### Validation

- Enforces 200 stat point maximum
- Validates all required fields
- Prevents invalid special move IDs
- Ensures unique names and stories

## 🎓 Educational Use

Perfect for:
- Intro to programming workshops
- Python syntax practice
- Game design concepts
- Strategic thinking
- Competitive coding events

## 📄 License

MIT License - Feel free to use for educational purposes!
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
