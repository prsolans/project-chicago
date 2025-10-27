-- Migration: Add new phrase categories (food, feelings, entertainment)
-- Run this in Supabase SQL Editor after running 001_initial_schema.sql

-- Add new values to phrase_category enum
ALTER TYPE phrase_category ADD VALUE IF NOT EXISTS 'food';
ALTER TYPE phrase_category ADD VALUE IF NOT EXISTS 'feelings';
ALTER TYPE phrase_category ADD VALUE IF NOT EXISTS 'entertainment';
