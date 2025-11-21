-- Add quick conversational response phrases
-- Migration: 005_add_quick_responses

-- Only insert if they don't already exist (check by text)
INSERT INTO phrases (text, category, time_of_day, source)
SELECT text, category::phrase_category, time_of_day::time_of_day, source::phrase_source
FROM (VALUES
  -- Quick conversational responses
  ('No ma''am', 'responses', 'anytime', 'static'),
  ('Mmmhmm', 'responses', 'anytime', 'static'),
  ('Uh huh', 'responses', 'anytime', 'static'),
  ('K', 'responses', 'anytime', 'static'),
  ('Stop talking', 'responses', 'anytime', 'static'),
  ('Tell me more', 'responses', 'anytime', 'static'),
  ('Say that in a different way', 'responses', 'anytime', 'static'),
  ('What do you think I''m going to say', 'responses', 'anytime', 'static')
) AS new_phrases(text, category, time_of_day, source)
WHERE NOT EXISTS (
  SELECT 1 FROM phrases WHERE phrases.text = new_phrases.text
);
