-- Stories Table Migration
-- Stores repeatable stories for controlled playback

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE story_tone AS ENUM (
  'normal',
  'excited',
  'serious',
  'whisper',
  'dramatic',
  'sad',
  'happy',
  'urgent',
  'contemplative'
);

CREATE TYPE story_speed AS ENUM (
  'very_slow',
  'slow',
  'normal',
  'fast',
  'very_fast'
);

CREATE TYPE story_pause AS ENUM (
  'none',
  'short',
  'medium',
  'long',
  'very_long'
);

-- ============================================
-- TABLES
-- ============================================

-- Stories table: stores complete stories
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT[],

  -- Default voice settings for the story
  default_tone story_tone DEFAULT 'normal',
  default_speed story_speed DEFAULT 'normal',
  default_pause story_pause DEFAULT 'short',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,

  -- Ensure unique titles
  CONSTRAINT unique_story_title UNIQUE (title)
);

-- Story lines table: individual lines within stories
CREATE TABLE story_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  line_order INTEGER NOT NULL,
  text TEXT NOT NULL,

  -- Per-line voice settings (optional overrides)
  tone_tag story_tone,
  speed story_speed,
  pause_after story_pause,

  -- Optional metadata
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique ordering within story
  CONSTRAINT unique_line_order UNIQUE (story_id, line_order)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX idx_stories_last_used_at ON stories(last_used_at DESC NULLS LAST);
CREATE INDEX idx_stories_category ON stories(category);
CREATE INDEX idx_story_lines_story_id ON story_lines(story_id);
CREATE INDEX idx_story_lines_order ON story_lines(story_id, line_order);

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

CREATE TRIGGER update_story_lines_timestamp
BEFORE UPDATE ON story_lines
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
ALTER TABLE story_lines ENABLE ROW LEVEL SECURITY;

-- Allow all operations (single-user app, no auth)
CREATE POLICY "Allow all operations on stories" ON stories
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on story_lines" ON story_lines
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE stories IS 'Stores repeatable stories for controlled playback';
COMMENT ON TABLE story_lines IS 'Individual lines within stories with optional voice customization';
COMMENT ON COLUMN stories.default_tone IS 'Default tone for all lines unless overridden';
COMMENT ON COLUMN stories.default_speed IS 'Default speed for all lines unless overridden';
COMMENT ON COLUMN stories.default_pause IS 'Default pause after lines unless overridden';
COMMENT ON COLUMN story_lines.line_order IS 'Order of line in story (0-indexed)';
COMMENT ON COLUMN story_lines.tone_tag IS 'Optional tone override for this line';
COMMENT ON COLUMN story_lines.speed IS 'Optional speed override for this line';
COMMENT ON COLUMN story_lines.pause_after IS 'Optional pause override after this line';
