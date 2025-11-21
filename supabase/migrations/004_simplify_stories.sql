-- Simplify Stories Schema
-- Drop the complex structure and use simple text storage

-- Drop existing tables
DROP TABLE IF EXISTS story_lines CASCADE;
DROP TABLE IF EXISTS stories CASCADE;

-- Drop enums
DROP TYPE IF EXISTS story_tone CASCADE;
DROP TYPE IF EXISTS story_speed CASCADE;
DROP TYPE IF EXISTS story_pause CASCADE;

-- ============================================
-- SIMPLE STORIES TABLE
-- ============================================

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Full story text
  description TEXT,
  category TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,

  -- Ensure unique titles
  CONSTRAINT unique_story_title UNIQUE (title)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX idx_stories_last_used_at ON stories(last_used_at DESC NULLS LAST);
CREATE INDEX idx_stories_category ON stories(category);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stories_timestamp
BEFORE UPDATE ON stories
FOR EACH ROW
EXECUTE FUNCTION update_stories_updated_at();

-- Track story usage
CREATE OR REPLACE FUNCTION track_story_usage(p_story_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE stories
  SET
    usage_count = usage_count + 1,
    last_used_at = NOW()
  WHERE id = p_story_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Allow all operations (single-user app, no auth)
CREATE POLICY "Allow all operations on stories" ON stories
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE stories IS 'Stores repeatable stories as simple text blocks';
COMMENT ON COLUMN stories.content IS 'Full story text - user controls line breaks manually';
