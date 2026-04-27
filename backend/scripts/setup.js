/**
 * One-command project setup.
 *
 * Run from the backend/ directory:
 *   npm run setup
 *
 * What it does:
 *  1. Creates the database (if it doesn't exist)
 *  2. Applies database/schema.sql
 *  3. Applies all migrations in order
 *  4. Seeds demo data (seed.js)
 *  5. Promotes demo@healthyeat.dev to admin
 *  6. Seeds extra recipes, articles, and food items
 */

'use strict';

const path        = require('path');
const fs          = require('fs');
const { spawnSync } = require('child_process');
const mysql       = require('mysql2/promise');

// Load .env from backend/ (the cwd when run via npm run setup)
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// ── Helpers ───────────────────────────────────────────────────────────────────

const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const BOLD   = '\x1b[1m';
const CYAN   = '\x1b[36m';

function ok(msg)   { console.log(`${GREEN}✔${RESET}  ${msg}`); }
function info(msg) { console.log(`${CYAN}→${RESET}  ${msg}`); }
function warn(msg) { console.log(`${YELLOW}⚠${RESET}  ${msg}`); }
function fail(msg) { console.error(`${RED}✖${RESET}  ${msg}`); }
function step(msg) { console.log(`\n${BOLD}${msg}${RESET}`); }

// Errors that are safe to ignore when re-running setup on an existing database
const IGNORABLE_CODES = new Set([
  'ER_TABLE_EXISTS_ERROR',   // 1050 — table already exists
  'ER_DUP_FIELDNAME',        // 1060 — column already exists
  'ER_DUP_KEYNAME',          // 1061 — index already exists
  'ER_CANT_DROP_FIELD_OR_KEY', // 1091 — can't drop non-existent key
]);

function isIgnorable(err) {
  return IGNORABLE_CODES.has(err.code) || (err.errno && [1050, 1060, 1061, 1091].includes(err.errno));
}

// Split a SQL file into individual statements, skipping USE / CREATE DATABASE lines
function parseStatements(sql) {
  return sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.match(/^--/) && !s.match(/^\/\*/))
    .filter(s => !s.match(/^\s*USE\s+/i) && !s.match(/^\s*CREATE\s+DATABASE\s+/i))
    .map(s => {
      // Make CREATE TABLE idempotent
      s = s.replace(/\bCREATE\s+TABLE\s+(?!IF\s+NOT\s+EXISTS\s+)/i, 'CREATE TABLE IF NOT EXISTS ');
      // Make CREATE INDEX idempotent
      s = s.replace(/\bCREATE\s+(?:UNIQUE\s+)?INDEX\s+(?!IF\s+NOT\s+EXISTS\s+)/i, (m) => m.replace('INDEX ', 'INDEX IF NOT EXISTS '));
      return s + ';';
    });
}

async function runSqlFile(conn, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = parseStatements(sql);
  let skipped = 0;
  for (const stmt of statements) {
    try {
      await conn.query(stmt);
    } catch (err) {
      if (isIgnorable(err)) {
        skipped++;
      } else {
        fail(`SQL error in ${path.basename(filePath)}:`);
        fail(err.message);
        fail('Statement: ' + stmt.slice(0, 200));
        throw err;
      }
    }
  }
  if (skipped > 0) warn(`  ${skipped} statement(s) skipped (already applied)`);
}

function runScript(scriptName) {
  const scriptPath = path.resolve(__dirname, scriptName);
  if (!fs.existsSync(scriptPath)) {
    warn(`Script not found, skipping: ${scriptName}`);
    return;
  }
  info(`Running ${scriptName}…`);
  const result = spawnSync('node', [scriptPath], {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
  });
  if (result.status !== 0) {
    fail(`${scriptName} exited with code ${result.status}`);
    process.exit(1);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║   Healthy Eating App — Setup         ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════╝${RESET}\n`);

  const dbConfig = {
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
  };
  const dbName = process.env.DB_NAME || 'healthy_eating_app';

  // ── Step 1: Create database ────────────────────────────────────────────────
  step('Step 1/6 — Creating database');

  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      fail('Cannot connect to MySQL. Is the server running?');
      fail(`  Host: ${dbConfig.host}:${dbConfig.port}`);
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      fail('Access denied. Check DB_USER and DB_PASSWORD in backend/.env');
    } else {
      fail(err.message);
    }
    process.exit(1);
  }

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  ok(`Database "${dbName}" ready`);

  await conn.query(`USE \`${dbName}\``);

  // ── Step 2: Apply schema ───────────────────────────────────────────────────
  step('Step 2/6 — Applying schema');

  const schemaPath = path.resolve(__dirname, '..', '..', 'database', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    fail(`schema.sql not found at: ${schemaPath}`);
    process.exit(1);
  }

  await runSqlFile(conn, schemaPath);
  ok('Schema applied');

  // ── Step 3: Apply migrations ───────────────────────────────────────────────
  step('Step 3/6 — Applying migrations');

  const migrationsDir = path.resolve(__dirname, '..', '..', 'database', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    warn('Migrations directory not found, skipping');
  } else {
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      info(`Applying ${file}…`);
      await runSqlFile(conn, path.join(migrationsDir, file));
      ok(`  ${file}`);
    }

    if (files.length === 0) warn('No migration files found');
    else ok(`${files.length} migration(s) applied`);
  }

  // ── Step 4: Seed demo data ─────────────────────────────────────────────────
  step('Step 4/6 — Seeding demo data');
  await conn.end();   // seed.js opens its own connection
  runScript('seed.js');
  ok('Demo data seeded');

  // ── Step 5: Promote admin ──────────────────────────────────────────────────
  step('Step 5/6 — Promoting demo admin account');

  const connAdmin = await mysql.createConnection({ ...dbConfig, database: dbName });
  const [result] = await connAdmin.query(
    "UPDATE users SET role = 'admin' WHERE email = 'demo@healthyeat.dev'"
  );
  if (result.affectedRows > 0) {
    ok('demo@healthyeat.dev promoted to admin');
  } else {
    warn('demo@healthyeat.dev not found — skipping admin promotion');
  }
  await connAdmin.end();

  // ── Step 6: Seed additional content ───────────────────────────────────────
  step('Step 6/6 — Seeding additional content');

  runScript('seedMoreRecipes.js');
  ok('Extra recipes seeded');

  runScript('importArticles.js');
  ok('Articles imported');

  runScript('seedFoods.js');
  ok('Food database seeded');

  // ── Done ───────────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}${GREEN}✔ Setup complete!${RESET}`);
  console.log(`\n  Start the backend:   ${CYAN}npm run dev${RESET}   (in the backend/ directory)`);
  console.log(`  Start the frontend:  ${CYAN}npm run dev${RESET}   (in the frontend/ directory)\n`);
}

main().catch(err => {
  fail('Unexpected error: ' + err.message);
  process.exit(1);
});
