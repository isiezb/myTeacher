-- Create the stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  academic_grade TEXT,
  subject TEXT,
  word_count INTEGER,
  vocab_list JSONB DEFAULT '[]'::jsonb,
  quiz_data JSONB DEFAULT '[]'::jsonb
);

-- Add RLS policy to allow anyone to read stories but only the owner can write
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access (for now, since we're not using auth yet)
CREATE POLICY "Allow anonymous access" ON public.stories
  FOR ALL
  TO anon
  USING (true); 