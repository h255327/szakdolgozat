-- Migration 007: create foods table for nutrition database

USE healthy_eating_app;

CREATE TABLE IF NOT EXISTS foods (
  id                INT            NOT NULL AUTO_INCREMENT,
  name              VARCHAR(150)   NOT NULL,
  category          VARCHAR(100)   DEFAULT NULL,
  calories_per_100g DECIMAL(8, 2)  NOT NULL DEFAULT 0,
  protein_per_100g  DECIMAL(8, 2)  NOT NULL DEFAULT 0,
  carbs_per_100g    DECIMAL(8, 2)  NOT NULL DEFAULT 0,
  fat_per_100g      DECIMAL(8, 2)  NOT NULL DEFAULT 0,
  default_unit      VARCHAR(20)    NOT NULL DEFAULT 'g',
  PRIMARY KEY (id),
  INDEX idx_name (name)
);
