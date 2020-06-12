import { Pool } from 'pg';

const databaseConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: true 
};
const pool = new Pool(databaseConfig);

export default pool;
