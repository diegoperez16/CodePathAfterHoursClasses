# Boss Battle Workshop - Quick Start Guide

## 🎯 Getting Started

### 1. Install and Run
```bash
npm install
npm run dev
```

### 2. Create Your First Boss

Navigate to `http://localhost:5173` and you'll see the Boss Creation page with a code editor.

**Example Boss:**
```python
from boss import Boss

class MyBoss(Boss):
    name = "Shadow Dragon"
    hp = 150
    attack = 30
    speed = 20
    special_id = 7
    story = "A mysterious dragon that emerges from the shadows to defeat its enemies"
```

### 3. Stat Allocation Strategy

You have **200 total stat points** to distribute:

#### Tank Build (High HP)
- HP: 140
- Attack: 30
- Speed: 30

#### Balanced Build
- HP: 80
- Attack: 60
- Speed: 60

#### Glass Cannon (High Attack)
- HP: 60
- Attack: 100
- Speed: 40

#### Speed Demon (Goes First)
- HP: 70
- Attack: 50
- Speed: 80

### 4. Choosing Special Moves

Special moves activate on **Turn 3**. Choose strategically:

**Offensive:**
- ID 2: CRITICAL PULSE - Best for high attack builds
- ID 1: OVERLOAD STRIKE - Guaranteed extra damage
- ID 10: DUAL EDGE - Combo buff + damage

**Defensive:**
- ID 4: SECOND WIND - Big heal
- ID 6: STONE GUARD - Barrier protection

**Utility:**
- ID 7: BATTLE FRENZY - Permanent attack boost
- ID 9: SHADOW BLINK - Permanent speed boost
- ID 8: WEAKENING CURSE - Reduce enemy attack

**Advanced:**
- ID 3: TRUE BREAKER - Ignores barriers
- ID 11: LIFE SIPHON - Damage + heal combo

### 5. Battle Tips

- **Speed** determines who attacks first
- If speeds are equal, the first selected boss goes first
- Special moves trigger automatically on turn 3
- Barriers absorb damage before HP is affected
- Fight continues until one boss reaches 0 HP

### 6. Testing Your Boss

1. Click "Submit Boss & Fight!"
2. Navigate to Fight Simulator
3. Select two bosses
4. Click "START FIGHT!"
5. Watch the battle log unfold

### 7. Common Mistakes

❌ **Don't:**
- Exceed 200 total stat points
- Use 0 or negative values
- Choose special_id outside 1-12 range
- Leave name as "BOSS_NAME"
- Leave story as default text

✅ **Do:**
- Balance your stats strategically
- Give your boss a unique name
- Write a creative story
- Test different special move combinations
- Experiment with different builds

## 🎓 Workshop Activities

### Activity 1: Create 3 Different Bosses
Try creating:
1. A tank with high HP
2. A damage dealer with high attack
3. A speedy boss that goes first

### Activity 2: Test Matchups
- Which build wins most often?
- Does speed matter more than attack?
- How important is HP?

### Activity 3: Special Move Testing
- Test each special move
- Which ones are most powerful?
- Which ones work best with different builds?

### Activity 4: Team Tournament
- Each student creates a boss
- Round-robin tournament
- Track wins/losses
- Determine the champion!

## 🔧 Troubleshooting

**Boss won't submit:**
- Check total stats ≤ 200
- Verify all fields are filled
- Make sure name and story are unique

**Fight won't start:**
- Need at least 2 bosses created
- Select different bosses (can't fight itself)

**Editor not loading:**
- Wait a few seconds for Monaco Editor
- Refresh the page if needed

## 📊 Optional: Enable Scoreboard

See README.md for Supabase setup instructions to enable team tracking and leaderboards!

## 🎉 Have Fun!

Experiment, test strategies, and may the best boss win! ⚔️
