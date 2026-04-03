-- =============================================================
-- Healthy Eating App - Database Schema
-- =============================================================

CREATE DATABASE IF NOT EXISTS healthy_eating_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE healthy_eating_db;

-- =============================================================
-- USERS
-- =============================================================

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  password_hash VARCHAR(255) NOT NULL,
  weight DECIMAL(5,2),
  goal VARCHAR(50),
  diet_type VARCHAR(50),
  calorie_target INT,
  notification_preferences TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- =============================================================
-- DIET TYPES
-- =============================================================

CREATE TABLE diet_types (
  id          INT           NOT NULL AUTO_INCREMENT,
  name        VARCHAR(50)   NOT NULL UNIQUE,
  description TEXT,
  PRIMARY KEY (id)
);

-- =============================================================
-- RECIPES
-- =============================================================

CREATE TABLE recipes (
  id           INT           NOT NULL AUTO_INCREMENT,
  user_id      INT           NOT NULL,
  diet_type_id INT,
  title        VARCHAR(150)  NOT NULL,
  description  TEXT,
  prep_time    INT,                       -- minutes
  servings     INT           NOT NULL DEFAULT 1,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (diet_type_id) REFERENCES diet_types(id) ON DELETE SET NULL
);

-- =============================================================
-- INGREDIENTS
-- =============================================================

CREATE TABLE ingredients (
  id           INT           NOT NULL AUTO_INCREMENT,
  name         VARCHAR(100)  NOT NULL UNIQUE,
  unit         VARCHAR(30)   NOT NULL,    -- e.g. grams, ml, piece
  calories_per_unit DECIMAL(8, 2),
  PRIMARY KEY (id)
);

-- =============================================================
-- RECIPE INGREDIENTS  (junction: recipes <-> ingredients)
-- =============================================================

CREATE TABLE recipe_ingredients (
  id            INT             NOT NULL AUTO_INCREMENT,
  recipe_id     INT             NOT NULL,
  ingredient_id INT             NOT NULL,
  quantity      DECIMAL(8, 2)   NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (recipe_id)     REFERENCES recipes(id)     ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

-- =============================================================
-- MEALS  (a user's meal log entry for a given day)
-- =============================================================

CREATE TABLE meals (
  id         INT          NOT NULL AUTO_INCREMENT,
  user_id    INT          NOT NULL,
  meal_date  DATE         NOT NULL,
  meal_type  ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================
-- MEAL ITEMS  (which recipes are part of a meal)
-- =============================================================

CREATE TABLE meal_items (
  id        INT             NOT NULL AUTO_INCREMENT,
  meal_id   INT             NOT NULL,
  recipe_id INT             NOT NULL,
  servings  DECIMAL(4, 2)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  FOREIGN KEY (meal_id)   REFERENCES meals(id)   ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- =============================================================
-- ARTICLES
-- =============================================================

CREATE TABLE articles (
  id         INT          NOT NULL AUTO_INCREMENT,
  user_id    INT          NOT NULL,
  title      VARCHAR(200) NOT NULL,
  content    TEXT         NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================
-- COMMENTS  (on articles)
-- =============================================================

CREATE TABLE comments (
  id         INT       NOT NULL AUTO_INCREMENT,
  user_id    INT       NOT NULL,
  article_id INT       NOT NULL,
  content    TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- =============================================================
-- ACTIVITIES  (physical activity log)
-- =============================================================

CREATE TABLE activities (
  id               INT          NOT NULL AUTO_INCREMENT,
  user_id          INT          NOT NULL,
  name             VARCHAR(100) NOT NULL,
  duration_minutes INT          NOT NULL,
  calories_burned  INT,
  activity_date    DATE         NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
