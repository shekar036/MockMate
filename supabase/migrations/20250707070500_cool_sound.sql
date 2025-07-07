/*
# Create Interview Sessions Table

1. New Tables
   - `interview_sessions`
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key to auth.users)
     - `role` (text, interview role)
     - `question` (text, interview question)
     - `user_answer` (text, user's response)
     - `feedback_text` (text, AI feedback)
     - `feedback_audio_url` (text, audio feedback URL)
     - `score` (integer, 1-10 score)
     - `session_id` (text, groups questions in same session)
     - `created_at` (timestamp)

2. Security
   - Enable RLS on `interview_sessions` table
   - Add policy for authenticated users to read/write their own data
*/

CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  question text NOT NULL,
  user_answer text NOT NULL,
  feedback_text text NOT NULL,
  feedback_audio_url text,
  score integer NOT NULL CHECK (score >= 1 AND score <= 10),
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own interview sessions"
  ON interview_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interview sessions"
  ON interview_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interview sessions"
  ON interview_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interview sessions"
  ON interview_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_session_id ON interview_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_created_at ON interview_sessions(created_at);