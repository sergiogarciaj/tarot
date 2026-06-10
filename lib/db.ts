import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

let initialized = false

export async function initDb() {
  if (initialized) return
  
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    
    // Create user profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        email VARCHAR(255) PRIMARY KEY,
        birth_date DATE NOT NULL,
        birth_time TIME,
        unknown_time BOOLEAN NOT NULL DEFAULT FALSE,
        credits INTEGER NOT NULL DEFAULT 10,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `)

    // Migration for existing tables to add credits with a default of 10
    await client.query(`
      ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 10;
    `)

    // Create readings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS readings (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) REFERENCES user_profiles(email) ON DELETE CASCADE,
        reading_type VARCHAR(50) NOT NULL DEFAULT 'trinidad',
        theme VARCHAR(50),
        horizon VARCHAR(50),
        question TEXT,
        cards JSONB NOT NULL,
        synthesis TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `)

    // Migration in case column doesn't exist on older DBs
    await client.query(`
      ALTER TABLE readings ADD COLUMN IF NOT EXISTS reading_type VARCHAR(50) NOT NULL DEFAULT 'trinidad';
    `)

    // Create credit_transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) REFERENCES user_profiles(email) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        description TEXT,
        reference_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    await client.query("COMMIT")
    initialized = true
    console.log("Database tables initialized successfully.")
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Failed to initialize database tables:", error)
    throw error
  } finally {
    client.release()
  }
}
