-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    subject TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    word_count INTEGER NOT NULL,
    summary TEXT,
    vocabulary JSONB,
    quiz JSONB,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on grade_level and subject for faster queries
CREATE INDEX IF NOT EXISTS idx_lessons_grade_level ON lessons(grade_level);
CREATE INDEX IF NOT EXISTS idx_lessons_subject ON lessons(subject);
CREATE INDEX IF NOT EXISTS idx_lessons_user_id ON lessons(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read lessons
CREATE POLICY "Allow authenticated users to read lessons"
    ON lessons FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to insert lessons
CREATE POLICY "Allow authenticated users to insert lessons"
    ON lessons FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own lessons
CREATE POLICY "Allow users to update their own lessons"
    ON lessons FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own lessons
CREATE POLICY "Allow users to delete their own lessons"
    ON lessons FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id); 