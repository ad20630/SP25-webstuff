import mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

console.log('Initializing database with the following configuration:');
console.log('Host:', process.env.DB_HOST || 'localhost');
console.log('Database:', process.env.DB_NAME || 'webstuff_db');
console.log('User:', process.env.DB_USER || 'webstuff_user');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'webstuff_user',
  password: process.env.DB_PASSWORD || 'Webstuff@123456',
  database: process.env.DB_NAME || 'webstuff_db'
});

// First, drop the user_role table if it exists
const dropUserRoleTableQuery = 'DROP TABLE IF EXISTS user_role';
// Then drop the user table
const dropUserTableQuery = 'DROP TABLE IF EXISTS User';
const createTableQuery = `
CREATE TABLE User (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

// Execute queries in sequence
pool.query(dropUserRoleTableQuery, (error) => {
  if (error) {
    console.error('Error dropping user_role table:', error);
    process.exit(1);
  }
  console.log('Dropped existing user_role table');

  pool.query(dropUserTableQuery, (error) => {
    if (error) {
      console.error('Error dropping User table:', error);
      process.exit(1);
    }
    console.log('Dropped existing User table');

    pool.query(createTableQuery, (error) => {
      if (error) {
        console.error('Error creating table:', error);
        process.exit(1);
      }
      console.log('User table created successfully');
      
      // Verify table structure
      pool.query('DESCRIBE User', (error, results) => {
        if (error) {
          console.error('Error describing table:', error);
          process.exit(1);
        }
        console.log('Table structure:');
        console.log(results);
        pool.end();
      });
    });
  });
}); 
