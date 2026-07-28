import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database.sqlite');
const schemaPath = path.join(__dirname, '../database/schema.sql');

const SQL = await initSqlJs();

let sqliteDb;
if (fs.existsSync(dbPath)) {
  const filebuffer = fs.readFileSync(dbPath);
  sqliteDb = new SQL.Database(filebuffer);
} else {
  sqliteDb = new SQL.Database();
}

function saveDb() {
  try {
    const data = sqliteDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('Error saving database to disk:', err);
  }
}

// Auto-run schema DDL if tables don't exist
if (fs.existsSync(schemaPath)) {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  sqliteDb.exec(schemaSql);

  // Auto-migrate new security question columns for existing databases
  try { sqliteDb.exec("ALTER TABLE users ADD COLUMN security_question TEXT;"); } catch (e) {}
  try { sqliteDb.exec("ALTER TABLE users ADD COLUMN security_answer_hash TEXT;"); } catch (e) {}

  // Guarantee all user accounts are active for unlimited login access
  try { sqliteDb.exec("UPDATE users SET is_active = 1 WHERE is_active IS NULL OR is_active = 0;"); } catch (e) {}

  saveDb();
}

const db = {
  exec(sql) {
    sqliteDb.exec(sql);
    saveDb();
  },
  prepare(sql) {
    return {
      run(...args) {
        // Flatten array if passed as array
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        
        sqliteDb.run(sql, params);
        
        // Retrieve last inserted row id
        let lastInsertRowid = 0;
        try {
          const res = sqliteDb.exec('SELECT last_insert_rowid() as id');
          if (res.length > 0 && res[0].values.length > 0) {
            lastInsertRowid = res[0].values[0][0];
          }
        } catch (e) {}

        let changes = 0;
        try {
          const res = sqliteDb.exec('SELECT changes() as c');
          if (res.length > 0 && res[0].values.length > 0) {
            changes = res[0].values[0][0];
          }
        } catch (e) {}

        saveDb();

        return { lastInsertRowid, changes };
      },
      get(...args) {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        const stmt = sqliteDb.prepare(sql);
        stmt.bind(params);

        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return undefined;
      },
      all(...args) {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        const stmt = sqliteDb.prepare(sql);
        stmt.bind(params);

        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      }
    };
  }
};

export default db;
