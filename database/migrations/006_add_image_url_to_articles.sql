-- Migration 006: add image_url to articles

USE healthy_eating_app;

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) DEFAULT NULL AFTER category;
