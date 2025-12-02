# Session Table Setup

## Create the `session_bosses` table in Supabase

Run this SQL in your Supabase SQL Editor:

```sql
-- Create session_bosses table
CREATE TABLE IF NOT EXISTS session_bosses (
  id BIGSERIAL PRIMARY KEY,
  boss_name TEXT NOT NULL UNIQUE REFERENCES bosses(boss_name) ON DELETE CASCADE,
  session_wins INTEGER DEFAULT 0,
  session_losses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE session_bosses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all operations on session_bosses"
  ON session_bosses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable realtime for session_bosses table
ALTER PUBLICATION supabase_realtime ADD TABLE session_bosses;
```

---

## If you need to RECREATE the table (DROP and CREATE):

```sql
-- Drop the existing table
DROP TABLE IF EXISTS session_bosses CASCADE;

-- Create the table with session stats columns
CREATE TABLE session_bosses (
  id BIGSERIAL PRIMARY KEY,
  boss_name TEXT NOT NULL UNIQUE REFERENCES bosses(boss_name) ON DELETE CASCADE,
  session_wins INTEGER DEFAULT 0,
  session_losses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE session_bosses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on session_bosses" 
  ON session_bosses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE session_bosses;
```

## What this does:

1. **Creates `session_bosses` table** with:
   - `id`: Auto-incrementing primary key
   - `boss_name`: Reference to the boss name in the `bosses` table
   - `session_wins`: Number of wins in the current session (default 0)
   - `session_losses`: Number of losses in the current session (default 0)
   - `created_at`: Timestamp of when added to session
   - **UNIQUE constraint** on `boss_name` (can't add same boss twice)
   - **CASCADE DELETE**: If a boss is deleted from `bosses` table, it's automatically removed from session

2. **Enables Row Level Security** for the table

3. **Creates a policy** that allows all operations (you can restrict this later)

4. **Enables Realtime** so all connected clients see session changes instantly

## How it works:

- **Adding a boss to session**: Insert into `session_bosses` → All clients see it via realtime
- **Removing from session**: Delete from `session_bosses` → All clients lose it via realtime  
- **Boss stays in database**: The `bosses` table is unchanged, only session membership changes
- **Refresh page**: Session persists (unlike the old excluded list approach)

## To clear the session:

```sql
DELETE FROM session_bosses;
```

Or use the `clearSession()` function in the app (coming soon in admin panel).
