# Supabase Setup Guide

## Step 1: Create Supabase Account and Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"
4. Fill in:
   - Project name: `boss-battle-workshop`
   - Database password: (create a strong password and save it)
   - Region: (choose closest to you)
5. Click "Create new project" and wait for setup to complete (~2 minutes)

## Step 2: Create the Bosses Table

1. In your Supabase dashboard, click on "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy and paste this SQL:

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

-- Create indexes for faster queries
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

4. Click "Run" to execute the SQL
5. You should see "Success. No rows returned" message

## Step 2.5: Enable Realtime (IMPORTANT!)

For real-time synchronization to work across all users, you must enable the `bosses` table in the realtime publication:

**Option 1: Using the Dashboard (Easiest)**
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/dxuxdukcsvjhqmdzpghl
2. Click **"Database"** in the left sidebar
3. Click **"Publications"** (not Replication!)
4. Find the `supabase_realtime` publication
5. Click on it to expand
6. Toggle **ON** the `bosses` table
7. Done!

**Option 2: Using SQL**
1. Go to **SQL Editor** in your Supabase dashboard
2. Run this command:
```sql
alter publication supabase_realtime add table bosses;
```

Without this step, real-time sync will not work. Bosses will only load when users manually click "Load from DB".

## Step 3: Get Your API Credentials

1. In Supabase dashboard, click "Project Settings" (gear icon) in the left sidebar
2. Click "API" in the settings menu
3. You'll see two important values:
   - **Project URL**: Something like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`

## Step 4: Configure Your App

1. In your project folder, copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` file and add your credentials:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Save the file

## Step 5: Restart Your Dev Server

```bash
npm run dev
```

## Testing the Connection

1. Navigate to the Boss Creation page
2. Create a boss with all required fields
3. The boss should now be saved to Supabase
4. Go to Scoreboard page - you should see your boss listed
5. In Battle Arena, click "Load from DB" to fetch all bosses from database

## Features Now Available

### Boss Storage
- All created bosses are automatically saved to Supabase
- Bosses persist across sessions and devices
- Each boss has a unique name (enforced by database)

### Scoreboard
- View all bosses ranked by wins
- See games played and win percentage
- Track team stats over time

### Load from Database
- In Battle Arena, click "Load from DB" button
- Fetches all bosses from database
- Adds them to local boss list for fighting
- Perfect for workshop scenarios where students create bosses on different computers

### After Each Fight
You can update boss stats by calling:
```typescript
import { updateBossStats } from './lib/supabaseHelpers';

// After a fight
await updateBossStats(winnerBossId, true);  // Winner
await updateBossStats(loserBossId, false);  // Loser
```

## Database Schema

The `bosses` table structure:

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Auto-increment primary key |
| team_name | TEXT | Name of the team/student |
| boss_name | TEXT | Unique boss name |
| hp | INTEGER | Health points (must be > 0) |
| attack | INTEGER | Attack stat (must be > 0) |
| speed | INTEGER | Speed stat (must be > 0) |
| special_id | INTEGER | Special move ID (1-12) |
| story | TEXT | Boss backstory |
| games_played | INTEGER | Total games played |
| games_won | INTEGER | Total games won |
| created_at | TIMESTAMP | When boss was created |

## Troubleshooting

### "Supabase is not configured" error
- Make sure `.env` file exists in project root
- Check that variable names start with `VITE_`
- Restart dev server after creating `.env`

### "Failed to insert boss" error
- Check that boss name is unique
- Verify all stats are greater than 0
- Ensure special_id is between 1-12
- Check Supabase dashboard > Table Editor > bosses to see if data exists

### Connection timeout
- Verify your Supabase project is active (not paused)
- Check your internet connection
- Verify API URL and key are correct

### Row Level Security (RLS) errors
If you see RLS policy errors, run this in SQL Editor:
```sql
ALTER TABLE bosses ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (for workshop use)
CREATE POLICY "Allow all operations" ON bosses
FOR ALL USING (true) WITH CHECK (true);
```

## Security Notes

For a production app, you would want to:
- Enable Row Level Security (RLS)
- Create proper authentication
- Add policies to restrict who can insert/update data
- Use service role key for admin operations

For a workshop/classroom setting, the current setup is fine!
