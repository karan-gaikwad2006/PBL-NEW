const fs = require('fs');
const path = require('path');
const { getPool, query } = require('../config/db');
require('dotenv').config();

async function runMigrations() {
  console.log('[MIGRATIONS] Starting migration process...');
  const pool = getPool();

  try {
    // 1. Ensure schema_migrations table exists
    await query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Read migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Deterministic order

    console.log(`[MIGRATIONS] Found ${files.length} migration files.`);

    // 3. Get applied migrations
    const { rows } = await query('SELECT migration_name FROM schema_migrations');
    const appliedMigrations = new Set(rows.map(r => r.migration_name));

    // 4. Run unapplied migrations
    for (const file of files) {
      if (!appliedMigrations.has(file)) {
        console.log(`[MIGRATIONS] Applying migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        // Execute migration in a transaction
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          
          // Split by semi-colon to handle multiple statements if needed, 
          // but pg client can handle multiple statements in one string 
          // if not using parameters.
          await client.query(sql);
          
          await client.query('INSERT INTO schema_migrations (migration_name) VALUES ($1)', [file]);
          
          await client.query('COMMIT');
          console.log(`[MIGRATIONS] Successfully applied: ${file}`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`[MIGRATIONS] Error applying ${file}:`, err.message);
          process.exit(1);
        } finally {
          client.release();
        }
      } else {
        console.log(`[MIGRATIONS] Skipping already applied: ${file}`);
      }
    }

    console.log('[MIGRATIONS] All migrations completed successfully.');
  } catch (err) {
    console.error('[MIGRATIONS] Critical migration error:', err.message);
    process.exit(1);
  } finally {
    // Note: We don't close the pool here because this script might be part of a larger flow,
    // but for a standalone runner, we should close it.
    const { closePool } = require('../config/db');
    await closePool();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
