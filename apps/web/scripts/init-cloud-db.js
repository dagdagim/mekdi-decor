const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  'postgres://b72da640378c28a60eca90944507677286036f47643f4662c95c94eb5d39959c:sk_Xf9-Ixh4L8zaXpOD1Azts@db.prisma.io:5432/postgres?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  console.log('Connecting to cloud PostgreSQL at db.prisma.io...');
  const client = await pool.connect();
  try {
    const existing = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    const tableNames = existing.rows.map((r) => r.table_name);
    console.log('Existing tables:', tableNames);

    if (!tableNames.includes('users') || !tableNames.includes('quotes')) {
      console.log('Applying database schema from schema.sql...');
      const schemaPath = path.resolve(__dirname, '../../../packages/database/schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('Schema applied successfully!');

      console.log('Applying seed data from seed.sql...');
      const seedPath = path.resolve(__dirname, '../../../packages/database/seed.sql');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await client.query(seedSql);
      console.log('Seed data applied successfully!');
    } else {
      console.log('Tables already exist! Cloud database is ready.');
    }
  } catch (err) {
    console.error('Error initializing cloud database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
