const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in environment.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});

// Simple helper to run queries
module.exports = {
  query: (text, params) => {
    return pool.query(text, params);
  },
};
