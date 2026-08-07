-- Create resource_engagements table
CREATE TABLE resource_engagements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id text,
  resource_id text NOT NULL,
  resource_url text NOT NULL,
  resource_type text,
  is_done boolean DEFAULT false,
  downloaded boolean DEFAULT false,
  opened boolean DEFAULT false,
  meaningful_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, topic_id, resource_id, resource_url)
);

-- Add RLS policies
ALTER TABLE resource_engagements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resource engagements"
  ON resource_engagements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resource engagements"
  ON resource_engagements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resource engagements"
  ON resource_engagements FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resource engagements"
  ON resource_engagements FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups by user and topic
CREATE INDEX idx_resource_engagements_user_topic ON resource_engagements(user_id, topic_id);

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resource_engagements_updated_at
    BEFORE UPDATE ON resource_engagements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
